import { SITE_CONFIG } from '../data/site-config.js';
import { getLocale } from '../i18n/i18n.js';

export function formatCurrency(cents) {
  const amount = (cents / 100).toFixed(2);
  const formatter = new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency: SITE_CONFIG.currency
  });
  return formatter.format(amount);
}

export function centsToAmount(cents) {
  return cents / 100;
}
