import { createElement } from '../../utils/dom.js';
import { createButton } from './button.js';
import { t } from '../../i18n/i18n.js';

let modalCounter = 0;

export class Modal {
  constructor() {
    this.modal = null;
    this.dialog = null;
    this.closeBtn = null;
    this.lastFocusedElement = null;
    this.onCloseCallback = null;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  create({ title, content, actions = [], onClose }) {
    this.onCloseCallback = onClose;
    this.lastFocusedElement = document.activeElement;
    modalCounter += 1;
    const titleId = `modal-title-${modalCounter}`;

    const modal = createElement('div', {
      class: 'modal',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': titleId
    });

    const overlay = createElement('div', { class: 'modal-overlay' });
    overlay.addEventListener('click', this.handleOutsideClick);

    const dialog = createElement('div', { class: 'modal-dialog', role: 'document' });

    const header = createElement('div', { class: 'modal-header' });
    const titleEl = createElement('h2', { class: 'modal-title', id: titleId }, [title]);
    const closeBtn = createElement('button', {
      class: 'modal-close',
      type: 'button',
      'aria-label': t('modal.close')
    }, ['×']);
    closeBtn.addEventListener('click', () => this.close());
    this.closeBtn = closeBtn;

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    const body = createElement('div', { class: 'modal-body' });
    if (typeof content === 'string') {
      const p = createElement('p', {}, [content]);
      body.appendChild(p);
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    }

    const footer = createElement('div', { class: 'modal-footer' });
    actions.forEach(action => {
      const btn = createButton(action);
      if (action.href) {
        // La navegación externa se abre en otra pestaña y el modal se cierra.
        btn.addEventListener('click', () => {
          window.setTimeout(() => this.close(), 0);
        });
      }
      footer.appendChild(btn);
    });

    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(footer);
    modal.appendChild(overlay);
    modal.appendChild(dialog);

    this.modal = modal;
    this.dialog = dialog;

    document.addEventListener('keydown', this.handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus first focusable element or close button
    setTimeout(() => {
      const focusable = dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) {
        focusable.focus();
      } else {
        closeBtn.focus();
      }
    }, 50);

    return modal;
  }

  handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }
    if (e.key === 'Tab' && this.dialog) {
      const focusableElements = Array.from(this.dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter(el => !el.disabled && el.offsetWidth > 0 && el.offsetHeight > 0);

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  }

  handleOutsideClick(e) {
    if (e.target.classList.contains('modal-overlay')) {
      this.close();
    }
  }

  open(parent = document.body) {
    if (!this.modal) return;
    parent.appendChild(this.modal);
  }

  close() {
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
    document.removeEventListener('keydown', this.handleKeyDown);
    document.body.style.overflow = '';
    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      try {
        this.lastFocusedElement.focus();
      } catch (e) {
        // ignore
      }
    }
    if (typeof this.onCloseCallback === 'function') {
      this.onCloseCallback();
    }
    this.modal = null;
    this.dialog = null;
  }
}

export function createModal(options) {
  const modal = new Modal();
  return modal.create(options);
}

export default Modal;
