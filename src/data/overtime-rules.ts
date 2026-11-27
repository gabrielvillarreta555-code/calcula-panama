/**
 * Parámetros de la calculadora de horas extras (CP-TOOL-008), con su fundamento.
 *
 * Texto consultado: Código de Trabajo, recopilación de normas laborales de MITRADEL / Proyecto MATAC (OIT), copia
 * publicada por el Órgano Judicial (OFFICIAL_SOURCES.laborCode). Antes de cambiar un valor, verifica el texto vigente,
 * actualiza `reviewedOn` y ajusta src/lib/overtime.test.ts.
 */
export const OVERTIME_RULES = {
  reviewedOn: '2026-11-27',
  /** Art. 30: período diurno de 6 a.m. a 6 p.m.; nocturno de 6 p.m. a 6 a.m. (minutos desde medianoche). */
  dayStarts: 6 * 60,
  nightStarts: 18 * 60,
  /** Art. 30: la jornada es mixta si no abarca más de tres horas del período nocturno; con más, es nocturna. */
  mixedMaxNightMinutes: 3 * 60,
  /** Art. 31: jornada máxima diurna 8 h, nocturna 7 h, mixta 7 h 30 min. */
  dailyMaxMinutes: { diurna: 8 * 60, nocturna: 7 * 60, mixta: 7 * 60 + 30 },
  /** Art. 31: semana laborable de hasta 48, 42 y 45 horas. */
  weeklyMaxHours: { diurna: 48, nocturna: 42, mixta: 45 },
  /** Art. 33: recargos de la jornada extraordinaria. */
  overtime: {
    /** Num. 1: en el período diurno. */
    day: 0.25,
    /** Num. 2: en el período nocturno, o prolongación de la jornada mixta iniciada en el período diurno. */
    night: 0.5,
    /** Num. 3: prolongación de la jornada nocturna o de la mixta iniciada en el período nocturno. */
    nightExtension: 0.75
  },
  /** Art. 36 num. 4: no más de 3 horas extraordinarias en un día ni 9 en una semana. */
  overtimeDailyLimitMinutes: 3 * 60,
  overtimeWeeklyLimitMinutes: 9 * 60,
  /** Art. 36, último párrafo: el excedente de esos límites se paga con 75% de recargo adicional. */
  overLimitSurcharge: 0.75,
  day: {
    /** Art. 48: domingo o cualquier otro día de descanso semanal obligatorio, 50% sobre la jornada ordinaria. */
    restDay: 0.5,
    /** Arts. 48 y 49, segundos párrafos: trabajo en el día compensatorio, 50%. */
    compensatory: 0.5,
    /** Art. 49: fiesta o duelo nacional, 150% sobre el salario de la jornada ordinaria (incluye la remuneración del descanso). */
    holiday: 1.5,
    /** Art. 49, tercer párrafo: días libres por jornadas semanales de menos de seis días, 50% en jornada diurna… */
    shortWeekDay: 0.5,
    /** …y 75% en jornada mixta o nocturna. */
    shortWeekNightOrMixed: 0.75
  },
  /** Art. 39 num. 1: descansos dentro de la jornada de no menos de media hora ni más de dos horas. */
  breakMinMinutes: 30,
  breakMaxMinutes: 120,
  /**
   * Criterio de cálculo, no fijado por el Código para las horas extras: un mes equivale a 4⅓ semanas, la misma
   * equivalencia que usa el art. 54 num. 2 («cuatro semanas y un tercio») para pagar vacaciones.
   */
  weeksPerMonth: 13 / 3,
  holidays: {
    /** Art. 46 (Leyes 55 y 305 de 2001). El 20 de diciembre figura como pendiente de confirmar su norma. */
    fixed: [
      { date: '01-01', name: 'el 1 de enero (art. 46)' },
      { date: '01-09', name: 'el 9 de enero, día de los mártires (art. 46)' },
      { date: '05-01', name: 'el 1 de mayo (art. 46)' },
      { date: '11-03', name: 'el 3 de noviembre (art. 46)' },
      { date: '11-05', name: 'el 5 de noviembre (art. 46)' },
      { date: '11-10', name: 'el 10 de noviembre (art. 46)' },
      { date: '11-28', name: 'el 28 de noviembre (art. 46)' },
      { date: '12-08', name: 'el 8 de diciembre (art. 46)' },
      { date: '12-20', name: 'el 20 de diciembre, día de duelo nacional (norma pendiente de verificar en la Gaceta Oficial)' },
      { date: '12-25', name: 'el 25 de diciembre (art. 46)' }
    ],
    /** Art. 46 num. 8: día de la toma de posesión presidencial (1 de julio cada cinco años desde 2024). */
    inaugurationBaseYear: 2024
  }
} as const;
