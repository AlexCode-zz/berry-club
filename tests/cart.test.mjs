import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MAX_CART_LINES,
  MAX_LINE_QUANTITY,
  calculateCartTotals,
  configurationsMatch,
  createCartLine,
  normalizeCartLines
} from '../src/services/cart-pricing.js';
import {
  addConfigurationToLines,
  clearLines,
  decrementLineInLines,
  duplicateLineInLines,
  incrementLineInLines,
  removeLineFromLines,
  setLineQuantityInLines,
  updateLineInLines
} from '../src/services/cart-operations.js';
import {
  CART_STORAGE_KEY,
  readCart,
  writeCart
} from '../src/services/cart-storage.js';
import { buildCartMessage, buildCartWhatsAppUrl } from '../src/services/whatsapp-service.js';
import { SITE_CONFIG } from '../src/data/site-config.js';

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

function installStorage() {
  const storage = new MemoryStorage();
  globalThis.window = { localStorage: storage };
  return storage;
}

test('calcula precios unitarios y subtotales en centavos', () => {
  const line = createCartLine({
    sizeId: 'grande',
    extraIds: ['chocolate', 'crema-extra'],
    quantity: 3
  });

  assert.equal(line.basePriceCents, 500);
  assert.equal(line.unitPriceCents, 625);
  assert.equal(line.subtotalCents, 1875);
  assert.equal(line.sizeName, 'Grande');
  assert.equal(line.extras.length, 2);
});

test('calcula todos los complementos sin errores flotantes', () => {
  const line = createCartLine({
    sizeId: 'grande',
    extraIds: [
      'chocolate',
      'leche-condensada',
      'galleta-triturada',
      'oreo-triturada',
      'granola',
      'crema-extra'
    ],
    quantity: 2
  });

  assert.equal(line.unitPriceCents, 815);
  assert.equal(line.subtotalCents, 1630);
});

test('suma unidades, líneas y total del carrito', () => {
  const first = createCartLine({ sizeId: 'mini', extraIds: ['chocolate'], quantity: 2 });
  const second = createCartLine({ sizeId: 'clasico', extraIds: [], quantity: 1 });
  const totals = calculateCartTotals([first, second]);

  assert.deepEqual(totals, { unitCount: 3, lineCount: 2, totalCents: 950 });
});

test('recalcula los subtotales desde el precio unitario y la cantidad', () => {
  const line = createCartLine({ sizeId: 'grande', extraIds: ['chocolate'], quantity: 2 });
  line.subtotalCents = 1;

  assert.deepEqual(calculateCartTotals([line]), {
    unitCount: 2,
    lineCount: 1,
    totalCents: 1100
  });
});

test('combina solo configuraciones idénticas y conserva las diferentes', () => {
  const first = addConfigurationToLines([], {
    sizeId: 'mini',
    extraIds: ['chocolate', 'granola'],
    quantity: 2
  });
  const merged = addConfigurationToLines(first.lines, {
    sizeId: 'mini',
    extraIds: ['granola', 'chocolate'],
    quantity: 3
  });
  const different = addConfigurationToLines(merged.lines, {
    sizeId: 'mini',
    extraIds: ['chocolate'],
    quantity: 1
  });

  assert.equal(merged.lines.length, 1);
  assert.equal(merged.lines[0].quantity, 5);
  assert.equal(merged.merged, true);
  assert.equal(different.lines.length, 2);
  assert.equal(configurationsMatch(merged.lines[0], first.lines[0]), true);
});

test('agregar la misma configuración respeta el máximo por línea', () => {
  const first = addConfigurationToLines([], {
    sizeId: 'clasico',
    extraIds: [],
    quantity: 15
  });
  const merged = addConfigurationToLines(first.lines, {
    sizeId: 'clasico',
    extraIds: [],
    quantity: 15
  });

  assert.equal(merged.lines[0].quantity, MAX_LINE_QUANTITY);
  assert.equal(merged.addedQuantity, 5);
  assert.equal(merged.limitReached, true);

  const alreadyFull = addConfigurationToLines(merged.lines, {
    sizeId: 'clasico',
    extraIds: [],
    quantity: 1
  });
  assert.equal(alreadyFull.lines[0].quantity, MAX_LINE_QUANTITY);
  assert.equal(alreadyFull.addedQuantity, 0);
  assert.equal(alreadyFull.limitReached, true);
});

test('editar una línea no modifica las demás', () => {
  const first = createCartLine({ sizeId: 'mini', extraIds: ['granola'], quantity: 2 });
  const second = createCartLine({ sizeId: 'grande', extraIds: ['oreo-triturada'], quantity: 1 });
  const result = updateLineInLines([first, second], first.id, {
    sizeId: 'clasico',
    extraIds: ['chocolate'],
    quantity: 4
  });

  assert.equal(result.updated, true);
  assert.equal(result.lines[0].sizeId, 'clasico');
  assert.equal(result.lines[0].quantity, 4);
  assert.equal(result.lines[0].subtotalCents, 400 * 4);
  assert.deepEqual(result.lines[1], second);
});

