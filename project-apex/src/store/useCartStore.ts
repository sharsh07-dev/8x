import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '@/types/product';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, openDrawer?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),
      addToCart: (product, quantity = 1, openDrawer = true) => {
        if (!product.inStock || product.stock <= 0) {
          return;
        }

        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );

          let updatedItems;
          if (existingItemIndex > -1) {
            const currentQty = state.items[existingItemIndex].quantity;
            const newQty = Math.min(product.stock, currentQty + quantity);
            updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity = newQty;
          } else {
            const cappedQty = Math.min(product.stock, quantity);
            updatedItems = [...state.items, { product, quantity: cappedQty }];
          }

          return { 
            items: updatedItems,
            isDrawerOpen: openDrawer ? true : state.isDrawerOpen
          };
        });
      },
      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => {
            if (item.product.id === productId) {
              const maxAllowed = item.product.stock || 99;
              return { ...item, quantity: Math.min(maxAllowed, quantity) };
            }
            return item;
          }),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'apex-cart-storage',
      partialize: (state) => ({ items: state.items }), // only persist cart items, not drawer UI state
    }
  )
);

