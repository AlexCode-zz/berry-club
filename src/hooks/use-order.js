import { orderContext } from '../context/order-context.js';

export function useOrder() {
  return {
    getState: () => orderContext.getState(),
    setSize: (sizeId) => orderContext.setSize(sizeId),
    toggleExtra: (extraId) => orderContext.toggleExtra(extraId),
    setExtras: (extraIds) => orderContext.setExtras(extraIds),
    setQuantity: (quantity) => orderContext.setQuantity(quantity),
    incrementQuantity: () => orderContext.incrementQuantity(),
    decrementQuantity: () => orderContext.decrementQuantity(),
    reset: () => orderContext.reset(),
    subscribe: (listener) => orderContext.subscribe(listener)
  };
}

export function useOrderState(listener) {
  const order = useOrder();
  const unsubscribe = order.subscribe(listener);
  listener(order.getState());
  return unsubscribe;
}

export default useOrder;
