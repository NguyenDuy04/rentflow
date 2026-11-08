from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user, object_id_or_404, require_permission
from app.core.permissions import Permission, has_permission
from app.db.mongodb import issues_collection, rooms_collection, tenants_collection
from app.models.issue import IssueCreate, IssuePublic, IssueUpdate
from app.models.user import UserInDB

router = APIRouter(prefix="/issues", tags=["issues"])


@router.get("", response_model=list[IssuePublic])
async def list_issues(current_user: UserInDB = Depends(get_current_user)):
    if current_user.role == "tenant":
        if not current_user.tenant_id:
            return []
        query = {"tenant_id": current_user.tenant_id}
    elif has_permission(current_user.role, Permission.ISSUES_READ):
        query = {}
    else:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem báo cáo sự cố")
    docs = await issues_collection.find(query).sort("created_at", -1).to_list(length=2000)
    return [IssuePublic.model_validate(doc) for doc in docs]


@router.post("", response_model=IssuePublic, status_code=201)
async def create_issue(
    payload: IssueCreate,
    current_user: UserInDB = Depends(require_permission(Permission.ISSUES_CREATE)),
):
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Tài khoản chưa được liên kết hồ sơ thuê")
    tenant = await tenants_collection.find_one({"_id": ObjectId(current_user.tenant_id)})
    if not tenant or tenant.get("status") != "active" or not tenant.get("room_id"):
        raise HTTPException(status_code=403, detail="Chỉ người thuê đang ở mới gửi được báo cáo")
    room = await rooms_collection.find_one({"_id": object_id_or_404(tenant["room_id"])})
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng")

    now = datetime.now(timezone.utc)
    doc = {
        **payload.model_dump(),
        "tenant_id": current_user.tenant_id,
        "tenant_name": tenant["full_name"],
        "room_id": tenant["room_id"],
        "room_label": f"{room['room_code']} - {room['name']}",
        "status": "open",
        "staff_note": None,
        "created_at": now,
        "updated_at": now,
    }
    result = await issues_collection.insert_one(doc)
    created = await issues_collection.find_one({"_id": result.inserted_id})
    return IssuePublic.model_validate(created)


@router.patch("/{issue_id}", response_model=IssuePublic)
async def update_issue(
    issue_id: str,
    payload: IssueUpdate,
    current_user: UserInDB = Depends(require_permission(Permission.ISSUES_UPDATE)),
):
    oid = object_id_or_404(issue_id, "Không tìm thấy báo cáo")
    if not await issues_collection.find_one({"_id": oid}):
        raise HTTPException(status_code=404, detail="Không tìm thấy báo cáo")
    update = payload.model_dump(exclude_unset=True)
    update["updated_at"] = datetime.now(timezone.utc)
    if payload.status == "resolved":
        update["resolved_at"] = update["updated_at"]
    else:
        update["resolved_at"] = None
    await issues_collection.update_one({"_id": oid}, {"$set": update})
    return IssuePublic.model_validate(await issues_collection.find_one({"_id": oid}))