import { describe, expect, it } from 'vitest';
import {
  calculateLog, calculateQuick, chainFactor, classify, easter, holidayName, hourlyRate, isNightMinute,
  overtimeSurchargeFor, periodSalary, toCsv, type ShiftEntry, type Settings
} from './overtime';

const base: Settings = { salary: 1040, basis: 'monthly', weeklyHours: 48, period: 'fortnightly' };
// 1040 ÷ (48 × 4⅓) = 1040 ÷ 208 = B/.5.00 exactos por hora: facilita verificar a mano.
let n = 0;
const shift = (date: string, start: string, end: string, extra: Partial<ShiftEntry> = {}): ShiftEntry =>
  ({ id: `s${++n}`, date, start, end, breakMinutes: 0, dayKind: 'normal', ...extra });
const one = (e: ShiftEntry, s: Settings = base) => calculateLog([e], s);

describe('conversión salarial (criterio 4⅓ semanas por mes, art. 54)', () => {
  it('mensual, quincenal, semanal y por hora', () => {
    expect(hourlyRate(1040, 'monthly', 48)).toBeCloseTo(5, 10);
    expect(hourlyRate(520, 'fortnightly', 48)).toBeCloseTo(5, 10);
    expect(hourlyRate(240, 'weekly', 48)).toBeCloseTo(5, 10);
    expect(hourlyRate(5, 'hourly', 48)).toBe(5);
    expect(hourlyRate(1000, 'monthly', 48)).toBeCloseTo(4.8077, 4);
  });
  it('jornada nocturna de 42 h semanales: la misma paga mensual vale más por hora (art. 31)', () => {
    expect(hourlyRate(910, 'monthly', 42)).toBeCloseTo(5, 10);
  });
  it('salario del período', () => {
    expect(periodSalary(1040, 'monthly', 'fortnightly')).toBe(520);
    expect(periodSalary(240, 'weekly', 'monthly')).toBeCloseTo(1040, 10);
    expect(periodSalary(5, 'hourly', 'monthly')).toBeNull();
  });
  it('rechaza salarios inválidos', () => {
    expect(() => hourlyRate(0, 'monthly', 48)).toThrow();
    expect(() => hourlyRate(Number.NaN, 'monthly', 48)).toThrow();
    expect(() => hourlyRate(1e9, 'monthly', 48)).toThrow();
    expect(() => hourlyRate(1000, 'monthly', 0)).toThrow();
  });
});

describe('recargos individuales y acumulación (arts. 33, 36, 48, 49 y 50)', () => {
  it('25%, 50% y 75%', () => {
    expect(calculateQuick({ salary: 1040, basis: 'monthly', weeklyHours: 48, minutes: 120, overtime: 'd25', day: 'normal', overLimit: false }).total).toBe(12.5);
    expect(calculateQuick({ salary: 1040, basis: 'monthly', weeklyHours: 48, minutes: 60, overtime: 'n50', day: 'normal', overLimit: false }).total).toBe(7.5);
    expect(calculateQuick({ salary: 1040, basis: 'monthly', weeklyHours: 48, minutes: 60, overtime: 'n75', day: 'normal', overLimit: false }).total).toBe(8.75);
  });
  it('domingo 50% y feriado 150%', () => {
    expect(calculateQuick({ salary: 5, basis: 'hourly', weeklyHours: 48, minutes: 480, overtime: 'none', day: 'descanso', overLimit: false }).total).toBe(60);
    expect(calculateQuick({ salary: 5, basis: 'hourly', weeklyHours: 48, minutes: 480, overtime: 'none', day: 'feriado', overLimit: false }).total).toBe(100);
  });
  it('se encadenan: primero el del día, luego el de horas extra y luego el del exceso (art. 50)', () => {
    expect(chainFactor(0.5, 0.25, false)).toBeCloseTo(1.875, 12);
    expect(chainFactor(1.5, 0.75, true)).toBeCloseTo(2.5 * 1.75 * 1.75, 12);
    const r = calculateQuick({ salary: 5, basis: 'hourly', weeklyHours: 48, minutes: 60, overtime: 'd25', day: 'feriado', overLimit: true });
    expect(r.hourValue).toBeCloseTo(5 * 2.5 * 1.25 * 1.75, 10);
    expect(r.total).toBe(27.34);
    expect(r.base).toBe(5);
    expect(r.surcharge).toBe(22.34);
  });
  it('minutos y redondeo a centavos solo al final', () => {
    const r = calculateQuick({ salary: 1000, basis: 'monthly', weeklyHours: 48, minutes: 125, overtime: 'd25', day: 'normal', overLimit: false });
    // 4.807692… × 1.25 × 125/60 = 12.5200…
    expect(r.total).toBe(12.52);
    expect(r.base).toBe(10.02);
    expect(r.surcharge).toBe(2.5);
  });
  it('valida el modo rápido', () => {
    const q = { salary: 1000, basis: 'monthly' as const, weeklyHours: 48, minutes: 60, overtime: 'none' as const, day: 'normal' as const, overLimit: false };
    expect(() => calculateQuick(q)).toThrow(/recargo/);
    expect(() => calculateQuick({ ...q, overtime: 'd25', minutes: 0 })).toThrow();
    expect(() => calculateQuick({ ...q, overtime: 'd25', minutes: 1.5 })).toThrow();
    expect(() => calculateQuick({ ...q, overLimit: true, day: 'descanso' })).toThrow(/límite/);
  });
});

