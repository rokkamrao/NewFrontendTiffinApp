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
	dietary?: 'Veg' | 'Non-Veg' | 'Vegan' | 'Jain' | string;
	avatarUrl?: string;
	addresses?: AddressModel[];
}

