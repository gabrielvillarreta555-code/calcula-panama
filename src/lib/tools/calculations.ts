/** Pure mathematical engines. No DOM, storage, network or official tariff assumptions. */
import { calculateLoan, type Installment } from '../finance/loans';
import { holidayName } from '../overtime';
import { MINIMUM_WAGES } from '../../data/minimum-wage';
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

/* ---------------------------------------------------------------- CP-SEO-001, fase 1: herramientas cotidianas */

/**
 * Tarifas del ITBMS: Código Fiscal, art. 1057-V, parágrafo 6, según el art. 76 de la Ley 8 de 2010 (DGI).
 * 7% general; 10% bebidas alcohólicas y hospedaje; 15% productos derivados del tabaco.
 */
export const ITBMS_RATES = [7, 10, 15] as const;
export type ItbmsRate = typeof ITBMS_RATES[number];
export type ItbmsMode = 'add' | 'remove';

/** Agrega el ITBMS a un precio sin impuesto, o lo separa de un precio que ya lo incluye. Todo en centésimos. */
export function itbms(amount: number, rate: number, mode: ItbmsMode) {
  const value = cents(amount, 'Importe');
  if (!(ITBMS_RATES as readonly number[]).includes(rate)) throw new Error('Selecciona una tarifa de ITBMS válida: 7%, 10% o 15%.');
  if (mode !== 'add' && mode !== 'remove') throw new Error('Indica si el importe incluye o no el ITBMS.');
  // Redondeo al centésimo más cercano, con los empates hacia arriba (enteros exactos: sin error de coma flotante).
  const base = mode === 'add' ? value : Math.round(value * 100 / (100 + rate));
  const tax = mode === 'add' ? Math.round(value * rate / 100) : value - base;
  return { base: base / 100, tax: tax / 100, total: (base + tax) / 100, rate };
}

/** Redondeos admitidos al dividir una cuenta, en centésimos (monedas de 1, 5, 25 centésimos y B/.1). */
export const SPLIT_ROUNDING = { none: 1, '0.05': 5, '0.25': 25, '1.00': 100 } as const;
export type SplitRounding = keyof typeof SPLIT_ROUNDING;

export interface SplitBillInput {
  /** Total de la factura, con ITBMS. */
  total: number;
  /** ITBMS que figura en la factura. Si se indica, la propina se calcula sobre el consumo sin impuesto. */
  tax?: number;
  tipPercent: number;
  people: number;
  rounding: SplitRounding;
}

/** Divide una cuenta en partes iguales, con propina opcional, sin perder ni inventar centésimos. */
export function splitBill(input: SplitBillInput) {
  const total = cents(input.total, 'Total de la cuenta');
  if (total === 0) throw new Error('Total de la cuenta: debe ser mayor que cero.');
  const tax = input.tax === undefined ? 0 : cents(input.tax, 'ITBMS de la factura');
  if (tax >= total) throw new Error('El ITBMS debe ser menor que el total de la cuenta.');
  bounded(input.tipPercent, 'Propina', 0, 50);
  bounded(input.people, 'Personas', 1, 100);
  if (!Number.isInteger(input.people)) throw new Error('Personas: usa un número entero.');
  const step = SPLIT_ROUNDING[input.rounding];
  if (!step) throw new Error('Selecciona un redondeo válido.');
  const tipBase = total - tax;
  const tip = Math.round(tipBase * input.tipPercent / 100);
  const grand = total + tip;
  if (step === 1) {
    // Reparto exacto: las primeras personas pagan un centésimo más si la división no es exacta.
    const share = Math.floor(grand / input.people), extra = grand % input.people;
    return { total: total / 100, tipBase: tipBase / 100, tip: tip / 100, grand: grand / 100, share: share / 100, extraPeople: extra, maxShare: (share + (extra ? 1 : 0)) / 100, collected: grand / 100, surplus: 0 };
  }
  // Con redondeo, cada persona paga lo mismo, redondeado hacia arriba; lo sobrante se suma a la propina.
  const share = Math.ceil(grand / (input.people * step)) * step;
  const collected = share * input.people;
  return { total: total / 100, tipBase: tipBase / 100, tip: tip / 100, grand: grand / 100, share: share / 100, extraPeople: 0, maxShare: share / 100, collected: collected / 100, surplus: (collected - grand) / 100 };
}

/**
 * Días hábiles y feriados. Fiestas y duelos nacionales del art. 46 del Código de Trabajo (con la Ley 291 de 2022)
 * y el lunes de descanso del art. 47 cuando la fiesta cae en domingo: los mismos datos verificados de
 * src/data/overtime-rules.ts. No incluye días libres decretados por el Órgano Ejecutivo ni feriados locales.
 */
