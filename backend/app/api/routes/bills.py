import random
import string
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response

from app.api.deps import get_current_user, object_id_or_404, require_permission
from app.core.permissions import Permission, has_permission
from app.db.mongodb import (
    bank_account_settings_collection,
    bills_collection,
    meters_collection,
    payments_collection,
    pricing_collection,
    rooms_collection,
    tenants_collection,
)
from app.models.bill import BillPublic, BillStatusUpdate, GenerateBillRequest
from app.models.payment import VietQrResponse
from app.models.user import UserInDB
from app.services.billing import compute_bill_amounts
from app.services.pdf import generate_bill_pdf

router = APIRouter(prefix="/bills", tags=["bills"])

DUE_DAYS = 10  # days after generation a bill is considered due


def _bill_code(month: str) -> str:
    suffix = "".join(random.choices(string.digits, k=4))
    return f"HD{month.replace('-', '')}{suffix}"


def _with_overdue(doc: dict) -> dict:
    doc = dict(doc)
    now = datetime.now(timezone.utc)
    due = doc["due_date"]
    if due.tzinfo is None:
        due = due.replace(tzinfo=timezone.utc)
    doc["is_overdue"] = doc["status"] == "unpaid" and due < now
    return doc


@router.get("", response_model=list[BillPublic])
async def list_bills(
    month: str | None = None,
    status: str | None = None,
    room_id: str | None = None,
    current_user: UserInDB = Depends(require_permission(Permission.BILLS_READ)),
):
    query: dict = {}
    if month:
        query["month"] = month
    if status:
        query["status"] = status
    if room_id:
        query["room_id"] = room_id
    docs = await bills_collection.find(query).sort("created_at", -1).to_list(length=5000)
    return [BillPublic.model_validate(_with_overdue(d)) for d in docs]


@router.get("/{bill_id}", response_model=BillPublic)
async def get_bill(bill_id: str, current_user: UserInDB = Depends(require_permission(Permission.BILLS_READ))):
    doc = await _get_bill_or_404(bill_id)
    return BillPublic.model_validate(_with_overdue(doc))


@router.get("/{bill_id}/vietqr", response_model=VietQrResponse)
async def get_bill_vietqr(bill_id: str, current_user: UserInDB = Depends(get_current_user)):
    bill = await _get_bill_or_404(bill_id)
    if current_user.role == "tenant":
        if not current_user.tenant_id or bill.get("tenant_id") != current_user.tenant_id:
            raise HTTPException(status_code=404, detail="Không tìm thấy hóa đơn")
    elif not has_permission(current_user.role, Permission.PAYMENTS_QR):
        raise HTTPException(status_code=403, detail="Bạn không có quyền thực hiện thao tác này")
    bank = await bank_account_settings_collection.find_one({"_id": "primary"})
    if not bank:
        raise HTTPException(status_code=400, detail="Chưa cấu hình tài khoản nhận tiền")

    payments = await payments_collection.aggregate(
        [
            {"$match": {"bill_id": bill_id}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]
    ).to_list(length=1)
    total_paid = payments[0]["total"] if payments else 0
    amount_due = int(round(bill["total_amount"] - total_paid))
    if amount_due <= 0 or bill["status"] == "paid":
        raise HTTPException(status_code=409, detail="Hóa đơn đã được thanh toán")

    transfer_content = bill["bill_code"]
    qr_path = f"{bank['bank_bin']}-{bank['account_number']}"
    qr_url = (
        f"https://img.vietqr.io/image/{qr_path}-compact2.png?"
        + urlencode(
            {
                "amount": amount_due,
                "addInfo": transfer_content,
                "accountName": bank["account_name"],
            }
        )
    )
    return VietQrResponse(
        amount=amount_due,
        transfer_content=transfer_content,
        bank_bin=bank["bank_bin"],
        bank_name=bank.get("bank_name", ""),
        account_number=bank["account_number"],
        account_name=bank["account_name"],
        qr_url=qr_url,
    )


@router.post("/generate", response_model=list[BillPublic], status_code=201)
async def generate_bills(payload: GenerateBillRequest, current_user: UserInDB = Depends(require_permission(Permission.BILLS_CREATE))):
    pricing = await pricing_collection.find_one({})
    if not pricing:
        raise HTTPException(status_code=400, detail="Chưa cấu hình bảng giá dịch vụ. Vào Cài đặt để thiết lập.")

    if payload.room_id:
        room = await rooms_collection.find_one({"_id": object_id_or_404(payload.room_id)})
        if not room:
            raise HTTPException(status_code=404, detail="Không tìm thấy phòng")
        rooms = [room]
    else:
        rooms = await rooms_collection.find({"status": "occupied"}).to_list(length=2000)

    now = datetime.now(timezone.utc)
    created_bills: list[BillPublic] = []
    skipped_existing = 0
    skipped_no_meter = 0

    for room in rooms:
        room_id_str = str(room["_id"])
        if await bills_collection.find_one({"room_id": room_id_str, "month": payload.month}):
            skipped_existing += 1
            continue
        meter = await meters_collection.find_one({"room_id": room_id_str, "month": payload.month})
        if not meter:
            skipped_no_meter += 1
            continue
        tenant = await tenants_collection.find_one({"room_id": room_id_str, "status": "active"})
        amounts = compute_bill_amounts(room, meter, pricing)
        bill_doc = {
            "bill_code": _bill_code(payload.month),
            "month": payload.month,
            "room_id": room_id_str,
            "tenant_id": str(tenant["_id"]) if tenant else None,
            **amounts,
            "status": "unpaid",
            "due_date": now + timedelta(days=DUE_DAYS),
            "created_at": now,
        }
        result = await bills_collection.insert_one(bill_doc)
        created = await bills_collection.find_one({"_id": result.inserted_id})
        created_bills.append(BillPublic.model_validate(_with_overdue(created)))

    if not created_bills:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Không tạo được hóa đơn nào. Đã có hóa đơn: {skipped_existing} phòng, "
                f"thiếu chỉ số điện nước: {skipped_no_meter} phòng. "
                "Hãy nhập chỉ số điện nước cho tháng này trước."
            ),
        )
    return created_bills


@router.put("/{bill_id}/status", response_model=BillPublic)
async def update_bill_status(
    bill_id: str, payload: BillStatusUpdate, current_user: UserInDB = Depends(require_permission(Permission.BILLS_UPDATE))
):
    oid = object_id_or_404(bill_id, "Không tìm thấy hóa đơn")
    await _get_bill_or_404(bill_id)
    await bills_collection.update_one({"_id": oid}, {"$set": {"status": payload.status}})
    doc = await bills_collection.find_one({"_id": oid})
    return BillPublic.model_validate(_with_overdue(doc))


@router.get("/{bill_id}/pdf")
async def get_bill_pdf(bill_id: str, current_user: UserInDB = Depends(require_permission(Permission.BILLS_READ))):
    doc = await _get_bill_or_404(bill_id)
    room = await rooms_collection.find_one({"_id": object_id_or_404(doc["room_id"])})
    tenant = None
    if doc.get("tenant_id"):
        tenant = await tenants_collection.find_one({"_id": object_id_or_404(doc["tenant_id"])})
    pdf_bytes = generate_bill_pdf(doc, room, tenant)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{doc["bill_code"]}.pdf"'},
    )


async def _get_bill_or_404(bill_id: str) -> dict:
    oid = object_id_or_404(bill_id, "Không tìm thấy hóa đơn")
    doc = await bills_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy hóa đơn")
    return doc
