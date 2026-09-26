import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  const csvPath = '/Users/harshshinde/Downloads/8x/archive/styles.csv';
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found at ${csvPath}`);
  }

  const csvData = fs.readFileSync(csvPath, 'utf8');
  // Just take the first 500 lines to avoid parsing errors deep in the file
  const first500Lines = csvData.split('\\n').slice(0, 501).join('\\n');
  
  const records = parse(first500Lines, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
  });

  console.log(`Parsed ${records.length} records. Taking the first 500...`);
  const sample = records.slice(0, 500);

  const categoryMap = new Map();
  const subCategoryMap = new Map();

  const targetImageDir = '/Users/harshshinde/Downloads/8x/project-apex/public/images/products';
  if (!fs.existsSync(targetImageDir)) {
    fs.mkdirSync(targetImageDir, { recursive: true });
  }
  const sourceImageDir = '/Users/harshshinde/Downloads/8x/archive/images';

  for (const row of (sample as any[])) {
    const { id, gender, masterCategory, subCategory, articleType, baseColour, productDisplayName } = row;

    if (!masterCategory || !productDisplayName) continue;

    // Categories
    const catSlug = masterCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!categoryMap.has(catSlug)) {
      const createdCat = await prisma.category.upsert({
        where: { slug: catSlug },
        update: {},
        create: { name: masterCategory, slug: catSlug },
      });
      categoryMap.set(catSlug, createdCat);
    }
    const category = categoryMap.get(catSlug);

    // Subcategories
    const subSlug = subCategory ? subCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'general';
    const uniqueSubSlug = `${catSlug}-${subSlug}`;
    if (!subCategoryMap.has(uniqueSubSlug)) {
      const createdSubCat = await prisma.subcategory.upsert({
        where: { slug: uniqueSubSlug },
        update: {},
        create: { name: subCategory || 'General', slug: uniqueSubSlug, categoryId: category.id },
      });
      subCategoryMap.set(uniqueSubSlug, createdSubCat);
    }
    const subcategory = subCategoryMap.get(uniqueSubSlug);

    // Image
    const sourceImage = path.join(sourceImageDir, `${id}.jpg`);
    const targetImage = path.join(targetImageDir, `${id}.jpg`);
    
    let imageUrl = '';
    if (fs.existsSync(sourceImage)) {
      fs.copyFileSync(sourceImage, targetImage);
      imageUrl = `/images/products/${id}.jpg`;
    } else {
      continue;
    }

    // Product
    const price = Math.floor(Math.random() * (100 - 10 + 1) + 10);
    const productSlug = `${id}-${productDisplayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 40)}`;
    
    const existing = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (existing) continue;

    const product = await prisma.product.create({
      data: {
        title: productDisplayName,
        slug: productSlug,
        description: `This is a beautiful ${baseColour} ${articleType} for ${gender}. Perfect for ${row.usage} usage in ${row.season}.`,
        price: price,
        compareAtPrice: price + 20,
        categoryId: category.id,
        subcategoryId: subcategory.id,
        status: 'ACTIVE',
      }
    });

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: imageUrl,
        alt: productDisplayName,
      }
    });

    await prisma.productInventory.create({
      data: {
        productId: product.id,
        stock: Math.floor(Math.random() * 50) + 10,
      }
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
