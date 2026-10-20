import type { DishCategory } from '../models/DishCategory';
import type { Dish } from '../models/Dish';

export const seedCategories: DishCategory[] = [
  {
    BIT240168_Id: 'category-1',
    BIT240168_Name: 'Rice',
    BIT240168_Description: 'Rice dishes',
  },
  {
    BIT240168_Id: 'category-2',
    BIT240168_Name: 'Noodles',
    BIT240168_Description: 'Noodle dishes',
  },
  {
    BIT240168_Id: 'category-3',
    BIT240168_Name: 'Drinks',
    BIT240168_Description: 'Coffee, tea and other drinks',
  },
];

export const seedDishes: Dish[] = [
  {
    BIT240168_Id: 'dish-1',
    BIT240168_Name: 'Fried Rice',
    BIT240168_Price: 45000,
    BIT240168_PreparationTime: 12,
    BIT240168_IsAvailable: true,
    BIT240168_Description: 'Fried rice with eggs and vegetables.',
    BIT240168_DishCategoryId: 'category-1',
    BIT240168_DishImage: [
      {
        BIT240168_ImageUrl:
          'https://placehold.co/800x600/png?text=Fried+Rice',
        BIT240168_IsThumbnail: true,
      },
      {
        BIT240168_ImageUrl:
          'https://placehold.co/800x600/png?text=Fried+Rice+Detail',
        BIT240168_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240168_Id: 'dish-2',
    BIT240168_Name: 'Chicken Rice',
    BIT240168_Price: 55000,
    BIT240168_PreparationTime: 20,
    BIT240168_IsAvailable: true,
    BIT240168_Description: 'Rice served with chicken and vegetables.',
    BIT240168_DishCategoryId: 'category-1',
    BIT240168_DishImage: [
      {
        BIT240168_ImageUrl:
          'https://placehold.co/800x600/png?text=Chicken+Rice',
        BIT240168_IsThumbnail: true,
      },
    ],
  },
  {
    BIT240168_Id: 'dish-3',
    BIT240168_Name: 'Beef Pho',
    BIT240168_Price: 60000,
    BIT240168_PreparationTime: 25,
    BIT240168_IsAvailable: true,
    BIT240168_Description: 'Vietnamese noodle soup with beef.',
    BIT240168_DishCategoryId: 'category-2',
    BIT240168_DishImage: [
      {
        BIT240168_ImageUrl:
          'https://placehold.co/800x600/png?text=Beef+Pho',
        BIT240168_IsThumbnail: true,
      },
    ],
  },
  {
    BIT240168_Id: 'dish-4',
    BIT240168_Name: 'Stir-fried Noodles',
    BIT240168_Price: 50000,
    BIT240168_PreparationTime: 15,
    BIT240168_IsAvailable: false,
    BIT240168_Description: 'Stir-fried noodles with vegetables.',
    BIT240168_DishCategoryId: 'category-2',
    BIT240168_DishImage: [],
  },
  {
    BIT240168_Id: 'dish-5',
    BIT240168_Name: 'Iced Coffee',
    BIT240168_Price: 25000,
    BIT240168_PreparationTime: 5,
    BIT240168_IsAvailable: true,
    BIT240168_Description: 'Vietnamese coffee served with ice.',
    BIT240168_DishCategoryId: 'category-3',
    BIT240168_DishImage: [
      {
        BIT240168_ImageUrl:
          'https://placehold.co/800x600/png?text=Iced+Coffee',
        BIT240168_IsThumbnail: true,
      },
    ],
  },
];
