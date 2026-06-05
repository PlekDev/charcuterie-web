import { create } from 'zustand'

export interface CartItem {
  id: string
  name: string
  barcode: string | null
  salePrice: number
  costPrice: number
  quantity: number
  unit: string
  stock: number
}

interface POSState {
  // Carrito
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getTotal: () => number
  
  // Descuento
  discount: number
  setDiscount: (value: number) => void
  
  // Método de pago
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia'
  setPaymentMethod: (method: 'efectivo' | 'tarjeta' | 'transferencia') => void
  
  // Efectivo recibido
  cashReceived: number
  setCashReceived: (value: number) => void
  getChange: () => number
  
  // Sesión actual
  sessionId: string | null
  setSessionId: (id: string | null) => void
  
  // Ubicación actual
  locationId: string
  setLocationId: (id: string) => void
  
  // Cajero actual
  cashierId: string
  setCashierId: (id: string) => void
}

export const usePOSStore = create<POSState>((set, get) => ({
  // Carrito
  cart: [],
  
  addToCart: (item) => {
    const { cart } = get()
    const existingItem = cart.find(i => i.id === item.id)
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + (item.quantity || 1)
      if (newQuantity > item.stock) {
        return // No agregar más del stock disponible
      }
      set({
        cart: cart.map(i => 
          i.id === item.id 
            ? { ...i, quantity: newQuantity }
            : i
        ),
      })
    } else {
      set({
        cart: [...cart, { ...item, quantity: item.quantity || 1 }],
      })
    }
  },
  
  removeFromCart: (id) => {
    set(state => ({
      cart: state.cart.filter(i => i.id !== id),
    }))
  },
  
  updateQuantity: (id, quantity) => {
    const { cart } = get()
    const item = cart.find(i => i.id === id)
    
    if (!item) return
    if (quantity <= 0) {
      get().removeFromCart(id)
      return
    }
    if (quantity > item.stock) return
    
    set({
      cart: cart.map(i => 
        i.id === id ? { ...i, quantity } : i
      ),
    })
  },
  
  clearCart: () => {
    set({ 
      cart: [], 
      discount: 0, 
      paymentMethod: 'efectivo', 
      cashReceived: 0 
    })
  },
  
  getSubtotal: () => {
    const { cart } = get()
    return cart.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0)
  },
  
  getTotal: () => {
    const { cart, discount } = get()
    const subtotal = cart.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0)
    return Math.max(0, subtotal - discount)
  },
  
  // Descuento
  discount: 0,
  setDiscount: (value) => set({ discount: Math.max(0, value) }),
  
  // Método de pago
  paymentMethod: 'efectivo',
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  
  // Efectivo recibido
  cashReceived: 0,
  setCashReceived: (value) => set({ cashReceived: value }),
  getChange: () => {
    const { cashReceived } = get()
    return Math.max(0, cashReceived - get().getTotal())
  },
  
  // Sesión
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),
  
  // Ubicación
  locationId: '',
  setLocationId: (id) => set({ locationId: id }),
  
  // Cajero
  cashierId: '',
  setCashierId: (id) => set({ cashierId: id }),
}))
