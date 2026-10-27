import { SIZES, getSizeById } from '../data/sizes.js';
import { EXTRAS } from '../data/extras.js';

export function isValidSizeId(id) {
  return SIZES.some(size => size.id === id);
}

export function normalizeSizeId(id) {
  if (isValidSizeId(id)) return id;
  return 'clasico';
}

export function isValidExtraId(id) {
  return EXTRAS.some(extra => extra.id === id);
}

export function normalizeExtrasIds(ids) {
  if (!Array.isArray(ids)) return [];
  return ids.filter(id => isValidExtraId(id));
}

export function isValidQuantity(qty) {
  const num = Number(qty);
  return Number.isInteger(num) && num >= 1 && num <= 20;
}

export function normalizeQuantity(qty) {
  const num = Number(qty);
  if (!Number.isInteger(num)) return 1;
  if (num < 1) return 1;
  if (num > 20) return 20;
  return num;
}
