import {
  MAX_CART_LINES,
  MAX_LINE_QUANTITY,
  configurationsMatch,
  createCartLine,
  createCartLineId,
  recalculateCartLine
} from './cart-pricing.js';
import { normalizeQuantity } from '../utils/validators.js';

export function addConfigurationToLines(lines, configuration) {
  const safeLines = Array.isArray(lines) ? lines : [];
  const candidate = createCartLine(configuration);
  const existingIndex = safeLines.findIndex(line => configurationsMatch(line, candidate));

  if (existingIndex >= 0) {
    const existing = safeLines[existingIndex];
    const combinedQuantity = existing.quantity + candidate.quantity;
    const nextQuantity = normalizeQuantity(combinedQuantity);
    const nextLine = {
      ...existing,
      quantity: nextQuantity,
      subtotalCents: existing.unitPriceCents * nextQuantity
    };

    return {
      lines: safeLines.map((line, index) => (index === existingIndex ? nextLine : line)),
      line: nextLine,
      merged: true,
      addedQuantity: nextQuantity - existing.quantity,
      limitReached: combinedQuantity > MAX_LINE_QUANTITY,
      cartFull: false
    };
  }

  if (safeLines.length >= MAX_CART_LINES) {
    return {
      lines: safeLines,
      line: null,
      merged: false,
      addedQuantity: 0,
      limitReached: false,
      cartFull: true
    };
  }

  return {
    lines: [...safeLines, candidate],
    line: candidate,
    merged: false,
    addedQuantity: candidate.quantity,
    limitReached: false,
    cartFull: false
  };
}

export function updateLineInLines(lines, lineId, configuration) {
  const safeLines = Array.isArray(lines) ? lines : [];
  const index = safeLines.findIndex(line => line.id === lineId);
  if (index < 0) return { lines: safeLines, line: null, updated: false };

  const line = createCartLine(configuration, { id: lineId });
  return {
    lines: safeLines.map((item, itemIndex) => (itemIndex === index ? line : item)),
    line,
    updated: true
  };
}

export function setLineQuantityInLines(lines, lineId, quantity) {
  const safeLines = Array.isArray(lines) ? lines : [];
  const normalized = normalizeQuantity(quantity);
  let line = null;

  const nextLines = safeLines.map(item => {
    if (item.id !== lineId) return item;
    line = {
      ...recalculateCartLine({ ...item, quantity: normalized }),
      id: item.id
    };
    return line;
  });

  return { lines: nextLines, line };
}

export function incrementLineInLines(lines, lineId) {
  const line = (Array.isArray(lines) ? lines : []).find(item => item.id === lineId);
  if (!line) return { lines, line: null };
  return setLineQuantityInLines(lines, lineId, line.quantity + 1);
}

export function decrementLineInLines(lines, lineId) {
  const line = (Array.isArray(lines) ? lines : []).find(item => item.id === lineId);
  if (!line) return { lines, line: null };
  return setLineQuantityInLines(lines, lineId, line.quantity - 1);
}

export function removeLineFromLines(lines, lineId) {
  const safeLines = Array.isArray(lines) ? lines : [];
  return safeLines.filter(line => line.id !== lineId);
}

export function duplicateLineInLines(lines, lineId) {
  const safeLines = Array.isArray(lines) ? lines : [];
  const index = safeLines.findIndex(line => line.id === lineId);
  if (index < 0) return { lines: safeLines, line: null, cartFull: false };
  if (safeLines.length >= MAX_CART_LINES) {
    return { lines: safeLines, line: null, cartFull: true };
  }

  const source = safeLines[index];
  const duplicate = {
    ...recalculateCartLine(source),
    id: createCartLineId()
  };
  const nextLines = [...safeLines];
  nextLines.splice(index + 1, 0, duplicate);

  return { lines: nextLines, line: duplicate, cartFull: false };
}

export function clearLines() {
  return [];
}
