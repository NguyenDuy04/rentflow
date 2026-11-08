from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.common import PyObjectId


class PricingConfigBase(BaseModel):
    electricity_price: float = Field(ge=0, description="VND / kWh")
    water_price: float = Field(ge=0, description="VND / m3")
    internet_fee: float = Field(default=0, ge=0, description="VND / thang")
    parking_fee: float = Field(default=0, ge=0, description="VND / thang")
    cleaning_fee: float = Field(default=0, ge=0, description="VND / thang")
    other_fee: float = Field(default=0, ge=0, description="VND / thang")


class PricingConfigUpdate(BaseModel):
    electricity_price: Optional[float] = None
    water_price: Optional[float] = None
    internet_fee: Optional[float] = None
    parking_fee: Optional[float] = None
    cleaning_fee: Optional[float] = None
    other_fee: Optional[float] = None


class PricingConfigPublic(PricingConfigBase):
    id: PyObjectId = Field(validation_alias="_id")
    updated_at: datetime

    model_config = ConfigDict(populate_by_name=True)
