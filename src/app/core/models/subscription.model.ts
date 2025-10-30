export type SubscriptionPlanType = 'Basic' | 'Standard' | 'Premium';

export interface SubscriptionPlan {
	id: string;
	name: SubscriptionPlanType;
	pricePerMonth: number;
	mealsPerDay: 1 | 2 | 3;
	features: string[];
}

export type SubscriptionStatus = 'Active' | 'Paused' | 'Cancelled' | 'Expired';

export interface SubscriptionModel {
	id: string;
	plan: SubscriptionPlan;
	status: SubscriptionStatus;
	startedAt: string; // ISO
	nextBillingDate?: string; // ISO
	remainingMeals?: number;
}

