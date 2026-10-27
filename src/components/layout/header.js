import { createElement } from '../../utils/dom.js';
import { SITE_CONFIG } from '../../data/site-config.js';
import { createButton } from '../ui/button.js';
import { createLanguageSwitcher } from './language-switcher.js';
import { t, tCount, withLanguage } from '../../i18n/i18n.js';
import { cartContext } from '../../context/cart-context.js';

export function createHeader() {
  const header = createElement('header', { class: 'site-header' });
  const container = createElement('div', { class: 'container header-container' });

  const logo = createElement('a', {
    class: 'site-logo',
    href: withLanguage('index.html')
  }, [SITE_CONFIG.brandName]);

  const nav = createElement('nav', {
    class: 'site-nav',
    'aria-label': t('nav.mainLabel')
  });
  const navList = createElement('ul', { class: 'nav-list' });

  const navItems = [
    { text: t('nav.home'), href: withLanguage('index.html') },
    { text: t('nav.customize'), href: withLanguage('pedido.html') },
    { text: t('nav.demo') }
  ];

  navItems.forEach(item => {
    const li = createElement('li', { class: 'nav-item' });
    const link = createElement(item.href ? 'a' : 'span', {
      class: 'nav-link',
      ...(item.href ? { href: item.href } : {})
    }, [item.text]);
    li.appendChild(link);
    navList.appendChild(li);
  });

  nav.appendChild(navList);

  const actions = createElement('div', { class: 'header-actions' });
  const languageSwitcher = createLanguageSwitcher();

  // Acceso directo al personalizador, conservando el idioma activo.
  const productsLink = createElement('a', {
    class: 'header-cart header-products',
    href: withLanguage('pedido.html'),
    'aria-label': t('nav.products')
  });
  const productsLetter = createElement('span', {
    class: 'header-products-letter',
    'aria-hidden': 'true'
  }, ['P']);
  productsLink.appendChild(productsLetter);

  const cartLink = createElement('a', {
    class: 'header-cart',
    href: withLanguage('carrito.html'),
    'aria-label': t('cart.headerEmpty')
  });
  const cartIcon = createElement('span', {
    class: 'header-cart-icon',
    'aria-hidden': 'true'
  });
  // Icono decorativo estático; el nombre accesible está en el enlace.
  cartIcon.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20.5 7H6.2"></path>
      <circle cx="10" cy="20" r="1.2"></circle>
      <circle cx="17.5" cy="20" r="1.2"></circle>
    </svg>
  `;
  const cartCount = createElement('span', {
    class: 'header-cart-count',
    'aria-hidden': 'true'
  }, ['0']);
  cartLink.append(cartIcon, cartCount);

  const syncCart = () => {
    const { unitCount } = cartContext.getState().totals;
    cartCount.textContent = String(unitCount);
    cartLink.classList.toggle('is-empty', unitCount === 0);
    cartLink.setAttribute(
      'aria-label',
      unitCount === 0
        ? t('cart.headerEmpty')
        : tCount('cart.headerOne', 'cart.headerMany', unitCount)
    );
  };
  const unsubscribeCart = cartContext.subscribe(syncCart);
  syncCart();

  const cta = createButton({
    text: t('cta.build'),
    variant: 'primary',
    href: withLanguage('pedido.html')
  });
  cta.classList.add('header-cta');

  actions.append(languageSwitcher, productsLink, cartLink, cta);

  container.appendChild(logo);
  container.appendChild(nav);
  container.appendChild(actions);
  header.appendChild(container);

  // En reposo el header deja ver la fotografía; al desplazarse gana contraste.
  const syncHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  const controller = new AbortController();
  window.addEventListener('scroll', syncHeader, { passive: true, signal: controller.signal });
  syncHeader();

  // Permite limpiar listeners cuando la página se vuelve a montar al cambiar idioma.
  header.destroy = () => {
    controller.abort();
    unsubscribeCart();
  };

  return header;
}

export default createHeader;
