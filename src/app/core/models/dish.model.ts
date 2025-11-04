export type DietType = 'veg' | 'non-veg';
export type SpiceLevel = 'MILD' | 'MEDIUM' | 'HOT';
export type DishCategory = 'MAIN_COURSE' | 'BREAKFAST' | 'DESSERT' | 'APPETIZER' | 'BEVERAGE';

export interface Dish {
  id: number | string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  tags?: string[];  // Made optional since API doesn't provide this
  calories?: number;
  category: DishCategory;
  isVegetarian: boolean;
  isAvailable: boolean;
  preparationTime?: number;  // in minutes
  spiceLevel?: SpiceLevel;
  rating?: number;
  
  // Computed property
  type?: DietType;  // Will be computed from isVegetarian
}
