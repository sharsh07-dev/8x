import csv
import json
import os
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

AMAZON_CSV = "/Users/harshshinde/Downloads/8x/amazon.csv"
MYNTRA_CSV = "/Users/harshshinde/Downloads/8x/myntra202305041052.csv"

departments_map = {}
raw_products = []
all_reviews = []
seen_product_ids = set()

def parse_price(price_str):
    if not price_str: return 0
    clean = re.sub(r'[^\d.]', '', str(price_str))
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

# PARSE AMAZON
with open(AMAZON_CSV, 'r', encoding='utf-8') as f:
    all_rows = list(csv.reader(f))
    if all_rows and 'product_id' in all_rows[0][0].lower():
        all_rows = all_rows[1:]

    for idx, row in enumerate(all_rows):
        if len(row) < 15: continue

        prod_id = row[0]
        if prod_id in seen_product_ids:
            continue
        seen_product_ids.add(prod_id)
        
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

        try: rating = float(rating_str)
        except: rating = 4.0

        try: rc = int(re.sub(r'[^\d]', '', rating_count_str))
        except: rc = 0
            
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
            'brand': 'Amazon Vendor'
        })
        
        # Collect amazon reviews
        user_names = row[10].split(',') if len(row) > 10 else []
        review_ids = row[11].split(',') if len(row) > 11 else []
        review_titles = row[12].split(',') if len(row) > 12 else []
        review_contents = row[13].split(',') if len(row) > 13 else []
        for i in range(min(len(user_names), len(review_ids), len(review_titles), len(review_contents))):
            all_reviews.append({
                'id': review_ids[i].strip() or f"R-{prod_id}-{i}",
                'productId': prod_id,
                'rating': 5 if i % 2 == 0 else 4,
                'title': review_titles[i].strip(),
                'body': review_contents[i].strip(),
                'verifiedPurchase': True,
                'userName': user_names[i].strip(),
                'helpfulCount': i * 2,
                'createdAt': '2023-12-01T10:00:00Z'
            })

# PARSE MYNTRA (Limit to 1500 lines to avoid blowing up memory/time)
# "id","name","img","asin","price","mrp","rating","ratingTotal","discount","seller","purl"
print("Parsing Myntra...")
myntra_count = 0
with open(MYNTRA_CSV, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    try: next(reader) # skip header
    except: pass
    
    for row in reader:
        if len(row) < 11: continue
        
        prod_id = f"myn-{row[0]}"
        if prod_id in seen_product_ids:
            continue
        seen_product_ids.add(prod_id)
        
        title = row[1]
        img_urls = row[2].split(';')
        img_url = img_urls[0].strip() if img_urls else ''
        price_str = row[4]
        mrp_str = row[5]
        rating_str = row[6]
        rating_count_str = row[7]
        seller = row[9]
        purl = row[10]
        
        # Subcategory from purl
        # e.g. https://www.myntra.com/tshirts/roadster/...
        sub_cat = 'Fashion'
        if 'myntra.com/' in purl:
            parts = purl.split('myntra.com/')[1].split('/')
            if len(parts) > 0:
                sub_cat = parts[0].replace('-', ' ').title()
                
        main_dept = 'Clothing & Fashion'
        dept_slug = slugify(main_dept)
        sub_slug = slugify(sub_cat)
        
        if dept_slug not in departments_map:
            departments_map[dept_slug] = {
                'id': f'dept-{dept_slug}',
                'name': main_dept,
                'slug': dept_slug,
                'shortName': 'Clothing',
                'description': f'Explore all {main_dept}',
                'heroImage': img_url if img_url else 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
                'bannerTagline': 'Trendy ' + main_dept,
                'subcategories': {}
            }
            
        if sub_slug not in departments_map[dept_slug]['subcategories']:
            departments_map[dept_slug]['subcategories'][sub_slug] = {
                'id': f'sub-{dept_slug}-{sub_slug}',
                'name': sub_cat,
                'slug': sub_slug,
                'description': f'Best {sub_cat}'
            }
            
        try: rating = float(rating_str)
        except: rating = 4.2
        
        try: rc = int(rating_count_str)
        except: rc = 120
        
        raw_products.append({
            'id': prod_id,
            'title': title,
            'description': f'Premium {title} from Myntra. Top quality material.',
            'price': parse_price(price_str) or parse_price(mrp_str) or 499,
            'originalPrice': parse_price(mrp_str) or parse_price(price_str) or 999,
            'department': dept_slug,
            'subcategory': sub_slug,
            'image': img_url,
            'rating': rating,
            'reviewCount': rc,
            'inStock': True,
            'stock': 20,
            'isPrime': False,
            'brand': seller or 'Myntra Brand'
        })
        
        myntra_count += 1
        if myntra_count >= 1500:
            break

print(f"Total raw products to check: {len(raw_products)}")
valid_products = []
valid_product_ids = set()

# CHECK IMAGES IN PARALLEL
with ThreadPoolExecutor(max_workers=50) as executor:
    # Submit checks for all
    future_to_prod = {executor.submit(is_image_reachable, p['image']): p for p in raw_products}
    
    for future in as_completed(future_to_prod):
        p = future_to_prod[future]
        try:
            if future.result():
                valid_products.append(p)
                valid_product_ids.add(p['id'])
        except Exception:
            pass

print(f"Kept {len(valid_products)} products with reachable images.")

# Filter reviews to only valid products
final_reviews = [r for r in all_reviews if r['productId'] in valid_product_ids]

# Filter out empty departments and subcategories
valid_depts = {}
for p in valid_products:
    d_slug = p['department']
    s_slug = p['subcategory']
    if d_slug not in valid_depts:
        valid_depts[d_slug] = set()
    valid_depts[d_slug].add(s_slug)

depts_array = []
for d_slug, d_data in departments_map.items():
    if d_slug not in valid_depts:
        continue # Entire department has no products
        
    # Filter subcategories
    valid_subs = []
    for s_slug, s_data in d_data['subcategories'].items():
        if s_slug in valid_depts[d_slug]:
            valid_subs.append(s_data)
            
    if not valid_subs:
        continue # Just in case
        
    d_data['subcategories'] = valid_subs
    depts_array.append(d_data)

with open('src/data/departments.ts', 'w', encoding='utf-8') as f:
    f.write('export const DEPARTMENTS = ')
    json.dump(depts_array, f, indent=2)
    f.write(';\n\n')
    f.write('export function getDepartmentBySlug(slug: string) {\n')
    f.write('  return DEPARTMENTS.find((d: any) => d.slug === slug);\n')
    f.write('}\n')

with open('src/data/mockProducts.ts', 'w', encoding='utf-8') as f:
    f.write('export const mockProducts = ')
    json.dump(valid_products, f, indent=2)
    f.write(';\n')

with open('src/data/mockReviews.ts', 'w', encoding='utf-8') as f:
    f.write('export const mockReviews = ')
    json.dump(final_reviews, f, indent=2)
    f.write(';\n')

print("All done!")
