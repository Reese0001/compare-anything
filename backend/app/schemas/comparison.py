from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ComparisonCreate(BaseModel):
    item_ids: list[str] = Field(min_length=2)


class ComparisonRead(BaseModel):
    id: str
    item_ids: list[str]
    dimensions: list[str]
    report: str
    table_data: list[dict[str, str]]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
