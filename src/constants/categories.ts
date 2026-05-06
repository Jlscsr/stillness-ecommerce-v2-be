export const VALID_CATEGORIES = [
  'collections',
  'decor',
  'gifts',
  'tea',
  'apparel',
  'home',
  'limited_edition',
  'seasonal',
  'wellness',
] as const;

export type ProductCategory = (typeof VALID_CATEGORIES)[number];

export const isValidCategory = (category: string): category is ProductCategory =>
  VALID_CATEGORIES.includes(category as ProductCategory);
