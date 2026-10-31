/** Cálculos locales de presupuesto. Todos los importes se representan en centésimos enteros. */
export type Category = 'alimentacion' | 'transporte' | 'vivienda' | 'servicios' | 'deudas' | 'salud' | 'otros';
export type MovementKind = 'gasto' | 'deuda';
export type MovementStatus = 'pendiente' | 'pagado';
export interface Movement {
  id: string;
  name: string;
  cents: number;
  category: Category;
  date: string;
  kind: MovementKind;
  status: MovementStatus;
  recurring: boolean;
}

export interface BudgetState {
  version: 1;
  start: string;
  payday: string;
  openingCents: number;
  savingsCents: number;
  movements: Movement[];
}

export const CATEGORIES: Record<Category, string> = {
  alimentacion: 'Alimentación', transporte: 'Transporte', vivienda: 'Vivienda', servicios: 'Servicios',
  deudas: 'Deudas', salud: 'Salud', otros: 'Otros'
};
export const MAX_CENTS = 1_000_000_000;
export const MAX_MOVEMENTS = 200;

export function parseCents(input: string): number {
  const value = input.trim().replace(',', '.');
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(value)) throw new Error('Introduce un importe válido con hasta dos decimales.');
  const [whole, fraction = ''] = value.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents > MAX_CENTS) throw new Error('El importe supera el límite permitido.');
  return cents;
}

export function localToday(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Fecha civil, independiente de zona horaria y cambios de horario de verano. */
export function civilDay(date: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Revisa las fechas.');
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  if (year < 1900 || year > 2100) throw new Error('La fecha debe estar entre 1900 y 2100.');
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day) throw new Error('Revisa las fechas.');
  return Math.floor(utc.getTime() / 86_400_000);
}

export function summarizeBudget(state: BudgetState, today = localToday()) {
  const start = civilDay(state.start), end = civilDay(state.payday), current = civilDay(today);
  if (end <= start) throw new Error('El próximo pago debe ser posterior al inicio.');
  for (const amount of [state.openingCents, state.savingsCents]) {
    if (!Number.isSafeInteger(amount) || amount < 0 || amount > MAX_CENTS) throw new Error('Revisa los importes.');
  }
  if (state.movements.length > MAX_MOVEMENTS) throw new Error('Se alcanzó el máximo de movimientos.');
  let paidCents = 0, pendingCents = 0;
  for (const item of state.movements) {
    if (!Number.isSafeInteger(item.cents) || item.cents < 0 || item.cents > MAX_CENTS) throw new Error('Revisa los movimientos.');
    if (item.status === 'pagado') paidCents += item.cents;
    else if (item.status === 'pendiente') pendingCents += item.cents;
    else throw new Error('El estado de un movimiento no es válido.');
  }
  const currentCents = state.openingCents - paidCents;
  const freeCents = currentCents - pendingCents - state.savingsCents;
  const days = Math.max(0, end - Math.max(start, current));
  // Para no asignar más de lo disponible, el presupuesto diario se redondea hacia abajo al centésimo.
  const dailyCents = days > 0 ? Math.floor(Math.max(0, freeCents) / days) : null;
  return { currentCents, paidCents, pendingCents, savingsCents: state.savingsCents, freeCents, days, dailyCents, past: end <= current };
}

export function newPeriod(state: BudgetState, today: string, keepRecurring: boolean): BudgetState {
  return { version: 1, start: today, payday: '', openingCents: 0, savingsCents: 0,
    movements: keepRecurring ? state.movements.filter(item => item.recurring).map(item => ({ ...item, status: 'pendiente', date: '' })) : [] };
}

export function emptyBudget(today = localToday()): BudgetState {
  return { version: 1, start: today, payday: '', openingCents: 0, savingsCents: 0, movements: [] };
}

export function isBudgetState(value: unknown): value is BudgetState {
  if (!value || typeof value !== 'object') return false;
  const s = value as Partial<BudgetState>;
  if (s.version !== 1 || typeof s.start !== 'string' || typeof s.payday !== 'string' || !Number.isSafeInteger(s.openingCents) || !Number.isSafeInteger(s.savingsCents) || s.openingCents! < 0 || s.savingsCents! < 0 || s.openingCents! > MAX_CENTS || s.savingsCents! > MAX_CENTS || !Array.isArray(s.movements) || s.movements.length > MAX_MOVEMENTS) return false;
  try { civilDay(s.start); if (s.payday) civilDay(s.payday); } catch { return false; }
  const ids = new Set<string>();
  return s.movements.every(m => {
    if (!m || typeof m.id !== 'string' || !m.id || ids.has(m.id) || typeof m.name !== 'string' || !m.name.trim() || m.name.length > 80 || !Number.isSafeInteger(m.cents) || m.cents < 0 || m.cents > MAX_CENTS || !Object.hasOwn(CATEGORIES, m.category) || !['gasto', 'deuda'].includes(m.kind) || !['pendiente', 'pagado'].includes(m.status) || typeof m.recurring !== 'boolean' || typeof m.date !== 'string') return false;
    ids.add(m.id); try { if (m.date) civilDay(m.date); } catch { return false; } return true;
  });
}
