import { createHeader } from '../components/layout/header.js';
import { createFooter } from '../components/layout/footer.js';
import { createElement, clearElement } from '../utils/dom.js';
import { createButton } from '../components/ui/button.js';
import { Modal } from '../components/ui/modal.js';
import { setupImageState } from '../components/ui/image-state.js';
import { formatCurrency } from '../utils/currency.js';
import { getSizeById } from '../data/sizes.js';
import { PRODUCT } from '../data/products.js';
import { buildCartWhatsAppUrl } from '../services/whatsapp-service.js';
import { copyText } from '../services/share-service.js';
import { t, tCount, withLanguage } from '../i18n/i18n.js';
import { useCart } from '../hooks/use-cart.js';

function getEditHref(lineId) {
  const url = new URL(withLanguage('pedido.html'), window.location.href);
  url.searchParams.set('edit', lineId);
  return `${url.pathname}${url.search}`;
}

function getSizeLabel(line) {
  return t(`sizes.${line.sizeId}.label`);
}

function getLineExtras(line) {
  return line.extraIds.map(extraId => {
    const stored = (line.extras || []).find(extra => extra.id === extraId);
    return {
      id: extraId,
      label: t(`extras.${extraId}.label`),
      priceCents: stored?.priceCents ?? 0
    };
  });
}

function createQuantityControl(line, cart) {
  const wrapper = createElement('div', { class: 'cart-qty' });
  const sizeLabel = getSizeLabel(line);
  const decrease = createElement('button', {
    class: 'cart-qty-btn',
    type: 'button',
    'aria-label': t('cart.decrease', { size: sizeLabel }),
    'data-action': 'decrease'
  }, ['−']);
  const value = createElement('span', {
    class: 'cart-qty-value',
    'aria-live': 'polite',
    'aria-atomic': 'true'
  }, [String(line.quantity)]);
  const increase = createElement('button', {
    class: 'cart-qty-btn',
    type: 'button',
    'aria-label': t('cart.increase', { size: sizeLabel }),
    'data-action': 'increase'
  }, ['+']);

  decrease.addEventListener('click', () => cart.decrementLine(line.id));
  increase.addEventListener('click', () => cart.incrementLine(line.id));

  wrapper.append(decrease, value, increase);
  return { wrapper, decrease, increase, value };
}

