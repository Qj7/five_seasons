---
name: shopee-catalog-images
description: >-
  Fetches all photos from a Shopee listing, classifies angles/colorways, then
  delegates GenerateImage to the product-image-gen subagent so the app gets a
  transparent side cutout plus front/top/heel gallery shots. Use when the user
  pastes a Shopee URL, shop/item id, or asks to add/resync Crocs photos from
  Shopee.
---

# Shopee catalog images

Shopee photos are **identity refs only**. The app never displays them. Each SKU needs four generated files matching the gold tiles already in the repo.

## Scripts

Run from the repo root. Scripts live in `scripts/` (source also in [scripts.md](scripts.md)).

```bash
python3 .cursor/skills/shopee-catalog-images/scripts/fetch_shopee.py "<shopee-url>"
# exit 0 = originals saved
# exit 2 = listing reached, 0 images → ask user to drop files into originals/
# exit 1 = parse/network failure

python3 .cursor/skills/shopee-catalog-images/scripts/fit_canvas.py --cutout --key-magenta <src> public/products/new/{stem}.png
python3 .cursor/skills/shopee-catalog-images/scripts/fit_canvas.py --gallery <src> public/products/new/gallery/{stem}-{front|top|heel}.png
```

Job pack: `tmp/image-jobs/{shop}-{item}/` with `meta.json` and `originals/`.

Do not install Playwright, rembg, or onnx unless the user asks.

## Workflow

Copy and track:

```
- [ ] Fetch originals
- [ ] Classify every original (Read the image)
- [ ] Write angles.json + brief.json
- [ ] Launch product-image-gen subagent
- [ ] Quality-gate outputs
- [ ] Wire src/data/products.ts if this is a new SKU
```

### 1. Fetch

Parse `shop_id` / `item_id` from `/product/{shop}/{item}` or `i.{shop}.{item}`. Run `fetch_shopee.py`. If exit 2, stop and ask for files in `originals/`.

### 2. Classify

`Read` each file in `originals/`. Write `angles.json`:

```json
{
  "jobDir": "tmp/image-jobs/{shop}-{item}",
  "photos": [
    {
      "file": "00.jpg",
      "view": "side",
      "colorway": "white",
      "identity": true,
      "toe": "right"
    }
  ]
}
```

`view`: `side` | `front` | `top` | `heel` | `three_quarter` | `pair` | `on_foot` | `detail` | `infographic` | `other`

Drop infographics, size charts, banners, photos with no shoe. Group remaining identity photos by colorway / SKU stem (`classic-white`, `naruto-kakashi`, …).

Then write `brief.json`:

```json
{
  "skus": [
    {
      "id": "classic-white",
      "colorName": "White",
      "identityRefs": ["tmp/image-jobs/{shop}-{item}/originals/00.jpg"],
      "angleRefs": {
        "front": ["tmp/image-jobs/.../03.jpg"],
        "top": [],
        "heel": []
      }
    }
  ]
}
```

Use absolute paths when launching the subagent.

### 3. Generate

Launch the **product-image-gen** subagent. Pass `brief.json`, gold camera refs, and the identity image paths. Do not generate images in this orchestrator.

Do **not** pass catalog gold tiles as `reference_image_paths`. Only Shopee originals. Framing is prompt text. Cutout background: chroma magenta `#FF00FF`, then `fit_canvas.py --cutout --key-magenta`.

### 4. After the subagent

Fit canvases with `fit_canvas.py` if the subagent has not already. Confirm:

- `public/products/new/{stem}.png` — 1000×720 RGBA, corners transparent, toe right
- `public/products/new/gallery/{stem}-front.png` — 1536×1024 RGB, white studio, 3/4 front
- `…-top.png` — top-down, toe right
- `…-heel.png` — rear 3/4

If GenerateImage baked a checkerboard into the cutout, regenerate. Do not flood-fill.

New product: add an entry in `src/data/products.ts` with `image: img('{stem}.png')`. `galleryOf` already appends the three gallery files.

## What this skill does not do

- Put raw Shopee JPGs in `product.image` or the PDP hero
- Generate from the product name without Shopee refs
- Use a previous AI tile as the identity reference
