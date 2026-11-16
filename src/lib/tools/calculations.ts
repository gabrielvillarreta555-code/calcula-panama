/** Pure mathematical engines. No DOM, storage, network or official tariff assumptions. */
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
