/**
 * Bloque A de CP-EXP-001: automóviles.
 * Los valores esperados se obtuvieron con una implementación de referencia independiente
 * (Python, aritmética decimal con redondeo half-up), no con este código.
 */
import { describe, expect, it } from 'vitest';
import { carFinancing, carMonthlyCost, effectiveAnnualRate, fuelTrip, kmPerLiter, KM_PER_MILE, LITERS_PER_GALLON } from '../src/lib/tools/calculations';

const car = { price: 25000, downPayment: 5000, annualRate: 8, rateType: 'nominal' as const, months: 72, insurance: 0, bankFees: 0, otherCosts: 0 };

describe('financiamiento de automóviles', () => {
  it('financia el precio menos el abono con cuota francesa: B/.20,000 al 8% nominal en 72 meses', () => {
    const r = carFinancing(car);
    expect(r).toMatchObject({ financed: 20000, payment: 350.66, payments: 72, interest: 5247.98, finalPayment: 351.12 });
    expect(r.schedule[0]).toEqual({ month: 1, payment: 350.66, principal: 217.33, interest: 133.33, balance: 19782.67 });
    expect(r.schedule.at(-1)?.balance).toBe(0);
    expect(r.schedule.reduce((sum, row) => sum + Math.round(row.principal * 100), 0)).toBe(2_000_000);
  });

  it('sin comisión, la tasa efectiva es la nominal capitalizada: (1 + 0.08/12)^12 − 1 = 8.30%', () => {
    expect(carFinancing(car).effectiveRate).toBeCloseTo(8.29997121374, 8);
  });

  it('suma seguros, comisión y gastos de terceros al costo; solo la comisión sube la tasa efectiva', () => {
    const r = carFinancing({ ...car, insurance: 60, bankFees: 300, otherCosts: 150 });
    expect(r.paymentWithInsurance).toBe(410.66);
    expect(r.insuranceTotal).toBe(4320);
    expect(r.totalCar).toBe(35017.98);
    expect(r.financingCost).toBe(10017.98);
    expect(r.effectiveRate).toBeCloseTo(8.88708225220, 7);
    expect(carFinancing({ ...car, insurance: 60, otherCosts: 150 }).effectiveRate).toBeCloseTo(8.29997121374, 8);
  });

  it('a tasa cero divide el capital y ajusta los centavos en la última cuota', () => {
    const r = carFinancing({ ...car, price: 10000, downPayment: 0, annualRate: 0, months: 24 });
    expect(r).toMatchObject({ payment: 416.67, finalPayment: 416.59, interest: 0, effectiveRate: 0 });
  });

  it('acepta tasa efectiva anual y abono cero', () => {
    const r = carFinancing({ ...car, downPayment: 0, rateType: 'effective', annualRate: 8.3 });
    expect(r.financed).toBe(25000);
    // La cuota se redondea al centésimo, así que la TIR difiere de 8.3% en menos de 0.0001 puntos.
    expect(r.effectiveRate).toBeCloseTo(8.3, 3);
  });

  it.each([
    [{ downPayment: 25000 }, /abono/],
    [{ price: 0 }, /mayor que cero/],
    [{ months: 0 }, /Plazo/],
    [{ months: 121 }, /Plazo/],
    [{ months: 12.5 }, /enteros/],
    [{ annualRate: -1 }, /tasa/i],
    [{ bankFees: 20000 }, /comisión/],
    [{ price: 1000.005 }, /decimales/],
  ])('rechaza datos inválidos %o', (change, message) => expect(() => carFinancing({ ...car, ...change })).toThrow(message));
});

describe('tasa efectiva por TIR (Acuerdo SBP 3-2002)', () => {
  it('devuelve cero sin intereses ni comisión y crece con la comisión', () => {
    expect(effectiveAnnualRate(1200, [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100])).toBe(0);
    expect(effectiveAnnualRate(1100, Array(12).fill(100))).toBeGreaterThan(0.15);
    expect(() => effectiveAnnualRate(0, [100])).toThrow();
  });
});

