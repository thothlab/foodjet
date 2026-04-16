import { describe, it, expect } from 'vitest';
import { isValidTransition, canActorTransition, ORDER_TRANSITIONS } from '../../../packages/shared/src/order-statuses.js';
import type { OrderStatus } from '../../../packages/shared/src/order-statuses.js';

describe('Order Status Machine', () => {
  describe('isValidTransition', () => {
    it('allows NEW → CONFIRMED', () => {
      expect(isValidTransition('NEW', 'CONFIRMED')).toBe(true);
    });

    it('allows NEW → CANCELLED', () => {
      expect(isValidTransition('NEW', 'CANCELLED')).toBe(true);
    });

    it('rejects NEW → DELIVERED', () => {
      expect(isValidTransition('NEW', 'DELIVERED')).toBe(false);
    });

    it('rejects DELIVERED → any', () => {
      const statuses: OrderStatus[] = ['NEW', 'CONFIRMED', 'ASSEMBLING', 'CANCELLED'];
      for (const status of statuses) {
        expect(isValidTransition('DELIVERED', status)).toBe(false);
      }
    });

    it('rejects CANCELLED → any', () => {
      const statuses: OrderStatus[] = ['NEW', 'CONFIRMED', 'ASSEMBLING', 'DELIVERED'];
      for (const status of statuses) {
        expect(isValidTransition('CANCELLED', status)).toBe(false);
      }
    });

    it('allows full happy path', () => {
      const happyPath: [OrderStatus, OrderStatus][] = [
        ['NEW', 'CONFIRMED'],
        ['CONFIRMED', 'ASSEMBLING'],
        ['ASSEMBLING', 'READY_FOR_DELIVERY'],
        ['READY_FOR_DELIVERY', 'ASSIGNED_TO_COURIER'],
        ['ASSIGNED_TO_COURIER', 'IN_DELIVERY'],
        ['IN_DELIVERY', 'DELIVERED'],
      ];
      for (const [from, to] of happyPath) {
        expect(isValidTransition(from, to)).toBe(true);
      }
    });

    it('allows substitution flow', () => {
      expect(isValidTransition('ASSEMBLING', 'AWAITING_SUBSTITUTION_DECISION')).toBe(true);
      expect(isValidTransition('AWAITING_SUBSTITUTION_DECISION', 'ASSEMBLING')).toBe(true);
      expect(isValidTransition('AWAITING_SUBSTITUTION_DECISION', 'READY_FOR_DELIVERY')).toBe(true);
    });

    it('allows reassignment', () => {
      expect(isValidTransition('ASSIGNED_TO_COURIER', 'READY_FOR_DELIVERY')).toBe(true);
    });
  });

  describe('canActorTransition', () => {
    it('staff can confirm orders', () => {
      expect(canActorTransition('staff', 'NEW', 'CONFIRMED')).toBe(true);
    });

    it('staff can cancel from most statuses', () => {
      expect(canActorTransition('staff', 'NEW', 'CANCELLED')).toBe(true);
      expect(canActorTransition('staff', 'CONFIRMED', 'CANCELLED')).toBe(true);
      expect(canActorTransition('staff', 'ASSEMBLING', 'CANCELLED')).toBe(true);
    });

    it('courier can only do IN_DELIVERY and DELIVERED', () => {
      expect(canActorTransition('courier', 'ASSIGNED_TO_COURIER', 'IN_DELIVERY')).toBe(true);
      expect(canActorTransition('courier', 'IN_DELIVERY', 'DELIVERED')).toBe(true);
    });

    it('courier cannot confirm or cancel', () => {
      expect(canActorTransition('courier', 'NEW', 'CONFIRMED')).toBe(false);
      expect(canActorTransition('courier', 'NEW', 'CANCELLED')).toBe(false);
    });

    it('customer can cancel NEW and CONFIRMED only', () => {
      expect(canActorTransition('customer', 'NEW', 'CANCELLED')).toBe(true);
      expect(canActorTransition('customer', 'CONFIRMED', 'CANCELLED')).toBe(true);
      expect(canActorTransition('customer', 'ASSEMBLING', 'CANCELLED')).toBe(false);
    });

    it('unknown actor type returns false', () => {
      expect(canActorTransition('random', 'NEW', 'CONFIRMED')).toBe(false);
    });
  });

  describe('terminal states', () => {
    it('DELIVERED has no transitions', () => {
      expect(ORDER_TRANSITIONS.DELIVERED).toHaveLength(0);
    });

    it('CANCELLED has no transitions', () => {
      expect(ORDER_TRANSITIONS.CANCELLED).toHaveLength(0);
    });
  });
});
