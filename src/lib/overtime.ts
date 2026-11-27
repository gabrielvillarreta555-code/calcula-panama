/**
 * Motor de horas extras para Panamá (CP-TOOL-008).
 *
 * Fuente primaria: Código de Trabajo, arts. 30 a 50 (texto de la recopilación MITRADEL/OIT publicada por el Órgano
 * Judicial). Cada regla cita su artículo. Lo que el Código no fija (por ejemplo, cómo pasar un salario mensual a valor
 * por hora) está marcado como «criterio de cálculo» y se explica en la página y en docs/cp-tool-008.
 *
 * Todo se calcula en minutos enteros; los importes se redondean a centavos solo al final de cada grupo.
 */
import { OVERTIME_RULES as R } from '../data/overtime-rules';

export type PayBasis = 'monthly' | 'fortnightly' | 'weekly' | 'hourly';
export type ShiftType = 'diurna' | 'mixta' | 'nocturna';
export type DayKind = 'normal' | 'descanso' | 'compensatorio' | 'libre' | 'feriado';
export type PeriodKind = 'weekly' | 'fortnightly' | 'monthly';

const MIN_PER_DAY = 1440;

/* ----------------------------------------------------------------------------------------------------------------- */
/* Valor de la hora                                                                                                   */
/* ----------------------------------------------------------------------------------------------------------------- */

/** Horas ordinarias semanales máximas por tipo de jornada (art. 31). */
export const legalWeeklyHours = (type: ShiftType) => R.weeklyMaxHours[type];

/**
 * Valor de la hora ordinaria. Criterio de cálculo (el Código no fija un divisor): un mes tiene 4⅓ semanas, la misma
 * equivalencia que usa el art. 54 para pagar vacaciones; una quincena es medio mes.
 */
export function hourlyRate(salary: number, basis: PayBasis, weeklyHours: number): number {
  assertAmount(salary, 'El salario');
  if (basis === 'hourly') return salary;
  if (!(weeklyHours > 0 && weeklyHours <= 168)) throw new Error('Las horas semanales deben estar entre 1 y 168.');
  const monthlyHours = weeklyHours * R.weeksPerMonth;
  if (basis === 'monthly') return salary / monthlyHours;
  if (basis === 'fortnightly') return (salary * 2) / monthlyHours;
  return salary / weeklyHours;
}

/** Salario fijo equivalente a un período (semana, quincena o mes), con la misma equivalencia de 4⅓ semanas por mes. */
export function periodSalary(salary: number, basis: PayBasis, period: PeriodKind): number | null {
  if (basis === 'hourly') return null;
  const monthly = basis === 'monthly' ? salary : basis === 'fortnightly' ? salary * 2 : salary * R.weeksPerMonth;
  return period === 'monthly' ? monthly : period === 'fortnightly' ? monthly / 2 : monthly / R.weeksPerMonth;
}

/* ----------------------------------------------------------------------------------------------------------------- */
/* Modo rápido                                                                                                        */
/* ----------------------------------------------------------------------------------------------------------------- */

export type QuickOvertime = 'none' | 'd25' | 'n50' | 'n75';
export type QuickDay = 'normal' | 'descanso' | 'feriado';
export interface QuickInput {
  salary: number; basis: PayBasis; weeklyHours: number;
  minutes: number; overtime: QuickOvertime; day: QuickDay; overLimit: boolean;
}
export interface QuickResult {
  hourly: number; factor: number; hourValue: number; hours: number;
  base: number; surcharge: number; total: number; parts: string[];
}

export const QUICK_OVERTIME: Record<QuickOvertime, number> = { none: 0, d25: R.overtime.day, n50: R.overtime.night, n75: R.overtime.nightExtension };
export const QUICK_DAY: Record<QuickDay, number> = { normal: 0, descanso: R.day.restDay, feriado: R.day.holiday };

/** Recargos encadenados según el art. 50: primero el del día, luego el de las horas excedentes y, si procede, el del art. 36. */
export function chainFactor(daySurcharge: number, overtimeSurcharge: number, overLimit: boolean): number {
  return (1 + daySurcharge) * (1 + overtimeSurcharge) * (overLimit ? 1 + R.overLimitSurcharge : 1);
}

