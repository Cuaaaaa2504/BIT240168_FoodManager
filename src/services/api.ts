import axios from 'axios';
import type { Dish } from '../models/Dish';
import type { DishCategory } from '../models/DishCategory';

const api = axios.create({
  baseURL: 'https://6ad74bba95e98f36aef23bc6.mockapi.io/api/v1',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// id là mã do MockAPI quản lý.
// BIT240168_Id là mã nghiệp vụ dùng trong ứng dụng.
export type ApiDishCategory = DishCategory & {
  id: string;
};

export type ApiDish = Dish & {
  id: string;
};

const CATEGORY_RESOURCE = '/BIT240168_DishCategory';
const DISH_RESOURCE = '/BIT240168_Dish';

// ==================== LOẠI MÓN ====================

export async function getCategories(): Promise<ApiDishCategory[]> {
  const response = await api.get<ApiDishCategory[]>(
    CATEGORY_RESOURCE,
  );

  return response.data;
}

export async function createCategory(
  category: DishCategory,
): Promise<ApiDishCategory> {
  const response = await api.post<ApiDishCategory>(
    CATEGORY_RESOURCE,
    category,
  );

  return response.data;
}

export async function deleteCategory(
  remoteId: string,
): Promise<void> {
  await api.delete(
    `${CATEGORY_RESOURCE}/${encodeURIComponent(remoteId)}`,
  );
}

// ==================== MÓN ĂN ====================

export async function getDishes(): Promise<ApiDish[]> {
  const response = await api.get<ApiDish[]>(DISH_RESOURCE);

  return response.data;
}

export async function getDishByRemoteId(
  remoteId: string,
): Promise<ApiDish> {
  const response = await api.get<ApiDish>(
    `${DISH_RESOURCE}/${encodeURIComponent(remoteId)}`,
  );

  return response.data;
}

export async function createDish(
  dish: Dish,
): Promise<ApiDish> {
  const response = await api.post<ApiDish>(
    DISH_RESOURCE,
    dish,
  );

  return response.data;
}

export async function updateDish(
  remoteId: string,
  dish: Dish,
): Promise<ApiDish> {
  const response = await api.put<ApiDish>(
    `${DISH_RESOURCE}/${encodeURIComponent(remoteId)}`,
    dish,
  );

  return response.data;
}

export async function deleteDish(
  remoteId: string,
): Promise<void> {
  await api.delete(
    `${DISH_RESOURCE}/${encodeURIComponent(remoteId)}`,
  );
}