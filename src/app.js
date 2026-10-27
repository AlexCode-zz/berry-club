import { initHomePage } from './pages/home-page.js';
import { initOrderPage } from './pages/order-page.js';
import { initCartPage } from './pages/cart-page.js';
import { initI18n, subscribeToLanguage } from './i18n/i18n.js';
import { initConnectionStatus } from './components/ui/connection-status.js';

let appInitialized = false;

export function getCurrentPage() {
  const declaredPage = document.body.dataset.page;
  if (declaredPage === 'home' || declaredPage === 'order' || declaredPage === 'cart') {
    return declaredPage;
  }

  const path = window.location.pathname;
  if (path.endsWith('carrito.html') || path.endsWith('/carrito')) return 'cart';
  return path.endsWith('pedido.html') || path.endsWith('/pedido') ? 'order' : 'home';
}

function closeTransientUi() {
  document.querySelectorAll('.modal').forEach(modal => modal.remove());
  document.querySelectorAll('.product-scene').forEach(scene => scene.remove());
  document.body.style.overflow = '';
}

function focusActiveLanguage() {
  const active = document.querySelector('.language-switch .language-option[aria-pressed="true"]');
  if (active && typeof active.focus === 'function') {
    active.focus({ preventScroll: true });
  }
}

/**
 * El destino de un enlace con hash puede montarse después del primer render
 * (la portada se construye con JavaScript). Lo enfocamos y desplazamos cuando
 * ya existe, sin añadir una entrada extra al historial.
 */
function focusInitialFragment() {
  const { hash } = window.location;
  if (!hash || hash.length < 2) return;

  let id;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch (error) {
    return;
  }

  const target = document.getElementById(id);
  if (!target) return;

  target.scrollIntoView({ block: 'start', behavior: 'auto' });
  target.focus({ preventScroll: true });
}

export function initApp() {
  if (appInitialized) return;
  appInitialized = true;

  const app = document.getElementById('app');
  if (!app) return;

  initI18n();
  initConnectionStatus();

  let cleanupCurrentPage = null;

  function renderCurrentPage() {
    if (typeof cleanupCurrentPage === 'function') {
      cleanupCurrentPage();
      cleanupCurrentPage = null;
    }

    app.innerHTML = '';
    closeTransientUi();

    const page = getCurrentPage();
    let cleanup;
    if (page === 'order') cleanup = initOrderPage();
    else if (page === 'cart') cleanup = initCartPage();
    else cleanup = initHomePage();
    cleanupCurrentPage = typeof cleanup === 'function' ? cleanup : null;
  }

  subscribeToLanguage(() => {
    const scrollY = window.scrollY;

    renderCurrentPage();

    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
      focusActiveLanguage();
    });
  });

  renderCurrentPage();
  window.requestAnimationFrame(focusInitialFragment);
}

export default initApp;