describe('clasificación de la jornada (art. 30) y recargo de cada hora extra (art. 33)', () => {
  it('período nocturno de 6 p.m. a 6 a.m.', () => {
    expect(isNightMinute(5 * 60 + 59)).toBe(true);
    expect(isNightMinute(6 * 60)).toBe(false);
    expect(isNightMinute(17 * 60 + 59)).toBe(false);
    expect(isNightMinute(18 * 60)).toBe(true);
  });
  it('más de tres horas nocturnas convierten la jornada en nocturna', () => {
    expect(classify([...Array(180).fill(false), ...Array(180).fill(true)]).type).toBe('mixta');
    expect(classify([...Array(180).fill(false), ...Array(181).fill(true)]).type).toBe('nocturna');
    expect(classify(Array(120).fill(true)).type).toBe('nocturna');
    expect(classify(Array(480).fill(false)).type).toBe('diurna');
  });
  it('recargo según jornada y período', () => {
    expect(overtimeSurchargeFor('diurna', false, false)).toBe(0.25);
    expect(overtimeSurchargeFor('diurna', false, true)).toBe(0.5);
    expect(overtimeSurchargeFor('mixta', false, true)).toBe(0.5);
    expect(overtimeSurchargeFor('mixta', true, false)).toBe(0.75);
    expect(overtimeSurchargeFor('nocturna', true, false)).toBe(0.75);
  });
});

