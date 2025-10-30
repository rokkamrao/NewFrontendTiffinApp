export type DietType = 'veg' | 'non-veg';

export interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  tags: string[];
  calories?: number;
  type: DietType;  // Changed from isVegetarian to explicit type
  rating?: number;
  preparationTime?: number;  // in minutes
  spicyLevel?: 1 | 2 | 3;   // 1=mild, 2=medium, 3=hot
}
