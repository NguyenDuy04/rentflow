from datetime import datetime

from fastapi import APIRouter, Depends, Query

from app.api.deps import require_permission
from app.core.permissions import Permission
from app.db.mongodb import audit_logs_collection
from app.models.user import UserInDB

router = APIRouter(prefix="/audit-logs", tags=["audit"])


@router.get("")
async def list_audit_logs(
    actor_role: str | None = None,
    action: str | None = None,
    since: datetime | None = None,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    current_user: UserInDB = Depends(require_permission(Permission.AUDIT_READ)),
):
    query: dict = {}
    if actor_role:
        query["actor_role"] = actor_role
    if action:
        query["action"] = {"$regex": action, "$options": "i"}
    if since:
        query["created_at"] = {"$gte": since}

    cursor = audit_logs_collection.find(query).sort("created_at", -1).skip(offset).limit(limit)
    docs = await cursor.to_list(length=limit)
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return {
        "items": docs,
        "total": await audit_logs_collection.count_documents(query),
        "limit": limit,
        "offset": offset,
    }