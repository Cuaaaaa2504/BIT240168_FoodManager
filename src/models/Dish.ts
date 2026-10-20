export interface DishImage {
  BIT240168_ImageUrl: string;
  BIT240168_IsThumbnail: boolean;
}

export interface Dish {
  BIT240168_Id: string;
  BIT240168_Name: string;
  BIT240168_Price: number;
  BIT240168_PreparationTime: number;
  BIT240168_IsAvailable: boolean;
  BIT240168_Description: string;
  BIT240168_DishCategoryId: string;
  BIT240168_DishImage: DishImage[];
}
