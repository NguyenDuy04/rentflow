from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user, object_id_or_404, require_permission
from app.core.permissions import Permission
from app.db.mongodb import rooms_collection, tenants_collection, users_collection
from app.models.tenant import TenantCreate, TenantPublic, TenantUpdate, TransferRoomRequest
from app.models.user import UserInDB

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("", response_model=list[TenantPublic])
async def list_tenants(
    search: str | None = None,
    status: str | None = None,
    room_id: str | None = None,
    current_user: UserInDB = Depends(require_permission(Permission.TENANTS_READ)),
):
    query: dict = {}
    if status:
        query["status"] = status
    if room_id:
        query["room_id"] = room_id
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"national_id": {"$regex": search, "$options": "i"}},
        ]
    docs = await tenants_collection.find(query).sort("full_name", 1).to_list(length=2000)
    return [TenantPublic.model_validate(d) for d in docs]


@router.post("", response_model=TenantPublic, status_code=201)
async def create_tenant(payload: TenantCreate, current_user: UserInDB = Depends(require_permission(Permission.TENANTS_CREATE))):
    if payload.room_id:
        room = await rooms_collection.find_one(
            {"_id": object_id_or_404(payload.room_id)}
        )

        if not room:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy phòng",
            )

        max_occupants = room.get("max_occupants", 1)

        current_occupants = await tenants_collection.count_documents(
            {
                "room_id": payload.room_id,
                "status": "active",
            }
        )

        if current_occupants >= max_occupants:
            raise HTTPException(
                status_code=400,
                detail=f"Phòng đã đủ số người tối đa ({max_occupants})",
            )
    now = datetime.now(timezone.utc)
    doc = payload.model_dump()
    doc["created_at"] = now
    doc["updated_at"] = now
    result = await tenants_collection.insert_one(doc)
    if payload.room_id:
        await rooms_collection.update_one(
            {"_id": object_id_or_404(payload.room_id)},
            {"$set": {"status": "occupied", "updated_at": now}},
        )
    created = await tenants_collection.find_one({"_id": result.inserted_id})
    return TenantPublic.model_validate(created)


@router.get("/{tenant_id}", response_model=TenantPublic)
async def get_tenant(tenant_id: str, current_user: UserInDB = Depends(require_permission(Permission.TENANTS_READ))):
    doc = await _get_tenant_or_404(tenant_id)
    return TenantPublic.model_validate(doc)


@router.put("/{tenant_id}", response_model=TenantPublic)
async def update_tenant(
    tenant_id: str, payload: TenantUpdate, current_user: UserInDB = Depends(require_permission(Permission.TENANTS_UPDATE))
):
    oid = object_id_or_404(tenant_id, "Không tìm thấy người thuê")
    await _get_tenant_or_404(tenant_id)
    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await tenants_collection.update_one({"_id": oid}, {"$set": update_data})
    doc = await tenants_collection.find_one({"_id": oid})
    return TenantPublic.model_validate(doc)


@router.delete("/{tenant_id}", status_code=204)
async def delete_tenant(tenant_id: str, current_user: UserInDB = Depends(require_permission(Permission.TENANTS_DELETE))):
    oid = object_id_or_404(tenant_id, "Không tìm thấy người thuê")
    tenant = await _get_tenant_or_404(tenant_id)
    room_id = tenant.get("room_id")
    if room_id and tenant.get("status") == "active":
        remaining = await tenants_collection.count_documents(
            {"room_id": room_id, "status": "active", "_id": {"$ne": oid}}
        )
        if remaining == 0:
            await rooms_collection.update_one(
                {"_id": object_id_or_404(room_id)},
                {"$set": {"status": "available", "updated_at": datetime.now(timezone.utc)}},
            )
    await users_collection.delete_one({"role": "tenant", "tenant_id": tenant_id})
    await tenants_collection.delete_one({"_id": oid})


@router.post("/{tenant_id}/transfer-room", response_model=TenantPublic)
async def transfer_room(
    tenant_id: str,
    payload: TransferRoomRequest,
    current_user: UserInDB = Depends(require_permission(Permission.TENANTS_UPDATE)),
):
    oid = object_id_or_404(tenant_id, "Không tìm thấy người thuê")
    tenant = await _get_tenant_or_404(tenant_id)
    new_room_oid = object_id_or_404(payload.new_room_id, "Không tìm thấy phòng mới")

    new_room = await rooms_collection.find_one(
    {"_id": new_room_oid}
)

    if not new_room:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy phòng mới",
        )

    max_occupants = new_room.get("max_occupants", 1)

    current_occupants = await tenants_collection.count_documents(
        {
            "room_id": payload.new_room_id,
            "status": "active",
        }
    )

    if current_occupants >= max_occupants:
        raise HTTPException(
            status_code=400,
            detail=f"Phòng đã đủ số người tối đa ({max_occupants})",
        )

    now = datetime.now(timezone.utc)
    old_room_id = tenant.get("room_id")
    if old_room_id:
        remaining = await tenants_collection.count_documents(
            {"room_id": old_room_id, "status": "active", "_id": {"$ne": oid}}
        )
        if remaining == 0:
            await rooms_collection.update_one(
                {"_id": object_id_or_404(old_room_id)},
                {"$set": {"status": "available", "updated_at": now}},
            )

    await tenants_collection.update_one(
        {"_id": oid}, {"$set": {"room_id": payload.new_room_id, "updated_at": now}}
    )
    await rooms_collection.update_one(
        {"_id": new_room_oid}, {"$set": {"status": "occupied", "updated_at": now}}
    )
    doc = await tenants_collection.find_one({"_id": oid})
    return TenantPublic.model_validate(doc)


@router.post("/{tenant_id}/end-contract", response_model=TenantPublic)
async def end_contract(tenant_id: str, current_user: UserInDB = Depends(require_permission(Permission.TENANTS_UPDATE))):
    oid = object_id_or_404(tenant_id, "Không tìm thấy người thuê")
    tenant = await _get_tenant_or_404(tenant_id)
    now = datetime.now(timezone.utc)
    await tenants_collection.update_one({"_id": oid}, {"$set": {"status": "ended", "updated_at": now}})
    room_id = tenant.get("room_id")
    if room_id:
        remaining = await tenants_collection.count_documents(
            {"room_id": room_id, "status": "active", "_id": {"$ne": oid}}
        )
        if remaining == 0:
            await rooms_collection.update_one(
                {"_id": object_id_or_404(room_id)},
                {"$set": {"status": "available", "updated_at": now}},
            )
    doc = await tenants_collection.find_one({"_id": oid})
    return TenantPublic.model_validate(doc)


async def _get_tenant_or_404(tenant_id: str) -> dict:
    oid = object_id_or_404(tenant_id, "Không tìm thấy người thuê")
    doc = await tenants_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy người thuê")
    return doc
