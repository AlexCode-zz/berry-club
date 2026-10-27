import { createElement } from '../../utils/dom.js';
import { formatCurrency } from '../../utils/currency.js';
import { t, tCount, withLanguage } from '../../i18n/i18n.js';
import { cartContext } from '../../context/cart-context.js';

/**
 * Barra móvil global del carrito. Solo se muestra cuando hay unidades y nunca
 * se monta en la propia página del carrito, donde el resumen ya es el contenido.
 */
export function createCartBar() {
  const bar = createElement('div', {
    class: 'cart-bar',
    role: 'region',
    'aria-label': t('cart.barLabel')
  });
  bar.hidden = true;

  const total = createElement('div', { class: 'cart-bar-total' });
  total.appendChild(createElement('span', { class: 'cart-bar-label' }, [
    t('cart.summaryTotal')
  ]));
  const amount = createElement('strong', { class: 'cart-bar-amount' }, ['']);
  total.appendChild(amount);

  const units = createElement('span', { class: 'cart-bar-units' }, ['']);

  const link = createElement('a', {
    class: 'btn btn-primary cart-bar-link',
    href: withLanguage('carrito.html')
  }, [t('cart.barView')]);

  bar.append(total, units, link);

  const sync = () => {
    const { unitCount, totalCents } = cartContext.getState().totals;
    const visible = unitCount > 0;
    bar.hidden = !visible;
    document.body.classList.toggle('has-cart-bar', visible);
    if (!visible) return;

    amount.textContent = formatCurrency(totalCents);
    units.textContent = tCount('cart.barUnitsOne', 'cart.barUnitsMany', unitCount);
    link.setAttribute(
      'aria-label',
      `${t('cart.barView')}, ${tCount('cart.barUnitsOne', 'cart.barUnitsMany', unitCount)}`
    );
  };

  const unsubscribe = cartContext.subscribe(sync);
  sync();

  return {
    element: bar,
    destroy() {
      unsubscribe();
      document.body.classList.remove('has-cart-bar');
      if (bar.parentNode) bar.parentNode.removeChild(bar);
    }
  };
}

export default createCartBar;
