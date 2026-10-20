import type { Dish } from '../models/Dish';
import type { DishCategory } from '../models/DishCategory';

export type DishValidationErrors = {
  name?: string;
  price?: string;
  preparationTime?: string;
  category?: string;
  images?: string;
};

export function validateDish(
  dish: Dish,
  allDishes: Dish[],
  categories: DishCategory[],
): DishValidationErrors {
  const errors: DishValidationErrors = {};

  const normalizedName = dish.BIT240168_Name.trim().toLowerCase();

  if (!normalizedName) {
    errors.name = 'nameRequired';
  }

  if (
    !Number.isFinite(dish.BIT240168_Price) ||
    dish.BIT240168_Price <= 0
  ) {
    errors.price = 'priceInvalid';
  }

  if (
    !Number.isFinite(dish.BIT240168_PreparationTime) ||
    dish.BIT240168_PreparationTime <= 0
  ) {
    errors.preparationTime = 'preparationTimeInvalid';
  }

  const categoryExists = categories.some(
    category =>
      category.BIT240168_Id === dish.BIT240168_DishCategoryId,
  );

  if (!categoryExists) {
    errors.category = 'categoryInvalid';
  }

  const duplicateExists = allDishes.some(
    existingDish =>
      existingDish.BIT240168_Id !== dish.BIT240168_Id &&
      existingDish.BIT240168_DishCategoryId ===
        dish.BIT240168_DishCategoryId &&
      existingDish.BIT240168_Name.trim().toLowerCase() ===
        normalizedName,
  );

  if (normalizedName && duplicateExists) {
    errors.name = 'duplicateDishName';
  }

  const thumbnailCount = dish.BIT240168_DishImage.filter(
    image => image.BIT240168_IsThumbnail,
  ).length;

  if (thumbnailCount > 1) {
    errors.images = 'multipleThumbnails';
  }

  const hasEmptyImageUrl = dish.BIT240168_DishImage.some(
    image => !image.BIT240168_ImageUrl.trim(),
  );

  if (hasEmptyImageUrl) {
    errors.images = 'imageUrlRequired';
  }

  return errors;
}

export function isValidPriceRange(
  minPrice: number | null,
  maxPrice: number | null,
): boolean {
  if (
    minPrice !== null &&
    (!Number.isFinite(minPrice) || minPrice < 0)
  ) {
    return false;
  }

  if (
    maxPrice !== null &&
    (!Number.isFinite(maxPrice) || maxPrice < 0)
  ) {
    return false;
  }

  return !(
    minPrice !== null &&
    maxPrice !== null &&
    minPrice > maxPrice
  );
}

export function isCategoryInUse(
  categoryId: string,
  dishes: Dish[],
): boolean {
  return dishes.some(
    dish => dish.BIT240168_DishCategoryId === categoryId,
  );
}
