export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum SubscriptionPlanType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export interface Subscription {
  id?: number;
  userId: number;
  planType: SubscriptionPlanType;
  startDate: string; // Using string for ISO 8601 format
  endDate: string;
  mealsPerDay: number;
  mealsRemaining: number;
  planPrice: number;
  isActive: boolean;
  status: SubscriptionStatus;
  deliveryTime?: string;
  deliveryAddressId: number;
  autoRenew: boolean;
  nextBillingDate?: string;
}

// Keep legacy interfaces for backward compatibility
export type SubscriptionPlanTypeLegacy = 'Basic' | 'Standard' | 'Premium';

export interface SubscriptionPlan {
	id: string;
	name: SubscriptionPlanTypeLegacy;
	pricePerMonth: number;
	mealsPerDay: 1 | 2 | 3;
	features: string[];
}

export type SubscriptionStatusLegacy = 'Active' | 'Paused' | 'Cancelled' | 'Expired';

export interface SubscriptionModel {
	id: string;
	plan: SubscriptionPlan;
	status: SubscriptionStatusLegacy;
	startedAt: string; // ISO
	nextBillingDate?: string; // ISO
	remainingMeals?: number;
}

