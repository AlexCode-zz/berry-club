import { createHeader } from '../components/layout/header.js';
import { createFooter } from '../components/layout/footer.js';
import { createElement } from '../utils/dom.js';
import { createSizeSelector, updateSizeSelector } from '../components/ui/size-selector.js';
import { createExtrasSelector, updateExtrasSelector } from '../components/ui/extras-selector.js';
import { createQuantitySelector, updateQuantitySelector } from '../components/ui/quantity-selector.js';
import { createPriceSummary, updatePriceSummary } from '../components/ui/price-summary.js';
import { createButton } from '../components/ui/button.js';
import { setupImageState, updateImageSource } from '../components/ui/image-state.js';
import { createCartBar } from '../components/ui/cart-bar.js';
import { useOrder } from '../hooks/use-order.js';
import { useCart } from '../hooks/use-cart.js';
import { calculateOrder, validateOrder } from '../services/pricing-service.js';
import { PRODUCT } from '../data/products.js';
import { formatCurrency } from '../utils/currency.js';
import { parseOrderStateFromUrl } from '../utils/url-state.js';
import { t, withLanguage } from '../i18n/i18n.js';

// Solo la primera montura de la página hidrata la URL. Al cambiar de idioma
// se vuelve a pintar la interfaz, pero se conserva el estado del pedido.
let orderHydrated = false;
let hasExplicitSize = false;
let editLineId = null;

function getRequestedEditLineId() {
  try {
    return new URLSearchParams(window.location.search).get('edit');
  } catch (error) {
    return null;
  }
}

