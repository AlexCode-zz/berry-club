import { createElement } from '../../utils/dom.js';

export function createButton({
  text,
  variant = 'primary',
  type = 'button',
  className = '',
  onClick,
  ariaLabel,
  href,
  target,
  rel
}) {
  const classes = ['btn', `btn-${variant}`];
  if (className) {
    if (Array.isArray(className)) classes.push(...className);
    else classes.push(className);
  }
  
  if (href) {
    const link = createElement('a', {
      class: classes,
      href,
      ...(target ? { target } : {}),
      ...(rel ? { rel } : {}),
      ...(ariaLabel ? { 'aria-label': ariaLabel } : {})
    }, [text]);
    
    if (typeof onClick === 'function') {
      link.addEventListener('click', onClick);
    }
    
    return link;
  }
  
  const button = createElement('button', {
    type,
    class: classes,
    'aria-label': ariaLabel || text
  }, [text]);
  
  if (typeof onClick === 'function') {
    button.addEventListener('click', onClick);
  }
  
  return button;
}

export default createButton;
