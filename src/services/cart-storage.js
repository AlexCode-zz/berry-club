import { CART_STORAGE_VERSION, MAX_CART_LINES, normalizeCartLines } from './cart-pricing.js';

export const CART_STORAGE_KEY = 'berry-club-cart';

function getStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch (error) {
    return null;
  }
}

function readRaw() {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return storage.getItem(CART_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function removeRaw() {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    // El carrito en memoria sigue funcionando aunque el almacenamiento falle.
  }
}

function isStorageRecord(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    value.version === CART_STORAGE_VERSION &&
    Array.isArray(value.lines) &&
    value.lines.length <= MAX_CART_LINES
  );
}

/**
 * Lee el carrito sin confiar en precios, etiquetas ni cantidades almacenadas.
 * Cualquier JSON corrupto, versión desconocida o estructura inválida se
 * invalida de forma controlada y devuelve un carrito vacío.
 */
export function readCart() {
  const raw = readRaw();
  if (!raw) return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.warn('[Berry Club] El carrito guardado no era JSON válido. Se ha reiniciado.');
    removeRaw();
    return [];
  }

  if (!isStorageRecord(parsed)) {
    console.warn('[Berry Club] El carrito guardado no tiene un formato compatible. Se ha reiniciado.');
    removeRaw();
    return [];
  }

  return normalizeCartLines(parsed.lines);
}

export function writeCart(lines) {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify({
      version: CART_STORAGE_VERSION,
      lines: Array.isArray(lines) ? lines : []
    }));
    return true;
  } catch (error) {
    console.warn('[Berry Club] No se pudo guardar el carrito en este navegador.');
    return false;
  }
}

export function clearCartStorage() {
  removeRaw();
}
