import { seedCategories, seedDishes } from '../data/seedData';
import {
  getCategories,
  getDishes,
  createCategory,
  createDish,
} from './api';

// Các lần gọi đồng thời trong cùng phiên app dùng chung một Promise.
let initializationPromise: Promise<void> | null = null;

async function seedMissingData(): Promise<void> {
  // Tạo loại món trước.
  const existingCategories = await getCategories();

  const categoryIds = new Set(
    existingCategories.map(category => category.BIT240168_Id),
  );

  for (const category of seedCategories) {
    if (!categoryIds.has(category.BIT240168_Id)) {
      await createCategory(category);
      categoryIds.add(category.BIT240168_Id);
    }
  }

  // Chỉ tạo món sau khi loại món đã có.
  const existingDishes = await getDishes();

  const dishIds = new Set(
    existingDishes.map(dish => dish.BIT240168_Id),
  );

  for (const dish of seedDishes) {
    if (!categoryIds.has(dish.BIT240168_DishCategoryId)) {
      throw new Error(
        `Missing category: ${dish.BIT240168_DishCategoryId}`,
      );
    }

    if (!dishIds.has(dish.BIT240168_Id)) {
      await createDish(dish);
      dishIds.add(dish.BIT240168_Id);
    }
  }
}

export function initializeData(): Promise<void> {
  if (initializationPromise === null) {
    initializationPromise = seedMissingData().catch(error => {
      // Cho phép thử lại nếu lần trước thất bại.
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}