function createLineCard(line, cart, setStatus) {
  const size = getSizeById(line.sizeId);
  const sizeLabel = getSizeLabel(line);
  const article = createElement('article', {
    class: 'cart-line',
    dataset: { lineId: line.id },
    'aria-label': `${sizeLabel}, ${tCount('cart.unitsOne', 'cart.unitsMany', line.quantity)}`
  });

  const media = createElement('div', { class: 'cart-line-media' });
  const img = createElement('img', {
    class: 'cart-line-image',
    src: size.image,
    alt: t('order.mediaAlt', { size: sizeLabel }),
    width: '240',
    height: '240',
    loading: 'lazy',
    decoding: 'async'
  });
  media.appendChild(img);
  const fallbackSrc = size.image === PRODUCT.images.classic
    ? PRODUCT.images.toppings
    : PRODUCT.images.classic;
  const imageState = setupImageState(img, {
    container: media,
    fallbackSrc,
    label: sizeLabel,
    skeletonClass: 'cart-line-skeleton',
    compact: true,
    allowRetry: false
  });

  const body = createElement('div', { class: 'cart-line-body' });
  const heading = createElement('div', { class: 'cart-line-heading' });
  const title = createElement('h3', { class: 'cart-line-title' }, [sizeLabel]);
  const unit = createElement('p', { class: 'cart-line-unit' }, [
    `${t('cart.unitPrice')}: ${formatCurrency(line.unitPriceCents)}`
  ]);
  heading.append(title, unit);

  const extrasWrap = createElement('div', { class: 'cart-line-extras-wrap' });
  extrasWrap.appendChild(createElement('span', { class: 'cart-line-label' }, [
    t('cart.lineExtras')
  ]));
  const extras = getLineExtras(line);
  if (extras.length > 0) {
    const extrasList = createElement('ul', { class: 'cart-line-extras' });
    extras.forEach(extra => {
      const item = createElement('li', { class: 'cart-line-extra' });
      item.appendChild(createElement('span', {}, [extra.label]));
      item.appendChild(createElement('span', { class: 'cart-line-extra-price' }, [
        `+${formatCurrency(extra.priceCents)}`
      ]));
      extrasList.appendChild(item);
    });
    extrasWrap.appendChild(extrasList);
  } else {
    extrasWrap.appendChild(createElement('p', { class: 'cart-line-no-extras' }, [
      t('cart.noExtras')
    ]));
  }

  const footer = createElement('div', { class: 'cart-line-footer' });
  const substotal = createElement('div', { class: 'cart-line-subtotal' });
  substotal.appendChild(createElement('span', { class: 'cart-line-subtotal-label' }, [
    t('cart.subtotal')
  ]));
  const subtotalValue = createElement('strong', { class: 'cart-line-subtotal-value' }, [
    formatCurrency(line.subtotalCents)
  ]);
  substotal.appendChild(subtotalValue);

  const qty = createQuantityControl(line, cart);
  const quantityWrap = createElement('div', { class: 'cart-line-quantity' });
  quantityWrap.appendChild(createElement('span', { class: 'cart-line-label' }, [
    t('cart.quantity')
  ]));
  quantityWrap.appendChild(qty.wrapper);

  const actions = createElement('div', { class: 'cart-line-actions' });
  const edit = createElement('a', {
    class: 'cart-line-action cart-line-edit',
    href: getEditHref(line.id),
    'aria-label': t('cart.editLabel', { size: sizeLabel })
  }, [t('cart.edit')]);

  const duplicate = createElement('button', {
    class: 'cart-line-action',
    type: 'button',
    'aria-label': t('cart.duplicateLabel', { size: sizeLabel })
  }, [t('cart.duplicate')]);
  duplicate.addEventListener('click', () => {
    const result = cart.duplicateLine(line.id);
    if (result.cartFull) {
      setStatus(t('cart.cartFull'), 'error');
      return;
    }
    if (result.line) {
      setStatus(t('cart.duplicated'), 'success');
      window.requestAnimationFrame(() => {
        const next = document.querySelector(`[data-line-id="${result.line.id}"] .cart-line-edit`);
        if (next) next.focus();
      });
    }
  });

  const remove = createElement('button', {
    class: 'cart-line-action cart-line-remove',
    type: 'button',
    'aria-label': t('cart.removeLabel', { size: sizeLabel })
  }, [t('cart.remove')]);
  remove.addEventListener('click', () => {
    const state = cart.getState();
    const index = state.lines.findIndex(item => item.id === line.id);
    const next = state.lines[index + 1] || state.lines[index - 1];
    cart.removeLine(line.id);
    setStatus(t('cart.removed'), 'success');
    window.requestAnimationFrame(() => {
      const target = next
        ? document.querySelector(`[data-line-id="${next.id}"] .cart-line-edit`)
        : document.querySelector('.cart-empty-cta');
      if (target) target.focus();
    });
  });

  actions.append(edit, duplicate, remove);
  footer.append(substotal, quantityWrap, actions);
  body.append(heading, extrasWrap, footer);
  article.append(media, body);

  return {
    article,
    imageState,
    update(nextLine) {
      qty.value.textContent = String(nextLine.quantity);
      subtotalValue.textContent = formatCurrency(nextLine.subtotalCents);
      qty.decrease.disabled = nextLine.quantity <= 1;
      qty.increase.disabled = nextLine.quantity >= 20;
      article.setAttribute(
        'aria-label',
        `${sizeLabel}, ${tCount('cart.unitsOne', 'cart.unitsMany', nextLine.quantity)}`
      );
    }
  };
}

