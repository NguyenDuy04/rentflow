from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.common import PyObjectId

MONTH_PATTERN = r"^\d{4}-(0[1-9]|1[0-2])$"


class MeterReadingBase(BaseModel):
    room_id: str
    month: str = Field(pattern=MONTH_PATTERN)
    electricity_old: float = Field(ge=0)
    electricity_new: float = Field(ge=0)
    water_old: float = Field(ge=0)
    water_new: float = Field(ge=0)

    @model_validator(mode="after")
    def check_readings(self):
        if self.electricity_new < self.electricity_old:
            raise ValueError("Chi so dien moi phai lon hon hoac bang chi so cu")
        if self.water_new < self.water_old:
            raise ValueError("Chi so nuoc moi phai lon hon hoac bang chi so cu")
        return self


class MeterReadingCreate(MeterReadingBase):
    electricity_old: float = Field(default=0, ge=0)
    water_old: float = Field(default=0, ge=0)


class MeterReadingUpdate(BaseModel):
    electricity_old: Optional[float] = None
    electricity_new: Optional[float] = None
    water_old: Optional[float] = None
    water_new: Optional[float] = None


class MeterReadingPublic(BaseModel):
    id: PyObjectId = Field(validation_alias="_id")

    room_id: str
    month: str

    electricity_old: float
    electricity_new: float

    water_old: float
    water_new: float

    electricity_consumption: float
    water_consumption: float

    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)
