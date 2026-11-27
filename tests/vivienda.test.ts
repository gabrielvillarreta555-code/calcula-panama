import { describe, expect, it } from 'vitest';
import { affordability, frenchPayment, itbiNewHome, mortgage, presentValue, rentOrBuy } from '../src/lib/tools/housing';
import { mortgagePreferential, preferentialClientRate, PREFERENTIAL_MODE_PUBLIC, PREFERENTIAL_TRAMO_3 } from '../src/lib/tools/housing-preferential';

const base = { price: 150000, downPayment: 15000, annualRate: 6.5, years: 30, insurance: 0, closingCosts: 0 };

describe('hipoteca', () => {
  it('coincide con la fórmula del sistema francés', () => {
    const r = mortgage(base);
    expect(r.financed).toBe(135000);
    expect(r.phases[0]!.payment).toBeCloseTo(135000 * (0.065 / 12) / (1 - Math.pow(1 + 0.065 / 12, -360)), 2);
    expect(r.downShare).toBeCloseTo(10, 10);
  });
  it('la suma pagada cuadra: capital + intereses + seguros + abono + gastos', () => {
    const r = mortgage({ ...base, insurance: 45.5, closingCosts: 2500 });
    expect(r.cashAtStart).toBe(17500);
    expect(r.totalCost).toBeCloseTo(15000 + 2500 + 135000 + r.interest + 45.5 * 360, 2);
  });
  it('con tasa cero no hay intereses', () => expect(mortgage({ ...base, annualRate: 0 }).interest).toBe(0));
  it('rechaza abono mayor que el precio, plazo fraccionario y tasas fuera de rango', () => {
    expect(() => mortgage({ ...base, downPayment: 150000 })).toThrow();
    expect(() => mortgage({ ...base, years: 20.5 })).toThrow();
    expect(() => mortgage({ ...base, annualRate: 31 })).toThrow();
  });
});

describe('motor del interés preferencial (desactivado en el sitio): tramo 3 de la Ley 481 de 2025', () => {
  it('subsidia el menor entre el 4% y el 85% de la tasa del banco', () => {
    expect(preferentialClientRate(6.5)).toEqual({ subsidy: 4, clientRate: 2.5 });
    const low = preferentialClientRate(4);
    expect(low.subsidy).toBeCloseTo(3.4, 10); expect(low.clientRate).toBeCloseTo(0.6, 10);
  });
  it('tiene dos fases: 84 meses a la tasa del cliente y el resto a la del banco', () => {
    const r = mortgagePreferential({ ...base, price: 110000, downPayment: 11000 });
    expect(r.phases.map(p => p.months)).toEqual([84, 276]);
    expect(r.phases[0]!.rate).toBe(2.5); expect(r.phases[1]!.rate).toBe(6.5);
    expect(r.phases[1]!.payment).toBeGreaterThan(r.phases[0]!.payment);
    expect(r.interest).toBeLessThan(mortgage({ ...base, price: 110000, downPayment: 11000 }).interest);
  });
  it('rechaza precios fuera del tramo 3 y plazos de 7 años o menos', () => {
    expect(() => mortgagePreferential({ ...base, price: 80000, downPayment: 8000 })).toThrow(/tramo 3/);
    expect(() => mortgagePreferential({ ...base, price: 120000.01, downPayment: 12000 })).toThrow(/tramo 3/);
    expect(() => mortgagePreferential({ ...base, price: 100000, downPayment: 10000, years: 7 })).toThrow(/7 años/);
    expect(PREFERENTIAL_TRAMO_3).toMatchObject({ min: 80000.01, max: 120000, maxSubsidizedRate: 4, months: 84, bankShareCap: 0.85 });
  });
});

