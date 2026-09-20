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
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Electronics',
    brand: 'Apple',
    isPrime: true,
    inStock: true,
    stock: 15,
    badge: 'Overall Pick',
    description: 'Up to 2x more Active Noise Cancellation. Transparency mode. Personalized Spatial Audio with dynamic head tracking and touch control.',
    features: [
      'Up to 2x more Active Noise Cancellation than the previous generation',
      'Adaptive Audio dynamically blends Transparency mode and Active Noise Cancellation',
      'Personalized Spatial Audio with dynamic head tracking places sound all around you',
      'MagSafe Charging Case (USB-C) with speaker, lanyard loop, and Precision Finding',
      'Up to 6 hours of listening time with ANC enabled, and up to 30 hours total listening time with the case'
    ],
    specs: {
      'Brand': 'Apple',
      'Model Name': 'AirPods Pro (2nd Gen)',
      'Color': 'White',
      'Form Factor': 'In Ear',
      'Connectivity': 'Bluetooth 5.3, USB-C'
    }
  },
  {
    id: 'prod-2',
    title: 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones',
    price: 328.00,
    originalPrice: 399.99,
    rating: 4.6,
    reviewCount: 9240,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Electronics',
    brand: 'Sony',
    isPrime: true,
    inStock: true,
    stock: 8,
    badge: 'Best Seller',
    description: 'Two processors control 8 microphones for unprecedented noise cancellation. Auto NC Optimizer automatically optimizes noise canceling based on your wearing conditions.',
    features: [
      'Industry-leading noise cancellation optimized to you',
      'Magnificent sound, engineered to perfection with the new Integrated Processor V1',
      'Crystal clear hands-free calling with 4 beamforming microphones',
      'Up to 30-hour battery life with quick charging (3 min charge for 3 hours of playback)',
      'Ultra-comfortable, lightweight design with soft fit leather'
    ],
    specs: {
      'Brand': 'Sony',
      'Model Name': 'WH1000XM5',
      'Color': 'Silver / Black',
      'Headphones Jack': '3.5mm Jack / Bluetooth',
      'Noise Control': 'Active Noise Cancellation'
    }
  },
  {
    id: 'prod-3',
    title: 'Kindle Paperwhite (16 GB) – 6.8" display, adjustable warm light, up to 10 weeks battery',
    price: 139.99,
    originalPrice: 149.99,
    rating: 4.8,
    reviewCount: 31200,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Devices',
    brand: 'Amazon / Apex',
    isPrime: true,
    inStock: true,
    stock: 20,
    badge: 'Apex Exclusive',
    description: 'Now with a 6.8” display and thinner borders, adjustable warm light, up to 10 weeks of battery life, and 20% faster page turns.',
    features: [
      'All-new Kindle Paperwhite with a 6.8” display and thinner borders',
      'Purpose-built for reading with a flush-front design and 300 ppi glare-free display',
      'Waterproof reading - IPX8 rated to protect against accidental immersion',
      'Adjustable warm light to shift screen shade from white to amber',
      'USB-C charging with battery lasting up to 10 weeks'
    ],
    specs: {
      'Display': '6.8" Paperwhite display technology, 300 ppi',
      'Storage': '16 GB',
      'Battery Life': 'Up to 10 weeks',
      'Weight': '205 g',
      'Connectivity': 'Wi-Fi 2.4 GHz and 5.0 GHz'
    }
  },
  {
    id: 'prod-4',
    title: 'Stanley Quencher H2.0 FlowState Stainless Steel Vacuum Insulated Tumbler 40oz',
    price: 45.00,
    rating: 4.5,
    reviewCount: 24150,
    image: 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Home & Kitchen',
    brand: 'Stanley',
    isPrime: true,
    inStock: true,
    stock: 3, // Low stock indicator test
    badge: 'Trending Now',
    description: 'Constructed of recycled stainless steel for sustainable sipping, our 40 oz Quencher H2.0 offers maximum hydration with fewer refills.',
    features: [
      'Earth-friendly durability made of 90% recycled BPA-free stainless steel',
      'Advanced FlowState lid featuring a rotating cover with three positions',
      'Car cup holder compatible base with ergonomic comfort-grip handle',
      'Dishwasher safe for quick, effortless cleaning',
      'Keeps drinks cold for 11 hours and iced for up to 2 days'
    ],
    specs: {
      'Brand': 'Stanley',
      'Capacity': '40 Fluid Ounces',
      'Material': 'Stainless Steel',
      'Item Dimensions': '3.86 x 5.82 x 12.3 inches',
      'Care': 'Dishwasher Safe'
    }
  },
  {
    id: 'prod-5',
    title: 'Apple Watch Series 9 [GPS 41mm] Smartwatch with Midnight Aluminum Case',
    price: 329.00,
    originalPrice: 399.00,
    rating: 4.7,
    reviewCount: 5680,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Smartwatches',
    brand: 'Apple',
    isPrime: true,
    inStock: false, // Out of stock test item
    stock: 0,
    description: 'Powerful health insights, innovative safety features, and a magically easy way to interact with double tap gesture.',
    features: [
      'S9 SiP powers a brilliant display and a magic new way to use your watch without touching the screen',
      'Advanced health sensors provide insights to help you better understand your physical and mental health',
      'Crash Detection and Fall Detection can connect you with emergency services',
      'Water resistant to 50 meters and dust resistant with IP6X certification'
    ],
    specs: {
      'Brand': 'Apple',
      'Case Size': '41mm',
      'Connectivity': 'GPS, Wi-Fi, Bluetooth 5.3',
      'Battery': 'Up to 18 hours (36 hours in Low Power Mode)'
    }
  },
  {
    id: 'prod-6',
    title: 'Anker Magnetic Power Bank, 10,000mAh Wireless Portable Charger with USB-C',
    price: 39.99,
    originalPrice: 49.99,
    rating: 4.4,
    reviewCount: 8120,
    image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Accessories',
    brand: 'Anker',
    isPrime: true,
    inStock: true,
    stock: 25,
    badge: 'Limited Time Deal',
    description: 'Snap & Go wireless charging for iPhone 15/14/13/12 series with strong magnetic hold and 20W high-speed USB-C output.',
    features: [
      'Strong magnetic attachment snaps effortlessly to iPhone back',
      '10,000mAh capacity provides up to 2 full phone charges',
      '20W Power Delivery USB-C port charges 3x faster than standard chargers',
      'MultiProtect safety system ensures complete protection for you and devices'
    ],
    specs: {
      'Brand': 'Anker',
      'Battery Capacity': '10000 Milliamp Hours',
      'Output Ports': 'USB Type-C',
      'Dimensions': '4.13 x 2.62 x 0.67 inches'
    }
  },
  {
    id: 'prod-7',
    title: 'Logitech MX Master 3S Advanced Wireless Performance Mouse, Quiet Clicks',
    price: 99.99,
    rating: 4.8,
    reviewCount: 16800,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Computers',
    brand: 'Logitech',
    isPrime: true,
    inStock: true,
    stock: 10,
    badge: 'Top Rated',
    description: 'Any-surface tracking - now 8K DPI: Use MX Master 3S cordless computer mouse to work on any surface - even glass.',
    features: [
      'Quiet Clicks introduce the same satisfying feel but with 90% less click noise',
      '8K DPI track-on-glass sensor allows pinpoint precision on any desktop surface',
      'MagSpeed electromagnetic scrolling is remarkably fast, precise, and nearly silent',
      'Ergonomic silhouette crafted for the palm with optimal thumb wheel angle',
      'Cross-computer Flow control between up to 3 computers running Windows or macOS'
    ],
    specs: {
      'Brand': 'Logitech',
      'Sensor': 'Darkfield high precision (8000 DPI)',
      'Buttons': '7 buttons (Left/Right-click, Back/Forward, App-Switch, Wheel mode-shift, Middle click)',
      'Battery': 'Rechargeable Li-Po (500 mAh) battery'
    }
  },
  {
    id: 'prod-8',
    title: 'Ninja AF101 Air Fryer that Crisps, Roasts, Reheats, & Dehydrates, 4 Qt Capacity',
    price: 89.95,
    originalPrice: 129.99,
    rating: 4.8,
    reviewCount: 54900,
    image: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1584269600519-112d071b35e6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Home & Kitchen',
    brand: 'Ninja',
    isPrime: true,
    inStock: true,
    stock: 14,
    badge: 'Popular',
    description: 'Now enjoy guilt-free food. Air fry with up to 75 percent less fat than traditional frying methods.',
    features: [
      'Guilt-free fried food with up to 75% less fat than conventional frying',
      'Wide temperature range from 105°F to 400°F allows gentle moisture removal or crisp cooking',
      '4-quart ceramic-coated nonstick basket and crisper plate fit 2 lbs of french fries',
      'One-touch control panel with 4 programmable cooking functions: Air Fry, Roast, Reheat, Dehydrate',
      'Dishwasher-safe accessories for fast, effortless cleanup'
    ],
    specs: {
      'Brand': 'Ninja',
      'Capacity': '4 Quarts',
      'Color': 'Grey / Black',
      'Output Wattage': '1500 Watts',
      'Voltage': '120 Volts'
    }
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
