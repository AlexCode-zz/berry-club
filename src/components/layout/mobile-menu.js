import { createElement } from '../../utils/dom.js';
import { createButton } from '../ui/button.js';

export function createMobileMenu() {
  // Simple mobile menu - header handles basic nav
  return createElement('div', { class: 'mobile-menu', style: 'display:none' });
}

export default createMobileMenu;
