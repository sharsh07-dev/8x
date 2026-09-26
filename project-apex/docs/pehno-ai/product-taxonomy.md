# PEHNO STYLIST - Product Taxonomy

To power an intelligent styling engine, the existing strict hierarchy (`Category > Subcategory > Product`) must be enriched with lateral, stylistic metadata.

## 1. Core Taxonomy Extension
Currently, a product is bound to a Category (e.g., "Clothing"). For Pehno Stylist, we need a **Garment Role** classification to build outfits:
- `TOP` (Shirts, T-Shirts, Jackets, Kurtas)
- `BOTTOM` (Jeans, Trousers, Shorts, Skirts)
- `FOOTWEAR` (Sneakers, Formal Shoes, Sandals)
- `ACCESSORY` (Watches, Belts, Sunglasses)
- `ONE_PIECE` (Dresses, Jumpsuits, Suits)

## 2. Normalized Color Families
Products must map their specific color (e.g., "Midnight Blue") to a normalized family for the compatibility engine:
- `Black`, `White`, `Grey`, `Navy`, `Blue`, `Brown`, `Beige`, `Cream`, `Green`, `Olive`, `Red`, `Maroon`, `Pink`, `Yellow`, `Orange`, `Purple`.

## 3. Style & Formality Taxonomy
- **Formality Score**: 0.0 (Loungewear) to 1.0 (Black Tie).
- **Style Tags**: `smart-casual`, `minimal`, `streetwear`, `ethnic`, `athletic`, `vintage`.
- **Occasion Tags**: `date`, `office`, `college`, `party`, `wedding`, `vacation`, `gym`.
- **Season Tags**: `spring`, `summer`, `autumn`, `winter`, `all-season`.

## 4. Fit & Silhouette
- `slim`, `regular`, `relaxed`, `oversized`, `skinny`.

*Audit Conclusion*: We will not break the existing Category/Subcategory model. Instead, we will add these taxonomy fields as flat metadata attributes directly on the `Product` model to facilitate fast filtering.