export function calculateQuick(input: QuickInput): QuickResult {
  if (!Number.isInteger(input.minutes) || input.minutes <= 0) throw new Error('Indica cuántas horas o minutos trabajaste.');
  if (input.minutes > 7 * MIN_PER_DAY) throw new Error('El modo rápido admite hasta 168 horas. Para períodos largos usa el registro de jornadas.');
  const day = QUICK_DAY[input.day], ot = QUICK_OVERTIME[input.overtime];
  if (input.overLimit && input.overtime === 'none') throw new Error('El recargo por superar el límite solo se aplica a horas extraordinarias: elige su recargo.');
  if (day === 0 && ot === 0) throw new Error('Elige el recargo de las horas extraordinarias o el tipo de día con recargo.');
  const hourly = hourlyRate(input.salary, input.basis, input.weeklyHours);
  const factor = chainFactor(day, ot, input.overLimit);
  const hours = input.minutes / 60;
  const total = cents(hourly * factor * hours);
  const base = cents(hourly * hours);
  const parts: string[] = [];
  if (day) parts.push(input.day === 'feriado' ? 'Fiesta o duelo nacional +150%' : 'Día de descanso +50%');
  if (ot) parts.push(`Hora extraordinaria +${Math.round(ot * 100)}%`);
  if (input.overLimit) parts.push('Exceso del límite legal +75%');
  return { hourly, factor, hourValue: hourly * factor, hours, base, surcharge: cents(total - base), total, parts };
}

/* ----------------------------------------------------------------------------------------------------------------- */
/* Registro de jornadas                                                                                               */
/* ----------------------------------------------------------------------------------------------------------------- */

export interface ShiftEntry {
  id: string;
  date: string;              // AAAA-MM-DD en que empieza la jornada
  start: string;             // HH:MM
  end: string;               // HH:MM; si es igual o anterior al inicio, termina al día siguiente
  breakMinutes: number;
  breakStart?: string;       // HH:MM opcional; si falta, el descanso se ubica a mitad de la jornada ordinaria
  breakPaid?: boolean;       // art. 34.3: tiempo de comida dentro del local cuando no puede salir
  dayKind: DayKind;
  nextDayKind?: DayKind;     // tipo del día siguiente cuando la jornada cruza la medianoche
  contractDailyHours?: number; // límite contractual inferior al legal (art. 33)
}

export interface Settings {
  salary: number; basis: PayBasis;
  /** Horas ordinarias semanales del contrato; por defecto, el máximo legal de la jornada habitual (art. 31). */
  weeklyHours: number;
  period: PeriodKind;
}

export type AlertLevel = 'error' | 'warn' | 'info';
export interface Alert { level: AlertLevel; entryId?: string; code: string; message: string }

export interface Bucket {
  key: string; label: string; minutes: number;
  ordinary: boolean; daySurcharge: number; overtimeSurcharge: number; overLimit: boolean;
  factor: number; covered: number; pay: number; additional: number;
  /** Importes sin redondear: los totales se redondean una sola vez, al final. */
  rawPay: number; rawAdditional: number;
}

export interface ShiftResult {
  id: string; date: string; included: boolean;
  type?: ShiftType; startedAtNight?: boolean;
  workedMinutes: number; ordinaryMinutes: number; extraMinutes: number; overLimitMinutes: number; nightMinutes: number;
  buckets: Bucket[]; additional: number; pay: number;
}

export interface LogResult {
  hourly: number;
  shifts: ShiftResult[];
  alerts: Alert[];
  days: number; workedMinutes: number; ordinaryMinutes: number; extraMinutes: number; overLimitMinutes: number;
  distribution: Bucket[];
  /** Pago adicional al salario fijo (o, con salario por hora, lo que se suma a las horas ordinarias). */
  additional: number;
  /** Con salario por hora: pago de las horas ordinarias en días normales y del descanso remunerado de los feriados. */
  ordinaryPay: number;
  periodSalary: number | null;
  /** Salario ordinario del período más lo adicional, cuando se puede estimar. */
  grandTotal: number | null;
}

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseTime(value: string): number {
  const m = TIME.exec(value.trim());
  if (!m) throw new Error('Usa horas con el formato HH:MM.');
  return Number(m[1]) * 60 + Number(m[2]);
}
export function parseDate(value: string): number {
  const m = DATE.exec(value.trim());
  if (!m) throw new Error('Usa fechas con el formato AAAA-MM-DD.');
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(t);
  if (d.getUTCFullYear() !== Number(m[1]) || d.getUTCMonth() !== Number(m[2]) - 1 || d.getUTCDate() !== Number(m[3])) throw new Error('La fecha no existe.');
  return Math.round(t / 86_400_000);
}
const isoFromDay = (day: number) => new Date(day * 86_400_000).toISOString().slice(0, 10);

