import {
  addConfigurationToLines,
  clearLines,
  decrementLineInLines,
  duplicateLineInLines,
  incrementLineInLines,
  removeLineFromLines,
  setLineQuantityInLines,
  updateLineInLines
} from '../services/cart-operations.js';
import { calculateCartTotals } from '../services/cart-pricing.js';
import { readCart, writeCart } from '../services/cart-storage.js';

function cloneLine(line) {
  return {
    ...line,
    extraIds: [...line.extraIds],
    extras: line.extras.map(extra => ({ ...extra }))
  };
}

class CartContext {
  constructor() {
    this.lines = readCart();
    this.listeners = new Set();
  }

  getState() {
    return {
      lines: this.lines.map(cloneLine),
      totals: calculateCartTotals(this.lines)
    };
  }

  getLine(lineId) {
    const line = this.lines.find(item => item.id === lineId);
    return line ? cloneLine(line) : null;
  }

  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  commit(nextLines) {
    this.lines = nextLines;
    writeCart(this.lines);
    this.notify();
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('[Berry Club] Cart listener failed', error);
      }
    });
  }

  addConfiguration(configuration) {
    const result = addConfigurationToLines(this.lines, configuration);
    if (result.lines !== this.lines) {
      this.commit(result.lines);
    }
    return result;
  }

  updateLine(lineId, configuration) {
    const result = updateLineInLines(this.lines, lineId, configuration);
    if (result.updated) this.commit(result.lines);
    return result;
  }

  setLineQuantity(lineId, quantity) {
    const result = setLineQuantityInLines(this.lines, lineId, quantity);
    if (result.line) this.commit(result.lines);
    return result;
  }

  incrementLine(lineId) {
    const result = incrementLineInLines(this.lines, lineId);
    if (result.line) this.commit(result.lines);
    return result;
  }

  decrementLine(lineId) {
    const result = decrementLineInLines(this.lines, lineId);
    if (result.line) this.commit(result.lines);
    return result;
  }

  removeLine(lineId) {
    const nextLines = removeLineFromLines(this.lines, lineId);
    if (nextLines.length === this.lines.length) return false;
    this.commit(nextLines);
    return true;
  }

  duplicateLine(lineId) {
    const result = duplicateLineInLines(this.lines, lineId);
    if (result.line) this.commit(result.lines);
    return result;
  }

  clear() {
    if (this.lines.length === 0) return;
    this.commit(clearLines());
  }
}

export const cartContext = new CartContext();
export default cartContext;
