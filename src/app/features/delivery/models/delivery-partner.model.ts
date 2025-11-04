export interface DeliveryPartner {
  id: number;
  phone: string;
  name: string;
  email?: string;
  status: PartnerStatus;
  vehicleType: VehicleType;
  vehicleNumber?: string;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  isOnline: boolean;
  documentsVerified: boolean;
  profileImageUrl?: string;
}

export enum PartnerStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED'
}

export enum VehicleType {
  BICYCLE = 'BICYCLE',
  MOTORCYCLE = 'MOTORCYCLE',
  CAR = 'CAR',
  SCOOTER = 'SCOOTER'
}

export interface DeliveryPartnerLoginRequest {
  phone: string;
  password: string;
}

export interface DeliveryPartnerResponse {
  id: number;
  phone: string;
  name: string;
  email?: string;
  status: PartnerStatus;
  vehicleType: VehicleType;
  vehicleNumber?: string;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  isOnline: boolean;
  documentsVerified: boolean;
  profileImageUrl?: string;
}