export function initCartPage() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = '';
  const cart = useCart();

  const header = createHeader();
  app.appendChild(header);

  const main = createElement('main', { class: 'cart-main' });
  const container = createElement('div', { class: 'container cart-container' });
  const intro = createElement('div', { class: 'cart-intro' });
  const introTop = createElement('div', { class: 'cart-intro-top' });
  introTop.appendChild(createElement('p', { class: 'cart-eyebrow' }, [t('cart.eyebrow')]));
  introTop.appendChild(createElement('span', { class: 'cart-demo-badge' }, [
    t('cart.demoBadge')
  ]));
  const title = createElement('h1', { class: 'cart-title', tabindex: '-1' }, [t('cart.title')]);
  const subtitle = createElement('p', { class: 'cart-subtitle' }, [t('cart.subtitle')]);
  const countLabel = createElement('p', {
    class: 'cart-units-label',
    'aria-live': 'polite',
    'aria-atomic': 'true'
  }, ['']);
  intro.append(introTop, title, subtitle, countLabel);

  const status = createElement('p', {
    class: 'cart-status',
    role: 'status',
    'aria-live': 'polite'
  });
  let statusTimer = null;
  function setStatus(message, tone = '') {
    if (statusTimer) window.clearTimeout(statusTimer);
    status.textContent = message;
    status.className = ['cart-status', tone ? `is-${tone}` : ''].filter(Boolean).join(' ');
    if (message) {
      statusTimer = window.setTimeout(() => {
        status.textContent = '';
        status.className = 'cart-status';
      }, 5000);
    }
  }

  const cartLayout = createElement('div', { class: 'cart-layout' });
  const listColumn = createElement('section', {
    class: 'cart-list-panel',
    'aria-labelledby': 'cart-list-title'
  });
  const listHead = createElement('div', { class: 'cart-list-head' });
  const listTitle = createElement('h2', { class: 'cart-list-title', id: 'cart-list-title' }, [
    t('cart.listTitle')
  ]);
  const clearButton = createElement('button', {
    class: 'cart-clear',
    type: 'button'
  }, [t('cart.clear')]);
  listHead.append(listTitle, clearButton);
  const linesList = createElement('div', { class: 'cart-lines' });
  listColumn.append(listHead, linesList);

  const summary = createElement('aside', {
    class: 'cart-summary-panel',
    'aria-label': t('cart.summaryTitle')
  });
  summary.appendChild(createElement('h2', { class: 'cart-summary-title' }, [
    t('cart.summaryTitle')
  ]));
  const summaryUnitsRow = createElement('div', { class: 'cart-summary-row' });
  summaryUnitsRow.appendChild(createElement('span', {}, [t('cart.summaryUnits')]));
  const summaryUnits = createElement('strong', {}, ['0']);
  summaryUnitsRow.appendChild(summaryUnits);
  const summaryTotalRow = createElement('div', { class: 'cart-summary-row cart-summary-total' });
  summaryTotalRow.appendChild(createElement('span', {}, [t('cart.summaryTotal')]));
  const summaryTotal = createElement('strong', { class: 'cart-summary-total-value' }, ['$0.00']);
  summaryTotalRow.appendChild(summaryTotal);
  const summaryNote = createElement('p', { class: 'cart-summary-note' }, [
    t('cart.summaryNote')
  ]);
  const whatsappButton = createButton({
    text: t('cart.whatsapp'),
    variant: 'primary',
    className: 'cart-whatsapp-btn'
  });
  const continueLink = createButton({
    text: t('cart.continue'),
    variant: 'secondary',
    href: withLanguage('pedido.html'),
    className: 'cart-continue-btn'
  });
  const whatsappHelp = createElement('p', { class: 'cart-whatsapp-help' }, [
    t('cart.whatsappHelp')
  ]);
  summary.append(
    summaryUnitsRow,
    summaryTotalRow,
    summaryNote,
    whatsappButton,
    continueLink,
    whatsappHelp
  );

  cartLayout.append(listColumn, summary);

  const emptyState = createElement('section', { class: 'cart-empty' });
  const emptyMedia = createElement('div', { class: 'cart-empty-media' });
  const emptyImage = createElement('img', {
    class: 'cart-empty-image',
    src: PRODUCT.images.classic,
    alt: t('cart.emptyImageAlt'),
    width: '640',
    height: '640',
    loading: 'lazy',
    decoding: 'async'
  });
  emptyMedia.appendChild(emptyImage);
  const emptyCopy = createElement('div', { class: 'cart-empty-copy' });
  emptyCopy.appendChild(createElement('h2', { class: 'cart-empty-title' }, [
    t('cart.emptyTitle')
  ]));
  emptyCopy.appendChild(createElement('p', { class: 'cart-empty-text' }, [
    t('cart.emptyText')
  ]));
  const emptyCta = createButton({
    text: t('cart.emptyCta'),
    variant: 'primary',
    href: withLanguage('pedido.html'),
    className: 'cart-empty-cta'
  });
  const emptyHome = createElement('a', {
    class: 'cart-empty-home',
    href: withLanguage('index.html')
  }, [t('cart.emptyHome')]);
  emptyCopy.append(emptyCta, emptyHome);
  emptyState.append(emptyMedia, emptyCopy);

  container.append(intro, status, cartLayout, emptyState);
  main.appendChild(container);
  app.appendChild(main);

  const footer = createFooter();
  app.appendChild(footer);

  const emptyImageState = setupImageState(emptyImage, {
    container: emptyMedia,
    fallbackSrc: PRODUCT.images.toppings,
    label: t('cart.emptyImageAlt'),
    skeletonClass: 'cart-empty-skeleton'
  });

  let lineStates = [];
  let structuralKey = '';
  let whatsappModal = null;
  let clearModal = null;

  function disposeLineStates() {
    lineStates.forEach(state => state.imageState.dispose());
    lineStates = [];
  }

  function updateSummary(totals) {
    summaryUnits.textContent = tCount('cart.unitsOne', 'cart.unitsMany', totals.unitCount);
    summaryTotal.textContent = formatCurrency(totals.totalCents);
    countLabel.textContent = tCount('cart.unitsOne', 'cart.unitsMany', totals.unitCount);
  }

  function buildLines(lines) {
    disposeLineStates();
    clearElement(linesList);
    lines.forEach(line => {
      const lineCard = createLineCard(line, cart, setStatus);
      lineCard.update(line);
      linesList.appendChild(lineCard.article);
      lineStates.push({ id: line.id, ...lineCard });
    });
  }

  function syncLines(lines) {
    const nextKey = lines.map(line => line.id).join('|');
    if (nextKey !== structuralKey) {
      structuralKey = nextKey;
      buildLines(lines);
      return;
    }

    lines.forEach(line => {
      const state = lineStates.find(item => item.id === line.id);
      if (state) state.update(line);
    });
  }

  function render() {
    const state = cart.getState();
    const hasLines = state.lines.length > 0;
    cartLayout.hidden = !hasLines;
    emptyState.hidden = hasLines;
    clearButton.hidden = !hasLines;

    if (hasLines) {
      syncLines(state.lines);
    } else {
      disposeLineStates();
      clearElement(linesList);
      structuralKey = '';
    }

    updateSummary(state.totals);
    clearButton.disabled = !hasLines;
  }

  function openClearModal() {
    const content = createElement('div', { class: 'cart-modal-content' });
    content.appendChild(createElement('p', { class: 'modal-description' }, [
      t('cart.clearText')
    ]));
    if (clearModal) clearModal.close();
    const modal = new Modal();
    clearModal = modal;
    modal.create({
      title: t('cart.clearTitle'),
      content,
      actions: [
        {
          text: t('cart.cancel'),
          variant: 'secondary',
          onClick: () => modal.close()
        },
        {
          text: t('cart.clearConfirm'),
          variant: 'primary',
          onClick: () => {
            cart.clear();
            modal.close();
            setStatus(t('cart.removed'), 'success');
            window.requestAnimationFrame(() => {
              const target = document.querySelector('.cart-empty-cta');
              if (target) target.focus();
            });
          }
        }
      ],
      onClose: () => {
        if (clearModal === modal) clearModal = null;
      }
    });
    modal.open();
  }

  function createWhatsAppContent(result) {
    const content = createElement('div', { class: 'cart-modal-content whatsapp-modal-content' });
    const portfolio = createElement('p', { class: 'portfolio-badge' }, [t('portfolio.badge')]);
    const notice = createElement('div', { class: 'cart-demo-notice', role: 'note' });
    notice.appendChild(createElement('strong', {}, [t('whatsapp.demoModalNotice')]));
    notice.appendChild(createElement('p', {}, [t('whatsapp.demoPrices')]));

    const preview = createElement('div', { class: 'whatsapp-preview' });
    const lines = cart.getState().lines;
    lines.forEach((line, index) => {
      const row = createElement('div', { class: 'whatsapp-line' });
      const copy = createElement('div', { class: 'whatsapp-line-copy' });
      copy.appendChild(createElement('strong', {}, [
        `${t('whatsapp.lineLabel', { index: index + 1 })} · ${getSizeLabel(line)}`
      ]));
      const extras = getLineExtras(line);
      copy.appendChild(createElement('span', {}, [
        extras.length > 0
          ? extras.map(extra => extra.label).join(', ')
          : t('cart.noExtras')
      ]));
      const amount = createElement('div', { class: 'whatsapp-line-amount' });
      amount.appendChild(createElement('span', {}, [
        `${line.quantity} × ${formatCurrency(line.unitPriceCents)}`
      ]));
      amount.appendChild(createElement('strong', {}, [formatCurrency(line.subtotalCents)]));
      row.append(copy, amount);
      preview.appendChild(row);
    });

    const totals = cart.getState().totals;
    const totalRow = createElement('div', { class: 'whatsapp-total' });
    totalRow.appendChild(createElement('span', {}, [t('cart.summaryTotal')]));
    totalRow.appendChild(createElement('strong', {}, [formatCurrency(totals.totalCents)]));
    preview.appendChild(totalRow);

    content.append(portfolio, notice, preview);

    if (result.status === 'unconfigured') {
      content.appendChild(createElement('p', { class: 'cart-modal-hint' }, [
        t('whatsapp.recipientUnconfigured')
      ]));
    } else if (result.status === 'too-long') {
      content.appendChild(createElement('p', { class: 'cart-modal-hint is-error' }, [
        t('whatsapp.messageTooLong')
      ]));
    } else {
      content.appendChild(createElement('p', { class: 'cart-modal-hint' }, [
        t('whatsapp.demoFooter')
      ]));
    }

    const copyStatus = createElement('p', {
      class: 'cart-copy-status',
      role: 'status',
      'aria-live': 'polite'
    });
    content.appendChild(copyStatus);

    const actions = [
      {
        text: t('share.close'),
        variant: 'secondary',
        onClick: () => whatsappModal?.close()
      },
      {
        text: t('whatsapp.copySummary'),
        variant: 'secondary',
        onClick: async () => {
          const copied = await copyText(result.message);
          copyStatus.textContent = copied ? t('whatsapp.copied') : t('whatsapp.copyFailed');
          copyStatus.classList.toggle('is-error', !copied);
        }
      }
    ];

    if (result.status === 'ready') {
      actions.push({
        text: t('whatsapp.open'),
        variant: 'primary',
        href: result.url,
        target: '_blank',
        rel: 'noopener noreferrer'
      });
    }

    return { content, actions };
  }

  function openWhatsAppModal() {
    const state = cart.getState();
    if (state.lines.length === 0) return;
    const result = buildCartWhatsAppUrl(state.lines);
    if (whatsappModal) whatsappModal.close();
    const { content, actions } = createWhatsAppContent(result);
    const modal = new Modal();
    whatsappModal = modal;
    modal.create({
      title: t('whatsapp.demoModalTitle'),
      content,
      actions,
      onClose: () => {
        if (whatsappModal === modal) whatsappModal = null;
      }
    });
    modal.open();
  }

  whatsappButton.addEventListener('click', openWhatsAppModal);
  clearButton.addEventListener('click', openClearModal);

  const unsubscribe = cart.subscribe(render);
  render();

  return () => {
    unsubscribe();
    if (statusTimer) window.clearTimeout(statusTimer);
    disposeLineStates();
    if (emptyImageState) emptyImageState.dispose();
    if (whatsappModal) whatsappModal.close();
    if (clearModal) clearModal.close();
    if (typeof header.destroy === 'function') header.destroy();
    document.body.style.overflow = '';
  };
}

export default initCartPage;
