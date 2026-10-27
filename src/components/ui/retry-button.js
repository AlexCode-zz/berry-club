import { createElement } from '../../utils/dom.js';
import { t } from '../../i18n/i18n.js';

/**
 * Botón de reintento reutilizable. Evita solicitudes simultáneas, muestra un
 * estado temporal de carga y mantiene el foco en un control real.
 */
export function createRetryButton({
  onRetry,
  label = t('loading.retry'),
  className = ''
} = {}) {
  const button = createElement('button', {
    type: 'button',
    class: ['retry-button', className].filter(Boolean).join(' '),
    'aria-label': label
  }, [label]);

  let busy = false;

  function setBusy(nextBusy) {
    busy = Boolean(nextBusy);
    button.disabled = busy;
    button.setAttribute('aria-busy', busy ? 'true' : 'false');
    button.textContent = busy ? t('loading.retrying') : button.dataset.restingLabel || label;
  }

  button.dataset.restingLabel = label;

  button.addEventListener('click', async () => {
    if (busy || typeof onRetry !== 'function') return;

    setBusy(true);
    try {
      await onRetry();
    } catch (error) {
      console.error('[Berry Club] Retry failed', error);
    } finally {
      setBusy(false);
    }
  });

  button.setBusy = setBusy;
  return button;
}

export default createRetryButton;
