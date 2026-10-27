import { cartContext } from '../context/cart-context.js';

export function useCart() {
  return {
    getState: () => cartContext.getState(),
    getLine: (lineId) => cartContext.getLine(lineId),
    addConfiguration: (configuration) => cartContext.addConfiguration(configuration),
    updateLine: (lineId, configuration) => cartContext.updateLine(lineId, configuration),
    setLineQuantity: (lineId, quantity) => cartContext.setLineQuantity(lineId, quantity),
    incrementLine: (lineId) => cartContext.incrementLine(lineId),
    decrementLine: (lineId) => cartContext.decrementLine(lineId),
    removeLine: (lineId) => cartContext.removeLine(lineId),
    duplicateLine: (lineId) => cartContext.duplicateLine(lineId),
    clear: () => cartContext.clear(),
    subscribe: (listener) => cartContext.subscribe(listener)
  };
}

export default useCart;
