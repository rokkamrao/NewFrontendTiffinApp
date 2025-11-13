export interface AddressModel {
	id: string;
	label?: string; // Home, Work
	line1: string;
	line2?: string;
	city?: string;
	state?: string;
	pincode?: string;
	lat?: number;
	lng?: number;
}

export interface UserModel {
	id: string;
	phone: string;
	name?: string;
	email?: string;
	dietary?: string | string[];
	avatarUrl?: string;
	addresses?: AddressModel[];
}

// Alias for backward compatibility
export interface UserProfile extends UserModel {
	phone: string;
	name?: string;
	fullName?: string;
	email?: string;
	dietary?: string | string[];
	allergies?: { [key: string]: boolean } | string[];
	role?: string;
}

export interface AuthResponse {
	success?: boolean;
	user?: UserProfile;
	token?: string;
	message?: string;
	role?: string;
}

