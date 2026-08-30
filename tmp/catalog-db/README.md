# Temp Crocs catalog DB

Editable snapshot of the catalog after the Shopee-based replace.

- `crocs-catalog.json` — all products with English color/model names, soldOut flags, Shopee sources
- Images: `public/products/new/`
- Source of truth in app: `src/data/products.ts`

## Rollback

```bash
cp backups/pre-crocs-replace-2026-08-05/products.ts src/data/products.ts
rm -rf public/products/new
# optional: restore old images
# cp -R backups/pre-crocs-replace-2026-08-05/products-images/* public/products/
```

## How to tweak

1. Edit `crocs-catalog.json` (names, soldOut, prices, colorName)
2. Or edit `src/data/products.ts` directly
3. Replace images under `public/products/new/` keeping the same filenames
