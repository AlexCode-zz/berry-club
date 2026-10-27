import { createElement } from '../../utils/dom.js';
import { createButton } from './button.js';

export function createProductCard({ product, onCustomize }) {
  const card = createElement('article', { class: 'product-card' });
  
  const imageWrapper = createElement('div', { class: 'product-card-image' });
  const img = createElement('img', {
    src: product.images.hero,
    alt: product.alt || product.name,
    loading: 'lazy',
    width: '400',
    height: '400'
  });
  imageWrapper.appendChild(img);
  
  const content = createElement('div', { class: 'product-card-content' });
  const title = createElement('h3', { class: 'product-card-title' }, [product.name]);
  const desc = createElement('p', { class: 'product-card-desc' }, [product.description]);
  
  const actions = createElement('div', { class: 'product-card-actions' });
  const btn = createButton({
    text: 'Personalizar',
    variant: 'primary',
    onClick: onCustomize
  });
  actions.appendChild(btn);
  
  content.appendChild(title);
  content.appendChild(desc);
  content.appendChild(actions);
  
  card.appendChild(imageWrapper);
  card.appendChild(content);
  
  return card;
}

export default createProductCard;
