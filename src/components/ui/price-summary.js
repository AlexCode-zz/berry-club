import { createElement, clearElement } from '../../utils/dom.js';
import { formatCurrency } from '../../utils/currency.js';
import { t } from '../../i18n/i18n.js';

function renderItems(items, orderCalculation) {
  clearElement(items);
  if (!orderCalculation) return;

  const {
    size,
    extras,
    quantity,
    basePriceCents,
    extrasTotalCents,
    unitPriceCents
  } = orderCalculation;

  const sizeRow = createElement('div', { class: 'price-row' });
  const sizeName = createElement('span', { class: 'price-row-main' });
  sizeName.appendChild(createElement('span', { class: 'price-row-label' }, [t('order.summarySize')]));
  sizeName.appendChild(createElement('strong', { class: 'price-row-strong' }, [t(`sizes.${size.id}.label`)]));
  sizeRow.appendChild(sizeName);
  sizeRow.appendChild(createElement('span', { class: 'price-row-amount' }, [formatCurrency(basePriceCents)]));
  items.appendChild(sizeRow);

  if (extras.length > 0) {
    const extrasHeader = createElement('div', { class: 'price-row price-row-header' });
    extrasHeader.appendChild(createElement('span', {}, [t('order.summaryExtras')]));
    items.appendChild(extrasHeader);

    extras.forEach(extra => {
      const row = createElement('div', { class: 'price-row price-row-extra' });
      row.appendChild(createElement('span', {}, [`+ ${t(`extras.${extra.id}.label`)}`]));
      row.appendChild(createElement('span', {}, [formatCurrency(extra.priceCents)]));
      items.appendChild(row);
    });

    const extrasTotalRow = createElement('div', { class: 'price-row price-row-subtotal' });
    extrasTotalRow.appendChild(createElement('span', {}, [t('order.summaryExtrasSubtotal')]));
    extrasTotalRow.appendChild(createElement('span', {}, [formatCurrency(extrasTotalCents)]));
    items.appendChild(extrasTotalRow);
  }

  const qtyRow = createElement('div', { class: 'price-row' });
  qtyRow.appendChild(createElement('span', { class: 'price-row-label' }, [t('order.summaryQuantity')]));
  qtyRow.appendChild(createElement('span', { class: 'price-row-amount' }, [`${quantity}`]));
  items.appendChild(qtyRow);

  const unitRow = createElement('div', { class: 'price-row price-row-unit' });
  unitRow.appendChild(createElement('span', { class: 'price-row-label' }, [t('order.summaryUnit')]));
  unitRow.appendChild(createElement('span', { class: 'price-row-amount' }, [formatCurrency(unitPriceCents)]));
  items.appendChild(unitRow);
}

function renderTotal(total, orderCalculation) {
  clearElement(total);
  total.appendChild(createElement('span', { class: 'price-total-label' }, [t('order.summaryTotal')]));
  total.appendChild(createElement('span', {
    class: 'price-total-amount'
  }, [
    orderCalculation ? formatCurrency(orderCalculation.totalPriceCents) : '-'
  ]));
}

export function createPriceSummary({ orderCalculation }) {
  const container = createElement('div', {
    class: 'price-summary',
    'aria-label': t('order.priceSummaryAria')
  });
  container.tabIndex = -1;

  const head = createElement('div', { class: 'price-summary-head' });
  const heading = createElement('div', { class: 'price-summary-heading' });
  heading.appendChild(createElement('span', { class: 'price-summary-kicker' }, [t('order.summaryKicker')]));
  heading.appendChild(createElement('h3', { class: 'price-summary-title' }, [t('order.summaryTitle')]));
  const badge = createElement('span', { class: 'price-summary-badge' }, [t('demo.badge')]);
  head.appendChild(heading);
  head.appendChild(badge);
  container.appendChild(head);

  const items = createElement('div', { class: 'price-summary-items' });
  container.appendChild(items);

  const total = createElement('div', {
    class: 'price-summary-total',
    'aria-live': 'polite',
    'aria-atomic': 'true'
  });
  container.appendChild(total);

  container.appendChild(createElement('p', { class: 'price-summary-note' }, [
    t('order.summaryNote')
  ]));

  container._items = items;
  container._total = total;
  container._lastTotal = orderCalculation ? orderCalculation.totalPriceCents : undefined;

  renderItems(items, orderCalculation);
  renderTotal(total, orderCalculation);

  return container;
}

export function updatePriceSummary(container, orderCalculation) {
  const items = container._items;
  const total = container._total;
  if (!items || !total) return;

  const nextTotal = orderCalculation ? orderCalculation.totalPriceCents : undefined;
  const previousTotal = container._lastTotal;
  container._lastTotal = nextTotal;

  renderItems(items, orderCalculation);
  renderTotal(total, orderCalculation);

  if (previousTotal !== undefined && nextTotal !== undefined && previousTotal !== nextTotal) {
    total.classList.remove('is-updated');
    // Fuerza el reinicio de la animación breve del total.
    void total.offsetWidth;
    total.classList.add('is-updated');
    window.setTimeout(() => total.classList.remove('is-updated'), 360);
  }
}

export default createPriceSummary;
