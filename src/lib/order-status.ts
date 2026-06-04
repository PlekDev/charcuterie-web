// Constantes de estado de pedido — seguras para usar en cliente o servidor
// (no importan nada de Supabase ni del service_role).

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivered',
  'cancelled',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

// Flujo normal de avance del pedido (sin contar cancelado)
export const ORDER_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivered',
]

// Devuelve el siguiente estado en el flujo, o null si ya está al final.
export function nextStatus(current: OrderStatus): OrderStatus | null {
  const i = ORDER_FLOW.indexOf(current)
  if (i === -1 || i === ORDER_FLOW.length - 1) return null
  return ORDER_FLOW[i + 1]
}