/** Período nocturno del art. 30: de 6 p.m. a 6 a.m. */
export const isNightMinute = (minuteOfDay: number) => minuteOfDay < R.dayStarts || minuteOfDay >= R.nightStarts;

/** Recargo del día según los arts. 48 y 49. El de los días libres por semana corta depende de la jornada. */
export function daySurchargeFor(kind: DayKind, type: ShiftType): number {
  switch (kind) {
    case 'descanso': return R.day.restDay;
    case 'compensatorio': return R.day.compensatory;
    case 'feriado': return R.day.holiday;
    case 'libre': return type === 'diurna' ? R.day.shortWeekDay : R.day.shortWeekNightOrMixed;
    default: return 0;
  }
}

/** Recargo de una hora extraordinaria según el art. 33. */
export function overtimeSurchargeFor(type: ShiftType, startedAtNight: boolean, night: boolean): number {
  if (type === 'nocturna') return R.overtime.nightExtension;
  if (type === 'mixta') return startedAtNight ? R.overtime.nightExtension : R.overtime.night;
  return night ? R.overtime.night : R.overtime.day;
}

/**
 * Clasifica la jornada con el art. 30 a partir de los minutos trabajados en orden. Solo cuenta la parte que puede ser
 * ordinaria: las horas que prolongan la jornada no la convierten en mixta ni en nocturna.
 */
export function classify(nightFlags: boolean[]): { type: ShiftType; startedAtNight: boolean } {
  const startedAtNight = nightFlags[0] ?? false;
  const count = (n: number) => nightFlags.slice(0, n).filter(Boolean).length;
  if (count(R.dailyMaxMinutes.diurna) === 0) return { type: 'diurna', startedAtNight };
  const mixedWindow = nightFlags.slice(0, R.dailyMaxMinutes.mixta);
  const night = mixedWindow.filter(Boolean).length;
  const hasDay = mixedWindow.some(n => !n);
  if (hasDay && night <= R.mixedMaxNightMinutes) return { type: 'mixta', startedAtNight };
  return { type: 'nocturna', startedAtNight };
}

interface Expanded { entry: ShiftEntry; startAbs: number; endAbs: number; minutes: { abs: number; worked: boolean }[] }

function expand(entry: ShiftEntry): Expanded {
  const day = parseDate(entry.date);
  const start = parseTime(entry.start), end = parseTime(entry.end);
  const span = end > start ? end - start : end + MIN_PER_DAY - start;
  const breakMinutes = entry.breakMinutes;
  if (!Number.isInteger(breakMinutes) || breakMinutes < 0) throw new Error('El descanso debe ser un número entero de minutos.');
  if (breakMinutes >= span) throw new Error('El descanso es igual o mayor que el tiempo entre la entrada y la salida.');
  const startAbs = day * MIN_PER_DAY + start;
  const minutes = Array.from({ length: span }, (_, i) => ({ abs: startAbs + i, worked: true }));
  if (breakMinutes > 0 && !entry.breakPaid) {
    let offset: number;
    if (entry.breakStart) {
      const b = parseTime(entry.breakStart);
      offset = (b - start + MIN_PER_DAY) % MIN_PER_DAY;
      if (offset + breakMinutes > span) throw new Error('El descanso queda fuera del horario de la jornada.');
    } else {
      // Criterio de cálculo: sin hora indicada, el descanso se ubica a mitad de la parte ordinaria.
      const ordinaryGuess = Math.min(span - breakMinutes, R.dailyMaxMinutes.diurna);
      offset = Math.max(0, Math.floor(ordinaryGuess / 2));
      if (offset + breakMinutes > span) offset = span - breakMinutes;
    }
    for (let i = offset; i < offset + breakMinutes; i++) minutes[i]!.worked = false;
  }
  return { entry, startAbs, endAbs: startAbs + span, minutes };
}

