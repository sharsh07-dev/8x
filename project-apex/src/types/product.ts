export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  category: string;
  department?: string;
  subcategory?: string;
  gender?: 'Men' | 'Women' | 'Kids' | 'Unisex';
  sizes?: string[];
  colors?: string[];
  brand?: string;
  isPrime?: boolean;
  inStock: boolean;
  stock: number;
  badge?: string;
  description?: string;
  features?: string[];
  specs?: Record<string, string>;
  deal?: {
    dealPrice: number;
    discountPercent: number;
    endsAt: string;
    active: boolean;
    dealLabel: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}
