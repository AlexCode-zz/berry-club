import { createElement } from '../../utils/dom.js';

export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Bloque decorativo de carga. Los skeletons nunca son contenido real:
 * se ocultan a lectores de pantalla y la región que los contiene comunica
 * su estado con aria-busy y un mensaje de estado separado.
 */
export function createSkeletonBlock(className = '', { tag = 'span' } = {}) {
  return createElement(tag, {
    class: ['skeleton', className].filter(Boolean).join(' '),
    'aria-hidden': 'true'
  });
}

export function createImageSkeleton(className = '', { tag = 'span' } = {}) {
  return createSkeletonBlock(['skeleton-image', className].filter(Boolean).join(' '), { tag });
}

export function setRegionBusy(element, isBusy) {
  if (!element) return;
  if (isBusy) {
    element.setAttribute('aria-busy', 'true');
  } else {
    element.removeAttribute('aria-busy');
  }
}

export default createSkeletonBlock;
