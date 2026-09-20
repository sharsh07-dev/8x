export interface CuratedCollection {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  heroImage: string;
  tag: string;
  productIds: string[];
}

export const COLLECTIONS: CuratedCollection[] = [
  {
    id: 'col-tech',
    name: 'Bestselling Tech & Audio',
    slug: 'bestsellers-tech',
    subtitle: 'Top-rated electronics with instant Prime delivery',
    description: 'Immerse yourself in industry-leading noise cancellation, wireless charging, and precision acoustic engineering.',
    heroImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Top Rated Tech',
    productIds: ['prod-1', 'prod-2', 'prod-6', 'prod-8'],
  },
  {
    id: 'col-fashion',
    name: 'Modern Wardrobe Essentials',
    slug: 'modern-wardrobe',
    subtitle: 'Curated menswear, womenswear, and footwear',
    description: 'Elevated essentials designed for everyday comfort, timeless aesthetics, and versatile styling.',
    heroImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
    tag: 'Fashion Spotlight',
    productIds: ['prod-cloth-1', 'prod-cloth-2', 'prod-cloth-3', 'prod-cloth-4', 'prod-cloth-5'],
  },
  {
    id: 'col-home-office',
    name: 'Work From Home Productivity',
    slug: 'work-from-home',
    subtitle: 'Everything you need for an ergonomic workspace',
    description: 'Curated ergonomic furniture, noise-canceling headphones, and minimalist desk notebooks.',
    heroImage: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1200&q=80',
    tag: 'Productivity Hub',
    productIds: ['prod-2', 'prod-4', 'prod-5', 'prod-6'],
  },
  {
    id: 'col-wellness',
    name: 'Self-Care & Daily Wellness',
    slug: 'wellness-routine',
    subtitle: 'Dermatologist-tested skincare and active lifestyle gear',
    description: 'Start your morning refreshed with restorative skincare, hydration essentials, and workout mats.',
    heroImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    tag: 'Wellness Routine',
    productIds: ['prod-3', 'prod-7', 'prod-1'],
  },
];

export function getCollectionBySlug(slug: string): CuratedCollection | undefined {
  return COLLECTIONS.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}
