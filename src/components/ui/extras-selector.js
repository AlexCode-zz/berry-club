import { createElement } from '../../utils/dom.js';
import { EXTRAS } from '../../data/extras.js';
import { formatCurrency } from '../../utils/currency.js';
import { t } from '../../i18n/i18n.js';

export function createExtrasSelector({ selectedExtraIds = [], onToggle }) {
  const container = createElement('div', { class: 'extras-selector' });
  const title = createElement('h3', { class: 'selector-title' }, [t('order.extrasTitle')]);
  const hint = createElement('p', { class: 'selector-hint' }, [t('order.extrasHint')]);
  container.appendChild(title);
  container.appendChild(hint);

  const options = createElement('div', { class: 'extras-options' });

  EXTRAS.forEach(extra => {
    const isSelected = selectedExtraIds.includes(extra.id);
    const option = createElement('button', {
      class: ['extra-option', isSelected ? 'is-selected' : ''],
      type: 'button',
      'aria-pressed': isSelected ? 'true' : 'false',
      'data-extra-id': extra.id
    });

    const check = createElement('span', {
      class: 'extra-check',
      'aria-hidden': 'true'
    });

    const info = createElement('span', { class: 'extra-info' });
    const label = createElement('span', { class: 'extra-label' }, [t(`extras.${extra.id}.label`)]);
    const desc = createElement('span', { class: 'extra-desc' }, [t(`extras.${extra.id}.description`)]);
    info.appendChild(label);
    info.appendChild(desc);

    const price = createElement('span', { class: 'extra-price' }, ['+' + formatCurrency(extra.priceCents)]);

    option.appendChild(check);
    option.appendChild(info);
    option.appendChild(price);

    option.addEventListener('click', () => {
      if (typeof onToggle === 'function') {
        onToggle(extra.id);
      }
    });

    options.appendChild(option);
  });

  container.appendChild(options);
  return container;
}

export function updateExtrasSelector(container, selectedExtraIds = []) {
  const buttons = container.querySelectorAll('.extra-option');
  buttons.forEach(btn => {
    const extraId = btn.getAttribute('data-extra-id');
    const isSelected = selectedExtraIds.includes(extraId);
    btn.classList.toggle('is-selected', isSelected);
    btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
  });
}

export default createExtrasSelector;