describe('turnos de prueba del encargo', () => {
  it('7:00 a 15:00: diurna, sin extras', () => {
    const r = one(shift('2026-11-02', '07:00', '15:00'));
    expect(r.shifts[0]).toMatchObject({ type: 'diurna', ordinaryMinutes: 480, extraMinutes: 0 });
    expect(r.additional).toBe(0);
  });
  it('15:00 a 23:00: cinco horas nocturnas → nocturna de 7 h; la octava es extra al 75%', () => {
    const r = one(shift('2026-11-02', '15:00', '23:00'));
    expect(r.shifts[0]).toMatchObject({ type: 'nocturna', ordinaryMinutes: 420, extraMinutes: 60 });
    expect(r.additional).toBe(8.75);
  });
  it('23:00 a 7:00 cruza la medianoche: nocturna, 1 h extra al 75%', () => {
    const r = one(shift('2026-11-02', '23:00', '07:00'));
    expect(r.shifts[0]).toMatchObject({ type: 'nocturna', workedMinutes: 480, extraMinutes: 60 });
    expect(r.additional).toBe(8.75);
  });
  it('1:00 a 8:30 con 30 min de descanso: 7 h trabajadas, nocturna, sin extras', () => {
    const r = one(shift('2026-11-02', '01:00', '08:30', { breakMinutes: 30 }));
    expect(r.shifts[0]).toMatchObject({ type: 'nocturna', workedMinutes: 420, extraMinutes: 0 });
  });
  it('turno de 12 h diurno: 4 h extra al 25%, la cuarta además +75% por superar 3 h diarias', () => {
    const r = one(shift('2026-11-02', '06:00', '18:00'));
    expect(r.shifts[0]).toMatchObject({ type: 'diurna', extraMinutes: 240, overLimitMinutes: 60 });
    // 3 × 5 × 1.25 + 1 × 5 × 1.25 × 1.75 = 18.75 + 10.9375
    expect(r.additional).toBe(29.69);
    expect(r.alerts.some(a => a.code === 'daily-limit')).toBe(true);
  });
  it('turno de 12 h nocturno: 5 h extra al 75%, 2 h sobre el límite', () => {
    const r = one(shift('2026-11-02', '18:00', '06:00'));
    expect(r.shifts[0]).toMatchObject({ type: 'nocturna', extraMinutes: 300, overLimitMinutes: 120 });
    // 3 × 5 × 1.75 + 2 × 5 × 1.75 × 1.75 = 26.25 + 30.625
    expect(r.additional).toBe(56.88);
  });
  it('diurna que se prolonga de noche: la hora extra nocturna lleva 50%', () => {
    const r = one(shift('2026-11-02', '10:00', '20:00'));
    expect(r.shifts[0]!.type).toBe('diurna');
    expect(r.additional).toBe(5 * 1.5 * 2);
  });
  it('mixta iniciada de día y de noche', () => {
    expect(one(shift('2026-11-02', '12:00', '21:00')).shifts[0]).toMatchObject({ type: 'mixta', startedAtNight: false, extraMinutes: 90 });
    expect(one(shift('2026-11-02', '12:00', '21:00')).additional).toBe(11.25);
    const night = one(shift('2026-11-02', '04:00', '12:30'));
    expect(night.shifts[0]).toMatchObject({ type: 'mixta', startedAtNight: true, extraMinutes: 60 });
    expect(night.additional).toBe(8.75);
  });
  it('no todas las horas nocturnas son extraordinarias', () => {
    const r = one(shift('2026-11-02', '22:00', '05:00'));
    expect(r.shifts[0]).toMatchObject({ type: 'nocturna', nightMinutes: 420, extraMinutes: 0 });
  });
  it('turno en feriado que cruza a un día normal', () => {
    const r = one(shift('2026-11-02', '22:00', '06:00', { dayKind: 'feriado', nextDayKind: 'normal' }));
    // 2 h en feriado (salario fijo ya paga 1 → adicional 1.5) + 5 h normales ordinarias + 1 h extra 75%.
    expect(r.additional).toBe(2 * 5 * 1.5 + 5 * 1.75);
  });
});

