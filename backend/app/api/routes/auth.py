import hashlib
import math
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pymongo import ReturnDocument

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.mongodb import login_attempts_collection, users_collection
from app.models.auth import LoginRequest, RegisterRequest, SetupStatusResponse
from app.models.user import ChangePasswordRequest, UserInDB, UserPublic, UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])
AUTH_COOKIE_PATH = "/api"


def _set_auth_cookie(response: Response, token: str, remember: bool) -> None:
    max_age = (
        settings.access_token_expire_minutes_remember * 60 if remember else None
    )
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=token,
        max_age=max_age,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=settings.auth_cookie_samesite,
        path=AUTH_COOKIE_PATH,
    )


def _login_attempt_keys(email: str, ip_address: str) -> list[tuple[str, str]]:
    subjects = [("email", email.casefold()), ("ip", ip_address)]
    return [
        (scope, hashlib.sha256(f"{scope}:{value}".encode()).hexdigest())
        for scope, value in subjects
    ]


def _as_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)


async def _active_login_lock(keys: list[tuple[str, str]], now: datetime) -> datetime | None:
    attempts = await login_attempts_collection.find(
        {"_id": {"$in": [key for _, key in keys]}}
    ).to_list(length=len(keys))
    active_locks = [
        _as_utc(attempt["blocked_until"])
        for attempt in attempts
        if attempt.get("blocked_until") and _as_utc(attempt["blocked_until"]) > now
    ]
    return max(active_locks, default=None)


async def _record_failed_login(keys: list[tuple[str, str]], now: datetime) -> None:
    expires_at = now + timedelta(hours=settings.login_attempt_window_hours)
    for scope, key in keys:
        await login_attempts_collection.delete_one({"_id": key, "expires_at": {"$lte": now}})
        attempt = await login_attempts_collection.find_one_and_update(
            {"_id": key},
            {
                "$inc": {"failures": 1},
                "$set": {"expires_at": expires_at},
                "$setOnInsert": {"scope": scope},
            },
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
        failures = attempt["failures"]
        if failures == 5:
            lock_minutes = 5
        elif failures == 10:
            lock_minutes = 15
        elif failures >= 20:
            lock_minutes = settings.login_temporary_lock_minutes
        else:
            continue
        await login_attempts_collection.update_one(
            {"_id": key},
            {"$max": {"blocked_until": now + timedelta(minutes=lock_minutes)}},
        )


@router.get("/setup-status", response_model=SetupStatusResponse)
async def setup_status():
    """RentFlow is single-tenant: exactly one landlord account. The register
    screen only works before that account exists (first-run setup); after
    that it's closed, same spirit as the WordPress/Nextcloud-style
    "create admin account" first-run screen."""
    count = await users_collection.count_documents({}, limit=1)
    return SetupStatusResponse(needs_setup=count == 0)


@router.post("/register", status_code=201)
async def register(payload: RegisterRequest, response: Response):
    if await users_collection.count_documents({}, limit=1) > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hệ thống đã được thiết lập. Vui lòng đăng nhập.",
        )
    if await users_collection.find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")

    doc = {
        "email": payload.email,
        "full_name": payload.full_name,
        "phone": None,
        "role": "owner",
        "hashed_password": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc),
    }
    result = await users_collection.insert_one(doc)
    token = create_access_token(str(result.inserted_id), remember=True)
    _set_auth_cookie(response, token, remember=True)
    return {"message": "Đăng ký thành công"}


@router.post("/login")
async def login(payload: LoginRequest, request: Request, response: Response):
    ip_address = request.client.host if request.client else "unknown"
    attempt_keys = _login_attempt_keys(payload.email, ip_address)
    now = datetime.now(timezone.utc)
    blocked_until = await _active_login_lock(attempt_keys, now)
    if blocked_until:
        retry_after = max(1, math.ceil((blocked_until - now).total_seconds()))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Đăng nhập tạm thời bị khóa. Vui lòng thử lại sau.",
            headers={"Retry-After": str(retry_after)},
        )

    doc = await users_collection.find_one({"email": payload.email})
    if not doc or not verify_password(payload.password, doc["hashed_password"]):
        await _record_failed_login(attempt_keys, now)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Email hoặc mật khẩu không đúng"
        )
    await login_attempts_collection.delete_many(
        {"_id": {"$in": [key for scope, key in attempt_keys if scope == "email"]}}
    )
    token = create_access_token(str(doc["_id"]), remember=payload.remember)
    _set_auth_cookie(response, token, remember=payload.remember)
    return {"message": "Đăng nhập thành công"}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response):
    response.delete_cookie(
        key=settings.auth_cookie_name,
        path=AUTH_COOKIE_PATH,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=settings.auth_cookie_samesite,
    )


@router.get("/me", response_model=UserPublic)
async def get_me(current_user: UserInDB = Depends(get_current_user)):
    doc = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    return UserPublic.model_validate(doc)


@router.put("/me", response_model=UserPublic)
async def update_me(payload: UserUpdate, current_user: UserInDB = Depends(get_current_user)):
    if current_user.role == "tenant":
        raise HTTPException(status_code=403, detail="Tài khoản người thuê chỉ có quyền xem hồ sơ")
    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if update_data:
        await users_collection.update_one({"_id": ObjectId(current_user.id)}, {"$set": update_data})
    doc = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    return UserPublic.model_validate(doc)


@router.put("/change-password")
async def change_password(
    payload: ChangePasswordRequest, current_user: UserInDB = Depends(get_current_user)
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không đúng")
    new_hash = hash_password(payload.new_password)
    await users_collection.update_one(
        {"_id": ObjectId(current_user.id)}, {"$set": {"hashed_password": new_hash}}
    )
    return {"message": "Đổi mật khẩu thành công"}
