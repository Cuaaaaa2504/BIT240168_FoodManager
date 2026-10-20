import axios from 'axios';
import type {Dish} from '../models/Dish';
import type {DishCategory} from '../models/DishCategory';

const api = axios.create({
  baseURL: 'https://6ad74bba95e98f36aef23bc6.mockapi.io/api/v1',
  timeout: 20000,
  headers: {'Content-Type': 'application/json'},
});

export type ApiDishCategory = DishCategory & {id: string};
export type ApiDish = Dish & {id: string};
const CATEGORY_RESOURCE = '/BIT240168_DishCategory';
const DISH_RESOURCE = '/BIT240168_Dish';

export class CategoryInUseError extends Error {
  constructor() {
    super('categoryInUse');
    this.name = 'CategoryInUseError';
  }
}

export async function getCategories(): Promise<ApiDishCategory[]> {
  const response = await api.get<ApiDishCategory[]>(CATEGORY_RESOURCE);
  if (!Array.isArray(response.data)) {throw new Error('Invalid category response');}
  return response.data;
}

export async function createCategory(category: DishCategory): Promise<ApiDishCategory> {
  const response = await api.post<ApiDishCategory>(CATEGORY_RESOURCE, category);
  return response.data;
}

export async function deleteCategory(remoteId: string): Promise<void> {
  const encodedId = encodeURIComponent(remoteId);
  const [categoryResponse, dishes] = await Promise.all([
    api.get<ApiDishCategory>(`${CATEGORY_RESOURCE}/${encodedId}`),
    getDishes(),
  ]);
  const category = categoryResponse.data;
  if (!category || !category.BIT240168_Id) {
    throw new Error('Invalid category response');
  }
  if (dishes.some(dish => dish.BIT240168_DishCategoryId === category.BIT240168_Id)) {
    throw new CategoryInUseError();
  }
  await api.delete(`${CATEGORY_RESOURCE}/${encodedId}`);
}

export async function getDishes(): Promise<ApiDish[]> {
  const response = await api.get<ApiDish[]>(DISH_RESOURCE);
  if (!Array.isArray(response.data)) {throw new Error('Invalid dish response');}
  return response.data;
}

export async function getDishByRemoteId(remoteId: string): Promise<ApiDish> {
  const response = await api.get<ApiDish>(`${DISH_RESOURCE}/${encodeURIComponent(remoteId)}`);
  return response.data;
}

export async function createDish(dish: Dish): Promise<ApiDish> {
  const response = await api.post<ApiDish>(DISH_RESOURCE, dish);
  return response.data;
}

export async function updateDish(remoteId: string, dish: Dish): Promise<ApiDish> {
  const response = await api.put<ApiDish>(`${DISH_RESOURCE}/${encodeURIComponent(remoteId)}`, dish);
  return response.data;
}

export async function deleteDish(remoteId: string): Promise<void> {
  await api.delete(`${DISH_RESOURCE}/${encodeURIComponent(remoteId)}`);
}
