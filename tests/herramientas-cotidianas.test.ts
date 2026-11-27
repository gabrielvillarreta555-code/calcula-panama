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

import { businessDays, holidayLabel } from '../src/lib/tools/calculations';
import { holidaysOf } from '../src/data/expansion-tools';
describe('días hábiles y feriados (Código de Trabajo, arts. 46 y 47; Ley 291 de 2022)', () => {
  it('reproduce el ejemplo publicado de 2027', () => {
    const r = businessDays('2027-01-01', '2027-12-31', 'mon-fri');
    expect(r).toMatchObject({ days: 365, weekend: 104, holidaysOnWorkdays: 9, business: 252 });
    expect(r.holidays).toHaveLength(13);
  });
  it('calcula carnaval y viernes santo desde la Pascua', () => {
    expect(holidayLabel('2027-02-09')).toBe('Martes de carnaval (art. 46)');
    expect(holidayLabel('2027-03-26')).toBe('Viernes santo (art. 46)');
    expect(holidayLabel('2026-04-03')).toBe('Viernes santo (art. 46)');
    expect(holidayLabel('2027-02-08')).toBeNull();
  });
  it('traslada al lunes la fiesta en domingo, no la del sábado', () => {
    expect(holidayLabel('2027-11-29')).toMatch(/art\. 47/);
    expect(holidayLabel('2027-01-10')).toBeNull(); // el 9 de enero de 2027 es sábado
  });
  it('incluye el 20 de diciembre y la toma de posesión solo cada cinco años', () => {
    expect(holidayLabel('2027-12-20')).toMatch(/duelo nacional/);
    expect(holidayLabel('2029-07-01')).toMatch(/toma de posesión/);
    expect(holidayLabel('2027-07-01')).toBeNull();
    expect(holidayLabel('2027-11-04')).toBeNull();
  });
  it('de lunes a sábado, los feriados en sábado restan un día hábil', () => {
    const r = businessDays('2027-01-01', '2027-12-31', 'mon-sat');
    expect(r.weekend).toBe(52); expect(r.holidaysOnWorkdays).toBe(12); expect(r.business).toBe(365 - 52 - 12);
  });
  it('cuenta las dos fechas y rechaza intervalos inválidos', () => {
    expect(businessDays('2027-03-01', '2027-03-01', 'mon-fri')).toMatchObject({ days: 1, business: 1 });
    expect(() => businessDays('2027-03-02', '2027-03-01', 'mon-fri')).toThrow();
    expect(() => businessDays('2020-01-01', '2031-01-01', 'mon-fri')).toThrow(/10 años/);
    expect(() => businessDays('2027-02-30', '2027-03-01', 'mon-fri')).toThrow();
  });
  it('la ficha publica la lista de 2027 calculada con las mismas reglas', () => {
    expect(holidaysOf(2027)).toHaveLength(13);
    expect(holidaysOf(2027).map(h => h.text).slice(0, 2)).toEqual(['viernes 1 de enero (art. 46)', 'sábado 9 de enero: día de los mártires (art. 46)']);
    expect(holidaysOf(2027).map(h => h.text)).toContain('lunes 29 de noviembre: lunes de descanso por una fiesta en domingo (art. 47)');
  });
});

import { creditCard } from '../src/lib/tools/calculations';
describe('tarjeta de crédito', () => {
  it('reproduce los ejemplos publicados', () => {
    expect(creditCard({ balance: 2000, annualRate: 36, mode: 'fixed', payment: 100, minPercent: 0 })).toMatchObject({ months: 31, interest: 1099.92, paid: 3099.92 });
    expect(creditCard({ balance: 2000, annualRate: 36, mode: 'minimum', payment: 25, minPercent: 5 })).toMatchObject({ months: 95, interest: 2366.65, firstPayment: 103 });
  });
  it('coincide con la fórmula cerrada del número de pagos', () => {
    // n = −ln(1 − B·i/P) / ln(1 + i) con B = 2000, i = 3%, P = 100 → 30.99… → 31 pagos.
    expect(Math.ceil(-Math.log(1 - 2000 * 0.03 / 100) / Math.log(1.03))).toBe(31);
  });
  it('el saldo final es cero y lo pagado = saldo + intereses', () => {
    const r = creditCard({ balance: 1234.56, annualRate: 29.9, mode: 'fixed', payment: 75, minPercent: 0 });
    expect(r.schedule.at(-1)!.balance).toBe(0);
    expect(Math.round(r.paid * 100)).toBe(123456 + Math.round(r.interest * 100));
  });
  it('el pago fijo para 12, 24 y 36 meses salda la deuda en ese plazo', () => {
    const r = creditCard({ balance: 2000, annualRate: 36, mode: 'fixed', payment: 100, minPercent: 0 });
    for (const p of r.payoff) expect(creditCard({ balance: 2000, annualRate: 36, mode: 'fixed', payment: p.payment, minPercent: 0 }).months).toBe(p.months);
  });
  it('con tasa cero no hay intereses', () => expect(creditCard({ balance: 300, annualRate: 0, mode: 'fixed', payment: 100, minPercent: 0 })).toMatchObject({ months: 3, interest: 0 }));
  it('rechaza un pago que no cubre los intereses y datos inválidos', () => {
    expect(() => creditCard({ balance: 2000, annualRate: 36, mode: 'fixed', payment: 60, minPercent: 0 })).toThrow(/no cubre los intereses/);
    expect(() => creditCard({ balance: 0, annualRate: 36, mode: 'fixed', payment: 60, minPercent: 0 })).toThrow();
    expect(() => creditCard({ balance: 100, annualRate: 101, mode: 'fixed', payment: 60, minPercent: 0 })).toThrow();
    expect(() => creditCard({ balance: 100, annualRate: 20, mode: 'minimum', payment: 0, minPercent: 0 })).toThrow();
  });
});
