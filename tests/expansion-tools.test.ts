import { describe, expect, it } from 'vitest';
import { compareUnits, decimal, electricity, grades, promotion, savings } from '../src/lib/tools/calculations';
import { expansionTools } from '../src/data/expansion-tools';

describe('bounded decimal input', () => {
  it('accepts comma, zero and integer-only input', () => {
    expect(decimal(' 2,50 ', 'Precio', 2)).toBe(2.5);
    expect(decimal('0', 'Precio')).toBe(0); expect(decimal('3', 'Cantidad', 0)).toBe(3);
  });
  it.each(['', ' ', '-1', '1e308', 'Infinity', 'NaN', '12abc', '1,000.00', '10000001', '1.2345'])('rejects %s', raw => expect(() => decimal(raw, 'Valor')).toThrow());
  it('rejects fractional counts', () => expect(() => decimal('1.5', 'Cantidad', 0)).toThrow());
});
describe('price per unit', () => {
  it('compares different package sizes', () => {
    const r = compareUnits([{ price: 2, quantity: 500, unit: 'g' }, { price: 2.7, quantity: 750, unit: 'g' }]);
    expect(r.values).toEqual([4, 3.6]); expect(r.winners).toEqual([1]);
  });
  it('converts pounds exactly and detects ties across units', () => {
    expect(compareUnits([{ price: 1, quantity: 1, unit: 'lb' }, { price: 1, quantity: 0.45359237, unit: 'kg' }]).winners).toEqual([0, 1]);
    expect(compareUnits([{ price: 1, quantity: 500, unit: 'ml' }, { price: 2, quantity: 1, unit: 'l' }]).values).toEqual([2, 2]);
  });
  it('supports free items', () => expect(compareUnits([{ price: 0, quantity: 1, unit: 'unidad' }, { price: 1, quantity: 1, unit: 'unidad' }]).best).toBe(0));
  it.each([0, -1, NaN, Infinity, 1e308])('rejects invalid content %s', quantity => expect(() => compareUnits([{ price: 2, quantity, unit: 'kg' }, { price: 2, quantity: 1, unit: 'kg' }])).toThrow());
  it('rejects incompatible units and fractional counts', () => {
    expect(() => compareUnits([{ price: 2, quantity: 1, unit: 'kg' }, { price: 2, quantity: 1, unit: 'l' }])).toThrow(/compatibles/);
    expect(() => compareUnits([{ price: 2, quantity: 1.5, unit: 'unidad' }, { price: 2, quantity: 1, unit: 'unidad' }])).toThrow(/entero/);
  });
});
describe('promotions', () => {
  it('applies full groups and leftovers', () => {
    expect(promotion(6, 3, '3x2').total).toBe(12);
    expect(promotion(6, 4, '3x2').total).toBe(18);
    expect(promotion(6, 3, '2x1').total).toBe(12);
    expect(promotion(6, 2, '3x2').total).toBe(12);
  });
  it('multiplies successive discounts instead of adding', () => {
    const r = promotion(100, 1, 'successive', 20, 10); expect(r.total).toBe(72); expect(r.effective).toBeCloseTo(28, 10);
  });
  it('discounts only the second item of each pair', () => {
    expect(promotion(10, 2, 'second', 50).effective).toBe(25);
    expect(promotion(10, 3, 'second', 50).total).toBe(25);
  });
  it('handles zero and full discounts, and cent rounding', () => {
    expect(promotion(0, 2, 'percent', 20).effective).toBe(0);
    expect(promotion(10, 1, 'percent', 100).total).toBe(0);
    expect(promotion(0.05, 1, 'percent', 50).total).toBe(0.03);
  });
  it('rejects invalid money, quantity and percentages', () => {
    expect(() => promotion(1.001, 1, 'percent')).toThrow();
    expect(() => promotion(1, 1.2, '2x1')).toThrow();
    expect(() => promotion(1, 1, 'percent', 101)).toThrow();
    expect(() => promotion(Infinity, 1, '3x2')).toThrow();
  });
});
describe('savings calendar and cent conservation', () => {
  it('builds twelve twice-monthly contributions', () => {
    const r = savings(600, 120, '2027-01-01', '2027-06-30', 'twice-month');
    expect(r.plan).toHaveLength(12); expect(r.maximum).toBe(40); expect(r.plan.at(-1)?.date).toBe('2027-06-30');
  });
  it('anchors monthly contributions without drifting after February', () => {
    expect(savings(10, 0, '2028-01-31', '2028-04-30', 'monthly').plan.map(p => p.date)).toEqual(['2028-01-31', '2028-02-29', '2028-03-31', '2028-04-30']);
  });
  it('includes endpoints and weekly dates', () => expect(savings(3, 0, '2027-01-01', '2027-01-15', 'weekly').plan.map(p => p.amount)).toEqual([1, 1, 1]));
  it.each([0, 0.01, 0.02, 0.10, 1, 10, 1000.01, 10000000])('conserves %s with nonnegative cent payments', goal => {
    const r = savings(goal, 0, '2027-01-01', '2027-12-31', 'weekly');
    expect(r.plan.reduce((sum, p) => sum + Math.round(p.amount * 100), 0)).toBe(Math.round(goal * 100));
    expect(r.plan.every(p => p.amount >= 0)).toBe(true);
  });
  it('recognizes an already completed goal', () => expect(savings(5, 10, '2027-01-01', '2027-01-01', 'weekly').remaining).toBe(0));
  it('rejects nonexistent dates, inverted range, absent payments and excess length', () => {
    expect(() => savings(5, 0, '2027-02-29', '2027-03-01', 'weekly')).toThrow();
    expect(() => savings(5, 0, '2027-03-01', '2027-02-01', 'weekly')).toThrow();
    expect(() => savings(5, 0, '2027-01-01', '2027-01-02', 'twice-month')).toThrow(/No hay/);
    expect(() => savings(5, 0, '2000-01-01', '2100-01-01', 'weekly')).toThrow(/600/);
  });
});
describe('weighted grades', () => {
  it('calculates complete and partial assessments', () => {
    const final = grades([{ score: 80, weight: 40 }, { score: 90, weight: 60 }], 100, 60);
    expect(final.average).toBe(86); expect(final.required).toBeNull();
    expect(grades([{ score: 80, weight: 40 }], 100, 70).required).toBeCloseTo(63.3333333333);
  });
  it('detects impossible and already met goals without division by zero', () => {
    expect(grades([{ score: 0, weight: 90 }], 100, 60).possible).toBe(false);
    expect(grades([{ score: 0, weight: 100 }], 100, 60).possible).toBe(false);
    expect(grades([{ score: 100, weight: 90 }], 100, 60).required).toBeLessThan(0);
  });
  it('supports scale five and floating weights', () => {
    expect(grades([{ score: 4, weight: 40 }, { score: 5, weight: 60 }], 5, 3).average).toBeCloseTo(4.6);
    expect(grades([{ score: 80, weight: 33.333 }, { score: 90, weight: 66.667 }], 100, 60).required).toBeNull();
  });
  it('rejects out-of-scale scores, zero weights and weights over 100', () => {
    expect(() => grades([{ score: 6, weight: 100 }], 5, 3)).toThrow();
    expect(() => grades([{ score: 1, weight: 0 }], 5, 3)).toThrow();
    expect(() => grades([{ score: 1, weight: 60 }, { score: 1, weight: 60 }], 5, 3)).toThrow();
  });
});
describe('electricity', () => {
  it('calculates consumption with an optional user-supplied price', () => {
    expect(electricity(100, 5, 30, 100)).toEqual({ kwh: 15, cost: null });
    expect(electricity(100, 5, 30, 100, 0.2)).toEqual({ kwh: 15, cost: 3 });
    expect(electricity(100, 5, 30, 50, 0)).toEqual({ kwh: 7.5, cost: 0 });
  });
  it('allows zero usage and rejects physically invalid hours', () => {
    expect(electricity(100, 0, 30, 100).kwh).toBe(0);
    expect(() => electricity(100, 25, 30, 100)).toThrow();
    expect(() => electricity(100, 5, 30.5, 100)).toThrow();
    expect(() => electricity(100, 5, 30, 101)).toThrow();
    expect(() => electricity(1e308, 5, 30, 100)).toThrow();
  });
});
it('catalog keeps ten unique complete editorial entries', () => {
  expect(expansionTools).toHaveLength(10);
  for (const key of ['path', 'title', 'description'] as const) expect(new Set(expansionTools.map(t => t[key])).size).toBe(expansionTools.length);
  for (const t of expansionTools) { expect(t.sources.length > 0 || Boolean(t.sourceNote)).toBe(true); expect(t.example.length).toBeGreaterThan(60); expect(t.limits.length).toBeGreaterThan(1); }
});

