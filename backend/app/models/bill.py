from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.common import PyObjectId
from app.models.meter import MONTH_PATTERN

BillStatus = Literal["unpaid", "paid"]


class BillPublic(BaseModel):
    id: PyObjectId = Field(validation_alias="_id")
    bill_code: str
    month: str
    room_id: str
    tenant_id: Optional[str] = None

    room_rent: float
    electricity_consumption: float
    electricity_amount: float
    water_consumption: float
    water_amount: float
    internet_fee: float
    parking_fee: float
    cleaning_fee: float
    other_fee: float
    total_amount: float

    status: BillStatus
    is_overdue: bool = False
    due_date: datetime
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)


class GenerateBillRequest(BaseModel):
    month: str = Field(pattern=MONTH_PATTERN, description="YYYY-MM")
    room_id: Optional[str] = Field(
        default=None, description="Bo trong de tao hoa don cho tat ca phong dang thue"
    )


class BillStatusUpdate(BaseModel):
    status: BillStatus
