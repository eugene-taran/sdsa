/**
 * Category type definitions for organizing questionnaires
 */

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  order: number;
}

export interface CategoriesData {
  categories: Category[];
}