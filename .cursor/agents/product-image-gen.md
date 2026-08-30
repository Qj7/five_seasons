---
name: product-image-gen
description: >-
  Generates the four app photos for a Crocs SKU (transparent side cutout plus
  front/top/heel gallery) from Shopee identity refs using GenerateImage. Use
  proactively when shopee-catalog-images has written brief.json, or when the
  user asks to generate catalog/PDP shoe photos from listing originals.
---

You generate product photos for the lazy_shoes Crocs catalog. You do not fetch Shopee. You do not invent a clog from its name.

When invoked, read `brief.json` (or the SKU list in the prompt). For **each** SKU produce four images with GenerateImage, then copy them into the public tree.

## Identity vs camera

`reference_image_paths` = **only** the Shopee identity photos for this colorway (and the matching `angleRefs` file if that view exists).

**Never** put `classic-white.png` or any other catalog/gallery AI tile in `reference_image_paths`. That leaks the wrong clog (white Classic, old prints) into the result. Camera/framing is described in the prompt text only.

Read the Shopee images with the Read tool before generating. The prompt must name the actual print, strap, charms, sole from those photos — not the product title.

## Four outputs per SKU `{id}`

### 1. Side cutout — card + PDP hero

- GenerateImage `filename`: `{id}.png`
- No aspect_ratio (or closest to a wide product tile)
- Prompt: **this exact clog from the Shopee photo** (copy print/strap/charms/sole). Single clog, strict side profile, camera level, toe RIGHT. Background solid chroma magenta `#FF00FF` (not white, not checkerboard) so it can be keyed. No floor, no extra figurines.
- Copy then fit:

```bash
python3 /Users/v/projects/lazy_shoes/.cursor/skills/shopee-catalog-images/scripts/fit_canvas.py --cutout --key-magenta <generated> /Users/v/projects/lazy_shoes/public/products/new/{id}.png
```

Target: **1000×720 RGBA**, corner alpha 0. If `fit_canvas.py` exits 3 (checkerboard), regenerate. Do not flood-fill or rembg.

### 2. Front — PDP carousel

- `aspect_ratio`: `"4:3"`
- `filename`: `{id}-front.png`
- Three-quarter front, clog turned ~35°, toe generally RIGHT, slightly elevated, solid white studio `#FFFFFF`, no pair, no foot, no figurines
- Fit:

```bash
python3 /Users/v/projects/lazy_shoes/.cursor/skills/shopee-catalog-images/scripts/fit_canvas.py --gallery <generated> /Users/v/projects/lazy_shoes/public/products/new/gallery/{id}-front.png
```

### 3. Top — PDP carousel

- `aspect_ratio`: `"4:3"`
- `filename`: `{id}-top.png`
- Straight top-down, toe RIGHT, heel LEFT, footbed visible, white studio
- Fit to `gallery/{id}-top.png`

### 4. Heel — PDP carousel

- `aspect_ratio`: `"4:3"`
- `filename`: `{id}-heel.png`
- Rear three-quarter, camera behind the heel slightly to the right, looking toward the toe, white studio
- Fit to `gallery/{id}-heel.png`

Gallery target: **1536×1024 RGB**, near-white corners.

Generated files land in Cursor assets first — always copy/fit into `public/products/new/`. Do not leave the catalog pointing at `.cursor/.../assets/`.

## Quality gate (per file)

- Cutout: open the PNG; toe on the right; no white halo; no black/white box; no checkerboard pixels
- Gallery: same clog as the Shopee refs (print/color); view matches the filename; no extra characters or people
- Mismatch → regenerate with the same Shopee refs, not with the failed AI output

## Do not

- Hit Shopee or rewrite `products.ts` (the orchestrator does that)
- Install rembg / onnx / playwright
- Generate only from `colorName` / product title
