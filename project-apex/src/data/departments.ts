export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  departmentSlug: string;
  description: string;
  image?: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  description: string;
  heroImage: string;
  bannerTagline: string;
  accentColor: string;
  subcategories: Subcategory[];
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'dept-clothing',
    name: 'Clothing & Fashion',
    shortName: 'Clothing',
    slug: 'clothing',
    description: 'Explore trending styles, premium apparel, everyday essentials, and footwear for men, women, and kids.',
    heroImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
    bannerTagline: 'Up to 50% off seasonal fashion collections',
    accentColor: 'from-amber-600 to-rose-600',
    subcategories: [
      {
        id: 'sub-men',
        name: "Men's Fashion",
        slug: 'men',
        departmentSlug: 'clothing',
        description: 'T-shirts, shirts, jackets, denim, and casual wear for men.',
        image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'sub-women',
        name: "Women's Fashion",
        slug: 'women',
        departmentSlug: 'clothing',
        description: 'Dresses, tops, outerwear, denim, and contemporary women’s apparel.',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'sub-kids',
        name: "Kids' Fashion",
        slug: 'kids',
        departmentSlug: 'clothing',
        description: 'Playwear, school outfits, cozy sets, and jackets for boys and girls.',
        image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'sub-footwear',
        name: 'Footwear & Sneakers',
        slug: 'footwear',
        departmentSlug: 'clothing',
        description: 'Running shoes, casual sneakers, boots, and athletic footwear.',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'sub-accessories',
        name: 'Bags & Accessories',
        slug: 'accessories',
        departmentSlug: 'clothing',
        description: 'Leather wallets, backpacks, caps, sunglasses, and belts.',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'dept-electronics',
    name: 'Electronics & Audio',
    shortName: 'Electronics',
    slug: 'electronics',
    description: 'High-performance audio, premium smartphones, workstations, and smart digital accessories.',
    heroImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    bannerTagline: 'Next-gen audio and tech with guaranteed 1-day delivery',
    accentColor: 'from-blue-600 to-indigo-700',
    subcategories: [
      {
        id: 'sub-audio',
        name: 'Headphones & Earbuds',
        slug: 'audio',
        departmentSlug: 'electronics',
        description: 'Noise-canceling headphones, wireless earbuds, and studio monitors.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'sub-mobiles',
        name: 'Smartphones & Tablets',
        slug: 'mobiles',
        departmentSlug: 'electronics',
        description: 'Flagship smartphones, 5G devices, and productivity tablets.',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'sub-wearables',
        name: 'Smartwatches & Fitness Trackers',
        slug: 'wearables',
        departmentSlug: 'electronics',
        description: 'GPS smartwatches, health bands, and connected sports devices.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'dept-home',
    name: 'Home & Kitchen',
    shortName: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Cookware, coffee machines, modern home decor, and comfortable bedroom bedding.',
    heroImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    bannerTagline: 'Elevate your living space with smart kitchen and home essentials',
    accentColor: 'from-amber-700 to-orange-600',
    subcategories: [
      {
        id: 'sub-kitchen',
        name: 'Kitchen & Small Appliances',
        slug: 'kitchen',
        departmentSlug: 'home-kitchen',
        description: 'Blenders, air fryers, pour-over kettles, and cookware sets.',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'sub-decor',
        name: 'Decor & Lighting',
        slug: 'decor',
        departmentSlug: 'home-kitchen',
        description: 'Minimalist table lamps, ceramic vases, and ambient home accents.',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'dept-beauty',
    name: 'Beauty & Personal Care',
    shortName: 'Beauty',
    slug: 'beauty',
    description: 'Dermatologist-tested skincare, restorative haircare, grooming tools, and wellness.',
    heroImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    bannerTagline: 'Clean skincare and premium self-care essentials',
    accentColor: 'from-rose-500 to-pink-600',
    subcategories: [
      {
        id: 'sub-skincare',
        name: 'Skincare & Hydration',
        slug: 'skincare',
        departmentSlug: 'beauty',
        description: 'Serums, moisturizers, mineral sunscreens, and toners.',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'sub-grooming',
        name: 'Haircare & Grooming',
        slug: 'grooming',
        departmentSlug: 'beauty',
        description: 'Precision electric trimmers, nourishing shampoos, and hair oils.',
        image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'dept-books',
    name: 'Books & Stationery',
    shortName: 'Books',
    slug: 'books',
    description: 'Bestselling novels, programming & design guides, desk notebooks, and premium pens.',
    heroImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
    bannerTagline: 'Broaden your horizons with curated reads and workspace tools',
    accentColor: 'from-emerald-700 to-teal-800',
    subcategories: [
      {
        id: 'sub-nonfiction',
        name: 'Design & Engineering Books',
        slug: 'nonfiction',
        departmentSlug: 'books',
        description: 'Architecture, engineering guides, and business bestsellers.',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'sub-stationery',
        name: 'Notebooks & Pens',
        slug: 'stationery',
        departmentSlug: 'books',
        description: 'Dotted journals, archival fountain pens, and desk organizers.',
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'dept-sports',
    name: 'Sports & Fitness',
    shortName: 'Sports',
    slug: 'sports',
    description: 'Strength training equipment, yoga gear, hydration bottles, and outdoor performance kit.',
    heroImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    bannerTagline: 'Gear up for workouts, trail runs, and active living',
    accentColor: 'from-emerald-600 to-cyan-600',
    subcategories: [
      {
        id: 'sub-workout',
        name: 'Workout Equipment & Mats',
        slug: 'workout',
        departmentSlug: 'sports',
        description: 'Eco-friendly yoga mats, resistance bands, and kettlebells.',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'sub-outdoor',
        name: 'Outdoor & Hydration',
        slug: 'outdoor',
        departmentSlug: 'sports',
        description: 'Vacuum insulated water bottles, backpacks, and camping gear.',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
];

export function getDepartmentBySlug(slug: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.slug.toLowerCase() === slug.toLowerCase());
}

export function getSubcategoryBySlug(deptSlug: string, subSlug: string): Subcategory | undefined {
  const dept = getDepartmentBySlug(deptSlug);
  return dept?.subcategories.find((s) => s.slug.toLowerCase() === subSlug.toLowerCase());
}
