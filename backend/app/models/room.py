from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.common import PyObjectId

RoomStatus = Literal["available", "occupied", "maintenance"]


class RoomBase(BaseModel):
    room_code: str = Field(min_length=1, description="Ma phong")
    name: str = Field(min_length=1, description="Ten phong")
    floor: Optional[str] = None
    area: Optional[float] = Field(default=None, ge=0)
    rent_price: float = Field(ge=0, description="Gia thue / thang")
    deposit_required: float = Field(default=0, ge=0)
    max_occupants: int = Field(default=1, ge=1)
    status: RoomStatus = "available"
    note: Optional[str] = None


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    room_code: Optional[str] = None
    name: Optional[str] = None
    floor: Optional[str] = None
    area: Optional[float] = None
    rent_price: Optional[float] = None
    deposit_required: Optional[float] = None
    max_occupants: Optional[int] = None
    status: Optional[RoomStatus] = None
    note: Optional[str] = None


class RoomStatusUpdate(BaseModel):
    status: RoomStatus


class RoomPublic(RoomBase):
    id: PyObjectId = Field(validation_alias="_id")

    current_occupants: int = 0

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(populate_by_name=True)
