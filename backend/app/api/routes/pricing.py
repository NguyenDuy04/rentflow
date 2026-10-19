from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, require_permission
from app.core.permissions import Permission
from app.db.mongodb import pricing_collection
from app.models.pricing import PricingConfigPublic, PricingConfigUpdate
from app.models.user import UserInDB

router = APIRouter(prefix="/pricing", tags=["pricing"])

DEFAULT_PRICING = {
    "electricity_price": 3500,
    "water_price": 20000,
    "internet_fee": 100000,
    "parking_fee": 50000,
    "cleaning_fee": 30000,
    "other_fee": 0,
}


@router.get("", response_model=PricingConfigPublic)
async def get_pricing(current_user: UserInDB = Depends(require_permission(Permission.PRICING_READ))):
    doc = await pricing_collection.find_one({})
    if not doc:
        now = datetime.now(timezone.utc)
        result = await pricing_collection.insert_one({**DEFAULT_PRICING, "updated_at": now})
        doc = await pricing_collection.find_one({"_id": result.inserted_id})
    return PricingConfigPublic.model_validate(doc)


@router.put("", response_model=PricingConfigPublic)
async def update_pricing(payload: PricingConfigUpdate, current_user: UserInDB = Depends(require_permission(Permission.PRICING_UPDATE))):
    doc = await pricing_collection.find_one({})
    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.now(timezone.utc)

    if not doc:
        result = await pricing_collection.insert_one({**DEFAULT_PRICING, **update_data})
        doc = await pricing_collection.find_one({"_id": result.inserted_id})
    else:
        await pricing_collection.update_one({"_id": doc["_id"]}, {"$set": update_data})
        doc = await pricing_collection.find_one({"_id": doc["_id"]})
    return PricingConfigPublic.model_validate(doc)
