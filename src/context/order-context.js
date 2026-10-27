import { getDefaultSize } from '../data/sizes.js';
import { normalizeSizeId, normalizeExtrasIds, normalizeQuantity } from '../utils/validators.js';

class OrderContext {
  constructor() {
    this.state = {
      sizeId: getDefaultSize().id,
      extraIds: [],
      quantity: 1
    };
    this.listeners = new Set();
  }
  
  getState() {
    return { ...this.state };
  }
  
  setSize(sizeId) {
    const normalized = normalizeSizeId(sizeId);
    if (this.state.sizeId === normalized) return;
    this.state.sizeId = normalized;
    this.notify();
  }
  
  toggleExtra(extraId) {
    const normalized = extraId;
    const currentExtras = [...this.state.extraIds];
    const index = currentExtras.indexOf(normalized);
    if (index >= 0) {
      currentExtras.splice(index, 1);
    } else {
      currentExtras.push(normalized);
    }
    this.state.extraIds = normalizeExtrasIds(currentExtras);
    this.notify();
  }
  
  setExtras(extraIds) {
    this.state.extraIds = normalizeExtrasIds(extraIds);
    this.notify();
  }
  
  setQuantity(quantity) {
    const normalized = normalizeQuantity(quantity);
    if (this.state.quantity === normalized) return;
    this.state.quantity = normalized;
    this.notify();
  }
  
  incrementQuantity() {
    this.setQuantity(this.state.quantity + 1);
  }
  
  decrementQuantity() {
    this.setQuantity(this.state.quantity - 1);
  }
  
  reset() {
    this.state = {
      sizeId: getDefaultSize().id,
      extraIds: [],
      quantity: 1
    };
    this.notify();
  }
  
  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  notify() {
    const state = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('OrderContext listener error:', error);
      }
    });
  }
}

export const orderContext = new OrderContext();
export default orderContext;
