export interface Delivery {
  id: number;
  orderId: number;
  status: DeliveryStatus;
  pickupAddress?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  customerName?: string;
  customerPhone?: string;
  deliveryInstructions?: string;
  deliveryFee?: number;
  estimatedDeliveryTime?: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  deliveryOtp?: string;
  customerRating?: number;
  customerFeedback?: string;
  distanceKm?: number;
  createdAt?: string;
}

export enum DeliveryStatus {
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export interface UpdateDeliveryStatusRequest {
  status: DeliveryStatus;
  currentLatitude?: number;
  currentLongitude?: number;
  notes?: string;
  deliveryOtp?: string;
}

export interface DeliveryStats {
  todayDeliveries: number;
  pendingPickups: number;
  inTransit: number;
  completed: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
  totalDeliveries: number;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  timestamp: string;
}