import { Product } from '@/types/product';

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    title: 'Apple AirPods Pro (2nd Generation) Wireless Earbuds with USB-C Charging',
    price: 189.99,
    originalPrice: 249.00,
    rating: 4.7,
    reviewCount: 14820,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    category: 'Electronics',
    isPrime: true,
    inStock: true,
    badge: 'Overall Pick',
    description: 'Up to 2x more Active Noise Cancellation. Transparency mode. Personalized Spatial Audio with dynamic head tracking.'
  },
  {
    id: 'prod-2',
    title: 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones',
    price: 328.00,
    originalPrice: 399.99,
    rating: 4.6,
    reviewCount: 9240,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    category: 'Electronics',
    isPrime: true,
    inStock: true,
    badge: 'Best Seller',
    description: 'Two processors control 8 microphones for unprecedented noise cancellation. Auto NC Optimizer automatically optimizes noise canceling.'
  },
  {
    id: 'prod-3',
    title: 'Kindle Paperwhite (16 GB) – 6.8" display, adjustable warm light, up to 10 weeks battery',
    price: 139.99,
    originalPrice: 149.99,
    rating: 4.8,
    reviewCount: 31200,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    category: 'Devices',
    isPrime: true,
    inStock: true,
    badge: 'Apex Exclusive',
    description: 'Now with a 6.8” display and thinner borders, adjustable warm light, up to 10 weeks of battery life, and 20% faster page turns.'
  },
  {
    id: 'prod-4',
    title: 'Stanley Quencher H2.0 FlowState Stainless Steel Vacuum Insulated Tumbler 40oz',
    price: 45.00,
    rating: 4.5,
    reviewCount: 24150,
    image: 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?auto=format&fit=crop&w=600&q=80',
    category: 'Home & Kitchen',
    isPrime: true,
    inStock: true,
    badge: 'Trending Now',
    description: 'Constructed of recycled stainless steel for sustainable sipping, our 40 oz Quencher H2.0 offers maximum hydration with fewer refills.'
  },
  {
    id: 'prod-5',
    title: 'Apple Watch Series 9 [GPS 41mm] Smartwatch with Midnight Aluminum Case',
    price: 329.00,
    originalPrice: 399.00,
    rating: 4.7,
    reviewCount: 5680,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    category: 'Smartwatches',
    isPrime: true,
    inStock: true,
    description: 'Powerful health insights, innovative safety features, and a magically easy way to interact with double tap gesture.'
  },
  {
    id: 'prod-6',
    title: 'Anker Magnetic Power Bank, 10,000mAh Wireless Portable Charger with USB-C',
    price: 39.99,
    originalPrice: 49.99,
    rating: 4.4,
    reviewCount: 8120,
    image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=600&q=80',
    category: 'Accessories',
    isPrime: true,
    inStock: true,
    badge: 'Limited Time Deal',
    description: 'Snap & Go wireless charging for iPhone 15/14/13/12 series with strong magnetic hold and 20W high-speed USB-C output.'
  },
  {
    id: 'prod-7',
    title: 'Logitech MX Master 3S Advanced Wireless Performance Mouse, Quiet Clicks',
    price: 99.99,
    rating: 4.8,
    reviewCount: 16800,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    category: 'Computers',
    isPrime: true,
    inStock: true,
    badge: 'Top Rated',
    description: 'Any-surface tracking - now 8K DPI: Use MX Master 3S cordless computer mouse to work on any surface - even glass.'
  },
  {
    id: 'prod-8',
    title: 'Ninja AF101 Air Fryer that Crisps, Roasts, Reheats, & Dehydrates, 4 Qt Capacity',
    price: 89.95,
    originalPrice: 129.99,
    rating: 4.8,
    reviewCount: 54900,
    image: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?auto=format&fit=crop&w=600&q=80',
    category: 'Home & Kitchen',
    isPrime: true,
    inStock: true,
    badge: 'Popular',
    description: 'Now enjoy guilt-free food. Air fry with up to 75 percent less fat than traditional frying methods.'
  }
];

export const categories = [
  'All Departments',
  'Electronics',
  'Computers',
  'Smart Home',
  'Home & Kitchen',
  'Fashion',
  'Beauty & Care',
  'Books',
  'Deals'
];
