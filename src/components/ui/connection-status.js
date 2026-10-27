import { createElement } from '../../utils/dom.js';
import { subscribeToLanguage, t } from '../../i18n/i18n.js';

let instance = null;

export function initConnectionStatus() {
  if (instance) return instance;
  if (typeof document === 'undefined') return null;

  const toast = createElement('div', {
    class: 'connection-toast',
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': 'true',
    hidden: true
  });

  const icon = createElement('span', {
    class: 'connection-toast-icon',
    'aria-hidden': 'true'
  }, ['!']);

  const message = createElement('p', { class: 'connection-toast-message' });
  const close = createElement('button', {
    class: 'connection-toast-close',
    type: 'button',
    'aria-label': t('connection.dismiss')
  }, ['×']);

  toast.append(icon, message, close);
  document.body.appendChild(toast);

  function updateText() {
    message.textContent = t('connection.offline');
    close.setAttribute('aria-label', t('connection.dismiss'));
  }

  function show() {
    updateText();
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add('is-visible'));
  }

  function hide() {
    toast.classList.remove('is-visible');
    toast.hidden = true;
  }

  function syncConnectivity() {
    // navigator.onLine solo informa del estado que conoce el navegador; no
    // garantiza que todos los recursos externos estén accesibles.
    if (navigator.onLine === false) {
      show();
    } else {
      hide();
    }
  }

  const unsubscribeLanguage = subscribeToLanguage(updateText);
  window.addEventListener('online', syncConnectivity);
  window.addEventListener('offline', syncConnectivity);
  close.addEventListener('click', hide);

  updateText();
  syncConnectivity();

  instance = {
    element: toast,
    refresh: syncConnectivity,
    destroy() {
      unsubscribeLanguage();
      window.removeEventListener('online', syncConnectivity);
      window.removeEventListener('offline', syncConnectivity);
      toast.remove();
      instance = null;
    }
  };

  return instance;
}

export default initConnectionStatus;
