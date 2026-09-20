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
    department: 'electronics',
    subcategory: 'audio',
    brand: 'Apple',
    isPrime: true,
    inStock: true,
    stock: 15,
    badge: 'Overall Pick',
    deal: {
      dealPrice: 189.99,
      discountPercent: 24,
      endsAt: '2026-10-01T00:00:00Z',
      active: true,
      dealLabel: 'Limited Time Deal',
    },
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
    department: 'electronics',
    subcategory: 'audio',
    brand: 'Sony',
    isPrime: true,
    inStock: true,
    stock: 8,
    badge: 'Best Seller',
    deal: {
      dealPrice: 328.00,
      discountPercent: 18,
      endsAt: '2026-10-01T00:00:00Z',
      active: true,
      dealLabel: 'Top Deal',
    },
    description: 'Two processors control 8 microphones for unprecedented noise cancellation. Auto NC Optimizer automatically optimizes noise canceling based on your wearing conditions.',
    features: [
      'Magnificent sound engineered to perfection with the integrated Processor V1',
      'Crystal clear hands-free calling with 4 beamforming microphones and AI noise reduction',
      'Up to 30-hour battery life with quick charging (3 min charge for 3 hours of playback)',
      'Ultra-comfortable, lightweight design with soft fit leather'
    ],
    specs: {
      'Brand': 'Sony',
      'Color': 'Silver / Black',
      'Connectivity': 'Bluetooth 5.2, 3.5mm Aux',
      'Battery Life': '30 Hours'
    }
  },
  {
    id: 'prod-3',
    title: 'Philips Norelco Multigroomer All-in-One Trimmer Series 7000',
    price: 59.96,
    originalPrice: 79.99,
    rating: 4.5,
    reviewCount: 3120,
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=600&q=80',
    category: 'Beauty & Care',
    department: 'beauty',
    subcategory: 'grooming',
    brand: 'Philips',
    isPrime: true,
    inStock: true,
    stock: 22,
    badge: "Amazon's Choice",
    deal: {
      dealPrice: 59.96,
      discountPercent: 25,
      endsAt: '2026-10-01T00:00:00Z',
      active: true,
      dealLabel: 'Deal of the Day',
    },
    description: 'All-in-one trimmer for your face, head and body styling: 19 pieces for all your trimming needs.',
    features: [
      'DualCut technology offers maximum precision with 2x more self-sharpening blades',
      'Reinforced steel blades will never rust, chip or dull',
      'Powerful Lithium-ion rechargeable battery delivers up to 5 hours of runtime per charge',
      'Fully washable trimmer can be rinsed cleanly under the tap'
    ],
    specs: {
      'Brand': 'Philips Norelco',
      'Power Source': 'Battery Powered (Li-ion)',
      'Run Time': '5 Hours'
    }
  },
  {
    id: 'prod-4',
    title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    price: 13.79,
    originalPrice: 27.00,
    rating: 4.8,
    reviewCount: 118400,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    category: 'Books',
    department: 'books',
    subcategory: 'nonfiction',
    brand: 'Penguin',
    isPrime: true,
    inStock: true,
    stock: 40,
    badge: '#1 Best Seller',
    deal: {
      dealPrice: 13.79,
      discountPercent: 49,
      endsAt: '2026-10-01T00:00:00Z',
      active: true,
      dealLabel: 'Save 49%',
    },
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving every day.',
    features: [
      'Over 15 million copies sold worldwide',
      'Learn how to make time for new habits even when life gets crazy',
      'Overcome a lack of motivation and willpower',
      'Design your environment to make success easier'
    ],
    specs: {
      'Author': 'James Clear',
      'Publisher': 'Avery',
      'Format': 'Hardcover',
      'Pages': '320'
    }
  },
  {
    id: 'prod-5',
    title: 'Garmin Forerunner 265 Running Smartwatch with AMOLED Display',
    price: 449.99,
    rating: 4.7,
    reviewCount: 840,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    category: 'Electronics',
    department: 'electronics',
    subcategory: 'wearables',
    brand: 'Garmin',
    isPrime: true,
    inStock: true,
    stock: 5,
    badge: 'Trending',
    description: 'Brilliant AMOLED touchscreen display with traditional button controls and lightweight design in 46 mm size.',
    features: [
      'Up to 13 days of battery life in smartwatch mode and up to 20 hours in GPS mode',
      'Morning report provides overview of your sleep, recovery, and training outlook',
      'Plan race strategy with daily suggested workouts based on your performance',
      'Multi-band GNSS with SatIQ technology for superior positioning accuracy'
    ],
    specs: {
      'Brand': 'Garmin',
      'Display Size': '1.3 Inches AMOLED',
      'Battery Life': 'Up to 13 Days',
      'Water Rating': '5 ATM'
    }
  },
  {
    id: 'prod-6',
    title: 'Instant Pot Duo Plus 9-in-1 Electric Pressure Cooker, 6 Quart',
    price: 129.99,
    originalPrice: 149.99,
    rating: 4.6,
    reviewCount: 68120,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    category: 'Home & Kitchen',
    department: 'home-kitchen',
    subcategory: 'kitchen',
    brand: 'Instant Pot',
    isPrime: true,
    inStock: true,
    stock: 18,
    badge: 'Great Deal',
    deal: {
      dealPrice: 129.99,
      discountPercent: 13,
      endsAt: '2026-10-01T00:00:00Z',
      active: true,
      dealLabel: 'Kitchen Special',
    },
    description: '9-in-1 functionality: pressure cook, slow cook, rice cooker, yogurt maker, steamer, sauté pan, yogurt maker, sterilizer and food warmer.',
    features: [
      'Improved easy-release steam switch with protective cover',
      'Stainless steel cooking pot with tri-ply bottom for quick, even cooking',
      'Cooks up to 70% faster than traditional cooking methods',
      'Over 10 proven safety features including Overheat Protection and safe locking lid'
    ],
    specs: {
      'Brand': 'Instant Pot',
      'Capacity': '6 Quarts',
      'Material': 'Stainless Steel',
      'Control Method': 'App, Touch'
    }
  },
  {
    id: 'prod-7',
    title: 'Hydro Flask Wide Mouth Straw Lid Insulated Water Bottle, 32 oz',
    price: 44.95,
    rating: 4.8,
    reviewCount: 29400,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    category: 'Sports & Outdoors',
    department: 'sports',
    subcategory: 'outdoor',
    brand: 'Hydro Flask',
    isPrime: true,
    inStock: true,
    stock: 30,
    badge: 'Popular',
    description: 'TempShield double-wall vacuum insulation keeps drinks cold up to 24 hours, and hot up to 12 hours.',
    features: [
      'Flex Straw Cap makes cold hydration that much easier',
      'Made with 18/8 pro-grade stainless steel for durability and pure taste',
      'Color Last powder coat is dishwasher safe and sweat-free',
      'BPA-Free and Toxin-Free'
    ],
    specs: {
      'Brand': 'Hydro Flask',
      'Capacity': '32 Ounces',
      'Color': 'Pacific Blue',
      'Material': 'Stainless Steel'
    }
  },
  {
    id: 'prod-8',
    title: 'Ninja AF101 Air Fryer that Crisps, Roasts, Reheats & Dehydrates, 4 Qt',
    price: 89.95,
    originalPrice: 129.99,
    rating: 4.8,
    reviewCount: 54900,
    image: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?auto=format&fit=crop&w=600&q=80',
    category: 'Home & Kitchen',
    department: 'home-kitchen',
    subcategory: 'kitchen',
    brand: 'Ninja',
    isPrime: true,
    inStock: true,
    stock: 14,
    badge: 'Popular',
    deal: {
      dealPrice: 89.95,
      discountPercent: 31,
      endsAt: '2026-10-01T00:00:00Z',
      active: true,
      dealLabel: 'Lightning Deal',
    },
    description: 'Now enjoy guilt-free food. Air fry with up to 75 percent less fat than traditional frying methods.',
    features: [
      'Guilt-free fried food with up to 75% less fat than conventional frying',
      'Wide temperature range from 105°F to 400°F allows gentle moisture removal or crisp cooking',
      '4-quart ceramic-coated nonstick basket and crisper plate fit 2 lbs of french fries'
    ],
    specs: {
      'Brand': 'Ninja',
      'Capacity': '4 Quarts',
      'Color': 'Grey / Black',
      'Output Wattage': '1500 Watts'
    }
  },

  // ---------------- CLOTHING & FASHION ----------------
  {
    id: 'prod-cloth-1',
    title: "Men's Heavyweight Organic Cotton Crewneck T-Shirt",
    price: 28.50,
    originalPrice: 35.00,
    rating: 4.6,
    reviewCount: 1420,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    category: 'Fashion',
    department: 'clothing',
    subcategory: 'men',
    gender: 'Men',
    brand: 'Everlane',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Navy Blue', 'Olive'],
    isPrime: true,
    inStock: true,
    stock: 45,
    badge: 'Fashion Pick',
    deal: {
      dealPrice: 28.50,
      discountPercent: 19,
      endsAt: '2026-10-01T00:00:00Z',
      active: true,
      dealLabel: 'Fashion Deal',
    },
    description: 'Crafted from dense 6.2 oz combed organic cotton. Built to hold its shape wear after wear.',
    features: [
      '100% Certified Organic Combed Cotton',
      'Pre-shrunk jersey knit with taped neck and shoulders',
      'Ribbed collar lays flat and keeps its shape'
    ],
    specs: {
      'Brand': 'Everlane',
      'Fit': 'Regular Fit',
      'Material': '100% Cotton',
      'Care': 'Machine Wash Warm'
    }
  },
  {
    id: 'prod-cloth-2',
    title: "Men's 511 Slim Fit Stretch Denim Jeans",
    price: 58.00,
    originalPrice: 69.50,
    rating: 4.7,
    reviewCount: 8900,
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80',
    category: 'Fashion',
    department: 'clothing',
    subcategory: 'men',
    gender: 'Men',
    brand: "Levi's",
    sizes: ['30x30', '32x32', '34x32', '36x32'],
    colors: ['Dark Indigo', 'Vintage Wash', 'Black'],
    isPrime: true,
    inStock: true,
    stock: 28,
    badge: 'Top Rated',
    description: 'A modern slim with room to move. Added stretch for all-day comfort and mobility.',
    features: [
      '99% Cotton, 1% Elastane for slight flex',
      'Slim from hip to ankle',
      'Signature 5-pocket styling and leather patch'
    ],
    specs: {
      'Brand': "Levi's",
      'Closure': 'Zip fly with button closure',
      'Leg Style': 'Slim leg'
    }
  },
  {
    id: 'prod-cloth-3',
    title: "Women's Ribbed Knit Midi Sweater Dress",
    price: 48.00,
    originalPrice: 68.00,
    rating: 4.8,
    reviewCount: 650,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    category: 'Fashion',
    department: 'clothing',
    subcategory: 'women',
    gender: 'Women',
    brand: 'Aritzia',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Heather Oatmeal', 'Midnight Black', 'Forest Green'],
    isPrime: true,
    inStock: true,
    stock: 19,
    badge: 'Trending Now',
    deal: {
      dealPrice: 48.00,
      discountPercent: 29,
      endsAt: '2026-10-01T00:00:00Z',
      active: true,
      dealLabel: 'Fall Clearance',
    },
    description: 'Flattering contoured fit crafted from ultra-soft wool blend yarns. Features an elegant side slit.',
    features: [
      'Ultra-soft viscose blend with fine vertical ribbing',
      'Mock neck neckline with graceful midi silhouette',
      'Elastic retention prevents sagging at elbows or knees'
    ],
    specs: {
      'Brand': 'Aritzia',
      'Length': 'Midi (Below Knee)',
      'Pattern': 'Solid Ribbed'
    }
  },
  {
    id: 'prod-cloth-4',
    title: "Women's Torrentshell 3L Packable Rain & Windbreaker Jacket",
    price: 119.00,
    originalPrice: 149.00,
    rating: 4.9,
    reviewCount: 2150,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
    category: 'Fashion',
    department: 'clothing',
    subcategory: 'women',
    gender: 'Women',
    brand: 'Patagonia',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Sage Green', 'Classic Navy', 'Black'],
    isPrime: true,
    inStock: true,
    stock: 12,
    badge: 'Eco Pick',
    description: 'Simple and unpretentious, trusted 3-layer H2No Performance Standard shell for exceptional waterproof/breathable performance.',
    features: [
      '100% Recycled Waterproof/Breathable Face Fabric',
      'Adjustable hood with laminated visor rolls down and stows',
      'Microfleece-lined neck provides comfort and protects with a waterproof barrier'
    ],
    specs: {
      'Brand': 'Patagonia',
      'Weight': '352 g (12.4 oz)',
      'Waterproof Rating': '20,000mm'
    }
  },
  {
    id: 'prod-cloth-5',
    title: 'Unisex Retro Cloud Leather Sneakers',
    price: 95.00,
    originalPrice: 110.00,
    rating: 4.7,
    reviewCount: 4320,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    category: 'Fashion',
    department: 'clothing',
    subcategory: 'footwear',
    gender: 'Unisex',
    brand: 'Adidas',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Cloud White / Green', 'Triple White', 'White / Gum'],
    isPrime: true,
    inStock: true,
    stock: 25,
    badge: 'Streetwear Staple',
    deal: {
      dealPrice: 95.00,
      discountPercent: 14,
      endsAt: '2026-10-01T00:00:00Z',
      active: true,
      dealLabel: 'Limited Stock',
    },
    description: 'Timeless court sneaker with premium leather upper, perforated 3-stripes, and durable rubber cupsole.',
    features: [
      'Supple full-grain leather upper with reinforced toe cap',
      'Ortholite sockliner provides cushioning and moisture wicking',
      'Low-profile traction rubber outsole'
    ],
    specs: {
      'Brand': 'Adidas',
      'Upper Material': 'Leather / Synthetic',
      'Closure': 'Lace-up'
    }
  },
  {
    id: 'prod-cloth-6',
    title: "Kids' Cozy Fleece Zip Hoodie & Joggers 2-Piece Outfit Set",
    price: 34.99,
    rating: 4.6,
    reviewCount: 880,
    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80',
    category: 'Fashion',
    department: 'clothing',
    subcategory: 'kids',
    gender: 'Kids',
    brand: 'GapKids',
    sizes: ['3T', '4T', '5Y', '6Y', '7Y'],
    colors: ['Heather Grey', 'Navy / Red Stripe'],
    isPrime: true,
    inStock: true,
    stock: 35,
    description: 'Soft brushed fleece set with front pockets and elasticized waistband for all-day playground comfort.',
    features: [
      'Brushed interior fleece stays soft after dozens of washes',
      'Reinforced knees on joggers for active kids',
      'Full-front durable safety zipper with chin guard'
    ],
    specs: {
      'Brand': 'GapKids',
      'Pieces': '2-Piece Set',
      'Material': '60% Cotton, 40% Polyester'
    }
  },
  {
    id: 'prod-cloth-7',
    title: 'Bellroy Classic Water-Resistant Everyday Laptop Backpack, 20L',
    price: 119.00,
    originalPrice: 139.00,
    rating: 4.8,
    reviewCount: 1650,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    category: 'Fashion',
    department: 'clothing',
    subcategory: 'accessories',
    gender: 'Unisex',
    brand: 'Bellroy',
    colors: ['Bronze Tan', 'Charcoal Grey', 'Black'],
    isPrime: true,
    inStock: true,
    stock: 16,
    badge: 'Apex Pick',
    deal: {
      dealPrice: 119.00,
      discountPercent: 14,
      endsAt: '2026-10-01T00:00:00Z',
      active: true,
      dealLabel: 'Travel Week Deal',
    },
    description: 'A refined everyday backpack featuring designated protective compartments for a 15.6" laptop, iPad, and quick-access valuables.',
    features: [
      'Padded sleeve fits up to 16" laptop securely',
      'Made from durable, water-resistant recycled fabric and eco-tanned leather',
      'Contoured back padding and ergonomic harness for all-day carry'
    ],
    specs: {
      'Brand': 'Bellroy',
      'Capacity': '20 Liters',
      'Laptop Size': 'Up to 16 Inches',
      'Warranty': '3 Years'
    }
  },

  // ---------------- BEAUTY & WELLNESS ----------------
  {
    id: 'prod-beauty-1',
    title: 'Ultra Facial Advanced Hydrating Barrier Cream with Squalane, 1.7 oz',
    price: 38.00,
    originalPrice: 48.00,
    rating: 4.8,
    reviewCount: 8400,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    category: 'Beauty & Care',
    department: 'beauty',
    subcategory: 'skincare',
    brand: "Kiehl's",
    isPrime: true,
    inStock: true,
    stock: 24,
    badge: 'Dermatologist Tested',
    deal: {
      dealPrice: 38.00,
      discountPercent: 21,
      endsAt: '2026-10-01T00:00:00Z',
      active: true,
      dealLabel: 'Beauty Flash Deal',
    },
    description: 'A 24-hour daily face moisturizer that provides continuous hydration for dry skin throughout the day.',
    features: [
      'Clinically proven to hydrate 2.3x more immediately',
      'Glacial Glycoprotein and Olive-Derived Squalane strengthen moisture barrier',
      'Lightweight, non-greasy texture absorbs quickly'
    ],
    specs: {
      'Brand': "Kiehl's",
      'Skin Type': 'All Skin Types',
      'Volume': '1.7 fl oz (50ml)'
    }
  },

  // ---------------- SPORTS & FITNESS ----------------
  {
    id: 'prod-sports-1',
    title: 'High-Density Non-Slip Alignment Yoga Mat with Carrying Strap, 6mm',
    price: 42.00,
    originalPrice: 55.00,
    rating: 4.7,
    reviewCount: 3100,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    category: 'Sports & Outdoors',
    department: 'sports',
    subcategory: 'workout',
    brand: 'Liforme',
    isPrime: true,
    inStock: true,
    stock: 27,
    badge: 'Fitness Essential',
    deal: {
      dealPrice: 42.00,
      discountPercent: 24,
      endsAt: '2026-10-01T00:00:00Z',
      active: true,
      dealLabel: 'Fitness Savings',
    },
    description: 'Eco-friendly TPE yoga mat with laser-engraved alignment lines. Extra cushioning protects joints during rigorous flows.',
    features: [
      'Engineered Alignment System guides hands and feet during postures',
      'Textured dual-sided grip prevents sliding on hardwood or carpet',
      'Lightweight, tear-resistant, and non-toxic TPE construction'
    ],
    specs: {
      'Brand': 'Liforme',
      'Dimensions': '72" L x 26" W x 6mm Thick',
      'Weight': '2.1 lbs'
    }
  },

  // ---------------- HOME DECOR & LIGHTING ----------------
  {
    id: 'prod-home-1',
    title: 'Modern Matte Ceramic Dimmable Touch Bedside Table Lamp',
    price: 54.00,
    originalPrice: 69.00,
    rating: 4.6,
    reviewCount: 920,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    category: 'Home & Kitchen',
    department: 'home-kitchen',
    subcategory: 'decor',
    brand: 'Muuto',
    isPrime: true,
    inStock: true,
    stock: 17,
    badge: 'Design Award',
    description: 'Minimalist ceramic cylindrical lamp with warm 2700K ambient glow and stepless touch-control dimming.',
    features: [
      'Handcrafted ceramic body with tactile matte stone glaze',
      'Stepless dimming from 10% to 100% via gentle brass touch button',
      'Energy-efficient LED bulb included with 25,000 hour lifespan'
    ],
    specs: {
      'Brand': 'Muuto',
      'Color Temperature': '2700K Soft Warm',
      'Power Source': 'Corded Electric'
    }
  }
];

export const categories = [
  'All Departments',
  'Clothing & Fashion',
  'Electronics',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Books & Stationery',
  'Sports & Fitness',
  "Today's Deals"
];
