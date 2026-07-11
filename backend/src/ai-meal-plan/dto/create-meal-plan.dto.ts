export type ChildInfoDto = {
  birthDate: string;
  dislikedFoods: string;
  likedFoods: string;
  allergies: string;
};

export type MealSettingsDto = {
  daysForMeal: string;
  ingredients: string;
};

export type FridgeItemDto = {
  name: string;
  quantity: string;
  status: 'fresh' | 'soon' | 'expired';
};

export type CreateMealPlanDto = {
  childInfo: ChildInfoDto;
  mealSettings: MealSettingsDto;
  fridgeItems: FridgeItemDto[];
};

export type GeneratedMealPlanDto = {
  shoppingList: string[];
  menus: Array<{ day: number; menu: string }>;
};
