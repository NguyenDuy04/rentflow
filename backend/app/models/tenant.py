from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.common import PyObjectId

TenantStatus = Literal["active", "ended"]
DATE_PATTERN = r"^\d{4}-\d{2}-\d{2}$"


class TenantBase(BaseModel):
    full_name: str = Field(min_length=1)
    phone: str = Field(min_length=1)
    email: Optional[EmailStr] = None
    national_id: str = Field(min_length=1, description="CCCD")
    address: Optional[str] = None
    room_id: Optional[str] = None
    lease_start_date: str = Field(pattern=DATE_PATTERN, description="YYYY-MM-DD")
    lease_end_date: Optional[str] = Field(default=None, pattern=DATE_PATTERN)
    deposit_amount: float = Field(default=0, ge=0)
    status: TenantStatus = "active"


class TenantCreate(TenantBase):
    pass


class TenantUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    national_id: Optional[str] = None
    address: Optional[str] = None
    lease_start_date: Optional[str] = Field(default=None, pattern=DATE_PATTERN)
    lease_end_date: Optional[str] = Field(default=None, pattern=DATE_PATTERN)
    deposit_amount: Optional[float] = None


class TenantPublic(TenantBase):
    id: PyObjectId = Field(validation_alias="_id")
    created_at: datetime
    updated_at: datetime
    portal_enabled: bool = False

    model_config = ConfigDict(populate_by_name=True)


class TransferRoomRequest(BaseModel):
    new_room_id: str
