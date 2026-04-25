import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Product } from '@/lib/supabase/types'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  shippingFee: number
  total: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          return { items: [...state.items, { product, quantity: 1 }] }
        })
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }))
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        )
      },

      get shippingFee() {
        return get().items.length > 0 ? 15000 : 0
      },

      get total() {
        return get().subtotal + get().shippingFee
      },
    }),
    {
      name: 'bionic-cart',
    }
  )
)

// Stable computed selectors (avoids re-renders)
export const selectItemCount = (s: CartStore) =>
  s.items.reduce((sum, i) => sum + i.quantity, 0)

export const selectSubtotal = (s: CartStore) =>
  s.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

export const selectTotal = (s: CartStore) =>
  selectSubtotal(s) + (s.items.length > 0 ? 15000 : 0)
