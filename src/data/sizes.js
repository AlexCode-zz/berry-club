import { PRODUCT } from './products.js';

export const SIZES = [
  {
    id: 'mini',
    label: 'Mini',
    description: 'Perfecto para un antojo ligero',
    priceCents: 250,
    image: PRODUCT.sizeImages.mini
  },
  {
    id: 'clasico',
    label: 'Clásico',
    description: 'El equilibrio perfecto',
    priceCents: 350,
    image: PRODUCT.sizeImages.clasico
  },
  {
    id: 'grande',
    label: 'Grande',
    description: 'Para compartir o disfrutar más',
    priceCents: 500,
    image: PRODUCT.sizeImages.grande
  }
];

export function getSizeById(id) {
  return SIZES.find(size => size.id === id) || SIZES[1];
}

export function getDefaultSize() {
  return SIZES[1];
}
