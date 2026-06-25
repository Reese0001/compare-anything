from collections.abc import AsyncGenerator

from app.models.item import Item
from app.services.extractor import normalize_specs

PROMPT_COMPARE_ITEMS = """You compare multiple arbitrary items and produce a concise decision-oriented report."""


async def stream_comparison_report(items: list[Item]) -> AsyncGenerator[str, None]:
    titles = ", ".join(item.title for item in items)
    yield "event: message\n"
    yield f"data: Comparing {titles}\n\n"

    yield "event: message\n"
    yield "data: This is the MVP stub report. It highlights shared structure and obvious differences.\n\n"

    dimensions = suggest_dimensions(items)
    yield "event: message\n"
    yield f"data: Focus dimensions: {', '.join(dimensions)}\n\n"

    yield "event: done\n"
    yield "data: \n\n"


def suggest_dimensions(items: list[Item]) -> list[str]:
    dimensions = ["summary", "category", "source_type"]
    if any(item.price for item in items):
        dimensions.append("price")
    if any(item.specs for item in items):
        dimensions.append("specs")
    return dimensions


def build_comparison_report(items: list[Item]) -> tuple[list[str], str, list[dict[str, str]]]:
    dimensions = suggest_dimensions(items)
    table_data = normalize_specs(items)
    report_lines = [
        f"Compared {len(items)} items.",
        f"Dimensions: {', '.join(dimensions)}.",
        "This MVP report is intentionally simple and ready to be replaced by a real AI analysis service.",
    ]
    return dimensions, "\n".join(report_lines), table_data
