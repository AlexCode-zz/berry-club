import {
  isValidSizeId,
  normalizeSizeId,
  normalizeExtrasIds,
  isValidQuantity
} from './validators.js';
import { isSupportedLanguage } from '../i18n/i18n.js';

function parseList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function unique(values) {
  return Array.from(new Set(values));
}

/**
 * Lee una configuración desde la URL sin confiar en precios ni en etiquetas.
 * Los IDs inválidos se descartan y la cantidad inválida vuelve al valor seguro 1.
 */
export function parseOrderStateFromUrl(search = window.location.search) {
  const params = new URLSearchParams(search);
  const rawSize = params.get('size') ?? params.get('tamano');
  const rawToppings = params.get('toppings') ?? params.get('extras') ?? params.get('complementos');
  const rawQuantity = params.get('qty') ?? params.get('cantidad');
  const rawLanguage = params.get('lang');

  const sizeId = rawSize && isValidSizeId(rawSize)
    ? rawSize
    : normalizeSizeId(rawSize);

  const extraIds = rawToppings
    ? normalizeExtrasIds(unique(parseList(rawToppings)))
    : [];

  const quantity = rawQuantity !== null && isValidQuantity(rawQuantity)
    ? Number(rawQuantity)
    : 1;

  return {
    state: { sizeId, extraIds, quantity },
    language: isSupportedLanguage(rawLanguage) ? rawLanguage : null,
    hasAnyParams: Boolean(rawSize || rawToppings || rawQuantity || rawLanguage),
    hasValidSize: Boolean(rawSize && isValidSizeId(rawSize)),
    hasInvalidSize: Boolean(rawSize && !isValidSizeId(rawSize)),
    hasInvalidQuantity: Boolean(rawQuantity !== null && !isValidQuantity(rawQuantity))
  };
}

export function hasOrderParams(search = window.location.search) {
  const params = new URLSearchParams(search);
  return ['size', 'tamano', 'toppings', 'extras', 'complementos', 'qty', 'cantidad']
    .some(key => params.has(key));
}
