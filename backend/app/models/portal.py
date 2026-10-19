from pydantic import BaseModel

from app.models.bill import BillPublic
from app.models.issue import IssuePublic
from app.models.payment import PaymentPublic
from app.models.room import RoomPublic
from app.models.tenant import TenantPublic


class TenantPortalOverview(BaseModel):
    tenant: TenantPublic
    room: RoomPublic | None
    bills: list[BillPublic]
    payments: list[PaymentPublic]
    issues: list[IssuePublic]