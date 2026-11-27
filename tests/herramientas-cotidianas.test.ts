import { describe, expect, it } from 'vitest';
import { itbms, splitBill } from '../src/lib/tools/calculations';
import { expansionTools } from '../src/data/expansion-tools';

describe('ITBMS (Código Fiscal, art. 1057-V, parágrafo 6; Ley 8 de 2010)', () => {
  it('agrega la tarifa general, la del 10% y la del 15%', () => {
    expect(itbms(100, 7, 'add')).toEqual({ base: 100, tax: 7, total: 107, rate: 7 });
    expect(itbms(120, 10, 'add')).toMatchObject({ tax: 12, total: 132 });
    expect(itbms(4.5, 15, 'add')).toMatchObject({ tax: 0.68, total: 5.18 });
  });
  it('separa el impuesto dividiendo entre 1 + tarifa, no restando el porcentaje', () => {
    expect(itbms(53.5, 7, 'remove')).toMatchObject({ base: 50, tax: 3.5, total: 53.5 });
    expect(itbms(107, 7, 'remove')).toMatchObject({ base: 100, tax: 7 });
    expect(itbms(1, 7, 'remove')).toMatchObject({ base: 0.93, tax: 0.07, total: 1 });
  });
  it('redondea al centésimo con los empates hacia arriba', () => {
    expect(itbms(0.5, 7, 'add').tax).toBe(0.04); // 0.035 → 0.04
    expect(itbms(0.35, 7, 'add').tax).toBe(0.02); // 0.0245 → 0.02
    expect(itbms(0, 7, 'add')).toMatchObject({ tax: 0, total: 0 });
  });
  it('la base más el impuesto siempre suman el total introducido', () => {
    for (let c = 1; c <= 5000; c += 37) for (const rate of [7, 10, 15]) {
      const r = itbms(c / 100, rate, 'remove');
      expect(Math.round(r.base * 100) + Math.round(r.tax * 100)).toBe(c);
    }
  });
  it.each([[100, 8, 'add'], [100, 7, 'otro'], [-1, 7, 'add'], [1.005, 7, 'add'], [Infinity, 7, 'add']])('rechaza %s, %s, %s', (amount, rate, mode) => {
    expect(() => itbms(amount as number, rate as number, mode as 'add')).toThrow();
  });
});

describe('dividir la cuenta', () => {
  it('reproduce el ejemplo publicado', () => {
    const r = splitBill({ total: 85.6, tax: 5.6, tipPercent: 10, people: 4, rounding: 'none' });
    expect(r).toMatchObject({ tipBase: 80, tip: 8, grand: 93.6, share: 23.4, maxShare: 23.4, extraPeople: 0, surplus: 0 });
    expect(splitBill({ total: 85.6, tax: 5.6, tipPercent: 10, people: 4, rounding: '0.25' })).toMatchObject({ share: 23.5, collected: 94, surplus: 0.4 });
  });
  it('reparte los centésimos sin perder ni inventar dinero', () => {
    const r = splitBill({ total: 10, tipPercent: 0, people: 3, rounding: 'none' });
    expect(r).toMatchObject({ share: 3.33, maxShare: 3.34, extraPeople: 1 });
    for (let people = 1; people <= 13; people++) {
      const s = splitBill({ total: 97.31, tipPercent: 12.5, people, rounding: 'none' });
      expect(Math.round(s.share * 100) * people + s.extraPeople).toBe(Math.round(s.grand * 100));
    }
  });
  it('sin ITBMS, la propina se calcula sobre el total', () => {
    expect(splitBill({ total: 50, tipPercent: 10, people: 1, rounding: 'none' })).toMatchObject({ tipBase: 50, tip: 5, grand: 55 });
  });
  it('con redondeo, lo recaudado cubre siempre el total', () => {
    for (const rounding of ['0.05', '0.25', '1.00'] as const) for (let people = 1; people <= 9; people++) {
      const s = splitBill({ total: 73.19, tax: 4.79, tipPercent: 10, people, rounding });
      expect(s.collected).toBeGreaterThanOrEqual(s.grand);
      expect(s.surplus).toBeLessThan(Number(rounding) * people);
    }
  });
  it.each([
    { total: 0, tipPercent: 10, people: 2 }, { total: 10, tax: 10, tipPercent: 10, people: 2 }, { total: 10, tipPercent: 51, people: 2 },
    { total: 10, tipPercent: 10, people: 0 }, { total: 10, tipPercent: 10, people: 2.5 }, { total: 10, tipPercent: 10, people: 101 },
  ])('rechaza datos fuera de rango %o', input => expect(() => splitBill({ rounding: 'none', ...input })).toThrow());
  it('rechaza un redondeo desconocido', () => expect(() => splitBill({ total: 10, tipPercent: 0, people: 2, rounding: 'x' as 'none' })).toThrow());
});

describe('fichas de las nuevas herramientas', () => {
  it.each(['itbms', 'split'])('%s tiene fuentes con fecha, ejemplo y preguntas frecuentes', id => {
    const tool = expansionTools.find(t => t.id === id)!;
    expect(tool.checkedOn).toBe('2026-11-27');
    expect(tool.sources.map(s => s.url)).toContain('https://dgi.mef.gob.pa/itbms/Normativa/Ley-8-15-marzo-2010.pdf');
    expect(tool.faq?.length).toBeGreaterThanOrEqual(3);
    expect(tool.description.length).toBeLessThanOrEqual(160);
  });
});