describe('domingos, descansos y feriados (arts. 45, 48 y 49)', () => {
  it('domingo de descanso: el salario fijo no cubre esas horas → 1.5 × hora', () => {
    expect(one(shift('2026-11-01', '07:00', '15:00', { dayKind: 'descanso' })).additional).toBe(60);
  });
  it('feriado con salario fijo: el descanso ya está pagado (art. 45) → adicional 150%', () => {
    const r = one(shift('2026-11-03', '07:00', '15:00', { dayKind: 'feriado' }));
    expect(r.additional).toBe(60);
    expect(r.distribution[0]!.pay).toBe(100);
  });
  it('feriado con salario por hora: total 250%', () => {
    const r = one(shift('2026-11-03', '07:00', '15:00', { dayKind: 'feriado' }), { ...base, salary: 5, basis: 'hourly' });
    expect(r.ordinaryPay + r.additional).toBe(100);
  });
  it('domingo con horas extra se encadena: 1.5 × 1.25', () => {
    const r = one(shift('2026-11-01', '07:00', '17:00', { dayKind: 'descanso' }));
    expect(r.additional).toBe(8 * 5 * 1.5 + 2 * 5 * 1.875);
  });
  it('día libre de semana corta: 50% diurna, 75% nocturna', () => {
    expect(one(shift('2026-11-07', '07:00', '15:00', { dayKind: 'libre' })).additional).toBe(60);
    expect(one(shift('2026-11-07', '22:00', '05:00', { dayKind: 'libre', nextDayKind: 'libre' })).additional).toBe(7 * 5 * 1.75);
  });
  it('compensatorio 50%', () => {
    expect(one(shift('2026-11-04', '07:00', '11:00', { dayKind: 'compensatorio' })).additional).toBe(30);
  });
  it('sugiere los feriados del art. 46 sin cambiar el tipo de día', () => {
    expect(easter(2026)).toBe('2026-04-05');
    expect(easter(2027)).toBe('2027-03-28');
    expect(holidayName('2026-02-17')).toMatch(/carnaval/);
    expect(holidayName('2026-04-03')).toMatch(/viernes santo/);
    expect(holidayName('2026-11-03')).toMatch(/3 de noviembre/);
    expect(holidayName('2029-07-01')).toMatch(/posesión/);
    expect(holidayName('2027-07-01')).toBeNull();
    expect(holidayName('2026-12-21')).toMatch(/art. 47/); // 20 de diciembre de 2026 cae en domingo
    expect(holidayName('2026-11-11')).toBeNull();
    const r = one(shift('2026-11-03', '07:00', '15:00'));
    expect(r.alerts.some(a => a.code === 'holiday-hint')).toBe(true);
    expect(r.additional).toBe(0);
  });
});

describe('límites legales y registros múltiples', () => {
  it('más de 9 h extra en la semana: el exceso se paga con 75% adicional y no se elimina', () => {
    const week = ['02', '03', '04', '05', '06', '07'].map(d => shift(`2026-11-${d}`, '06:00', '16:00'));
    const r = calculateLog(week, base);
    expect(r.extraMinutes).toBe(720);
    expect(r.overLimitMinutes).toBe(180);
    expect(r.additional).toBe(cents(9 * 5 * 1.25 + 3 * 5 * 1.25 * 1.75));
    expect(r.alerts.some(a => a.code === 'weekly-limit')).toBe(true);
  });
  it('límite semanal contractual inferior: las horas ordinarias que lo superan son extraordinarias (art. 33)', () => {
    const week = ['02', '03', '04', '05', '06'].map(d => shift(`2026-11-${d}`, '07:00', '15:00'));
    const r = calculateLog(week, { ...base, weeklyHours: 32 });
    expect(r.ordinaryMinutes).toBe(32 * 60);
    expect(r.extraMinutes).toBe(8 * 60);
  });
  it('límite diario contractual inferior', () => {
    const r = one(shift('2026-11-02', '07:00', '15:00', { contractDailyHours: 6 }));
    expect(r.shifts[0]!.extraMinutes).toBe(120);
  });
  it('la semana empieza el lunes', () => {
    const r = calculateLog([shift('2026-11-08', '06:00', '16:00'), ...['09', '10', '11', '12', '13'].map(d => shift(`2026-11-${d}`, '06:00', '16:00'))], base);
    expect(r.overLimitMinutes).toBe(60);
  });
  it('suma varios días y cuenta días distintos', () => {
    const r = calculateLog([shift('2026-11-02', '07:00', '17:00'), shift('2026-11-03', '07:00', '16:00')], base);
    expect(r.days).toBe(2);
    expect(r.extraMinutes).toBe(180);
    expect(r.additional).toBe(18.75);
    expect(r.periodSalary).toBe(520);
    expect(r.grandTotal).toBe(538.75);
  });
});

