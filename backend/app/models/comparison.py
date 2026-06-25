from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Comparison(Base):
    __tablename__ = "comparisons"

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid4()))
    item_ids: Mapped[list[str]] = mapped_column(JSON)
    dimensions: Mapped[list[str]] = mapped_column(JSON)
    report: Mapped[str] = mapped_column(Text())
    table_data: Mapped[list[dict[str, str]]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
