# Temp Crocs catalog DB

- `crocs-catalog.json` — editable snapshot (EN names, soldOut, colors)
- App source of truth: `src/data/products.ts`
- Images: `public/products/new/` (Naruto: `public/products/naruto-*.png`)

## Rollback

```bash
cp backups/pre-crocs-replace-2026-08-05-fresh/products.ts src/data/products.ts
# restore images from backups/pre-crocs-replace-2026-08-05-fresh/products-images/
```