describe('ejemplos de contexto y preguntas frecuentes (CP-ADS-002)', () => {
  it('precio por unidad: libra a kilo y paquetes múltiples', () => {
    expect(compareUnits([{ price: 1.99, quantity: 1, unit: 'lb' }, { price: 4.39, quantity: 1, unit: 'kg' }]).values[0]).toBeCloseTo(4.387, 3);
    const r = compareUnits([{ price: 4.5, quantity: 2130, unit: 'ml' }, { price: 2.75, quantity: 2, unit: 'l' }]);
    expect(r.values[0]).toBeCloseTo(2.1127, 4); expect(r.values[1]).toBeCloseTo(1.375, 10); expect(r.winners).toEqual([1]);
  });
  it('descuentos: 30% + 20% y segunda unidad al 50%', () => {
    expect(promotion(100, 1, 'successive', 30, 20).total).toBe(56);
    expect(promotion(10, 2, 'second', 50).total).toBe(15);
    expect(promotion(6, 3, '2x1').total).toBe(12);
  });
  it('ahorro: 12 aportes mensuales de B/.100 entre febrero de 2027 y enero de 2028', () => {
    const r = savings(1200, 0, '2027-02-01', '2028-01-31', 'monthly');
    expect(r.plan).toHaveLength(12); expect(r.plan.every(row => row.amount === 100)).toBe(true); expect(r.plan[0]?.date).toBe('2027-02-01');
  });
  it('notas: escala de 1 a 5 con 40% pendiente', () => {
    const r = grades([{ score: 4, weight: 30 }, { score: 3.5, weight: 30 }], 5, 3);
    expect(r.points).toBeCloseTo(2.25, 10); expect(r.required).toBeCloseTo(1.875, 10); expect(r.possible).toBe(true);
  });
  it('consumo eléctrico: aire acondicionado de 1,100 W', () => {
    const r = electricity(1100, 8, 30, 60, 0.2); expect(r.kwh).toBeCloseTo(158.4, 10); expect(r.cost).toBeCloseTo(31.68, 10);
  });
});
