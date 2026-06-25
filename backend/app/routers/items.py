from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.item import Item
from app.schemas.item import ItemCreateImage, ItemCreateManual, ItemCreateUrl, ItemRead
from app.services.extractor import build_item_from_image, build_item_from_manual_text, build_item_from_url

router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=list[ItemRead])
async def list_items(db: Session = Depends(get_db)) -> list[Item]:
    return db.query(Item).order_by(Item.created_at.desc()).all()


@router.post("/manual", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
async def create_manual_item(payload: ItemCreateManual, db: Session = Depends(get_db)) -> Item:
    item_data = build_item_from_manual_text(payload.text)
    item = Item(source_type="manual", **item_data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/url", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
async def create_url_item(payload: ItemCreateUrl, db: Session = Depends(get_db)) -> Item:
    item_data = build_item_from_url(str(payload.url))
    item = Item(source_type="url", **item_data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/image", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
async def create_image_item(payload: ItemCreateImage, db: Session = Depends(get_db)) -> Item:
    item_data = build_item_from_image(str(payload.image_url))
    item = Item(source_type="image", **item_data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{item_id}", response_model=ItemRead)
async def get_item(item_id: str, db: Session = Depends(get_db)) -> Item:
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item
