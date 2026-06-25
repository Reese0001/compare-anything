from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.comparison import Comparison
from app.models.item import Item
from app.schemas.comparison import ComparisonCreate, ComparisonRead
from app.services.ai_compare import build_comparison_report, stream_comparison_report

router = APIRouter(prefix="/compare", tags=["compare"])


@router.post("", response_model=ComparisonRead, status_code=status.HTTP_201_CREATED)
async def create_comparison(payload: ComparisonCreate, db: Session = Depends(get_db)) -> Comparison:
    items = db.query(Item).filter(Item.id.in_(payload.item_ids)).all()
    if len(items) != len(set(payload.item_ids)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or more items were not found")

    dimensions, report, table_data = build_comparison_report(items)
    comparison = Comparison(
        item_ids=payload.item_ids,
        dimensions=dimensions,
        report=report,
        table_data=table_data,
    )
    db.add(comparison)
    db.commit()
    db.refresh(comparison)
    return comparison


@router.post("/stream")
async def stream_comparison(payload: ComparisonCreate, db: Session = Depends(get_db)) -> StreamingResponse:
    items = db.query(Item).filter(Item.id.in_(payload.item_ids)).all()
    if len(items) != len(set(payload.item_ids)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or more items were not found")

    return StreamingResponse(stream_comparison_report(items), media_type="text/event-stream")


@router.get("/{comparison_id}", response_model=ComparisonRead)
async def get_comparison(comparison_id: str, db: Session = Depends(get_db)) -> Comparison:
    comparison = db.get(Comparison, comparison_id)
    if comparison is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comparison not found")
    return comparison
