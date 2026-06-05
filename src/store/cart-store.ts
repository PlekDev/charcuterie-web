import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Carrito de la tienda (lado cliente). Guarda los productos que el usuario
// quiere comprar antes de generar el pedido en /api/orders.
export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string | null
  stock?: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

// `persist` guarda el carrito en localStorage para que sobreviva al recargar.
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      // Agrega un producto; si ya está en el carrito, suma la cantidad
      // (respetando el stock disponible).
      addItem: (item) => {
        const currentItems = get().items
        const existingItem = currentItems.find((i) => i.id === item.id)

        if (existingItem) {
          const newQuantity = existingItem.quantity + item.quantity
          // No permitir agregar más unidades de las que hay en stock.
          if (item.stock !== undefined && newQuantity > item.stock) {
            return
          }

          set({
            items: currentItems.map((i) =>
              i.id === item.id ? { ...i, quantity: newQuantity } : i
            ),
          })
        } else {
          set({ items: [...currentItems, item] })
        }
      },
      // Elimina un producto del carrito por su id.
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },
      // Cambia la cantidad de un producto (tope: stock; mínimo: 1).
      updateQuantity: (id, quantity) => {
        const currentItems = get().items
        const item = currentItems.find(i => i.id === id)

        if (item && item.stock !== undefined && quantity > item.stock) {
          quantity = item.stock
        }

        set({
          items: currentItems.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })
      },
      // Vacía el carrito (se usa tras confirmar el pedido).
      clearCart: () => set({ items: [] }),
      // Suma total a pagar (precio × cantidad de cada producto).
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
      // Número total de unidades en el carrito (para el badge del navbar).
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'charcuteria-cart', // clave en localStorage
    }
  )
)