test('cantidades, eliminación, duplicado y vaciado recalculan el estado', () => {
  const base = createCartLine({ sizeId: 'mini', extraIds: [], quantity: 1 });
  const incremented = incrementLineInLines([base], base.id);
  assert.equal(incremented.lines[0].quantity, 2);
  assert.equal(incremented.lines[0].subtotalCents, 500);

  const decremented = decrementLineInLines(incremented.lines, base.id);
  assert.equal(decremented.lines[0].quantity, 1);

  const clamped = setLineQuantityInLines(decremented.lines, base.id, 99);
  assert.equal(clamped.lines[0].quantity, MAX_LINE_QUANTITY);

  const duplicated = duplicateLineInLines(clamped.lines, base.id);
  assert.equal(duplicated.lines.length, 2);
  assert.notEqual(duplicated.lines[0].id, duplicated.lines[1].id);
  assert.equal(duplicated.lines[1].quantity, MAX_LINE_QUANTITY);

  const removed = removeLineFromLines(duplicated.lines, base.id);
  assert.equal(removed.length, 1);
  assert.equal(clearLines().length, 0);
});

test('respeta el límite de líneas al agregar y duplicar', () => {
  const extraIds = ['chocolate', 'leche-condensada', 'galleta-triturada', 'oreo-triturada', 'granola', 'crema-extra'];
  const fullCart = Array.from({ length: MAX_CART_LINES }, (_, index) => createCartLine({
    sizeId: 'mini',
    extraIds: extraIds.filter((_, extraIndex) => Math.floor(index / Math.pow(2, extraIndex)) % 2 === 1),
    quantity: 1
  }, { id: `line-${index}` }));

  const added = addConfigurationToLines(fullCart, {
    sizeId: 'grande',
    extraIds: [],
    quantity: 1
  });
  assert.equal(added.cartFull, true);
  assert.equal(added.lines.length, MAX_CART_LINES);
  assert.equal(added.line, null);

  const duplicated = duplicateLineInLines(fullCart, fullCart[0].id);
  assert.equal(duplicated.cartFull, true);
  assert.equal(duplicated.line, null);

  const normalized = normalizeCartLines(
    Array.from({ length: MAX_CART_LINES + 1 }, (_, index) => ({
      id: `line-${index}`,
      sizeId: 'clasico',
      extraIds: [],
      quantity: 1
    }))
  );
  assert.equal(normalized.length, MAX_CART_LINES);
});

test('normaliza datos persistidos y descarta tamaños inválidos', () => {
  const normalized = normalizeCartLines([
    {
      id: 'linea-1',
      sizeId: 'grande',
      extraIds: ['chocolate', 'inventado'],
      quantity: 99,
      unitPriceCents: 1,
      subtotalCents: 1
    },
    { id: 'linea-2', sizeId: 'no-existe', extraIds: [], quantity: 1 }
  ]);

  assert.equal(normalized.length, 1);
  assert.equal(normalized[0].quantity, 20);
  assert.equal(normalized[0].unitPriceCents, 550);
  assert.equal(normalized[0].subtotalCents, 11000);
  assert.deepEqual(normalized[0].extraIds, ['chocolate']);
});

test('recupera el carrito guardado y recalcula precios de presentación', () => {
  const storage = installStorage();
  storage.setItem(CART_STORAGE_KEY, JSON.stringify({
    version: 1,
    lines: [{
      id: 'guardada',
      sizeId: 'clasico',
      extraIds: ['chocolate'],
      quantity: 2,
      unitPriceCents: 1,
      subtotalCents: 1
    }]
  }));

  const lines = readCart();
  assert.equal(lines.length, 1);
  assert.equal(lines[0].unitPriceCents, 400);
  assert.equal(lines[0].subtotalCents, 800);
  assert.equal(writeCart(lines), true);
});

test('un almacenamiento corrupto o incompatible no bloquea el carrito', () => {
  const storage = installStorage();
  storage.setItem(CART_STORAGE_KEY, '{json roto');
  assert.deepEqual(readCart(), []);
  assert.equal(storage.getItem(CART_STORAGE_KEY), null);

  storage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 99, lines: [] }));
  assert.deepEqual(readCart(), []);
  assert.equal(storage.getItem(CART_STORAGE_KEY), null);
});

test('genera un resumen completo y solo construye la URL con destinatario configurado', () => {
  const first = createCartLine({
    sizeId: 'grande',
    extraIds: ['chocolate'],
    quantity: 2
  });
  const second = createCartLine({
    sizeId: 'mini',
    extraIds: ['oreo-triturada'],
    quantity: 1
  });

  const message = buildCartMessage([first, second]);
  assert.match(message, /Carrito Berry Club - DEMO/);
  assert.match(message, /Vaso 1/);
  assert.match(message, /Vaso 2/);
  assert.match(message, /Chocolate/);
  assert.match(message, /Oreo triturada/);
  assert.match(message, /Cantidad: 2/);
  assert.match(message, /TOTAL DEL CARRITO/);
  assert.match(message, /no representan una compra confirmada/);

  const previousNumber = SITE_CONFIG.contact.orderWhatsappNumber;
  try {
    SITE_CONFIG.contact.orderWhatsappNumber = '';
    const unconfigured = buildCartWhatsAppUrl([first, second]);
    assert.equal(unconfigured.status, 'unconfigured');
    assert.equal(unconfigured.url, null);
    assert.match(unconfigured.message, /\$14\.10/);

    SITE_CONFIG.contact.orderWhatsappNumber = '18091234567';
    const configured = buildCartWhatsAppUrl([first, second]);
    assert.equal(configured.status, 'ready');
    assert.match(configured.url, /^https:\/\/wa\.me\/18091234567\?text=/);
    assert.equal(configured.message, unconfigured.message);
  } finally {
    SITE_CONFIG.contact.orderWhatsappNumber = previousNumber;
  }
});