describe('consumo de combustible por viaje', () => {
  it('usa conversiones exactas del galón EE. UU. y la milla', () => {
    expect(LITERS_PER_GALLON).toBe(3.785411784);
    expect(KM_PER_MILE).toBe(1.609344);
    expect(kmPerLiter(12, 'kml')).toBe(12);
    expect(kmPerLiter(8, 'l100')).toBe(12.5);
    expect(kmPerLiter(LITERS_PER_GALLON * 10, 'kmgal')).toBeCloseTo(10, 12);
  });

  it('ida y vuelta de 100 km a 12 km/l y B/.1.25 por litro, entre dos personas', () => {
    const r = fuelTrip({ distance: 100, roundTrip: true, efficiency: 12, unit: 'kml', price: 1.25, priceUnit: 'liter', people: 2 });
    expect(r.km).toBe(200);
    expect(r.liters).toBeCloseTo(16.666667, 6);
    expect(r.gallons).toBeCloseTo(4.402868, 6);
    expect(r.cost).toBeCloseTo(20.833333, 6);
    expect(r.costPerKm).toBeCloseTo(0.104167, 6);
    expect(r.costPerPerson).toBeCloseTo(10.416667, 6);
  });

  it('millas por galón con precio por galón', () => {
    const r = fuelTrip({ distance: 50, roundTrip: false, efficiency: 30, unit: 'mpg', price: 4.8, priceUnit: 'gallon', people: 1 });
    expect(r.liters).toBeCloseTo(3.920243, 6);
    expect(r.gallons).toBeCloseTo(1.035619, 6);
    expect(r.cost).toBeCloseTo(4.97097, 5);
  });

  it('litros por 100 km y kilómetros por galón', () => {
    expect(fuelTrip({ distance: 320, roundTrip: false, efficiency: 8, unit: 'l100', price: 1.279, priceUnit: 'liter', people: 1 }).cost).toBeCloseTo(32.7424, 6);
    const r = fuelTrip({ distance: 45, roundTrip: true, efficiency: 40, unit: 'kmgal', price: 4.5, priceUnit: 'gallon', people: 3 });
    expect(r.gallons).toBeCloseTo(2.25, 10);
    expect(r.cost).toBeCloseTo(10.125, 10);
    expect(r.costPerPerson).toBeCloseTo(3.375, 10);
  });

  it('un precio cero da costo cero', () => {
    expect(fuelTrip({ distance: 10, roundTrip: false, efficiency: 10, unit: 'kml', price: 0, priceUnit: 'liter', people: 1 }).cost).toBe(0);
  });

  it.each([
    [{ distance: 0 }], [{ efficiency: 0 }], [{ people: 0 }], [{ people: 1.5 }], [{ price: 101 }], [{ unit: 'xyz' }], [{ priceUnit: 'barril' }],
  ])('rechaza %o', change => expect(() => fuelTrip({ distance: 10, roundTrip: false, efficiency: 10, unit: 'kml', price: 1, priceUnit: 'liter', people: 1, ...change } as never)).toThrow());
});

describe('costo mensual de mantener un automóvil', () => {
  const base = { loanPayment: 420, fuel: 140, parking: 60, tolls: 25, other: 15, insuranceYear: 720, maintenanceYear: 600, registrationYear: 80, depreciationYear: 1800 };

  it('suma gastos mensuales y prorratea los anuales entre 12', () => {
    const r = carMonthlyCost({ ...base, kmPerMonth: 1200 });
    expect(r.total).toBeCloseTo(926.666667, 6);
    expect(r.annual).toBeCloseTo(11120, 8);
    expect(r.withoutDepreciation).toBeCloseTo(776.666667, 6);
    expect(r.perKm).toBeCloseTo(0.772222, 6);
    expect(r.items[0]).toMatchObject({ label: 'Cuota del financiamiento', monthly: 420 });
    expect(r.items.reduce((sum, item) => sum + item.share, 0)).toBeCloseTo(100, 10);
  });

  it('omite conceptos en cero y no calcula costo por km sin kilómetros', () => {
    const r = carMonthlyCost({ ...base, loanPayment: 0, depreciationYear: 0 });
    expect(r.items.some(item => item.label.startsWith('Cuota'))).toBe(false);
    expect(r.perKm).toBeNull();
    expect(r.total).toBeCloseTo(240 + 1400 / 12, 10);
  });

  it('rechaza todo en cero, negativos, más de dos decimales y kilómetros inválidos', () => {
    const zero = { loanPayment: 0, fuel: 0, parking: 0, tolls: 0, other: 0, insuranceYear: 0, maintenanceYear: 0, registrationYear: 0, depreciationYear: 0 };
    expect(() => carMonthlyCost(zero)).toThrow(/al menos un gasto/);
    expect(() => carMonthlyCost({ ...base, fuel: -1 })).toThrow();
    expect(() => carMonthlyCost({ ...base, fuel: 1.234 })).toThrow(/decimales/);
    expect(() => carMonthlyCost({ ...base, kmPerMonth: 0 })).toThrow(/Kilómetros/);
  });
});
