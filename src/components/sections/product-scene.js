import { createElement } from '../../utils/dom.js';
import { PRODUCT } from '../../data/products.js';
import { setupImageState } from '../ui/image-state.js';
import { t } from '../../i18n/i18n.js';

/**
 * Capa fija que sostiene el producto durante toda la portada.
 * La fotografía se usa como composición recortada (no se intenta separar el fondo).
 * La sensación de profundidad se logra con transformaciones CSS 3D + scroll.
 */
export function createProductScene() {
  const scene = createElement('div', {
    class: 'product-scene',
    'aria-hidden': 'true'
  });
  
  const backdrop = createElement('div', { class: 'product-scene-backdrop' });
  const glow = createElement('div', { class: 'product-scene-glow' });
  
  const stage = createElement('div', { class: 'product-scene-stage' });
  const inner = createElement('div', { class: 'product-scene-inner' });
  
  const img = createElement('img', {
    src: PRODUCT.images.hero,
    srcset: `${PRODUCT.images.hero} 768w, ${PRODUCT.images.heroHd} 1672w`,
    sizes: '100vw',
    alt: '',
    class: 'product-scene-image',
    loading: 'eager',
    decoding: 'async',
    fetchpriority: 'high',
    width: '1672',
    height: '940'
  });
  inner.appendChild(img);
  stage.appendChild(inner);

  setupImageState(img, {
    container: inner,
    fallbackSrc: PRODUCT.images.hero,
    label: t('loading.heroLabel'),
    skeletonClass: 'product-scene-skeleton',
    allowRetry: false
  });
  
  const veil = createElement('div', { class: 'product-scene-veil' });
  
  scene.appendChild(backdrop);
  scene.appendChild(glow);
  scene.appendChild(stage);
  scene.appendChild(veil);
  
  scene.productStage = stage;
  scene.productInner = inner;
  scene.productImage = img;
  
  return scene;
}

/**
 * Aplica un estado de transformación previamente interpolado.
 * Solo se animan transform y opacity: no hay relayout.
 */
export function applyProductState(scene, state = {}) {
  if (!scene || !scene.productStage) return;
  
  const {
    x = 0,
    y = 0,
    scale = 1,
    rotateX = 0,
    rotateY = 0,
    rotateZ = 0,
    opacity = 1
  } = state;
  
  scene.style.opacity = String(opacity);
  scene.productStage.style.transform = [
    `translate3d(${x}px, ${y}px, 0)`,
    `rotateX(${rotateX}deg)`,
    `rotateY(${rotateY}deg)`,
    `rotateZ(${rotateZ}deg)`,
    `scale(${scale})`
  ].join(' ');
}

export default createProductScene;