describe('capacidad de compra', () => {
  it('la cuota máxima paga exactamente el préstamo máximo', () => {
    const r = affordability({ netIncome: 1500, otherDebts: 150, maxShare: 30, annualRate: 6.5, years: 30, downPayment: 10000, insurance: 0 });
    expect(r.maxTotal).toBe(450); expect(r.maxPayment).toBe(300);
    expect(frenchPayment(r.maxLoan * 100, 0.065 / 12, 360) / 100).toBeCloseTo(300, 1);
    expect(r.maxPrice).toBeCloseTo(r.maxLoan + 10000, 6);
  });
  it('avisa si las deudas ocupan toda la cuota y rechaza ingresos nulos', () => {
    expect(() => affordability({ netIncome: 1000, otherDebts: 300, maxShare: 30, annualRate: 6, years: 30, downPayment: 0, insurance: 0 })).toThrow(/ocupan/);
    expect(() => affordability({ netIncome: 0, otherDebts: 0, maxShare: 30, annualRate: 6, years: 30, downPayment: 0, insurance: 0 })).toThrow();
  });
  it('valor presente y cuota son inversos', () => expect(presentValue(frenchPayment(100000, 0.005, 240), 0.005, 240)).toBeCloseTo(100000, 6));
});

describe('alquilar o comprar', () => {
  const input = { rent: 800, rentIncrease: 3, price: 150000, downPayment: 15000, closingCosts: 3000, annualRate: 6.5, years: 30, ownerCosts: 150, appreciation: 2, savingsReturn: 4, horizon: 10 };
  it('compara el patrimonio final con el mismo dinero inicial', () => {
    const r = rentOrBuy(input);
    expect(r.years).toHaveLength(10);
    expect(r.difference).toBeCloseTo(r.buyerWealth - r.renterWealth, 6);
    expect(r.paidRent).toBeGreaterThan(800 * 120);
  });
  it('con valorización alta y alquiler caro, comprar gana; con lo contrario, alquilar', () => {
    expect(rentOrBuy({ ...input, rent: 1500, appreciation: 4 }).difference).toBeGreaterThan(0);
    expect(rentOrBuy({ ...input, rent: 400, appreciation: -2, savingsReturn: 6 }).difference).toBeLessThan(0);
  });
  it('rechaza datos fuera de rango', () => {
    expect(() => rentOrBuy({ ...input, downPayment: 150000 })).toThrow();
    expect(() => rentOrBuy({ ...input, horizon: 0 })).toThrow();
  });
});

describe('ITBI de la primera venta de vivienda nueva (Ley 546 de 2026)', () => {
  it.each([[100000, 0, 0], [120000, 0, 0], [125000, 0.5, 25], [140000, 1.0, 200], [160000, 1.4, 560], [180000, 1.6, 960], [200000, 1.8, 1440]])('base %s: tasa %s%% sobre el excedente = B/.%s', (b, rate, tax) => {
    expect(itbiNewHome(b)).toEqual({ rate, tax });
  });
  it('no cubre bases mayores de B/.200,000', () => expect(() => itbiNewHome(200000.01)).toThrow());
});

import { expansionTools } from '../src/data/expansion-tools';
describe('corrección de la entrega 3: interés preferencial retirado del contenido público', () => {
  const tool = expansionTools.find(t => t.id === 'mortgage')!;
  it('el interruptor público está desactivado y la calculadora no ofrece el modo', () => {
    expect(PREFERENTIAL_MODE_PUBLIC).toBe(false);
    expect(tool.fields.map(f => f.key)).not.toContain('preferential');
  });
  it('la ficha no publica tasas, tramos ni plazos subsidiados', () => {
    const text = JSON.stringify(tool);
    for (const banned of ['tramo', '85%', '84 meses', '7 años', '4%', '2.5%', '80,000']) expect(text).not.toContain(banned);
  });
});

describe('el motor preferencial no se publica', () => {
  it('ninguna página ni script importa el módulo preferencial', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs');
    const walk = (d: string): string[] => readdirSync(d).flatMap(n => { const f = `${d}/${n}`; return statSync(f).isDirectory() ? walk(f) : [f]; });
    const importers = walk('src').filter(f => /\.(astro|ts)$/.test(f) && !f.endsWith('housing-preferential.ts') && readFileSync(f, 'utf8').includes('housing-preferential'));
    expect(importers).toEqual([]);
  });
});
