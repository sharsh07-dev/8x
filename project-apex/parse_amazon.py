import csv
import json
import os
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

CSV_PATH = "/Users/harshshinde/Downloads/8x/amazon.csv"

departments_map = {}
products = []

def parse_price(price_str):
    if not price_str: return 0
    clean = re.sub(r'[^\d.]', '', price_str)
    try:
        return float(clean)
    except:
        return 0

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def is_image_reachable(url):
    if not url or 'http' not in url:
        return False
    try:
        req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as response:
            return response.status == 200
    except:
        return False

with open(CSV_PATH, 'r', encoding='utf-8') as f:
    all_rows = list(csv.reader(f))

    if all_rows and 'product_id' in all_rows[0][0].lower():
        all_rows = all_rows[1:]

    raw_products = []
    
    for idx, row in enumerate(all_rows):
        if len(row) < 15: continue

        prod_id = row[0]
        title = row[1]
        category_str = row[2]
        price_str = row[3]
        original_price_str = row[4]
        rating_str = row[6]
        rating_count_str = row[7]
        description = row[8]
        img_url = row[14]
        if 'http' not in img_url and len(row) > 15:
            img_url = row[15] # fallback

        cat_parts = category_str.split('|')
        if not cat_parts: continue
        
        main_dept = cat_parts[0].strip()
        sub_cat = cat_parts[1].strip() if len(cat_parts) > 1 else 'General'

        dept_slug = slugify(main_dept)
        sub_slug = slugify(sub_cat)

        if dept_slug not in departments_map:
            departments_map[dept_slug] = {
                'id': f'dept-{dept_slug}',
                'name': main_dept,
                'slug': dept_slug,
                'shortName': main_dept,
                'description': f'Explore all {main_dept}',
                'heroImage': img_url if img_url else 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
                'bannerTagline': 'Best in ' + main_dept,
                'subcategories': {}
            }

        if sub_slug not in departments_map[dept_slug]['subcategories']:
            departments_map[dept_slug]['subcategories'][sub_slug] = {
                'id': f'sub-{dept_slug}-{sub_slug}',
                'name': sub_cat,
                'slug': sub_slug,
                'description': f'Best {sub_cat}'
            }

        try:
            rating = float(rating_str)
        except:
            rating = 4.0

        try:
            rc = int(re.sub(r'[^\d]', '', rating_count_str))
        except:
            rc = 0
            
        raw_products.append({
            'id': prod_id,
            'title': title,
            'description': description,
            'price': parse_price(price_str) or parse_price(original_price_str) or 99,
            'originalPrice': parse_price(original_price_str) or parse_price(price_str) or 99,
            'department': dept_slug,
            'subcategory': sub_slug,
            'image': img_url,
            'rating': rating,
            'reviewCount': rc,
            'inStock': True,
            'stock': 50,
            'isPrime': True,
        })

print(f"Checking images for {len(raw_products)} products...")
valid_products = []

with ThreadPoolExecutor(max_workers=50) as executor:
    # Submit all image checks
    future_to_prod = {executor.submit(is_image_reachable, p['image']): p for p in raw_products[:2500]}
    
    for future in as_completed(future_to_prod):
        p = future_to_prod[future]
        try:
            if future.result():
                valid_products.append(p)
        except Exception:
            pass

print(f"Kept {len(valid_products)} products with reachable images.")
products = valid_products

# Generate mockReviews.ts
all_reviews = []
for row in all_rows:
    if len(row) < 15: continue
    prod_id = row[0]
    user_names = row[10].split(',') if len(row) > 10 else []
    review_ids = row[11].split(',') if len(row) > 11 else []
    review_titles = row[12].split(',') if len(row) > 12 else []
    review_contents = row[13].split(',') if len(row) > 13 else []
    
    # Check if this product is in our valid_products
    if not any(p['id'] == prod_id for p in products):
        continue
        
    for i in range(min(len(user_names), len(review_ids), len(review_titles), len(review_contents))):
        all_reviews.append({
            'id': review_ids[i].strip(),
            'productId': prod_id,
            'rating': 5 if i % 2 == 0 else 4, # Fallback rating
            'title': review_titles[i].strip(),
            'body': review_contents[i].strip(),
            'verifiedPurchase': True,
            'userName': user_names[i].strip(),
            'helpfulCount': i * 2,
            'createdAt': '2023-12-01T10:00:00Z'
        })

with open('src/data/mockReviews.ts', 'w', encoding='utf-8') as f:
    f.write('export const mockReviews = ')
    json.dump(all_reviews, f, indent=2)
    f.write(';\n')

# Generate departments.ts
depts_array = []
for d_slug, d_data in departments_map.items():
    subs = list(d_data['subcategories'].values())
    d_data['subcategories'] = subs
    depts_array.append(d_data)

dept_ts = f"""
export interface Subcategory {{
  id: string;
  name: string;
  slug: string;
  description: string;
}}

export interface Department {{
  id: string;
  name: string;
  shortName: string;
  slug: string;
  description: string;
  heroImage: string;
  bannerTagline: string;
  subcategories: Subcategory[];
}}

export const DEPARTMENTS: Department[] = {json.dumps(depts_array, indent=2)};

export function getDepartmentBySlug(slug: string): Department | undefined {{
  return DEPARTMENTS.find(d => d.slug === slug);
}}
"""

with open('src/data/departments.ts', 'w', encoding='utf-8') as f:
    f.write(dept_ts)

# Generate mockProducts.ts
prod_ts = f"""import {{ Product }} from '@/types/product';

export const mockProducts: any[] = {json.dumps(products[:200], indent=2)};
"""

with open('src/data/mockProducts.ts', 'w', encoding='utf-8') as f:
    f.write(prod_ts)

print("Generated departments.ts and mockProducts.ts with new dataset.")
