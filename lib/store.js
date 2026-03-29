import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }),
    }
  )
);

export const useCartStore = create((set) => ({
  cartItems: [],
  cartCount: 0,
  setCart: (items) => set({ cartItems: items, cartCount: items.length }),
  clearCart: () => set({ cartItems: [], cartCount: 0 }),
}));
