from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.common import PyObjectId

UserRole = Literal["owner", "staff", "tenant"]


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole = "owner"
    tenant_id: Optional[str] = None


class UserInDB(UserBase):
    id: PyObjectId = Field(validation_alias="_id")
    hashed_password: str
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)


class UserPublic(UserBase):
    id: PyObjectId = Field(validation_alias="_id")
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)


class StaffAccountCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=120)
    phone: Optional[str] = None
    password: str = Field(min_length=8)


class TenantAccountCreate(BaseModel):
    tenant_id: str
    password: str = Field(min_length=8)


class ManagedUserPublic(UserPublic):
    role: UserRole
