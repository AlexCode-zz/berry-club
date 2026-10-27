import { calculateOrder } from './pricing-service.js';
import {
  isValidSizeId,
  normalizeSizeId,
  normalizeExtrasIds,
  normalizeQuantity
} from '../utils/validators.js';

export const CART_STORAGE_VERSION = 1;
export const MAX_CART_LINES = 30;
export const MAX_LINE_QUANTITY = 20;

let fallbackIdCounter = 0;

export function createCartLineId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  fallbackIdCounter += 1;
  return `line-${Date.now().toString(36)}-${fallbackIdCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Crea una instantánea de línea para mostrar y persistir. Los nombres y precios
 * se guardan como datos de presentación; cualquier total se recalcula desde el
 * catálogo local antes de usarse.
 */
export function createCartLine(configuration, { id = createCartLineId() } = {}) {
  const sizeId = normalizeSizeId(configuration?.sizeId);
  const extraIds = normalizeExtrasIds(configuration?.extraIds || []);
  const quantity = normalizeQuantity(configuration?.quantity);
  const calculation = calculateOrder({ sizeId, extraIds, quantity });

  return {
    id,
    sizeId,
    sizeName: calculation.size.label,
    basePriceCents: calculation.basePriceCents,
    extraIds: calculation.extras.map(extra => extra.id),
    extras: calculation.extras.map(extra => ({
      id: extra.id,
      name: extra.label,
      priceCents: extra.priceCents
    })),
    quantity,
    unitPriceCents: calculation.unitPriceCents,
    subtotalCents: calculation.totalPriceCents
  };
}

export function recalculateCartLine(line) {
  return createCartLine(
    {
      sizeId: line?.sizeId,
      extraIds: line?.extraIds,
      quantity: line?.quantity
    },
    { id: line?.id || createCartLineId() }
  );
}

export function configurationsMatch(first, second) {
  if (!first || !second || first.sizeId !== second.sizeId) return false;
  const firstExtras = [...(first.extraIds || [])].sort();
  const secondExtras = [...(second.extraIds || [])].sort();
  if (firstExtras.length !== secondExtras.length) return false;
  return firstExtras.every((id, index) => id === secondExtras[index]);
}

export function calculateCartTotals(lines = []) {
  return lines.reduce((totals, line) => {
    const quantity = normalizeQuantity(line.quantity);
    const unitPrice = Number.isInteger(line.unitPriceCents) ? line.unitPriceCents : 0;
    const subtotal = unitPrice * quantity;

    totals.unitCount += quantity;
    totals.lineCount += 1;
    totals.totalCents += subtotal;
    return totals;
  }, { unitCount: 0, lineCount: 0, totalCents: 0 });
}

/**
 * Normaliza datos recuperados del almacenamiento. Las líneas inválidas se
 * descartan y los importes se reconstruyen desde el catálogo actual.
 */
export function normalizeCartLines(rawLines) {
  if (!Array.isArray(rawLines)) return [];

  const seenIds = new Set();
  const lines = [];

  for (const raw of rawLines) {
    if (!raw || typeof raw !== 'object') continue;
    if (!isValidSizeId(raw.sizeId)) continue;

    let id = typeof raw.id === 'string' && raw.id.trim() && raw.id.length <= 128
      ? raw.id
      : createCartLineId();

    if (seenIds.has(id)) {
      id = createCartLineId();
    }

    seenIds.add(id);
    lines.push(recalculateCartLine({
      id,
      sizeId: raw.sizeId,
      extraIds: Array.isArray(raw.extraIds) ? raw.extraIds : [],
      quantity: raw.quantity
    }));

    if (lines.length >= MAX_CART_LINES) break;
  }

  return lines;
}

export default createCartLine;