export type WorkWeek = 'mon-fri' | 'mon-sat';
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
export function holidayLabel(iso: string): string | null {
  const name = holidayName(iso);
  return name === null ? null : capitalize(name.replace(/^el /, ''));
}
export function businessDays(start: string, end: string, week: WorkWeek) {
  const first = dateValue(start), last = dateValue(end);
  if (last < first) throw new Error('La fecha final no puede ser anterior a la inicial.');
  if (week !== 'mon-fri' && week !== 'mon-sat') throw new Error('Selecciona los días laborables.');
  const days = Math.round((last.getTime() - first.getTime()) / 86400000) + 1;
  if (days > 3660) throw new Error('El intervalo admite hasta 10 años.');
  let business = 0, weekend = 0;
  const holidays: { date: string; name: string; weekday: number; counted: boolean }[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(first.getTime() + i * 86400000);
    const iso = date.toISOString().slice(0, 10), weekday = date.getUTCDay();
    const workday = weekday !== 0 && (week === 'mon-sat' || weekday !== 6);
    const name = holidayLabel(iso);
    if (name) holidays.push({ date: iso, name, weekday, counted: workday });
    if (!workday) weekend++;
    else if (!name) business++;
  }
  return { days, business, weekend, holidays, holidaysOnWorkdays: holidays.filter(h => h.counted).length };
}

/**
 * Tarjeta de crédito: simulación mensual de una deuda sin compras nuevas. Interés = saldo × tasa nominal anual ÷ 12,
 * redondeado al centésimo. Es una aproximación: los bancos suelen calcular el interés sobre el saldo diario y
 * pueden cobrar cargos, seguros y comisiones que esta simulación no incluye.
 */
export type CardMode = 'fixed' | 'minimum';
export interface CardInput { balance: number; annualRate: number; mode: CardMode; payment: number; minPercent: number }
export function creditCard(input: CardInput) {
  const balance0 = cents(input.balance, 'Saldo');
  if (balance0 === 0) throw new Error('Saldo: debe ser mayor que cero.');
  bounded(input.annualRate, 'Tasa de interés anual', 0, 100);
  if (input.mode !== 'fixed' && input.mode !== 'minimum') throw new Error('Selecciona cómo vas a pagar.');
  const fixed = input.mode === 'fixed' ? cents(input.payment, 'Pago mensual') : 0;
  const floor = input.mode === 'minimum' ? cents(input.payment, 'Pago mínimo en B/.') : 0;
  if (input.mode === 'minimum') bounded(input.minPercent, 'Porcentaje del pago mínimo', 0.1, 100);
  const rate = input.annualRate / 1200;
  let balance = balance0, interestTotal = 0, paid = 0, months = 0, firstPayment = 0;
  const schedule: { month: number; payment: number; interest: number; balance: number }[] = [];
  while (balance > 0) {
    if (++months > 600) throw new Error('Con este pago, la deuda tardaría más de 50 años en saldarse. Aumenta el pago mensual.');
    const interest = Math.round(balance * rate);
    const due = balance + interest;
    const wanted = input.mode === 'fixed' ? fixed : Math.max(floor, Math.round(due * input.minPercent / 100));
    if (wanted <= interest && wanted < due) throw new Error(`El pago (B/.${(wanted / 100).toFixed(2)}) no cubre los intereses del mes (B/.${(interest / 100).toFixed(2)}): la deuda nunca bajaría. Aumenta el pago.`);
    const payment = Math.min(wanted, due);
    if (months === 1) firstPayment = payment;
    balance = due - payment; interestTotal += interest; paid += payment;
    schedule.push({ month: months, payment: payment / 100, interest: interest / 100, balance: balance / 100 });
  }
  /** Pago fijo necesario para saldar la deuda en n meses (sistema francés, sin compras nuevas). */
  const paymentFor = (n: number) => rate === 0 ? balance0 / n / 100 : balance0 * rate / -Math.expm1(-n * Math.log1p(rate)) / 100;
  return {
    months, interest: interestTotal / 100, paid: paid / 100, firstPayment: firstPayment / 100, schedule,
    payoff: [12, 24, 36].map(n => ({ months: n, payment: Math.ceil(paymentFor(n) * 100) / 100 })),
  };
}

/**
 * Salario mínimo (Decreto Ejecutivo 13 de 2025). El decreto fija tasas por hora; la conversión a semana, quincena y mes
 * es un criterio de cálculo, no una norma: 52 semanas ÷ 12 meses = 4⅓ semanas por mes, la misma equivalencia que usa
 * la calculadora de horas extras (art. 54 del Código de Trabajo para las vacaciones de quien cobra por semana).
 */
export type WageRegion = 'r1' | 'r2';
export function minimumWage(id: string, region: WageRegion, weeklyHours: number) {
  const rate = MINIMUM_WAGES.find(r => r.id === id);
  if (!rate) throw new Error('Selecciona una actividad económica.');
  if (region !== 'r1' && region !== 'r2') throw new Error('Selecciona la región.');
  const value = region === 'r1' ? rate.r1 : rate.r2;
  if (value === null) throw new Error('El decreto no fija una tasa para esta actividad en la Región 2.');
  if (rate.monthly) return { rate, hourly: null, weekly: null, fortnightly: value / 2, monthly: value, weeklyHours: null };
  bounded(weeklyHours, 'Horas semanales', 1, 48);
  if (!Number.isInteger(weeklyHours)) throw new Error('Horas semanales: usa un número entero.');
  const weekly = value * weeklyHours;
  const monthly = weekly * 52 / 12;
  return { rate, hourly: value, weekly, fortnightly: monthly / 2, monthly, weeklyHours };
}
