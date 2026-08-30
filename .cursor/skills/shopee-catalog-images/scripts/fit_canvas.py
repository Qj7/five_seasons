#!/usr/bin/env python3
"""Letterbox a generated shoe photo onto the catalog / gallery canvas.

Usage:
  python3 fit_canvas.py --cutout --key-magenta src.png public/products/new/{stem}.png
  python3 fit_canvas.py --gallery src.png public/products/new/gallery/{stem}-front.png
"""

from __future__ import annotations

import argparse
import collections
import sys
from pathlib import Path

from PIL import Image

CUTOUT = (1000, 720)
GALLERY = (1536, 1024)
PAD = 0.08
MAGENTA = (255, 0, 255)


def checkerboard(im: Image.Image) -> bool:
    """True only for a baked gray/white checker, not a solid white studio."""
    im = im.convert("RGBA")
    w, h = min(im.size[0], 48), min(im.size[1], 48)
    patch = im.crop((0, 0, w, h))
    lights, mids = 0, 0
    n = 0
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r, g, b, a = patch.getpixel((x, y))
            if a < 200:
                continue
            n += 1
            avg = (r + g + b) / 3
            if avg > 245:
                lights += 1
            elif 170 < avg < 220 and abs(r - g) < 12 and abs(g - b) < 12:
                mids += 1
    if n < 20:
        return False
    return lights / n > 0.25 and mids / n > 0.25


def drop_magenta_pixels(im: Image.Image, tol: int = 90) -> Image.Image:
    """Zero any remaining magenta (enclosed holes, shadows, resize fringe)."""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    tr, tg, tb = MAGENTA
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if abs(r - tr) + abs(g - tg) + abs(b - tb) <= tol:
                px[x, y] = (0, 0, 0, 0)
            elif r > 180 and b > 180 and g < 90:
                px[x, y] = (0, 0, 0, 0)
    return im


def key_chroma(im: Image.Image, rgb: tuple[int, int, int], tol: int = 55) -> Image.Image:
    """Flood-key a chroma color from the edges (keeps interior holes connected to bg)."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    tr, tg, tb = rgb

    def is_key(x: int, y: int) -> bool:
        r, g, b, a = px[x, y]
        if a == 0:
            return True
        return abs(r - tr) + abs(g - tg) + abs(b - tb) <= tol

    seen = bytearray(w * h)
    q = collections.deque()

    def push(x: int, y: int) -> None:
        i = y * w + x
        if seen[i]:
            return
        if is_key(x, y):
            seen[i] = 1
            q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while q:
        x, y = q.popleft()
        px[x, y] = (0, 0, 0, 0)
        if x > 0:
            push(x - 1, y)
        if x + 1 < w:
            push(x + 1, y)
        if y > 0:
            push(x, y - 1)
        if y + 1 < h:
            push(x, y + 1)
    return im


def letterbox(
    src: Path,
    dst: Path,
    size: tuple[int, int],
    transparent: bool,
    key_magenta: bool,
) -> None:
    im = Image.open(src)
    if transparent:
        im = im.convert("RGBA")
        if checkerboard(im):
            print(f"CHECKERBOARD {src} — regenerate, do not flood-fill", file=sys.stderr)
            sys.exit(3)
        if key_magenta:
            im = key_chroma(im, MAGENTA)
            im = drop_magenta_pixels(im)
    else:
        im = im.convert("RGB")

    cw, ch = size
    max_w = int(cw * (1 - 2 * PAD))
    max_h = int(ch * (1 - 2 * PAD))
    ratio = min(max_w / im.width, max_h / im.height)
    nw, nh = max(1, int(im.width * ratio)), max(1, int(im.height * ratio))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (cw - nw) // 2
    y = (ch - nh) // 2

    if transparent:
        canvas = Image.new("RGBA", size, (0, 0, 0, 0))
        if im.mode != "RGBA":
            im = im.convert("RGBA")
        canvas.alpha_composite(im, (x, y))
        if key_magenta:
            canvas = drop_magenta_pixels(canvas)
        canvas.save(dst, "PNG", optimize=True)
    else:
        canvas = Image.new("RGB", size, (255, 255, 255))
        canvas.paste(im.convert("RGB"), (x, y))
        canvas.save(dst, "PNG", optimize=True)

    print(f"wrote {dst} {size[0]}x{size[1]} {'RGBA' if transparent else 'RGB'}")


def main() -> int:
    p = argparse.ArgumentParser()
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--cutout", action="store_true")
    g.add_argument("--gallery", action="store_true")
    p.add_argument("--key-magenta", action="store_true")
    p.add_argument("src")
    p.add_argument("dst")
    args = p.parse_args()
    dst = Path(args.dst)
    dst.parent.mkdir(parents=True, exist_ok=True)
    if args.cutout:
        letterbox(Path(args.src), dst, CUTOUT, True, args.key_magenta)
    else:
        letterbox(Path(args.src), dst, GALLERY, False, False)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
