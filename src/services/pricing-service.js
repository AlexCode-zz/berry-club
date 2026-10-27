import { getSizeById } from '../data/sizes.js';
import { getExtrasByIds } from '../data/extras.js';
import { isValidSizeId, isValidExtraId, isValidQuantity } from '../utils/validators.js';
import { t } from '../i18n/i18n.js';

/**
 * Calcula el pedido completo en centavos enteros.
 * Es la única fuente de verdad para los importes que se muestran.
 */
export function calculateOrder(orderState) {
  if (!orderState) return null;

  const size = getSizeById(orderState.sizeId);
  const extras = getExtrasByIds(orderState.extraIds || []);
  const quantity = Number(orderState.quantity) || 1;

  const basePriceCents = size.priceCents;
  const extrasTotalCents = extras.reduce((sum, extra) => sum + extra.priceCents, 0);
  const unitPriceCents = basePriceCents + extrasTotalCents;
  const totalPriceCents = unitPriceCents * quantity;

  return {
    size,
    extras,
    quantity,
    basePriceCents,
    extrasTotalCents,
    unitPriceCents,
    totalPriceCents
  };
}

export function validateOrder(orderState) {
  const errors = [];

  if (!orderState) {
    return { valid: false, errors: [t('validation.noConfiguration')] };
  }

  if (!isValidSizeId(orderState.sizeId)) {
    errors.push(t('validation.invalidSize'));
  }

  const extraIds = Array.isArray(orderState.extraIds) ? orderState.extraIds : [];
  if (extraIds.some(id => !isValidExtraId(id))) {
    errors.push(t('validation.invalidExtras'));
  }

  if (!isValidQuantity(orderState.quantity)) {
    errors.push(t('validation.invalidQuantity'));
  }

  return { valid: errors.length === 0, errors };
}
