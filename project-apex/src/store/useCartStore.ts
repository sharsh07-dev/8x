import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  syncCart: () => Promise<void>;
  addToCart: (product: Product, quantity?: number, openDrawer?: boolean) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),
      
      syncCart: async () => {
        try {
          const res = await fetch(`${API_URL}/cart`, { credentials: 'include' });
          const data = await res.json();
          if (data.success && data.data.cart) {
            // Map backend structure to frontend CartItem[]
            const backendItems = data.data.cart.items.map((item: any) => ({
              product: {
                id: item.product.id,
                title: item.product.title,
                price: item.product.price,
                compareAtPrice: item.product.compareAtPrice,
                image: item.product.images?.[0]?.url || 'https://via.placeholder.com/400',
                rating: 4.5,
                reviewCount: 0,
                inStock: true,
                stock: item.product.inventory?.stock || 0
              },
              quantity: item.quantity
            }));
            set({ items: backendItems });
          }
        } catch (e) {
          console.error('Failed to sync cart:', e);
        }
      },

      addToCart: async (product, quantity = 1, openDrawer = true) => {
        // Optimistic UI Update
        set((state) => {
          const existingItemIndex = state.items.findIndex(item => item.product.id === product.id);
          let updatedItems = [...state.items];
          if (existingItemIndex > -1) {
            updatedItems[existingItemIndex].quantity += quantity;
          } else {
            updatedItems.push({ product, quantity });
          }
          return { items: updatedItems, isDrawerOpen: openDrawer ? true : state.isDrawerOpen };
        });

        // Background server sync
        try {
          await fetch(`${API_URL}/cart/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId: product.id, quantity })
          });
        } catch (e) {
          console.error('Failed to add item to cart on server:', e);
        }
      },

      removeFromCart: async (productId) => {
        // Optimistic UI Update
        set((state) => ({ items: state.items.filter(item => item.product.id !== productId) }));

        // Background server sync
        try {
          await fetch(`${API_URL}/cart/items/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
          });
        } catch (e) {
          console.error('Failed to remove item from cart on server:', e);
        }
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
          return get().removeFromCart(productId);
        }
        
        // Optimistic UI Update
        set((state) => ({
          items: state.items.map(item => item.product.id === productId ? { ...item, quantity } : item)
        }));

        // Background server sync
        try {
          await fetch(`${API_URL}/cart/items/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ quantity })
          });
        } catch (e) {
          console.error('Failed to update item quantity on server:', e);
        }
      },

      clearCart: async () => {
        set({ items: [] });
        // Optional: Implement DELETE /cart to clear completely on server
        // (If there's no endpoint, we just leave it for now)
      },

      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      
      getSubtotal: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    }),
    {
      name: 'apex-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
