from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from urllib.parse import urlencode

from app.api.deps import get_current_user, object_id_or_404, require_permission
from app.core.permissions import Permission
from app.db.mongodb import (
    bank_account_settings_collection,
    bills_collection,
    payments_collection,
)
from app.models.payment import (
    BankAccountSettingsPublic,
    BankAccountSettingsUpdate,
    PaymentCreate,
    PaymentPublic,
    VietQrResponse,
)
from app.models.user import UserInDB

router = APIRouter(prefix="/payments", tags=["payments"])
BANK_ACCOUNT_SETTINGS_ID = "primary"


@router.get("/bank-account", response_model=BankAccountSettingsPublic)
async def get_bank_account_settings(current_user: UserInDB = Depends(require_permission(Permission.PRICING_READ))):
    doc = await bank_account_settings_collection.find_one({"_id": BANK_ACCOUNT_SETTINGS_ID})
    if not doc:
        return BankAccountSettingsPublic(
            bank_bin="", bank_name="", account_number="", account_name=""
        )
    return BankAccountSettingsPublic.model_validate(doc)


@router.put("/bank-account", response_model=BankAccountSettingsPublic)
async def update_bank_account_settings(
    payload: BankAccountSettingsUpdate,
    current_user: UserInDB = Depends(require_permission(Permission.PRICING_UPDATE)),
):
    settings = {
        **payload.model_dump(),
        "account_name": payload.account_name.upper(),
        "updated_at": datetime.now(timezone.utc),
    }
    await bank_account_settings_collection.update_one(
        {"_id": BANK_ACCOUNT_SETTINGS_ID}, {"$set": settings}, upsert=True
    )
    return BankAccountSettingsPublic(**settings)


@router.get("", response_model=list[PaymentPublic])
async def list_payments(bill_id: str | None = None, current_user: UserInDB = Depends(require_permission(Permission.PAYMENTS_READ))):
    query: dict = {}
    if bill_id:
        query["bill_id"] = bill_id
    docs = await payments_collection.find(query).sort("payment_date", -1).to_list(length=5000)
    return [PaymentPublic.model_validate(d) for d in docs]


@router.post("", response_model=PaymentPublic, status_code=201)
async def create_payment(payload: PaymentCreate, current_user: UserInDB = Depends(require_permission(Permission.PAYMENTS_CREATE))):
    bill_oid = object_id_or_404(payload.bill_id, "Không tìm thấy hóa đơn")
    bill = await bills_collection.find_one({"_id": bill_oid})
    if not bill:
        raise HTTPException(status_code=404, detail="Không tìm thấy hóa đơn")

    now = datetime.now(timezone.utc)
    doc = payload.model_dump()
    doc["payment_date"] = payload.payment_date or now
    doc["created_at"] = now
    result = await payments_collection.insert_one(doc)

    # Support partial payments: only flip the bill to "paid" once the sum of
    # everything recorded against it reaches the total.
    total_paid_cursor = payments_collection.aggregate(
        [
            {"$match": {"bill_id": payload.bill_id}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]
    )
    total_paid_docs = await total_paid_cursor.to_list(length=1)
    total_paid = total_paid_docs[0]["total"] if total_paid_docs else 0
    if total_paid >= bill["total_amount"]:
        await bills_collection.update_one({"_id": bill_oid}, {"$set": {"status": "paid"}})

    created = await payments_collection.find_one({"_id": result.inserted_id})
    return PaymentPublic.model_validate(created)