export function initOrderPage() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = '';

  const order = useOrder();
  const cart = useCart();

  if (!orderHydrated) {
    const requestedEditId = getRequestedEditLineId();
    if (requestedEditId) {
      const line = cart.getLine(requestedEditId);
      if (line) {
        order.setSize(line.sizeId);
        order.setExtras(line.extraIds);
        order.setQuantity(line.quantity);
        editLineId = line.id;
        hasExplicitSize = true;
      }
    }

    if (!editLineId) {
      const parsed = parseOrderStateFromUrl();
      if (parsed.hasAnyParams) {
        order.setSize(parsed.state.sizeId);
        order.setExtras(parsed.state.extraIds);
        order.setQuantity(parsed.state.quantity);
      }
      hasExplicitSize = parsed.hasValidSize;
    }

    orderHydrated = true;
  }

  const isEditing = Boolean(editLineId);
  const header = createHeader();
  app.appendChild(header);

  const main = document.createElement('main');
  main.className = 'order-main';

  const container = createElement('div', { class: 'container order-container' });

  const intro = createElement('div', { class: 'order-intro' });
  const introTop = createElement('div', { class: 'order-intro-top' });
  const eyebrow = createElement('p', { class: 'order-eyebrow' }, [t('order.eyebrow')]);
  const demoBadge = createElement('span', { class: 'order-demo-badge' }, [
    t('demo.orderBadge')
  ]);
  introTop.appendChild(eyebrow);
  introTop.appendChild(demoBadge);

  const title = createElement('h1', { class: 'order-title' }, [t('order.title')]);
  const subtitle = createElement('p', { class: 'order-subtitle' }, [t('order.subtitle')]);

  intro.appendChild(introTop);
  intro.appendChild(title);
  intro.appendChild(subtitle);

  let editBanner = null;
  if (isEditing) {
    editBanner = createElement('div', { class: 'order-edit-banner', role: 'status' });
    const editCopy = createElement('div', { class: 'order-edit-copy' });
    editCopy.appendChild(createElement('span', { class: 'order-edit-kicker' }, [
      t('order.editKicker')
    ]));
    editCopy.appendChild(createElement('strong', { class: 'order-edit-title' }, [
      t('order.editTitle')
    ]));
    editCopy.appendChild(createElement('p', { class: 'order-edit-note' }, [
      t('order.editNote')
    ]));
    const cancelEdit = createElement('a', {
      class: 'order-edit-cancel',
      href: withLanguage('carrito.html')
    }, [t('order.cancelEdit')]);
    editBanner.append(editCopy, cancelEdit);
  }

  const grid = createElement('div', { class: 'order-grid' });

  // Columna izquierda - producto protagonista
  const leftCol = createElement('aside', {
    class: 'order-left',
    'aria-label': t('order.mediaAria')
  });

  const media = createElement('figure', { class: 'order-media' });
  const mediaFrame = createElement('div', { class: 'order-media-frame' });
  const productImage = createElement('img', {
    class: 'order-product-image',
    alt: t('product.alt'),
    width: '768',
    height: '512',
    loading: 'eager',
    decoding: 'async',
    fetchpriority: 'high'
  });
  mediaFrame.appendChild(productImage);

  const initialCalculation = calculateOrder(order.getState());
  const initialSizeLabel = t(`sizes.${initialCalculation.size.id}.label`);
  const imageState = setupImageState(productImage, {
    container: mediaFrame,
    fallbackSrc: PRODUCT.images.classic,
    label: t('loading.productLabel', { size: initialSizeLabel }),
    skeletonClass: 'order-image-skeleton'
  });

  const mediaTag = createElement('span', { class: 'order-media-tag' }, [t('order.mediaTag')]);
  mediaFrame.appendChild(mediaTag);

  const caption = createElement('figcaption', { class: 'order-media-caption' });
  const captionMain = createElement('span', { class: 'order-media-caption-main' });
  const mediaSize = createElement('strong', { class: 'order-media-size' }, ['']);
  const mediaSub = createElement('span', { class: 'order-media-sub' }, [t('order.mediaSub')]);
  captionMain.appendChild(mediaSize);
  captionMain.appendChild(mediaSub);
  const mediaPrice = createElement('span', { class: 'order-media-price' }, ['']);
  caption.appendChild(captionMain);
  caption.appendChild(mediaPrice);

  media.appendChild(mediaFrame);
  media.appendChild(caption);
  leftCol.appendChild(media);

  const mediaNote = createElement('p', { class: 'order-media-note' }, [t('order.mediaNote')]);
  leftCol.appendChild(mediaNote);

  // Columna derecha - controles
  const rightCol = createElement('div', { class: 'order-right' });

  const sizeSelector = createSizeSelector({
    selectedSizeId: order.getState().sizeId,
    onSelect: (sizeId) => {
      order.setSize(sizeId);
    }
  });
  rightCol.appendChild(sizeSelector);

  const extrasSelector = createExtrasSelector({
    selectedExtraIds: order.getState().extraIds,
    onToggle: (extraId) => {
      order.toggleExtra(extraId);
    }
  });
  rightCol.appendChild(extrasSelector);

  const quantitySelector = createQuantitySelector({
    quantity: order.getState().quantity,
    onChange: (qty) => {
      order.setQuantity(qty);
    }
  });
  rightCol.appendChild(quantitySelector);

  const checkout = createElement('div', { class: 'order-checkout' });
  const priceSummary = createPriceSummary({ orderCalculation: initialCalculation });
  checkout.appendChild(priceSummary);

  const orderStatus = createElement('p', {
    class: 'order-status',
    role: 'status',
    'aria-live': 'polite'
  });

  const orderBtn = createButton({
    text: isEditing ? t('order.saveChanges') : t('order.addToCart'),
    variant: 'primary',
    className: 'order-add-btn'
  });

  const cartLink = createButton({
    text: t('order.viewCart'),
    variant: 'secondary',
    href: withLanguage('carrito.html'),
    className: 'order-cart-link'
  });

  function syncCartLink() {
    const { unitCount } = cart.getState().totals;
    cartLink.textContent = unitCount > 0
      ? t('order.cartLink', { count: unitCount })
      : t('order.viewCart');
  }
  const unsubscribeCart = cart.subscribe(syncCartLink);
  syncCartLink();

  orderBtn.addEventListener('click', () => {
    const currentState = order.getState();
    const validation = validateOrder(currentState);

    if (!validation.valid) {
      orderStatus.textContent = validation.errors[0];
      orderStatus.className = 'order-status is-error';
      return;
    }

    if (isEditing) {
      const result = cart.updateLine(editLineId, currentState);
      if (!result.updated) {
        orderStatus.textContent = t('cart.removed');
        orderStatus.className = 'order-status is-error';
        return;
      }
      window.location.assign(withLanguage('carrito.html'));
      return;
    }

    const result = cart.addConfiguration(currentState);
    if (result.cartFull) {
      orderStatus.textContent = t('cart.cartFull');
      orderStatus.className = 'order-status is-error';
      return;
    }
    if (!result.line) {
      orderStatus.textContent = t('cart.cartFull');
      orderStatus.className = 'order-status is-error';
      return;
    }
    if (result.limitReached && result.addedQuantity === 0) {
      orderStatus.textContent = t('cart.lineAtLimit');
      orderStatus.className = 'order-status is-error';
      return;
    }

    orderStatus.textContent = result.limitReached ? t('cart.addedLimit') : t('cart.added');
    orderStatus.className = 'order-status is-success';
  });

  checkout.appendChild(orderBtn);
  checkout.appendChild(cartLink);
  checkout.appendChild(orderStatus);
  rightCol.appendChild(checkout);

  grid.appendChild(leftCol);
  grid.appendChild(rightCol);

  container.appendChild(intro);
  if (editBanner) container.appendChild(editBanner);
  container.appendChild(grid);
  main.appendChild(container);
  app.appendChild(main);

  const footer = createFooter();
  app.appendChild(footer);

  const cartBar = createCartBar();
  app.appendChild(cartBar.element);

  function updateOrderMedia(calculation, imageOverride) {
    if (!calculation) return;
    const { size } = calculation;
    const sizeLabel = t(`sizes.${size.id}.label`);
    const src = imageOverride || size.image || PRODUCT.images.classic;
    const fallbackSrc = src === PRODUCT.images.classic
      ? PRODUCT.images.toppings
      : PRODUCT.images.classic;

    updateImageSource(productImage, src, {
      fallbackSrc,
      label: t('loading.productLabel', { size: sizeLabel })
    });
    productImage.alt = t('order.mediaAlt', { size: sizeLabel });
    mediaSize.textContent = sizeLabel;
    mediaPrice.textContent = formatCurrency(size.priceCents);
  }

  // La vista inicial usa la fotografía clásica de presentación. Si se llega
  // con un tamaño compartido o editado, se respeta la fotografía de ese tamaño.
  let displayedSizeId = order.getState().sizeId;
  const usePresentationImage = !hasExplicitSize && displayedSizeId === 'clasico';
  updateOrderMedia(initialCalculation, usePresentationImage ? PRODUCT.images.classic : null);

  const unsubscribe = order.subscribe((state) => {
    const calculation = calculateOrder(state);
    updateSizeSelector(sizeSelector, state.sizeId);
    updateExtrasSelector(extrasSelector, state.extraIds);
    updateQuantitySelector(quantitySelector, state.quantity);
    updatePriceSummary(priceSummary, calculation);
    orderStatus.textContent = '';
    orderStatus.className = 'order-status';

    // Los complementos no alteran el tamaño ni la fotografía principal.
    if (state.sizeId !== displayedSizeId) {
      displayedSizeId = state.sizeId;
      hasExplicitSize = true;
      updateOrderMedia(calculation);
    }
  });

  return () => {
    unsubscribe();
    unsubscribeCart();
    if (typeof header.destroy === 'function') header.destroy();
    if (imageState) imageState.dispose();
    cartBar.destroy();
    document.body.style.overflow = '';
  };
}

export default initOrderPage;
