from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.common import PyObjectId

IssueCategory = Literal["plumbing", "electrical", "appliance", "other"]
IssueStatus = Literal["open", "in_progress", "resolved"]


class IssueCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=5, max_length=4000)
    category: IssueCategory = "other"


class IssueUpdate(BaseModel):
    status: IssueStatus
    staff_note: Optional[str] = Field(default=None, max_length=1000)


class IssuePublic(BaseModel):
    id: PyObjectId = Field(validation_alias="_id")
    tenant_id: str
    tenant_name: str
    room_id: str
    room_label: str
    title: str
    description: str
    category: IssueCategory
    status: IssueStatus
    staff_note: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(populate_by_name=True)