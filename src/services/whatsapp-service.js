import { SITE_CONFIG, hasValidOrderWhatsAppNumber, hasValidWhatsAppNumber } from '../data/site-config.js';
import { formatCurrency } from '../utils/currency.js';
import { calculateCartTotals } from './cart-pricing.js';
import { t } from '../i18n/i18n.js';

export const MAX_WHATSAPP_MESSAGE_LENGTH = 3000;
export const MAX_WHATSAPP_URL_LENGTH = 8000;

function getExtraLabel(extraId) {
  return t(`extras.${extraId}.label`);
}

/**
 * Genera el texto completo del pedido de demostración. No abre WhatsApp ni
 * conoce el destinatario: esa separación permite previsualizar y validar el
 * mensaje antes de construir una URL.
 */
export function buildCartMessage(lines = []) {
  if (!Array.isArray(lines) || lines.length === 0) return '';

  const totals = calculateCartTotals(lines);
  const message = [];
  message.push(`*${t('whatsapp.cartTitle')}*`);
  message.push('');
  message.push(t('whatsapp.cartIntro'));

  lines.forEach((line, index) => {
    message.push('');
    message.push(`*${t('whatsapp.lineLabel', { index: index + 1 })}*`);
    message.push(`${t('whatsapp.sizeLabel')}: ${t(`sizes.${line.sizeId}.label`)}`);

    if (line.extraIds.length > 0) {
      message.push(`${t('whatsapp.extrasLabel')}:`);
      line.extraIds.forEach(extraId => {
        const extra = (line.extras || []).find(item => item.id === extraId);
        const price = extra ? ` (+${formatCurrency(extra.priceCents)})` : '';
        message.push(`- ${getExtraLabel(extraId)}${price}`);
      });
    } else {
      message.push(`${t('whatsapp.extrasLabel')}: ${t('cart.noExtras')}`);
    }

    message.push(`${t('whatsapp.quantityLabel')}: ${line.quantity}`);
    message.push(`${t('whatsapp.unitPrice')}: ${formatCurrency(line.unitPriceCents)}`);
    message.push(`${t('whatsapp.lineSubtotal')}: ${formatCurrency(line.subtotalCents)}`);
  });

  message.push('');
  message.push(`${t('whatsapp.unitsLabel')}: ${totals.unitCount}`);
  message.push(`*${t('whatsapp.cartTotal')}: ${formatCurrency(totals.totalCents)}*`);
  message.push('');
  message.push(`_${t('whatsapp.demoFooter')}_`);

  return message.join('\n');
}

/**
 * Construye la URL solo cuando hay un destinatario configurado y el mensaje
 * está dentro de límites seguros. El llamador debe tratar cada estado.
 */
export function buildCartWhatsAppUrl(lines = []) {
  const message = buildCartMessage(lines);
  if (!message) {
    return { status: 'empty', message: '', url: null };
  }

  if (!hasValidOrderWhatsAppNumber()) {
    return { status: 'unconfigured', message, url: null };
  }

  if (message.length > MAX_WHATSAPP_MESSAGE_LENGTH) {
    return { status: 'too-long', message, url: null };
  }

  const number = SITE_CONFIG.contact.orderWhatsappNumber.trim();
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  if (url.length > MAX_WHATSAPP_URL_LENGTH) {
    return { status: 'too-long', message, url: null };
  }

  return { status: 'ready', message, url };
}

export function buildDeveloperMessageUrl() {
  if (!hasValidWhatsAppNumber()) {
    return null;
  }
  const message = t('whatsapp.developerMessage');
  const number = SITE_CONFIG.contact.whatsappNumber.trim();
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encodedMessage}`;
}