/** Semana de lunes a domingo (criterio de cálculo: el Código no define en qué día empieza la semana). */
const weekOf = (absMinute: number) => Math.floor((Math.floor(absMinute / MIN_PER_DAY) + 3) / 7);

export function calculateLog(entries: readonly ShiftEntry[], settings: Settings): LogResult {
  const alerts: Alert[] = [];
  const hourly = hourlyRate(settings.salary, settings.basis, settings.weeklyHours);
  const fixed = settings.basis !== 'hourly';

  // 1. Validar y expandir cada jornada.
  const expanded: Expanded[] = [];
  const results = new Map<string, ShiftResult>();
  for (const entry of entries) {
    const blank: ShiftResult = { id: entry.id, date: entry.date, included: false, workedMinutes: 0, ordinaryMinutes: 0, extraMinutes: 0, overLimitMinutes: 0, nightMinutes: 0, buckets: [], additional: 0, pay: 0 };
    results.set(entry.id, blank);
    if (!entry.date || !entry.start || !entry.end) { alerts.push({ level: 'error', entryId: entry.id, code: 'missing', message: 'Faltan la fecha, la entrada o la salida.' }); continue; }
    try {
      if (parseTime(entry.start) === parseTime(entry.end)) throw new Error('La entrada y la salida son iguales. Para un turno de 24 horas, regístralo en dos jornadas.');
      if (entry.contractDailyHours !== undefined && !(entry.contractDailyHours > 0 && entry.contractDailyHours <= 24)) throw new Error('Las horas diarias del contrato deben estar entre 0 y 24.');
      expanded.push(expand(entry));
    } catch (e) {
      alerts.push({ level: 'error', entryId: entry.id, code: 'invalid', message: e instanceof Error ? e.message : String(e) });
    }
  }

  // 2. Duplicados y solapamientos: la segunda jornada que se solapa no se cuenta, para no pagar dos veces las mismas horas.
  expanded.sort((a, b) => a.startAbs - b.startAbs || a.endAbs - b.endAbs);
  const kept: Expanded[] = [];
  for (const shift of expanded) {
    const clash = kept.find(k => shift.startAbs < k.endAbs && k.startAbs < shift.endAbs);
    if (clash) {
      const same = clash.startAbs === shift.startAbs && clash.endAbs === shift.endAbs;
      alerts.push({ level: 'error', entryId: shift.entry.id, code: same ? 'duplicate' : 'overlap', message: same ? 'Jornada duplicada: no se cuenta dos veces.' : `Se solapa con la jornada del ${clash.entry.date} (${clash.entry.start}–${clash.entry.end}); no se cuenta.` });
      continue;
    }
    kept.push(shift);
  }

  // 3. Calcular cada jornada en orden cronológico (los límites semanales dependen del orden).
  const weeklyOrdinary = new Map<number, number>(), weeklyExtra = new Map<number, number>();
  const weekly = settings.weeklyHours * 60;
  const typesByWeek = new Map<number, Set<ShiftType>>();
  let previous: { end: number; type: ShiftType } | undefined;

  for (const shift of kept) {
    const { entry } = shift;
    const worked = shift.minutes.filter(m => m.worked);
    const night = worked.map(m => isNightMinute(((m.abs % MIN_PER_DAY) + MIN_PER_DAY) % MIN_PER_DAY));
    const { type, startedAtNight } = classify(night);
    const legal = R.dailyMaxMinutes[type];
    const contract = entry.contractDailyHours !== undefined ? Math.round(entry.contractDailyHours * 60) : legal;
    const dailyLimit = Math.min(legal, contract);
    const week = weekOf(shift.startAbs);
    if (!typesByWeek.has(week)) typesByWeek.set(week, new Set());
    typesByWeek.get(week)!.add(type);
    // Los días con recargo propio no se suman al límite semanal ordinario (criterio: evita contar dos veces el mismo día de descanso).
    const countsWeekly = entry.dayKind === 'normal';
    const firstDay = parseDate(entry.date);

    const buckets = new Map<string, Bucket>();
    let ordinaryMinutes = 0, extraMinutes = 0, overLimitMinutes = 0, dayExtra = 0;
    worked.forEach((m, i) => {
      const isNight = night[i]!;
      const kind = Math.floor(m.abs / MIN_PER_DAY) === firstDay ? entry.dayKind : (entry.nextDayKind ?? 'normal');
      const daySurcharge = daySurchargeFor(kind, type);
      let ordinary = i < dailyLimit;
      if (ordinary && countsWeekly) {
        const used = weeklyOrdinary.get(week) ?? 0;
        if (used >= weekly) ordinary = false; else weeklyOrdinary.set(week, used + 1);
      }
      let overtimeSurcharge = 0, overLimit = false;
      if (!ordinary) {
        overtimeSurcharge = overtimeSurchargeFor(type, startedAtNight, isNight);
        const usedWeek = weeklyExtra.get(week) ?? 0;
        overLimit = dayExtra >= R.overtimeDailyLimitMinutes || usedWeek >= R.overtimeWeeklyLimitMinutes;
        dayExtra++; weeklyExtra.set(week, usedWeek + 1);
        extraMinutes++; if (overLimit) overLimitMinutes++;
      } else ordinaryMinutes++;
      const factor = chainFactor(daySurcharge, overtimeSurcharge, overLimit);
      // El salario fijo ya paga las horas ordinarias de los días normales y el descanso remunerado del feriado (art. 45).
      const covered = ordinary && (kind === 'normal' || kind === 'feriado') ? 1 : 0;
      const key = `${ordinary ? 'o' : 'x'}|${kind}|${daySurcharge}|${overtimeSurcharge}|${overLimit}`;
      const bucket = buckets.get(key) ?? { key, label: bucketLabel(ordinary, kind, daySurcharge, overtimeSurcharge, overLimit), minutes: 0, ordinary, daySurcharge, overtimeSurcharge, overLimit, factor, covered, pay: 0, additional: 0, rawPay: 0, rawAdditional: 0 };
      bucket.minutes++;
      buckets.set(key, bucket);
    });

    const list = [...buckets.values()].map(b => {
      const rawPay = (hourly * b.factor * b.minutes) / 60, rawAdditional = (hourly * (b.factor - b.covered) * b.minutes) / 60;
      return { ...b, rawPay, rawAdditional, pay: cents(rawPay), additional: cents(rawAdditional) };
    });
    const result: ShiftResult = {
      id: entry.id, date: entry.date, included: true, type, startedAtNight,
      workedMinutes: worked.length, ordinaryMinutes, extraMinutes, overLimitMinutes, nightMinutes: night.filter(Boolean).length,
      buckets: list, additional: sum(list.map(b => b.rawAdditional)), pay: sum(list.map(b => b.rawPay))
    };
    results.set(entry.id, result);

    // Alertas por jornada.
    if (dayExtra > R.overtimeDailyLimitMinutes) alerts.push({ level: 'warn', entryId: entry.id, code: 'daily-limit', message: `Supera el límite de 3 horas extraordinarias diarias (art. 36): ${formatMinutes(dayExtra - R.overtimeDailyLimitMinutes)} se pagan con 75% de recargo adicional. Se cuentan igualmente.` });
    if (entry.breakMinutes > 0 && entry.breakMinutes < R.breakMinMinutes) alerts.push({ level: 'info', entryId: entry.id, code: 'short-break', message: 'El art. 39 fija descansos de al menos 30 minutos dentro de la jornada.' });
    if (entry.breakMinutes > R.breakMaxMinutes) alerts.push({ level: 'info', entryId: entry.id, code: 'long-break', message: 'El art. 39 fija descansos de no más de 2 horas dentro de la jornada.' });
    if (shift.minutes.length > 16 * 60) alerts.push({ level: 'warn', entryId: entry.id, code: 'long-shift', message: 'Jornada de más de 16 horas: revisa la entrada y la salida.' });
    const holiday = holidayName(entry.date);
    if (holiday && entry.dayKind === 'normal') alerts.push({ level: 'warn', entryId: entry.id, code: 'holiday-hint', message: `${entry.date} es ${holiday}. Si es así en tu caso, marca el día como fiesta o duelo nacional.` });
    if (entry.dayKind === 'normal' && new Date(`${entry.date}T00:00:00Z`).getUTCDay() === 0) alerts.push({ level: 'info', entryId: entry.id, code: 'sunday-hint', message: 'Es domingo. Si es tu día de descanso semanal, márcalo para aplicar el recargo del 50% (art. 48).' });
    if (previous && previous.type !== type && shift.startAbs - previous.end < 12 * 60) alerts.push({ level: 'info', entryId: entry.id, code: 'rest-12h', message: 'Entre jornadas diurna y nocturna consecutivas debe haber al menos 12 horas de descanso (art. 39.3).' });
    previous = { end: shift.endAbs, type };
  }

  for (const [week, extra] of weeklyExtra) {
    if (extra > R.overtimeWeeklyLimitMinutes) alerts.push({ level: 'warn', code: 'weekly-limit', message: `La semana del ${isoFromDay(week * 7 - 3)} supera las 9 horas extraordinarias semanales (art. 36): el exceso lleva 75% de recargo adicional.` });
  }
  if ([...typesByWeek.values()].some(t => t.size > 1)) alerts.push({ level: 'info', code: 'rotating', message: 'Hay turnos rotativos con distintas jornadas en una misma semana. El salario debe ser uniforme (art. 32); confirma en tu contrato cuántas horas ordinarias semanales te corresponden.' });

  // 4. Período.
  if (kept.length) {
    const days = kept.map(k => Math.floor(k.startAbs / MIN_PER_DAY));
    const span = Math.max(...days) - Math.min(...days) + 1;
    const limit = settings.period === 'weekly' ? 7 : settings.period === 'fortnightly' ? 16 : 31;
    if (span > limit) alerts.push({ level: 'warn', code: 'period', message: `Las jornadas abarcan ${span} días, más que el período elegido. El salario del período no incluye esos días adicionales.` });
  }

  const shifts = entries.map(e => results.get(e.id)!);
  const included = shifts.filter(s => s.included);
  const distribution = mergeBuckets(included.flatMap(s => s.buckets));
  const additional = sum(distribution.map(b => b.rawAdditional));
  const ordinaryPay = fixed ? 0 : sum(distribution.filter(b => b.covered).map(b => (hourly * b.minutes) / 60));
  const ps = periodSalary(settings.salary, settings.basis, settings.period);
  return {
    hourly, shifts, alerts,
    days: new Set(included.map(s => s.date)).size,
    workedMinutes: sumInt(included.map(s => s.workedMinutes)),
    ordinaryMinutes: sumInt(included.map(s => s.ordinaryMinutes)),
    extraMinutes: sumInt(included.map(s => s.extraMinutes)),
    overLimitMinutes: sumInt(included.map(s => s.overLimitMinutes)),
    distribution, additional, ordinaryPay,
    periodSalary: ps === null ? null : cents(ps),
    grandTotal: included.length ? (ps === null ? cents(ordinaryPay + additional) : cents(ps + additional)) : null
  };
}

