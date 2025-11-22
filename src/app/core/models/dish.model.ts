export type DietType = 'veg' | 'non-veg';
export type SpiceLevel = 'MILD' | 'MEDIUM' | 'HOT';
export type DishCategory = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  tags?: string[];  // Made optional since API doesn't provide this
  calories: number;
  category: DishCategory;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isJain: boolean;
  isAvailable: boolean;
  isBestseller: boolean;
  preparationTime?: number;  // in minutes
  spiceLevel?: SpiceLevel;
  rating?: number;
  
  // Nutrition information
  protein: number;
  carbs: number;
  fat: number;
  
  // Computed property
  type?: DietType;  // Will be computed from isVegetarian
}
