import { PRODUCT } from '../data/products.js';

export const IMAGES = {
  hero: PRODUCT.images.hero,
  heroHd: PRODUCT.images.heroHd,
  classic: PRODUCT.images.classic,
  chocolate: PRODUCT.images.chocolate,
  toppings: PRODUCT.images.toppings
};

export function getImagePath(key) {
  return IMAGES[key] || IMAGES.hero;
}
