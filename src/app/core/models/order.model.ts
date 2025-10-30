export interface OrderItemModel {
	dishId: string;
	name: string;
	price: number;
	qty: number;
}

export type OrderStatusModel = 'Pending' | 'Paid' | 'Preparing' | 'OutForDelivery' | 'Delivered' | 'Cancelled';

export interface OrderModel {
	id: string;
	items: OrderItemModel[];
	status: OrderStatusModel;
	createdAt: string; // ISO string
	eta?: string; // e.g., "45 mins"
	totalAmount?: number;
}