describe('descansos', () => {
  it('el descanso no pagado se descuenta; si es tiempo de comida obligatorio en el local, cuenta (art. 34)', () => {
    expect(one(shift('2026-11-02', '07:00', '16:00', { breakMinutes: 60 })).shifts[0]!.extraMinutes).toBe(0);
    expect(one(shift('2026-11-02', '07:00', '16:00', { breakMinutes: 60, breakPaid: true })).shifts[0]!.extraMinutes).toBe(60);
  });
  it('la hora del descanso cambia qué minutos son nocturnos', () => {
    const late = one(shift('2026-11-02', '13:00', '22:00', { breakMinutes: 60, breakStart: '18:00' }));
    expect(late.shifts[0]).toMatchObject({ nightMinutes: 180, type: 'mixta' });
  });
  it('avisa de descansos fuera del art. 39', () => {
    expect(one(shift('2026-11-02', '07:00', '16:00', { breakMinutes: 15 })).alerts.some(a => a.code === 'short-break')).toBe(true);
    expect(one(shift('2026-11-02', '07:00', '19:00', { breakMinutes: 150 })).alerts.some(a => a.code === 'long-break')).toBe(true);
  });
});

describe('datos inválidos, duplicados y alertas', () => {
  it('descanso mayor que el tiempo trabajado', () => {
    const r = one(shift('2026-11-02', '07:00', '08:00', { breakMinutes: 60 }));
    expect(r.shifts[0]!.included).toBe(false);
    expect(r.alerts[0]!.level).toBe('error');
  });
  it('horas y fechas inválidas, entrada igual a salida y datos que faltan', () => {
    for (const bad of [shift('2026-11-02', '25:00', '08:00'), shift('2026-02-30', '07:00', '08:00'), shift('2026-11-02', '07:00', '07:00'), shift('', '07:00', '08:00'), shift('2026-11-02', '07:00', '15:00', { breakMinutes: -5 })]) {
      const r = one(bad);
      expect(r.shifts[0]!.included).toBe(false);
      expect(r.alerts.some(a => a.level === 'error')).toBe(true);
    }
  });
  it('duplicados y solapamientos no se cuentan dos veces', () => {
    const a = shift('2026-11-02', '07:00', '17:00');
    const r = calculateLog([a, { ...a, id: 'copia' }, shift('2026-11-02', '16:00', '18:00')], base);
    expect(r.extraMinutes).toBe(120);
    expect(r.alerts.filter(x => x.code === 'duplicate')).toHaveLength(1);
    expect(r.alerts.filter(x => x.code === 'overlap')).toHaveLength(1);
  });
  it('turnos rotativos, descanso de 12 h entre jornadas y período excedido', () => {
    const r = calculateLog([shift('2026-11-02', '07:00', '15:00'), shift('2026-11-02', '23:00', '06:00'), shift('2026-11-20', '07:00', '15:00')], { ...base, period: 'weekly' });
    expect(r.alerts.map(a => a.code)).toEqual(expect.arrayContaining(['rest-12h', 'period']));
    expect(r.conditional.map(c => c.code)).toContain('rotating');
  });
  it('CSV con encabezado, filas y totales, sin datos personales', () => {
    const e = [shift('2026-11-02', '07:00', '17:00')];
    const csv = toCsv(e, calculateLog(e, base));
    expect(csv.startsWith('﻿Fecha;Entrada;Salida')).toBe(true);
    expect(csv).toContain('2026-11-02;07:00;17:00;0;Día laborable;diurna;600;480;120;0;12.50;Incluida');
  });
});

