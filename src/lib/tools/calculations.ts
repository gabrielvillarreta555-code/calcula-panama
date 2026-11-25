/** Pure mathematical engines. No DOM, storage, network or official tariff assumptions. */
import { calculateLoan, type Installment } from '../finance/loans';
export const LIMIT = 10_000_000;
export function bounded(n: number, name: string, min = 0, max = LIMIT): number {
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${name}: usa un número entre ${min} y ${max}.`);
  return n;
}
export function decimal(raw: string, name: string, digits = 3): number {
  const text = raw.trim();
  if (!(digits === 0 ? /^\d+$/ : new RegExp(`^\\d+(?:[.,]\\d{1,${digits}})?$`)).test(text)) throw new Error(`${name}: escribe un número sin separadores de miles, con hasta ${digits} decimales.`);
  return bounded(Number(text.replace(',', '.')), name);
}
const cents = (n: number, name = 'Importe') => {
  bounded(n, name);
  const value = Math.round(n * 100);
  if (Math.abs(n * 100 - value) > 0.00001) throw new Error(`${name}: usa como máximo dos decimales.`);
  return value;
};
const units = {
  kg: { factor: 1, kind: 'masa', label: 'kg' }, g: { factor: 0.001, kind: 'masa', label: 'kg' },
  lb: { factor: 0.45359237, kind: 'masa', label: 'kg' },
  l: { factor: 1, kind: 'volumen', label: 'litro' }, ml: { factor: 0.001, kind: 'volumen', label: 'litro' },
  unidad: { factor: 1, kind: 'unidades', label: 'unidad' },
} as const;
export type Unit = keyof typeof units;
export interface Product { price: number; quantity: number; unit: Unit }
export function compareUnits(products: Product[]) {
  if (products.length < 2 || products.length > 20) throw new Error('Compara entre 2 y 20 productos.');
  const kind = units[products[0]!.unit]?.kind;
  const values = products.map((p, i) => {
    cents(p.price, `Precio ${i + 1}`); bounded(p.quantity, `Contenido ${i + 1}`, 0.001);
    if (!units[p.unit] || units[p.unit].kind !== kind) throw new Error('Compara unidades compatibles: masa con masa, volumen con volumen o unidades.');
    if (p.unit === 'unidad' && !Number.isInteger(p.quantity)) throw new Error('El número de unidades debe ser entero.');
    return p.price / (p.quantity * units[p.unit].factor);
  });
  const best = Math.min(...values);
  return { values, best, winners: values.map((v, i) => Math.abs(v - best) <= Math.max(1, best) * 1e-10 ? i : -1).filter(i => i >= 0), label: units[products[0]!.unit].label };
}
export type Promotion = 'percent' | 'successive' | '2x1' | '3x2' | 'second';
export function promotion(price: number, quantity: number, mode: Promotion, discount = 0, secondDiscount = 0) {
  const unit = cents(price); bounded(quantity, 'Cantidad', 1, 10000);
  if (!Number.isInteger(quantity)) throw new Error('La cantidad debe ser entera.');
  bounded(discount, 'Descuento', 0, 100); bounded(secondDiscount, 'Segundo descuento', 0, 100);
  const original = unit * quantity;
  let total: number;
  switch (mode) {
    case 'percent': total = original * (1 - discount / 100); break;
    case 'successive': total = original * (1 - discount / 100) * (1 - secondDiscount / 100); break;
    case '2x1': total = unit * (quantity - Math.floor(quantity / 2)); break;
    case '3x2': total = unit * (quantity - Math.floor(quantity / 3)); break;
    case 'second': total = unit * (quantity - Math.floor(quantity / 2) * discount / 100); break;
    default: throw new Error('Selecciona una promoción válida.');
  }
  const paid = Math.round(total + 1e-7);
  return { total: paid / 100, original: original / 100, saved: (original - paid) / 100, effective: original ? (original - paid) / original * 100 : 0, perUnit: paid / 100 / quantity };
}
function dateValue(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Introduce fechas completas.');
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value || date.getUTCFullYear() < 2000 || date.getUTCFullYear() > 2100) throw new Error('Usa fechas válidas entre 2000 y 2100.');
  return date;
}
export type Frequency = 'weekly' | 'twice-month' | 'monthly';
export function savings(goal: number, saved: number, start: string, end: string, frequency: Frequency) {
  const remaining = Math.max(0, cents(goal, 'Meta') - cents(saved, 'Ahorro inicial'));
  const first = dateValue(start), last = dateValue(end);
  if (last < first) throw new Error('La fecha objetivo no puede ser anterior al inicio.');
  if (!['weekly', 'twice-month', 'monthly'].includes(frequency)) throw new Error('Selecciona una frecuencia válida.');
  const dates: string[] = [];
  const append = (d: Date) => { if (d >= first && d <= last) dates.push(d.toISOString().slice(0, 10)); };
  if (frequency === 'weekly') {
    for (let t = first.getTime(); t <= last.getTime(); t += 7 * 86400000) append(new Date(t));
  } else {
    for (let m = first.getUTCFullYear() * 12 + first.getUTCMonth(); m <= last.getUTCFullYear() * 12 + last.getUTCMonth(); m++) {
      const y = Math.floor(m / 12), month = m % 12, finalDay = new Date(Date.UTC(y, month + 1, 0)).getUTCDate();
      for (const day of frequency === 'twice-month' ? [15, finalDay] : [Math.min(first.getUTCDate(), finalDay)]) append(new Date(Date.UTC(y, month, day)));
    }
  }
  if (!dates.length) throw new Error('No hay aportes en ese intervalo. Amplía las fechas o cambia la frecuencia.');
  if (dates.length > 600) throw new Error('El plan admite hasta 600 aportes. Reduce el plazo.');
  const base = Math.floor(remaining / dates.length), extra = remaining % dates.length;
  return { remaining: remaining / 100, maximum: Math.ceil(remaining / dates.length) / 100, plan: dates.map((date, i) => ({ date, amount: (base + (i < extra ? 1 : 0)) / 100 })) };
}
export interface Grade { score: number; weight: number }
export function grades(rows: Grade[], scale: number, target: number) {
  bounded(scale, 'Nota máxima', 1, 1000); bounded(target, 'Objetivo', 0, scale);
  if (!rows.length || rows.length > 20) throw new Error('Introduce entre 1 y 20 evaluaciones.');
  let weight = 0, points = 0;
  for (const row of rows) {
    bounded(row.score, 'Nota', 0, scale); bounded(row.weight, 'Peso', 0.001, 100);
    weight += row.weight; points += row.score * row.weight / 100;
  }
  if (weight > 100 + 1e-9) throw new Error('Los pesos no pueden superar el 100%.');
  const remaining = Math.max(0, 100 - weight);
  const required = remaining > 1e-9 ? (target - points) * 100 / remaining : null;
  return { average: points * 100 / weight, points, weight, remaining, required, possible: required === null ? points + 1e-9 >= target : required <= scale + 1e-9 };
}
export function electricity(watts: number, hours: number, days: number, duty: number, rate?: number) {
  bounded(watts, 'Potencia', 0, 100000); bounded(hours, 'Horas diarias', 0, 24); bounded(days, 'Días', 1, 366);
  if (!Number.isInteger(days)) throw new Error('Los días deben ser enteros.');
  bounded(duty, 'Tiempo activo', 0, 100);
  if (rate !== undefined) bounded(rate, 'Precio por kWh', 0, 100);
  const kwh = watts / 1000 * hours * days * duty / 100;
  return { kwh, cost: rate === undefined ? null : kwh * rate };
}

/* ---------------------------------------------------------------- Bloque A: automóviles */

/** Galón estadounidense y milla internacional exactos (NIST Handbook 44, apéndice C). */
export const LITERS_PER_GALLON = 3.785411784;
export const KM_PER_MILE = 1.609344;
const toCents = (n: number, name: string) => cents(n, name);

/**
 * Tasa efectiva anual estimada: tasa interna de retorno mensual de los flujos del préstamo
 * (Acuerdo SBP 3-2002, art. 4: incluye comisiones de cierre; excluye seguros, notaría, registro,
 * FECI y tributos), anualizada como (1 + i)^12 − 1.
 */
export function effectiveAnnualRate(netReceivedCents: number, paymentsCents: number[]): number {
  const pv = (rate: number) => paymentsCents.reduce((sum, pay, k) => sum + pay / Math.pow(1 + rate, k + 1), 0);
  if (netReceivedCents <= 0) throw new Error('La comisión no puede igualar ni superar el monto financiado.');
  let low = 0, high = 1;
  if (pv(0) <= netReceivedCents) return 0;
  for (let i = 0; i < 200; i++) { const mid = (low + high) / 2; if (pv(mid) > netReceivedCents) low = mid; else high = mid; }
  return Math.expm1(12 * Math.log1p((low + high) / 2));
}

export interface CarLoanInput {
  price: number; downPayment: number; annualRate: number; rateType: 'nominal' | 'effective'; months: number;
  /** Seguros mensuales exigidos (auto y vida). No forman parte de la tasa efectiva. */
  insurance: number;
  /** Comisión o gastos de cierre del banco pagados al inicio: sí forman parte de la tasa efectiva. */
  bankFees: number;
  /** Notaría, registro y otros pagos a terceros: no forman parte de la tasa efectiva. */
  otherCosts: number;
}

export function carFinancing(input: CarLoanInput) {
  const price = toCents(input.price, 'Precio del auto'), down = toCents(input.downPayment, 'Abono inicial');
  const insurance = toCents(input.insurance, 'Seguros mensuales'), fees = toCents(input.bankFees, 'Comisión de cierre'), other = toCents(input.otherCosts, 'Otros gastos iniciales');
  if (price === 0) throw new Error('Precio del auto: debe ser mayor que cero.');
  if (down >= price) throw new Error('El abono inicial debe ser menor que el precio: no quedaría nada por financiar.');
  bounded(input.months, 'Plazo', 1, 120);
  if (!Number.isInteger(input.months)) throw new Error('Plazo: usa meses enteros.');
  const financed = price - down;
  if (fees >= financed) throw new Error('La comisión de cierre no puede igualar ni superar el monto financiado.');
  const loan = calculateLoan({ principal: financed, annualRate: input.annualRate, rateType: input.rateType, months: input.months, insurance, monthlyCharges: 0, upfrontFee: 0 });
  const loanPayments = loan.installments.reduce((sum, item) => sum + item.payment, 0);
  const insuranceTotal = insurance * loan.installments.length;
  const totalCar = down + loanPayments + insuranceTotal + fees + other;
  return {
    financed: financed / 100,
    payment: loan.regularPayment / 100,
    paymentWithInsurance: (loan.regularPayment + insurance) / 100,
    finalPayment: loan.installments.at(-1)!.payment / 100,
    payments: loan.installments.length,
    interest: loan.interestTotal / 100,
    insuranceTotal: insuranceTotal / 100,
    financingCost: (loanPayments - financed + insuranceTotal + fees + other) / 100,
    totalCar: totalCar / 100,
    effectiveRate: effectiveAnnualRate(financed - fees, loan.installments.map(item => item.payment)) * 100,
    schedule: loan.installments.map((item: Installment) => ({ month: item.month, payment: item.payment / 100, principal: item.principal / 100, interest: item.interest / 100, balance: item.balance / 100 })),
  };
}

export type EfficiencyUnit = 'kml' | 'kmgal' | 'mpg' | 'l100';
export interface FuelTripInput { distance: number; roundTrip: boolean; efficiency: number; unit: EfficiencyUnit; price: number; priceUnit: 'liter' | 'gallon'; people: number }

/** Convierte cualquier rendimiento admitido a kilómetros por litro. */
export function kmPerLiter(efficiency: number, unit: EfficiencyUnit): number {
  bounded(efficiency, 'Rendimiento', 0.01, 1000);
  switch (unit) {
    case 'kml': return efficiency;
    case 'kmgal': return efficiency / LITERS_PER_GALLON;
    case 'mpg': return efficiency * KM_PER_MILE / LITERS_PER_GALLON;
    case 'l100': return 100 / efficiency;
    default: throw new Error('Selecciona una unidad de rendimiento válida.');
  }
}

export function fuelTrip(input: FuelTripInput) {
  bounded(input.distance, 'Distancia', 0.01, 100000);
  bounded(input.price, 'Precio del combustible', 0, 100);
  bounded(input.people, 'Personas', 1, 100);
  if (!Number.isInteger(input.people)) throw new Error('Personas: usa un número entero.');
  if (input.priceUnit !== 'liter' && input.priceUnit !== 'gallon') throw new Error('Selecciona si el precio es por litro o por galón.');
  const km = input.distance * (input.roundTrip ? 2 : 1);
  const liters = km / kmPerLiter(input.efficiency, input.unit);
  const pricePerLiter = input.priceUnit === 'liter' ? input.price : input.price / LITERS_PER_GALLON;
  const cost = liters * pricePerLiter;
  return { km, liters, gallons: liters / LITERS_PER_GALLON, pricePerLiter, cost, costPerKm: cost / km, costPerPerson: cost / input.people };
}

export interface CarMonthlyInput {
  loanPayment: number; fuel: number; parking: number; tolls: number; other: number;
  insuranceYear: number; maintenanceYear: number; registrationYear: number; depreciationYear: number;
  kmPerMonth?: number;
}

export function carMonthlyCost(input: CarMonthlyInput) {
  const monthly = [
    { label: 'Cuota del financiamiento', value: input.loanPayment, name: 'Cuota' },
    { label: 'Combustible', value: input.fuel, name: 'Combustible' },
    { label: 'Estacionamiento', value: input.parking, name: 'Estacionamiento' },
    { label: 'Peajes', value: input.tolls, name: 'Peajes' },
    { label: 'Otros gastos mensuales', value: input.other, name: 'Otros gastos' },
  ];
  const yearly = [
    { label: 'Seguro del auto', value: input.insuranceYear, name: 'Seguro anual' },
    { label: 'Mantenimiento y llantas', value: input.maintenanceYear, name: 'Mantenimiento anual' },
    { label: 'Placa, revisado y trámites', value: input.registrationYear, name: 'Trámites anuales' },
    { label: 'Pérdida de valor (depreciación)', value: input.depreciationYear, name: 'Depreciación anual' },
  ];
  const items = [
    ...monthly.map(item => ({ label: item.label, monthly: toCents(item.value, item.name) / 100 })),
    ...yearly.map(item => ({ label: item.label, monthly: toCents(item.value, item.name) / 1200 })),
  ];
  const total = items.reduce((sum, item) => sum + item.monthly, 0);
  if (total === 0) throw new Error('Introduce al menos un gasto mayor que cero.');
  if (input.kmPerMonth !== undefined) bounded(input.kmPerMonth, 'Kilómetros al mes', 1, 100000);
  const withoutDepreciation = total - input.depreciationYear / 12;
  return {
    total, annual: total * 12, withoutDepreciation,
    perKm: input.kmPerMonth === undefined ? null : total / input.kmPerMonth,
    items: items.filter(item => item.monthly > 0).map(item => ({ ...item, share: item.monthly / total * 100 })).sort((a, b) => b.monthly - a.monthly),
  };
}
