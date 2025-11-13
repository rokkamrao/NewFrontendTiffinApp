// Export all models from a single index file
export * from './user.model';
export * from './dish.model';
export * from './order.model';
export * from './subscription.model';
export * from './api-response.model';

// Re-export common interfaces
export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
  data?: any;
  isNewUser?: boolean;
  role?: string;
}

export interface OtpRequest {
  phone: string;
  verificationType?: string;
}

export interface OtpVerificationRequest {
  phone: string;
  otp: string;
  verificationType?: string;
}

export interface SignUpRequest {
  phone: string;
  password?: string;
  name?: string;
  email?: string;
  otp?: string;
}

export interface SignInRequest {
  phone: string;
  password: string;
}