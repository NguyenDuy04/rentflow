from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.api.routes.bills import _with_overdue
from app.db.mongodb import (
    bills_collection,
    issues_collection,
    payments_collection,
    rooms_collection,
    tenants_collection,
)
from app.models.bill import BillPublic
from app.models.issue import IssuePublic
from app.models.payment import PaymentPublic
from app.models.portal import TenantPortalOverview
from app.models.room import RoomPublic
from app.models.tenant import TenantPublic
from app.models.user import UserInDB

router = APIRouter(prefix="/portal", tags=["tenant portal"])


@router.get("/overview", response_model=TenantPortalOverview)
async def get_tenant_portal(current_user: UserInDB = Depends(get_current_user)):
    if current_user.role != "tenant" or not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Chỉ tài khoản người thuê mới truy cập portal")

    tenant_doc = await tenants_collection.find_one({"_id": ObjectId(current_user.tenant_id)})
    if not tenant_doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ người thuê")
    tenant = TenantPublic.model_validate(tenant_doc)

    room_public = None
    if tenant_doc.get("room_id"):
        room_doc = await rooms_collection.find_one({"_id": ObjectId(tenant_doc["room_id"])})
        if room_doc:
            room_doc["current_occupants"] = await tenants_collection.count_documents(
                {"room_id": tenant_doc["room_id"], "status": "active"}
            )
            room_public = RoomPublic.model_validate(room_doc)

    bill_docs = await bills_collection.find({"tenant_id": current_user.tenant_id}).sort(
        "created_at", -1
    ).to_list(length=500)
    bill_ids = [str(doc["_id"]) for doc in bill_docs]
    payment_docs = await payments_collection.find({"bill_id": {"$in": bill_ids}}).sort(
        "payment_date", -1
    ).to_list(length=1000)
    issue_docs = await issues_collection.find({"tenant_id": current_user.tenant_id}).sort(
        "created_at", -1
    ).to_list(length=200)

    return TenantPortalOverview(
        tenant=tenant,
        room=room_public,
        bills=[BillPublic.model_validate(_with_overdue(doc)) for doc in bill_docs],
        payments=[PaymentPublic.model_validate(doc) for doc in payment_docs],
        issues=[IssuePublic.model_validate(doc) for doc in issue_docs],
    )