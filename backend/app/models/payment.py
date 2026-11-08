from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.common import PyObjectId

PaymentMethod = Literal["cash", "bank_transfer"]


class PaymentCreate(BaseModel):
    bill_id: str
    amount: float = Field(gt=0)
    method: PaymentMethod
    payment_date: Optional[datetime] = None
    transaction_code: Optional[str] = None


class PaymentPublic(BaseModel):
    id: PyObjectId = Field(validation_alias="_id")
    bill_id: str
    amount: float
    method: PaymentMethod
    payment_date: datetime
    transaction_code: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)


class BankAccountSettingsUpdate(BaseModel):
    bank_bin: str = Field(pattern=r"^\d{6}$")
    bank_name: str = Field(min_length=2, max_length=100)
    account_number: str = Field(pattern=r"^\d{1,20}$")
    account_name: str = Field(min_length=2, max_length=100)

    @field_validator("account_name")
    @classmethod
    def normalize_account_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Tên chủ tài khoản cần ít nhất 2 ký tự")
        return value


class BankAccountSettingsPublic(BaseModel):
    bank_bin: str = ""
    bank_name: str = ""
    account_number: str = ""
    account_name: str = ""
    updated_at: Optional[datetime] = None


class VietQrResponse(BaseModel):
    amount: int
    transfer_content: str
    bank_bin: str
    bank_name: str
    account_number: str
    account_name: str
    qr_url: str
