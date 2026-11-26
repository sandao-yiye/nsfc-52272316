"""Rebuild the carousel preview sheet from assets/papers/01.png through 13.png.

Run from the site repository with Python and Pillow installed:
    python tools/build-paper-previews.py
"""

from pathlib import Path
from tempfile import NamedTemporaryFile

from PIL import Image


PAPERS = Path(__file__).resolve().parents[1] / "assets" / "papers"
COUNT = 13
COLUMNS = 3
CELL_WIDTH, CELL_HEIGHT = 800, 384


def build_sheet():
    rows = (COUNT + COLUMNS - 1) // COLUMNS
    sheet = Image.new("RGB", (COLUMNS * CELL_WIDTH, rows * CELL_HEIGHT), "white")
    for index in range(COUNT):
        filename = PAPERS / f"{index + 1:02d}.png"
        with Image.open(filename) as image:
            if image.width * CELL_HEIGHT != image.height * CELL_WIDTH:
                raise ValueError(f"{filename.name}: expected a 25:12 aspect ratio")
            if image.mode == "RGBA" or "transparency" in image.info:
                rgba = image.convert("RGBA")
                source = Image.new("RGB", rgba.size, "white")
                source.paste(rgba, mask=rgba.getchannel("A"))
            else:
                source = image.convert("RGB")
            cell = source.resize((CELL_WIDTH, CELL_HEIGHT), Image.Resampling.LANCZOS)
        x = (index % COLUMNS) * CELL_WIDTH
        y = (index // COLUMNS) * CELL_HEIGHT
        sheet.paste(cell, (x, y))
    return sheet


def main():
    sheet = build_sheet()
    destination = PAPERS / "carousel-previews.webp"
    with NamedTemporaryFile(dir=PAPERS, suffix=".webp", delete=False) as handle:
        temporary = Path(handle.name)
    try:
        sheet.save(temporary, format="WEBP", quality=76, method=5)
        temporary.replace(destination)
    finally:
        temporary.unlink(missing_ok=True)
    print(f"{destination.name}: {sheet.width} x {sheet.height}, {destination.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
