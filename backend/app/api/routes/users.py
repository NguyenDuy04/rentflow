from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.api.deps import object_id_or_404, require_permission
from app.core.permissions import Permission
from app.core.security import hash_password
from app.db.mongodb import tenants_collection, users_collection
from app.models.user import (
    ManagedUserPublic,
    StaffAccountCreate,
    TenantAccountCreate,
    UserInDB,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/staff", response_model=list[ManagedUserPublic])
async def list_staff(
    current_user: UserInDB = Depends(require_permission(Permission.STAFF_MANAGE)),
):
    docs = await users_collection.find({"role": "staff"}).sort("full_name", 1).to_list(length=1000)
    return [ManagedUserPublic.model_validate(doc) for doc in docs]


@router.post("/staff", response_model=ManagedUserPublic, status_code=201)
async def create_staff(
    payload: StaffAccountCreate,
    current_user: UserInDB = Depends(require_permission(Permission.STAFF_MANAGE)),
):
    doc = {
        "email": str(payload.email).casefold(),
        "full_name": payload.full_name,
        "phone": payload.phone,
        "role": "staff",
        "hashed_password": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc),
    }
    try:
        result = await users_collection.insert_one(doc)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="Email đã được sử dụng") from exc
    created = await users_collection.find_one({"_id": result.inserted_id})
    return ManagedUserPublic.model_validate(created)


@router.delete("/staff/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_staff(
    user_id: str,
    current_user: UserInDB = Depends(require_permission(Permission.STAFF_MANAGE)),
):
    oid = object_id_or_404(user_id, "Không tìm thấy tài khoản Staff")
    result = await users_collection.delete_one({"_id": oid, "role": "staff"})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản Staff")


@router.post("/tenant-accounts", response_model=ManagedUserPublic, status_code=201)
async def create_tenant_account(
    payload: TenantAccountCreate,
    current_user: UserInDB = Depends(require_permission(Permission.TENANT_ACCOUNTS_MANAGE)),
):
    tenant_id = str(object_id_or_404(payload.tenant_id, "Không tìm thấy người thuê"))
    tenant = await tenants_collection.find_one({"_id": ObjectId(tenant_id)})
    if not tenant:
        raise HTTPException(status_code=404, detail="Không tìm thấy người thuê")
    if not tenant.get("email"):
        raise HTTPException(status_code=400, detail="Cần thêm email cho hồ sơ người thuê trước")
    if await users_collection.find_one({"tenant_id": tenant_id}):
        raise HTTPException(status_code=409, detail="Người thuê đã có tài khoản portal")

    doc = {
        "email": str(tenant["email"]).casefold(),
        "full_name": tenant["full_name"],
        "phone": tenant.get("phone"),
        "role": "tenant",
        "tenant_id": tenant_id,
        "hashed_password": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc),
    }
    try:
        result = await users_collection.insert_one(doc)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="Email đã được sử dụng") from exc
    await tenants_collection.update_one(
        {"_id": ObjectId(tenant_id)}, {"$set": {"portal_enabled": True}}
    )
    created = await users_collection.find_one({"_id": result.inserted_id})
    return ManagedUserPublic.model_validate(created)