function bucketLabel(ordinary: boolean, kind: DayKind, day: number, ot: number, overLimit: boolean): string {
  const parts: string[] = [];
  if (ordinary) parts.push(kind === 'normal' ? 'Horas ordinarias' : 'Horas en ' + DAY_LABELS[kind].toLowerCase());
  else parts.push(`Extraordinarias +${Math.round(ot * 100)}%`);
  if (!ordinary && day) parts.push(`${DAY_LABELS[kind].toLowerCase()} +${Math.round(day * 100)}%`);
  else if (ordinary && day) parts.push(`+${Math.round(day * 100)}%`);
  if (overLimit) parts.push('exceso del límite +75%');
  return parts.join(' · ');
}

export const DAY_LABELS: Record<DayKind, string> = {
  normal: 'Día laborable',
  descanso: 'Domingo o descanso semanal',
  compensatorio: 'Día compensatorio',
  libre: 'Día libre de semana corta',
  feriado: 'Fiesta o duelo nacional'
};

function mergeBuckets(list: Bucket[]): Bucket[] {
  const map = new Map<string, Bucket>();
  for (const b of list) {
    const prev = map.get(b.key);
    map.set(b.key, prev ? { ...prev, minutes: prev.minutes + b.minutes, rawPay: prev.rawPay + b.rawPay, rawAdditional: prev.rawAdditional + b.rawAdditional } : { ...b });
  }
  return [...map.values()].map(b => ({ ...b, pay: cents(b.rawPay), additional: cents(b.rawAdditional) })).sort((a, b) => Number(a.ordinary) - Number(b.ordinary) || b.additional - a.additional);
}

