#!/usr/bin/env python3
"""Build catalog tiles from Shopee listing photos (identity refs only)."""

from __future__ import annotations

import collections
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
JOB = Path(__file__).resolve().parent
ORIG = JOB / "originals"
OUT = ROOT / "tmp" / "image-jobs" / "1339195530-29277471405" / "processed"
FIT = ROOT / ".cursor" / "skills" / "shopee-catalog-images" / "scripts" / "fit_canvas.py"
PUBLIC = ROOT / "public" / "products" / "new"
GALLERY = PUBLIC / "gallery"

CUTOUT = (1000, 720)
GALLERY_SIZE = (1536, 1024)
PAD = 0.08


def key_edges(im: Image.Image, target: tuple[int, int, int], tol: int) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    tr, tg, tb = target

    def is_key(x: int, y: int) -> bool:
        r, g, b, a = px[x, y]
        if a == 0:
            return True
        return abs(r - tr) + abs(g - tg) + abs(b - tb) <= tol

    seen = bytearray(w * h)
    q: collections.deque[tuple[int, int]] = collections.deque()

    def push(x: int, y: int) -> None:
        i = y * w + x
        if seen[i] or not is_key(x, y):
            return
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


def key_white(im: Image.Image, tol: int = 42) -> Image.Image:
    return key_edges(im, (255, 255, 255), tol)


def key_orange(im: Image.Image, tol: int = 70) -> Image.Image:
  # sample corners from 00.jpg orange studio
    return key_edges(im, (255, 140, 0), tol)


def key_grey_studio(im: Image.Image, tol: int = 55) -> Image.Image:
    im = key_edges(im, (210, 210, 210), tol)
    return key_edges(im, (180, 180, 180), 45)


def bbox_alpha(im: Image.Image, pad: int = 8) -> tuple[int, int, int, int]:
    im = im.convert("RGBA")
    w, h = im.size
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            if im.getpixel((x, y))[3] > 12:
                xs.append(x)
                ys.append(y)
    if not xs:
        return (0, 0, w, h)
    x0, x1 = max(0, min(xs) - pad), min(w, max(xs) + pad)
    y0, y1 = max(0, min(ys) - pad), min(h, max(ys) + pad)
    return (x0, y0, x1, y1)


def crop_box(im: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    return im.crop(box)


def letterbox_rgba(src: Image.Image, size: tuple[int, int]) -> Image.Image:
    cw, ch = size
    max_w = int(cw * (1 - 2 * PAD))
    max_h = int(ch * (1 - 2 * PAD))
    ratio = min(max_w / src.width, max_h / src.height)
    nw, nh = max(1, int(src.width * ratio)), max(1, int(src.height * ratio))
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    x, y = (cw - nw) // 2, (ch - nh) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas


def letterbox_rgb(src: Image.Image, size: tuple[int, int]) -> Image.Image:
    cw, ch = size
    max_w = int(cw * (1 - 2 * PAD))
    max_h = int(ch * (1 - 2 * PAD))
    ratio = min(max_w / src.width, max_h / src.height)
    nw, nh = max(1, int(src.width * ratio)), max(1, int(src.height * ratio))
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", size, (255, 255, 255))
    if resized.mode == "RGBA":
        canvas.paste(resized.convert("RGB"), ((cw - nw) // 2, (ch - nh) // 2), resized)
    else:
        canvas.paste(resized.convert("RGB"), ((cw - nw) // 2, (ch - nh) // 2))
    return canvas


def soften_alpha_edge(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    r, g, b, a = im.split()
    a = a.filter(ImageFilter.GaussianBlur(radius=0.6))
    return Image.merge("RGBA", (r, g, b, a))


def build_cutout() -> Path:
    src = Image.open(ORIG / "07.jpg")
    cut = key_white(src, tol=40)
    cut = soften_alpha_edge(cut)
    box = bbox_alpha(cut, pad=4)
    cut = crop_box(cut, box)
    out = OUT / "cutout-keyed.png"
    OUT.mkdir(parents=True, exist_ok=True)
    letterbox_rgba(cut, CUTOUT).save(out)
    dst = PUBLIC / "cars-mcqueen.png"
    letterbox_rgba(cut, CUTOUT).save(dst)
    return dst


def key_multi(im: Image.Image, colors: list[tuple[int, int, int]], tol: int) -> Image.Image:
    out = im
    for c in colors:
        out = key_edges(out, c, tol)
    return out


def corner_color(im: Image.Image) -> tuple[int, int, int]:
    im = im.convert("RGB")
    pts = [(2, 2), (im.width - 3, 2), (2, im.height - 3), (im.width - 3, im.height - 3)]
    rs, gs, bs = [], [], []
    for x, y in pts:
        r, g, b = im.getpixel((x, y))
        rs.append(r)
        gs.append(g)
        bs.append(b)
    return (sum(rs) // 4, sum(gs) // 4, sum(bs) // 4)


def build_front() -> Path:
    src = Image.open(ORIG / "00.jpg")
    cropped = crop_box(src, (35, 110, 500, 880))
    bg = corner_color(cropped)
    keyed = key_edges(cropped, bg, 75)
    keyed = key_multi(
        keyed,
        [(255, 200, 120), (255, 170, 90), (255, 150, 70), (255, 130, 50)],
        65,
    )
    keyed = soften_alpha_edge(keyed)
    keyed = crop_box(keyed, bbox_alpha(keyed))
    dst = GALLERY / "cars-mcqueen-front.png"
    letterbox_rgb(keyed, GALLERY_SIZE).save(dst)
    return dst


def build_top() -> Path:
    src = Image.open(ORIG / "02.jpg")
    cropped = crop_box(src, (130, 310, 420, 610)).convert("RGB")
    dst = GALLERY / "cars-mcqueen-top.png"
    letterbox_rgb(cropped, GALLERY_SIZE).save(dst)
    return dst


def build_heel() -> Path:
    src = Image.open(ORIG / "00.jpg")
    cropped = crop_box(src, (470, 90, 960, 880))
    bg = corner_color(cropped)
    keyed = key_edges(cropped, bg, 80)
    keyed = key_multi(
        keyed,
        [(255, 200, 120), (255, 170, 90), (255, 150, 70)],
        70,
    )
    keyed = soften_alpha_edge(keyed)
    keyed = crop_box(keyed, bbox_alpha(keyed))
    dst = GALLERY / "cars-mcqueen-heel.png"
    letterbox_rgb(keyed, GALLERY_SIZE).save(dst)
    return dst


def main() -> int:
    paths = [build_cutout(), build_front(), build_top(), build_heel()]
    for p in paths:
        im = Image.open(p)
        print(f"wrote {p} {im.size} {im.mode}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
