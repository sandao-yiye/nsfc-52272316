"""Rebuild the cover and display copies for members, activities and research.

From the website directory, run:
    python -m pip install "Pillow>=11.3"
    python tools/build-display-images.py
"""

from pathlib import Path
from tempfile import NamedTemporaryFile

from PIL import Image, ImageOps


ASSETS = Path(__file__).resolve().parents[1] / "assets"


def save_image(image, destination, **options):
    with NamedTemporaryFile(dir=destination.parent, suffix=destination.suffix, delete=False) as handle:
        temporary = Path(handle.name)
    try:
        image.save(temporary, **options)
        temporary.replace(destination)
    finally:
        temporary.unlink(missing_ok=True)


def build_photos(directory, widths, quality):
    previews = directory / "previews"
    previews.mkdir(exist_ok=True)
    for source in sorted(path for path in directory.iterdir() if path.suffix.lower() in {".jpg", ".png"}):
        with Image.open(source) as original:
            photo = ImageOps.exif_transpose(original).convert("RGB")
        for target in widths:
            width = min(target, photo.width)
            height = max(1, round(width * photo.height / photo.width))
            scaled = photo.resize((width, height), Image.Resampling.LANCZOS)
            save_image(scaled, previews / f"{source.stem}-{target}.webp", quality=quality, method=6)


def build_research(directory):
    previews = directory / "previews"
    previews.mkdir(exist_ok=True)
    for source in sorted(directory.glob("*.webp")):
        with Image.open(source) as figure:
            for density, box in enumerate(((576, 300), (1152, 600)), 1):
                max_size = (min(box[0], figure.width), min(box[1], figure.height))
                scaled = ImageOps.contain(figure, max_size, Image.Resampling.LANCZOS)
                save_image(scaled, previews / f"{source.stem}-{density}x.webp", quality=81, method=5)


def build_cover():
    output = ASSETS / "cover"
    output.mkdir(exist_ok=True)
    with Image.open(ASSETS / "research-cover.webp") as source:
        cover = source.convert("RGB")
    mobile = ImageOps.contain(cover, (840, 560), Image.Resampling.LANCZOS)
    height = min(cover.height, round(cover.width * 900 / 1536))
    top = round((cover.height - height) * .47)
    desktop = cover.crop((0, top, cover.width, top + height))
    save_image(desktop, output / "desktop.avif", quality=54, speed=5)
    save_image(mobile, output / "mobile.avif", quality=61, speed=5)
    save_image(mobile, output / "mobile.webp", quality=72, method=6)


if __name__ == "__main__":
    build_cover()
    build_photos(ASSETS / "members", (84, 168), 82)
    build_photos(ASSETS / "activities", (288, 448, 864), 77)
    build_research(ASSETS / "research")
    print("Updated the cover, member portraits, activity photos and research previews.")