/* ----------------------------------------------------------------------------------------------------------------- */
/* Feriados (art. 46): solo sugerencias; la persona decide el tipo de día.                                           */
/* ----------------------------------------------------------------------------------------------------------------- */

/** Domingo de Pascua (algoritmo anónimo gregoriano). */
export function easter(year: number): string {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function holidayName(iso: string): string | null {
  if (!DATE.test(iso)) return null;
  const year = Number(iso.slice(0, 4)), md = iso.slice(5);
  const fixed = R.holidays.fixed.find(h => h.date === md);
  if (fixed) return fixed.name;
  const e = parseDate(easter(year));
  const day = parseDate(iso);
  if (day === e - 47) return 'martes de carnaval (art. 46)';
  if (day === e - 2) return 'viernes santo (art. 46)';
  if (md === '07-01' && (year - R.holidays.inaugurationBaseYear) % 5 === 0) return 'la toma de posesión presidencial (art. 46)';
  // Art. 47: si la fiesta cae en domingo, el lunes siguiente es descanso obligatorio.
  const prev = isoFromDay(day - 1);
  if (new Date(`${iso}T00:00:00Z`).getUTCDay() === 1 && R.holidays.fixed.some(h => h.date === prev.slice(5))) return 'el lunes de descanso por una fiesta en domingo (art. 47)';
  return null;
}

/* ----------------------------------------------------------------------------------------------------------------- */
/* Utilidades                                                                                                         */
/* ----------------------------------------------------------------------------------------------------------------- */

export const cents = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const sum = (values: number[]) => cents(values.reduce((a, b) => a + b, 0));
const sumInt = (values: number[]) => values.reduce((a, b) => a + b, 0);

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60), m = total % 60;
  return m ? `${h} h ${String(m).padStart(2, '0')} min` : `${h} h`;
}

