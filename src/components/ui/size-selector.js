import { createElement } from '../../utils/dom.js';
import { SIZES } from '../../data/sizes.js';
import { PRODUCT } from '../../data/products.js';
import { formatCurrency } from '../../utils/currency.js';
import { setupImageState, updateImageSource } from '../ui/image-state.js';
import { t } from '../../i18n/i18n.js';

export function createSizeSelector({ selectedSizeId, onSelect }) {
  const container = createElement('div', { class: 'size-selector' });
  const title = createElement('h3', { class: 'selector-title' }, [t('order.sizeTitle')]);
  const hint = createElement('p', { class: 'selector-hint' }, [t('order.sizeHint')]);
  container.appendChild(title);
  container.appendChild(hint);

  const options = createElement('div', { class: 'size-options' });

  SIZES.forEach(size => {
    const isSelected = selectedSizeId === size.id;
    const sizeLabel = t(`sizes.${size.id}.label`);
    const option = createElement('button', {
      class: ['size-option', isSelected ? 'is-selected' : ''],
      type: 'button',
      'aria-pressed': isSelected ? 'true' : 'false',
      'data-size-id': size.id
    });

    const media = createElement('span', { class: 'size-option-media' });
    const image = createElement('img', {
      class: 'size-option-image',
      alt: t('order.mediaAlt', { size: sizeLabel }),
      width: '768',
      height: '512',
      loading: 'lazy',
      decoding: 'async'
    });
    media.appendChild(image);
    setupImageState(image, {
      container: media,
      fallbackSrc: size.id === 'mini' ? PRODUCT.images.toppings : PRODUCT.images.classic,
      label: t('loading.sizeLabel', { size: sizeLabel }),
      skeletonClass: 'size-image-skeleton',
      compact: true,
      allowRetry: false
    });
    updateImageSource(image, size.image, {
      fallbackSrc: size.id === 'mini' ? PRODUCT.images.toppings : PRODUCT.images.classic
    });

    const body = createElement('span', { class: 'size-option-body' });
    const top = createElement('span', { class: 'size-option-top' });
    const label = createElement('span', { class: 'size-option-label' }, [sizeLabel]);
    const price = createElement('span', { class: 'size-option-price' }, [formatCurrency(size.priceCents)]);
    top.appendChild(label);
    top.appendChild(price);

    const desc = createElement('span', { class: 'size-option-desc' }, [t(`sizes.${size.id}.description`)]);
    body.appendChild(top);
    body.appendChild(desc);

    // La marca visible + aria-pressed comunican la selección sin depender del color.
    const indicator = createElement('span', {
      class: 'size-option-indicator',
      'aria-hidden': 'true'
    }, ['✓']);

    option.appendChild(media);
    option.appendChild(indicator);
    option.appendChild(body);

    option.addEventListener('click', () => {
      if (typeof onSelect === 'function') {
        onSelect(size.id);
      }
    });

    options.appendChild(option);
  });

  container.appendChild(options);
  return container;
}

export function updateSizeSelector(container, selectedSizeId) {
  const buttons = container.querySelectorAll('.size-option');
  buttons.forEach(btn => {
    const sizeId = btn.getAttribute('data-size-id');
    const isSelected = sizeId === selectedSizeId;
    btn.classList.toggle('is-selected', isSelected);
    btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
  });
}

export default createSizeSelector;
