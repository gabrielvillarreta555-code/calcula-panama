import { describe, expect, it } from 'vitest';
import {
  MAX_ITEMS,
  lineSubtotalCents,
  normalizeItemName,
  parseMoneyToCents,
  parseQuantityToMilli,
  summarizeShopping,
  type ShoppingItem
} from './shopping';

describe('valores monetarios de Modo Pasillo', () => {
  it('convierte punto o coma a centésimos sin errores binarios', () => {
    expect(parseMoneyToCents('3.25')).toBe(325);
    expect(parseMoneyToCents('0,05')).toBe(5);
    expect(parseMoneyToCents('12')).toBe(1200);
  });

  it('rechaza vacíos, negativos, más de dos decimales e infinitos', () => {
    for (const value of ['', '-1', '1.999', 'Infinity', 'NaN']) {
      expect(() => parseMoneyToCents(value)).toThrow();
    }
  });

  it('representa cantidades con hasta tres decimales', () => {
    expect(parseQuantityToMilli('2')).toBe(2000);
    expect(parseQuantityToMilli('0.125')).toBe(125);
    expect(() => parseQuantityToMilli('0')).toThrow();
    expect(() => parseQuantityToMilli('1.0001')).toThrow();
    expect(() => parseQuantityToMilli('100000.001')).toThrow();
  });

  it('redondea cada línea a centésimos con enteros', () => {
    expect(lineSubtotalCents(325, 2000)).toBe(650);
    expect(lineSubtotalCents(199, 500)).toBe(100);
    expect(lineSubtotalCents(1, 500)).toBe(1);
  });
});

describe('resumen de compra', () => {
  const items: ShoppingItem[] = [
    { id: 'a', name: 'Arroz', priceCents: 325, quantityMilli: 2000 },
    { id: 'b', name: '', priceCents: 99, quantityMilli: 1500 }
  ];

  it('calcula total, cantidad, saldo y exceso', () => {
    expect(summarizeShopping(items, 1000)).toMatchObject({
      subtotalCents: 799, lineCount: 2, quantityMilli: 3500,
      balanceCents: 201, overBudget: false, adjustments: []
    });
    expect(summarizeShopping(items, 700)).toMatchObject({ balanceCents: -99, overBudget: true });
  });

  it('funciona sin presupuesto y no aplica impuestos ni descuentos', () => {
    expect(summarizeShopping(items, null)).toMatchObject({
      subtotalCents: 799, budgetCents: null, balanceCents: null, adjustments: []
    });
  });

  it('limpia y limita nombres', () => {
    expect(normalizeItemName('  Leche   entera ')).toBe('Leche entera');
    expect(() => normalizeItemName('x'.repeat(81))).toThrow();
  });

  it('limita el número extremo de líneas', () => {
    expect(() => summarizeShopping(Array.from({ length: MAX_ITEMS + 1 }, (_, i) => ({ ...items[0]!, id: String(i) })), null)).toThrow();
  });
});
