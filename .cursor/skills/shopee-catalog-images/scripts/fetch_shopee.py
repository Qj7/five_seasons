#!/usr/bin/env python3
"""Download every listing photo for a Shopee product into a job pack.

Usage:
  python3 fetch_shopee.py <shopee-url>
  python3 fetch_shopee.py --shop 1339195530 --item 26491424277

Writes tmp/image-jobs/{shop}-{item}/meta.json and originals/00.jpg …
Exit 0 if at least one image was saved.
Exit 2 if the listing was reached but no images (drop files into originals/).
Exit 1 on usage / network failure.
"""

from __future__ import annotations

import argparse
import json
import re
import ssl
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
JOBS = ROOT / "tmp" / "image-jobs"

UA = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
CTX = ssl.create_default_context()

CDN_HOSTS = (
    "https://down-vn.img.susercontent.com/file/{fid}",
    "https://down-sg.img.susercontent.com/file/{fid}",
    "https://down-bs.img.susercontent.com/file/{fid}",
    "https://cf.shopee.vn/file/{fid}",
)

FILE_ID_RE = re.compile(
    r"(?:susercontent\.com/file/|cf\.shopee\.[a-z.]+/file/)([a-zA-Z0-9_-]{20,})"
)
PRODUCT_PATH_RE = re.compile(r"/product/(\d+)/(\d+)")
I_DOT_RE = re.compile(r"[?&/.-]i[./](\d+)[./](\d+)")
I_SHORT_RE = re.compile(r"[-.]i\.(\d+)\.(\d+)")


def parse_ids(url: str) -> tuple[str, str]:
    for rx in (PRODUCT_PATH_RE, I_SHORT_RE, I_DOT_RE):
        m = rx.search(url)
        if m:
            return m.group(1), m.group(2)
    raise ValueError(
        "Could not parse shop_id/item_id. Use "
        "https://shopee.vn/product/{shop}/{item} or a slug with i.{shop}.{item}"
    )


def fetch(url: str, timeout: int = 30) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "text/html,application/json,image/*,*/*",
            "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
        },
    )
    with urllib.request.urlopen(req, context=CTX, timeout=timeout) as resp:
        return resp.read()


def unique_file_ids(html: str) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for fid in FILE_ID_RE.findall(html):
        if fid in seen or len(fid) < 20:
            continue
        seen.add(fid)
        out.append(fid)
    return out


def sniff_ext(data: bytes) -> str:
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if data[:3] == b"GIF":
        return "gif"
    if data[:2] == b"\xff\xd8":
        return "jpg"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return "jpg"


def download_fid(fid: str) -> bytes | None:
    for tmpl in CDN_HOSTS:
        try:
            data = fetch(tmpl.format(fid=fid), timeout=20)
        except (urllib.error.URLError, TimeoutError, ssl.SSLError):
            continue
        if len(data) < 2000:
            continue
        if data[:1] in (b"{", b"<"):
            continue
        return data
    return None


def og_title(html: str) -> str | None:
    for rx in (
        r'property="og:title"\s+content="([^"]+)"',
        r'content="([^"]+)"\s+property="og:title"',
        r'og:title"\s+content="([^"]+)"',
    ):
        m = re.search(rx, html, re.I)
        if m:
            return m.group(1)
    return None


def run(shop: str, item: str) -> int:
    job = JOBS / f"{shop}-{item}"
    originals = job / "originals"
    originals.mkdir(parents=True, exist_ok=True)

    url = f"https://shopee.vn/product/{shop}/{item}"
    try:
        html = fetch(url).decode("utf-8", errors="ignore")
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"FAILED fetch listing: {exc}", file=sys.stderr)
        return 1

    (job / "page.html").write_text(html, encoding="utf-8")
    fids = unique_file_ids(html)
    title = og_title(html)

    saved: list[str] = []
    for i, fid in enumerate(fids[:60]):
        data = download_fid(fid)
        if not data:
            print(f"  skip {fid[:36]}", file=sys.stderr)
            continue
        name = f"{i:02d}.{sniff_ext(data)}"
        (originals / name).write_bytes(data)
        saved.append(name)
        print(f"  saved {name} {len(data)} bytes")
        time.sleep(0.12)

    meta = {
        "url": url,
        "shop": shop,
        "item": item,
        "title": title,
        "fileIds": fids,
        "saved": saved,
        "jobDir": str(job.relative_to(ROOT)),
        "originalsDir": str(originals.relative_to(ROOT)),
    }
    (job / "meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(meta, ensure_ascii=False, indent=2))

    if not saved:
        print(
            f"NO_IMAGES: drop files into {originals} and continue.",
            file=sys.stderr,
        )
        return 2
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("url", nargs="?", help="Shopee product URL")
    p.add_argument("--shop", help="Shopee shop_id")
    p.add_argument("--item", help="Shopee item_id")
    args = p.parse_args()

    try:
        if args.shop and args.item:
            shop, item = args.shop, args.item
        elif args.url:
            shop, item = parse_ids(args.url)
        else:
            p.print_help()
            return 1
    except ValueError as exc:
        print(exc, file=sys.stderr)
        return 1

    return run(shop, item)


if __name__ == "__main__":
    raise SystemExit(main())
