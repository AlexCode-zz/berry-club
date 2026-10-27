import { createElement } from '../../utils/dom.js';
import { normalizeQuantity } from '../../utils/validators.js';
import { t } from '../../i18n/i18n.js';

export function createQuantitySelector({ quantity = 1, onChange }) {
  let currentQuantity = normalizeQuantity(quantity);

  const container = createElement('div', { class: 'quantity-selector' });
  const title = createElement('h3', { class: 'selector-title' }, [t('order.quantity')]);
  container.appendChild(title);

  const controls = createElement('div', {
    class: 'quantity-controls',
    role: 'group',
    'aria-label': t('order.quantity')
  });

  const decreaseBtn = createElement('button', {
    class: 'quantity-btn',
    type: 'button',
    'aria-label': t('order.decreaseQuantity')
  }, ['−']);

  const display = createElement('div', {
    class: 'quantity-display',
    'aria-live': 'polite',
    'aria-atomic': 'true',
    'aria-label': t('order.quantityLabel', { count: currentQuantity })
  }, [String(currentQuantity)]);

  const increaseBtn = createElement('button', {
    class: 'quantity-btn',
    type: 'button',
    'aria-label': t('order.increaseQuantity')
  }, ['+']);

  function emit(nextValue) {
    currentQuantity = normalizeQuantity(nextValue);
    if (typeof onChange === 'function') {
      onChange(currentQuantity);
    }
  }

  function syncDisabled() {
    decreaseBtn.disabled = currentQuantity <= 1;
    increaseBtn.disabled = currentQuantity >= 20;
  }

  decreaseBtn.addEventListener('click', () => {
    if (currentQuantity <= 1) return;
    emit(currentQuantity - 1);
  });

  increaseBtn.addEventListener('click', () => {
    if (currentQuantity >= 20) return;
    emit(currentQuantity + 1);
  });

  controls.appendChild(decreaseBtn);
  controls.appendChild(display);
  controls.appendChild(increaseBtn);
  container.appendChild(controls);

  container._display = display;
  container._decreaseBtn = decreaseBtn;
  container._increaseBtn = increaseBtn;
  container._setCurrent = (value) => {
    currentQuantity = normalizeQuantity(value);
    syncDisabled();
  };

  syncDisabled();

  return container;
}

export function updateQuantitySelector(container, quantity) {
  const display = container._display || container.querySelector('.quantity-display');
  if (!display) return;
  const normalized = normalizeQuantity(quantity);
  display.textContent = String(normalized);
  display.setAttribute('aria-label', t('order.quantityLabel', { count: normalized }));
  if (typeof container._setCurrent === 'function') {
    container._setCurrent(normalized);
  }
}

export default createQuantitySelector;
