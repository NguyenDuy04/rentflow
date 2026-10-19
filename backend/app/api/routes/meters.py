from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import DuplicateKeyError

from app.api.deps import get_current_user, object_id_or_404, require_permission
from app.core.permissions import Permission
from app.db.mongodb import meters_collection, rooms_collection
from app.models.meter import MeterReadingCreate, MeterReadingPublic, MeterReadingUpdate
from app.models.user import UserInDB

router = APIRouter(prefix="/meters", tags=["meters"])


def _with_consumption(doc: dict) -> dict:
    doc = dict(doc)
    doc["electricity_consumption"] = doc["electricity_new"] - doc["electricity_old"]
    doc["water_consumption"] = doc["water_new"] - doc["water_old"]
    return doc


@router.get("", response_model=list[MeterReadingPublic])
async def list_meters(
    room_id: str | None = None,
    month: str | None = None,
    current_user: UserInDB = Depends(require_permission(Permission.METERS_READ)),
):
    query: dict = {}
    if room_id:
        query["room_id"] = room_id
    if month:
        query["month"] = month
    docs = await meters_collection.find(query).sort("month", -1).to_list(length=5000)
    return [MeterReadingPublic.model_validate(_with_consumption(d)) for d in docs]


@router.post("", response_model=MeterReadingPublic, status_code=201)
async def create_meter(
    payload: MeterReadingCreate,
    current_user: UserInDB = Depends(require_permission(Permission.METERS_WRITE)),
):
    room = await rooms_collection.find_one(
        {"_id": object_id_or_404(payload.room_id)}
    )

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy phòng",
        )

    latest = (
        await meters_collection.find(
            {"room_id": payload.room_id}
        )
        .sort("month", -1)
        .limit(1)
        .to_list(length=1)
    )

    electricity_old = payload.electricity_old
    water_old = payload.water_old

    if latest:
        electricity_old = latest[0]["electricity_new"]
        water_old = latest[0]["water_new"]

    if payload.electricity_new < electricity_old:
        raise HTTPException(
            status_code=422,
            detail="Chỉ số điện mới phải lớn hơn hoặc bằng chỉ số cũ",
        )

    if payload.water_new < water_old:
        raise HTTPException(
            status_code=422,
            detail="Chỉ số nước mới phải lớn hơn hoặc bằng chỉ số cũ",
        )

    now = datetime.now(timezone.utc)

    doc = {
        "room_id": payload.room_id,
        "month": payload.month,
        "electricity_old": electricity_old,
        "electricity_new": payload.electricity_new,
        "water_old": water_old,
        "water_new": payload.water_new,
        "created_at": now,
    }

    try:
        result = await meters_collection.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=400,
            detail="Phòng này đã có chỉ số cho tháng đã chọn",
        )

    created = await meters_collection.find_one(
        {"_id": result.inserted_id}
    )

    return MeterReadingPublic.model_validate(
        _with_consumption(created)
    )

@router.get("/prefill/{room_id}")
async def get_meter_prefill(
    room_id: str,
    current_user: UserInDB = Depends(require_permission(Permission.METERS_READ)),
):
    room = await rooms_collection.find_one(
        {"_id": object_id_or_404(room_id)}
    )

    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng")

    latest = (
        await meters_collection
        .find({"room_id": room_id})
        .sort("month", -1)
        .limit(1)
        .to_list(length=1)
    )

    if not latest:
        return {
            "electricity_old": 0,
            "water_old": 0,
            "is_first_reading": True,
        }

    meter = latest[0]

    return {
        "electricity_old": meter["electricity_new"],
        "water_old": meter["water_new"],
        "is_first_reading": False,
    }

@router.put("/{meter_id}", response_model=MeterReadingPublic)
async def update_meter(
    meter_id: str, payload: MeterReadingUpdate, current_user: UserInDB = Depends(require_permission(Permission.METERS_WRITE))
):
    oid = object_id_or_404(meter_id, "Không tìm thấy chỉ số")
    doc = await meters_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy chỉ số")

    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    merged = {**doc, **update_data}
    if merged["electricity_new"] < merged["electricity_old"]:
        raise HTTPException(status_code=400, detail="Chỉ số điện mới phải lớn hơn hoặc bằng chỉ số cũ")
    if merged["water_new"] < merged["water_old"]:
        raise HTTPException(status_code=400, detail="Chỉ số nước mới phải lớn hơn hoặc bằng chỉ số cũ")

    if update_data:
        await meters_collection.update_one({"_id": oid}, {"$set": update_data})
    doc = await meters_collection.find_one({"_id": oid})
    return MeterReadingPublic.model_validate(_with_consumption(doc))
