export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  isPrime?: boolean;
  inStock?: boolean;
  badge?: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
