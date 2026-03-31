import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      hydrated: false,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      setHydrated: (state) => set({ hydrated: state }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }),
      onRehydrateStorage: (state) => (rehydratedState) => {
        if (rehydratedState) {
          rehydratedState.setHydrated(true);
        }
      },
    }
  )
);

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      cartCount: 0,
      hydrated: false,
      setCart: (items) => set({ cartItems: items, cartCount: items.length }),
      clearCart: () => set({ cartItems: [], cartCount: 0 }),
      setHydrated: (state) => set({ hydrated: state }),
      addItem: (product, quantity = 1) => {
        const currentItems = get().cartItems;
        const existingItem = currentItems.find(item => item.productId?._id === product._id || item.productId === product._id);
        
        let newItems;
        if (existingItem) {
          newItems = currentItems.map(item =>
            (item.productId?._id === product._id || item.productId === product._id)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...currentItems, { productId: product, quantity, price: product.price }];
        }
        set({ cartItems: newItems, cartCount: newItems.length });
      },
      removeItem: (productId) => {
        const newItems = get().cartItems.filter(item => 
          (item.productId?._id !== productId && item.productId !== productId)
        );
        set({ cartItems: newItems, cartCount: newItems.length });
      },
      updateQuantity: (productId, quantity) => {
        const newItems = get().cartItems.map(item =>
          (item.productId?._id === productId || item.productId === productId)
            ? { ...item, quantity: Math.max(0, quantity) }
            : item
        ).filter(item => item.quantity > 0);
        set({ cartItems: newItems, cartCount: newItems.length });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }),
      onRehydrateStorage: (state) => (rehydratedState) => {
        if (rehydratedState) {
          rehydratedState.setHydrated(true);
        }
      },
    }
  )
);
