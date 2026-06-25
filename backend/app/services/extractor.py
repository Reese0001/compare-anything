from collections.abc import Iterable

from app.models.item import Item

PROMPT_EXTRACT_ITEM = """You extract structured attributes from arbitrary input. Return JSON only."""


def build_item_from_manual_text(text: str) -> dict[str, str | dict[str, str] | None]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    title = lines[0][:255] if lines else "Untitled item"
    summary = " ".join(lines[1:3]) if len(lines) > 1 else text[:280]

    return {
        "title": title,
        "source_value": text,
        "summary": summary or None,
        "price": None,
        "category": "manual",
        "specs": {
            "input_length": str(len(text)),
            "line_count": str(len(lines)),
        },
    }


def build_item_from_url(url: str) -> dict[str, str | dict[str, str] | None]:
    domain = url.split("//", maxsplit=1)[-1].split("/", maxsplit=1)[0]
    return {
        "title": domain,
        "source_value": url,
        "summary": f"Imported from {domain}",
        "price": None,
        "category": "url",
        "specs": {
            "domain": domain,
            "source": "stub-url-import",
        },
    }


def build_item_from_image(image_url: str) -> dict[str, str | dict[str, str] | None]:
    filename = image_url.rstrip("/").split("/")[-1] or "image"
    return {
        "title": filename[:255],
        "source_value": image_url,
        "summary": "Image item queued for OCR extraction.",
        "price": None,
        "category": "image",
        "specs": {
            "filename": filename,
            "source": "stub-image-import",
        },
    }


def normalize_specs(items: Iterable[Item]) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for item in items:
        row = {
            "title": item.title,
            "source_type": item.source_type,
            "category": item.category or "",
            "price": item.price or "",
        }
        for key, value in (item.specs or {}).items():
            row[key] = value
        rows.append(row)
    return rows
