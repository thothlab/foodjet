export const ORDER_STATUSES = [
  'NEW',
  'CONFIRMED',
  'ASSEMBLING',
  'AWAITING_SUBSTITUTION_DECISION',
  'READY_FOR_DELIVERY',
  'ASSIGNED_TO_COURIER',
  'IN_DELIVERY',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'Новый',
  CONFIRMED: 'Подтверждён',
  ASSEMBLING: 'Собирается',
  AWAITING_SUBSTITUTION_DECISION: 'Ожидание решения по замене',
  READY_FOR_DELIVERY: 'Готов к доставке',
  ASSIGNED_TO_COURIER: 'Назначен курьер',
  IN_DELIVERY: 'В доставке',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
};

/**
 * Valid status transitions.
 * Key: current status, Value: array of allowed next statuses.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  NEW: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['ASSEMBLING', 'CANCELLED'],
  ASSEMBLING: ['AWAITING_SUBSTITUTION_DECISION', 'READY_FOR_DELIVERY', 'CANCELLED'],
  AWAITING_SUBSTITUTION_DECISION: ['ASSEMBLING', 'READY_FOR_DELIVERY', 'CANCELLED'],
  READY_FOR_DELIVERY: ['ASSIGNED_TO_COURIER', 'CANCELLED'],
  ASSIGNED_TO_COURIER: ['IN_DELIVERY', 'READY_FOR_DELIVERY', 'CANCELLED'],
  IN_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

/**
 * Which actor types can trigger which transitions.
 */
export const TRANSITION_ACTORS: Record<string, { from: OrderStatus; to: OrderStatus }[]> = {
  system: [
    { from: 'NEW', to: 'CONFIRMED' },
  ],
  staff: [
    { from: 'NEW', to: 'CONFIRMED' },
    { from: 'CONFIRMED', to: 'ASSEMBLING' },
    { from: 'ASSEMBLING', to: 'AWAITING_SUBSTITUTION_DECISION' },
    { from: 'AWAITING_SUBSTITUTION_DECISION', to: 'ASSEMBLING' },
    { from: 'ASSEMBLING', to: 'READY_FOR_DELIVERY' },
    { from: 'AWAITING_SUBSTITUTION_DECISION', to: 'READY_FOR_DELIVERY' },
    { from: 'READY_FOR_DELIVERY', to: 'ASSIGNED_TO_COURIER' },
    { from: 'ASSIGNED_TO_COURIER', to: 'READY_FOR_DELIVERY' },
    { from: 'NEW', to: 'CANCELLED' },
    { from: 'CONFIRMED', to: 'CANCELLED' },
    { from: 'ASSEMBLING', to: 'CANCELLED' },
    { from: 'AWAITING_SUBSTITUTION_DECISION', to: 'CANCELLED' },
    { from: 'READY_FOR_DELIVERY', to: 'CANCELLED' },
    { from: 'ASSIGNED_TO_COURIER', to: 'CANCELLED' },
  ],
  courier: [
    { from: 'ASSIGNED_TO_COURIER', to: 'IN_DELIVERY' },
    { from: 'IN_DELIVERY', to: 'DELIVERED' },
  ],
  customer: [
    { from: 'NEW', to: 'CANCELLED' },
    { from: 'CONFIRMED', to: 'CANCELLED' },
  ],
};

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to);
}

export function canActorTransition(actorType: string, from: OrderStatus, to: OrderStatus): boolean {
  const allowed = TRANSITION_ACTORS[actorType];
  if (!allowed) return false;
  return allowed.some((t) => t.from === from && t.to === to);
}
