from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user, object_id_or_404, require_permission
from app.core.permissions import Permission
from app.db.mongodb import rooms_collection, tenants_collection
from app.models.room import RoomCreate, RoomPublic, RoomStatusUpdate, RoomUpdate
from app.models.user import UserInDB

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.get("", response_model=list[RoomPublic])
async def list_rooms(
    search: str | None = None,
    status: str | None = None,
    current_user: UserInDB = Depends(require_permission(Permission.ROOMS_READ)),
):
    query: dict = {}
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"room_code": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}},
        ]
    docs = await rooms_collection.find(query).sort("room_code", 1).to_list(length=2000)

    result = []

    for room in docs:
        current_occupants = await tenants_collection.count_documents(
            {
                "room_id": str(room["_id"]),
                "status": "active",
            }
        )

        room["current_occupants"] = current_occupants

        result.append(
            RoomPublic.model_validate(room)
        )

    return result


@router.post("", response_model=RoomPublic, status_code=201)
async def create_room(payload: RoomCreate, current_user: UserInDB = Depends(require_permission(Permission.ROOMS_CREATE))):
    if await rooms_collection.find_one({"room_code": payload.room_code}):
        raise HTTPException(status_code=400, detail="Mã phòng đã tồn tại")
    now = datetime.now(timezone.utc)
    doc = payload.model_dump()
    doc["created_at"] = now
    doc["updated_at"] = now
    result = await rooms_collection.insert_one(doc)
    created = await rooms_collection.find_one({"_id": result.inserted_id})
    return RoomPublic.model_validate(created)


@router.get("/{room_id}", response_model=RoomPublic)
async def get_room(room_id: str, current_user: UserInDB = Depends(require_permission(Permission.ROOMS_READ))):
    doc = await _get_room_or_404(room_id)

    doc["current_occupants"] = await tenants_collection.count_documents(
        {
            "room_id": room_id,
            "status": "active",
        }
    )

    return RoomPublic.model_validate(doc)


@router.put("/{room_id}", response_model=RoomPublic)
async def update_room(
    room_id: str, payload: RoomUpdate, current_user: UserInDB = Depends(require_permission(Permission.ROOMS_UPDATE))
):
    oid = object_id_or_404(room_id, "Không tìm thấy phòng")
    await _get_room_or_404(room_id)
    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if "max_occupants" in update_data:
        current_occupants = await tenants_collection.count_documents(
            {
                "room_id": room_id,
                "status": "active",
            }
        )

        if update_data["max_occupants"] < current_occupants:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Phòng hiện có {current_occupants} người thuê. "
                    f"Không thể giảm sức chứa xuống {update_data['max_occupants']}."
                ),
            )
    if "room_code" in update_data:
        clash = await rooms_collection.find_one(
            {"room_code": update_data["room_code"], "_id": {"$ne": oid}}
        )
        if clash:
            raise HTTPException(status_code=400, detail="Mã phòng đã tồn tại")
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await rooms_collection.update_one({"_id": oid}, {"$set": update_data})
    doc = await rooms_collection.find_one({"_id": oid})
    return RoomPublic.model_validate(doc)


@router.patch("/{room_id}/status", response_model=RoomPublic)
async def update_room_status(
    room_id: str,
    payload: RoomStatusUpdate,
    current_user: UserInDB = Depends(require_permission(Permission.ROOMS_STATUS_UPDATE)),
):
    oid = object_id_or_404(room_id, "Không tìm thấy phòng")
    await _get_room_or_404(room_id)
    await rooms_collection.update_one(
        {"_id": oid},
        {"$set": {"status": payload.status, "updated_at": datetime.now(timezone.utc)}},
    )
    doc = await rooms_collection.find_one({"_id": oid})
    doc["current_occupants"] = await tenants_collection.count_documents(
        {"room_id": room_id, "status": "active"}
    )
    return RoomPublic.model_validate(doc)


@router.delete("/{room_id}", status_code=204)
async def delete_room(room_id: str, current_user: UserInDB = Depends(require_permission(Permission.ROOMS_DELETE))):
    oid = object_id_or_404(room_id, "Không tìm thấy phòng")
    await _get_room_or_404(room_id)
    active_tenant = await tenants_collection.find_one({"room_id": room_id, "status": "active"})
    if active_tenant:
        raise HTTPException(status_code=400, detail="Không thể xóa phòng đang có người thuê")
    await rooms_collection.delete_one({"_id": oid})


async def _get_room_or_404(room_id: str) -> dict:
    oid = object_id_or_404(room_id, "Không tìm thấy phòng")
    doc = await rooms_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng")
    return doc
