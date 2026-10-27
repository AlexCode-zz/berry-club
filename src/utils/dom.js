export function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (key === 'class') {
      if (Array.isArray(value)) {
        element.className = value.filter(Boolean).join(' ');
      } else {
        element.className = value;
      }
      return;
    }
    if (key === 'dataset' && typeof value === 'object') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
      return;
    }
    if (typeof value === 'boolean') {
      if (value) element.setAttribute(key, '');
      else element.removeAttribute(key);
      return;
    }
    element.setAttribute(key, value);
  });
  
  const childArray = Array.isArray(children) ? children : [children];
  childArray.filter(Boolean).forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });
  
  return element;
}

export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  return element;
}

export function query(selector, parent = document) {
  return parent.querySelector(selector);
}

export function queryAll(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}
