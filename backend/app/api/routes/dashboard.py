from calendar import monthrange
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user, require_permission
from app.core.permissions import Permission
from app.db.mongodb import bills_collection, payments_collection, rooms_collection, tenants_collection
from app.models.user import UserInDB

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _clean(doc: dict) -> dict:
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    return doc


@router.get("/overview")
async def get_overview(current_user: UserInDB = Depends(require_permission(Permission.DASHBOARD_READ))):
    total_rooms = await rooms_collection.count_documents({})
    occupied_rooms = await rooms_collection.count_documents({"status": "occupied"})
    vacant_rooms = await rooms_collection.count_documents({"status": "available"})
    maintenance_rooms = await rooms_collection.count_documents({"status": "maintenance"})
    occupancy_rate = round(occupied_rooms / total_rooms * 100, 1) if total_rooms else 0.0

    now = datetime.now(timezone.utc)
    month_start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    days_in_month = monthrange(now.year, now.month)[1]
    month_end = month_start + timedelta(days=days_in_month)

    revenue_cursor = payments_collection.aggregate(
        [
            {"$match": {"payment_date": {"$gte": month_start, "$lt": month_end}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]
    )
    revenue_docs = await revenue_cursor.to_list(length=1)
    current_month_revenue = revenue_docs[0]["total"] if revenue_docs else 0

    unpaid_bills_count = await bills_collection.count_documents({"status": "unpaid"})

    return {
        "total_rooms": total_rooms,
        "occupied_rooms": occupied_rooms,
        "vacant_rooms": vacant_rooms,
        "maintenance_rooms": maintenance_rooms,
        "occupancy_rate": occupancy_rate,
        "current_month_revenue": current_month_revenue,
        "unpaid_bills_count": unpaid_bills_count,
    }


@router.get("/alerts")
async def get_alerts(current_user: UserInDB = Depends(require_permission(Permission.DASHBOARD_READ))):
    now = datetime.now(timezone.utc)
    overdue_docs = (
        await bills_collection.find({"status": "unpaid", "due_date": {"$lt": now}})
        .sort("due_date", 1)
        .to_list(length=100)
    )

    today_str = now.date().isoformat()
    soon_str = (now + timedelta(days=30)).date().isoformat()
    expiring_docs = (
        await tenants_collection.find(
            {
                "status": "active",
                "lease_end_date": {"$gte": today_str, "$lte": soon_str},
            }
        )
        .sort("lease_end_date", 1)
        .to_list(length=200)
    )

    maintenance_docs = await rooms_collection.find({"status": "maintenance"}).to_list(length=200)

    return {
        "overdue_bills": [_clean(d) for d in overdue_docs],
        "expiring_contracts": [_clean(d) for d in expiring_docs],
        "maintenance_rooms": [_clean(d) for d in maintenance_docs],
    }


@router.get("/revenue-chart")
async def get_revenue_chart(
    months: int = Query(6, ge=1, le=24), current_user: UserInDB = Depends(require_permission(Permission.DASHBOARD_READ))
):
    now = datetime.now(timezone.utc)
    cursor_year, cursor_month = now.year, now.month
    month_keys = []
    for _ in range(months):
        month_keys.append(f"{cursor_year:04d}-{cursor_month:02d}")
        cursor_month -= 1
        if cursor_month == 0:
            cursor_month = 12
            cursor_year -= 1
    month_keys.reverse()

    result = []
    for key in month_keys:
        year, month = map(int, key.split("-"))
        start = datetime(year, month, 1, tzinfo=timezone.utc)
        end_month, end_year = (month + 1, year) if month < 12 else (1, year + 1)
        end = datetime(end_year, end_month, 1, tzinfo=timezone.utc)
        cursor = payments_collection.aggregate(
            [
                {"$match": {"payment_date": {"$gte": start, "$lt": end}}},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
            ]
        )
        docs = await cursor.to_list(length=1)
        result.append({"month": key, "revenue": docs[0]["total"] if docs else 0})
    return result


@router.get("/recent-activities")
async def get_recent_activities(
    limit: int = Query(10, ge=1, le=50), current_user: UserInDB = Depends(require_permission(Permission.DASHBOARD_READ))
):
    activities = []

    recent_tenants = await tenants_collection.find({}).sort("created_at", -1).to_list(length=limit)
    for t in recent_tenants:
        activities.append(
            {
                "type": "new_tenant",
                "description": f"Người thuê mới: {t['full_name']}",
                "timestamp": t["created_at"],
            }
        )

    recent_payments = await payments_collection.find({}).sort("created_at", -1).to_list(length=limit)
    for p in recent_payments:
        activities.append(
            {
                "type": "new_payment",
                "description": f"Thanh toán mới: {p['amount']:,.0f}đ",
                "timestamp": p["created_at"],
            }
        )

    recent_bills = await bills_collection.find({}).sort("created_at", -1).to_list(length=limit)
    for b in recent_bills:
        activities.append(
            {
                "type": "new_bill",
                "description": f"Hóa đơn mới: {b['bill_code']}",
                "timestamp": b["created_at"],
            }
        )

    activities.sort(key=lambda a: a["timestamp"], reverse=True)
    return activities[:limit]