describe('horario ordinario contratado (arts. 30 y 33)', () => {
  it('clasifica por el horario pactado: entrar antes de un horario diurno es extra, no jornada mixta', () => {
    // Contrato 10:00–18:00 (diurno). Trabaja 05:00–18:00: 05–06 es extra nocturna (50%), 06–10 extra diurna (25%).
    const sin = one(shift('2026-11-02', '05:00', '18:00'));
    expect(sin.shifts[0]!.type).toBe('mixta');
    const con = one(shift('2026-11-02', '05:00', '18:00', { contractStart: '10:00', contractEnd: '18:00' }));
    expect(con.shifts[0]).toMatchObject({ type: 'diurna', ordinaryMinutes: 480, extraMinutes: 300, overLimitMinutes: 120 });
    // 1 h × 1.5 + 2 h × 1.25 + 2 h × 1.25 × 1.75 (las dos últimas superan las 3 h diarias, art. 36)
    expect(con.additional).toBe(cents(5 * (1.5 + 2 * 1.25 + 2 * 1.25 * 1.75)));
  });
  it('salir después del horario contratado: la prolongación es extra con el recargo de su jornada', () => {
    const r = one(shift('2026-11-02', '22:00', '06:00', { contractStart: '22:00', contractEnd: '05:00' }));
    expect(r.shifts[0]).toMatchObject({ type: 'nocturna', ordinaryMinutes: 420, extraMinutes: 60 });
    expect(r.additional).toBe(8.75);
  });
  it('un horario que empezó el día anterior se reconoce en jornadas después de medianoche', () => {
    const r = one(shift('2026-11-03', '01:00', '07:00', { contractStart: '23:00', contractEnd: '06:00' }));
    expect(r.shifts[0]).toMatchObject({ type: 'nocturna', ordinaryMinutes: 300, extraMinutes: 60 });
  });
  it('el descanso se ubica dentro del horario contratado y se descuenta', () => {
    const r = one(shift('2026-11-02', '06:00', '15:00', { contractStart: '07:00', contractEnd: '15:00', breakMinutes: 60 }));
    expect(r.shifts[0]).toMatchObject({ workedMinutes: 480, ordinaryMinutes: 420, extraMinutes: 60 });
  });
  it('un horario contratado mayor que el máximo legal genera extras y un aviso', () => {
    const r = one(shift('2026-11-02', '07:00', '17:00', { contractStart: '07:00', contractEnd: '17:00' }));
    expect(r.shifts[0]!.extraMinutes).toBe(120);
    expect(r.alerts.some(a => a.code === 'contract-over-legal')).toBe(true);
  });
  it('horario incompleto o sin coincidencia', () => {
    expect(one(shift('2026-11-02', '07:00', '15:00', { contractStart: '07:00' })).alerts[0]!.level).toBe('error');
    const r = one(shift('2026-11-02', '07:00', '15:00', { contractStart: '18:00', contractEnd: '23:00' }));
    expect(r.alerts.some(a => a.code === 'contract-outside')).toBe(true);
    expect(r.shifts[0]!.included).toBe(true);
  });
});

describe('estimaciones condicionadas y criterios confirmados', () => {
  it('salario fijo: el divisor de 4⅓ semanas se marca como condicionado; por hora, no', () => {
    expect(one(shift('2026-11-02', '07:00', '17:00')).conditional.map(c => c.code)).toEqual(['divisor']);
    expect(one(shift('2026-11-02', '07:00', '17:00'), { ...base, salary: 5, basis: 'hourly' }).conditional).toEqual([]);
  });
  it('domingo con salario fijo: muestra también la lectura alternativa (solo el recargo)', () => {
    const r = one(shift('2026-11-01', '07:00', '15:00', { dayKind: 'descanso' }));
    expect(r.additional).toBe(60);
    expect(r.conditional.find(c => c.code === 'rest-fixed')!.altAdditional).toBe(20);
    const q = calculateQuick({ salary: 1040, basis: 'monthly', weeklyHours: 48, minutes: 480, overtime: 'none', day: 'descanso', overLimit: false });
    expect(q.conditional.find(c => c.code === 'rest-fixed')!.altAdditional).toBe(20);
  });
  it('feriado: coincide con el ejemplo oficial de MITRADEL (20 + 30 = 50 por el día)', () => {
    const r = one(shift('2026-11-03', '07:00', '15:00', { dayKind: 'feriado' }), { ...base, salary: 2.5, basis: 'hourly' });
    expect(r.ordinaryPay).toBe(20);
    expect(r.additional).toBe(30);
    expect(r.conditional).toEqual([]);
  });
  it('20 de diciembre: duelo nacional por la Ley 291 de 2022', () => {
    expect(holidayName('2027-12-20')).toMatch(/Ley 291 de 2022/);
  });
});

function cents(v: number) { return Math.round((v + Number.EPSILON) * 100) / 100; }