function assertAmount(value: number, name: string) {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} debe ser mayor que cero.`);
  if (value > 10_000_000) throw new Error(`${name} supera el límite técnico de 10,000,000.`);
}

/** Exporta el registro a CSV (separador «;» y coma decimal no: punto, para abrirlo en cualquier hoja de cálculo). */
export function toCsv(entries: readonly ShiftEntry[], result: LogResult): string {
  const esc = (v: string | number) => { const s = String(v); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const rows: (string | number)[][] = [['Fecha', 'Entrada', 'Salida', 'Descanso (min)', 'Tipo de día', 'Jornada', 'Minutos trabajados', 'Minutos ordinarios', 'Minutos extraordinarios', 'Minutos sobre el límite', 'Pago adicional (B/.)', 'Estado']];
  for (const e of entries) {
    const s = result.shifts.find(x => x.id === e.id);
    rows.push([e.date, e.start, e.end, e.breakMinutes, DAY_LABELS[e.dayKind], s?.type ?? '', s?.workedMinutes ?? 0, s?.ordinaryMinutes ?? 0, s?.extraMinutes ?? 0, s?.overLimitMinutes ?? 0, (s?.additional ?? 0).toFixed(2), s?.included ? 'Incluida' : 'No incluida']);
  }
  rows.push([], ['Valor de la hora ordinaria', result.hourly.toFixed(4)], ['Pago adicional total', result.additional.toFixed(2)], ['Estimación orientativa. Calcula Panamá: https://calculapanama.com/calculadoras/horas-extras/']);
  return '﻿' + rows.map(r => r.map(esc).join(';')).join('\r\n');
}
