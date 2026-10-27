import { getLanguage, t } from '../i18n/i18n.js';

/**
 * Construye una URL de demostración con IDs internos estables.
 * Nunca incluye precios ni datos personales: el total se recalcula al abrirla.
 */
export function buildShareUrl(orderState, language = getLanguage()) {
  const url = new URL('pedido.html', window.location.href);
  url.search = '';

  if (orderState?.sizeId) {
    url.searchParams.set('size', orderState.sizeId);
  }

  const extraIds = Array.isArray(orderState?.extraIds) ? orderState.extraIds : [];
  if (extraIds.length > 0) {
    url.searchParams.set('toppings', extraIds.join(','));
  }

  url.searchParams.set('qty', String(orderState?.quantity || 1));
  url.searchParams.set('lang', language);

  return url.toString();
}

export async function copyText(text) {
  if (!text) return false;

  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Continúa con el mecanismo clásico cuando el portapapeles moderno falla.
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch (error) {
    return false;
  }
}

/**
 * Intenta la Web Share API y cae al portapapeles. Devuelve un estado que la
 * interfaz usa para mostrar confirmaciones accesibles o el modo manual.
 */
export async function shareConfiguration(orderState) {
  const url = buildShareUrl(orderState);
  const title = t('share.title');
  const text = `${t('share.text')} ${t('share.demoNote')}`;

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return { status: 'shared', url };
    } catch (error) {
      if (error?.name === 'AbortError') {
        return { status: 'cancelled', url };
      }
      // Si la API falla por permisos o falta de soporte, se intenta copiar.
    }
  }

  const copied = await copyText(url);
  return { status: copied ? 'copied' : 'manual', url };
}

export default buildShareUrl;
