from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, HttpUrl


SourceType = Literal["url", "image", "manual"]


class ItemBase(BaseModel):
    title: str
    source_type: SourceType
    source_value: str | None = None
    summary: str | None = None
    price: str | None = None
    category: str | None = None
    specs: dict[str, str] | None = None


class ItemCreateManual(BaseModel):
    text: str


class ItemCreateUrl(BaseModel):
    url: HttpUrl


class ItemCreateImage(BaseModel):
    image_url: HttpUrl


class ItemRead(ItemBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
