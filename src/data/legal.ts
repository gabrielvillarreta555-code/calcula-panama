/**
 * Parámetros legales usados por las calculadoras.
 *
 * Cada valor indica la norma de la que procede. Antes de cambiar uno, verifica el
 * texto vigente, actualiza `reviewedOn` y añade o ajusta un caso en
 * `src/lib/calculations.test.ts`.
 */
export const LEGAL_PARAMETERS = {
  jurisdiction: 'Panamá',
  reviewedOn: '2026-10-24',
  salary: {
    /** Ley 51 de 2005, art. 101 num. 1 lit. d (cuota del empleado desde 2013; la Ley 462 de 2025 no la modificó). */
    socialSecurityEmployeeRate: 0.0975,
    /** Seguro Educativo, cuota del trabajador sobre el salario (no se aplica al décimo tercer mes). */
    educationalInsuranceEmployeeRate: 0.0125,
    /** Código Fiscal, art. 700: tarifa anual para personas naturales. */
    incomeTaxBrackets: [
      { from: 0, upTo: 11000, rate: 0, base: 0 },
      { from: 11000, upTo: 50000, rate: 0.15, base: 0 },
      { from: 50000, upTo: Number.POSITIVE_INFINITY, rate: 0.25, base: 5850 }
    ]
  },
  thirteenthMonth: {
    /** Práctica de cálculo: remuneración devengada en el período ÷ 12 (Decreto de Gabinete 221 de 1971). */
    divisor: 12,
    /** Ley 51 de 2005, art. 101 num. 5: contribución especial del empleado sobre cada partida. */
    socialSecurityEmployeeRate: 0.0725,
    /** Meses que cubre cada partida; sirve para estimar un período completo con salario fijo. */
    monthsPerPeriod: 4
  },
  vacation: {
    /** Código de Trabajo, art. 54: 30 días por cada 11 meses, a razón de un día por cada 11 días de servicio. */
    daysPerElevenMonths: 30,
    serviceDaysPerVacationDay: 11
  },
  termination: {
    /** Código de Trabajo, art. 224: una semana de salario por año (contratos por tiempo indefinido). */
    seniorityWeeksPerYear: 1,
    /** Código de Trabajo, art. 225 acápite C: relaciones iniciadas desde la vigencia de la Ley 44 de 1995. */
    indemnityWeeksFirstTenYears: 3.4,
    indemnityWeeksAfterTenYears: 1,
    /**
     * La Ley 44 es de 12 de agosto de 1995. Las relaciones que empezaron antes de septiembre
     * de 1995 se envían a revisión manual en lugar de suponer una fecha exacta de vigencia.
     */
    law44ReviewBefore: '1995-09-01'
  }
} as const;

export interface OfficialSource {
  institution: string;
  title: string;
  detail: string;
  url: string;
}

export const OFFICIAL_SOURCES = {
  laborCode: {
    institution: 'Órgano Judicial / MITRADEL',
    title: 'Código de Trabajo (con las reformas de la Ley 44 de 1995)',
    detail: 'Arts. 54 (vacaciones), 149 (salario base), 213 C, 223, 224, 225, 226 y 227 (prima e indemnizaciones).',
    url: 'https://www.organojudicial.gob.pa/uploads/wp_repo/uploads/2016/11/c%C3%B3digo-detrabajo.pdf'
  },
  css: {
    institution: 'Gaceta Oficial',
    title: 'Ley 51 de 2005, Orgánica de la Caja de Seguro Social',
    detail: 'Art. 101: cuota del empleado de 9.75% y contribución especial de 7.25% sobre cada partida del décimo tercer mes.',
    url: 'https://www.gacetaoficial.gob.pa/gacetas/25453_2005.pdf'
  },
  thirteenth: {
    institution: 'Gaceta Oficial (copia de LEGISPAN)',
    title: 'Decreto de Gabinete 221 de 1971, que establece el décimo tercer mes',
    detail: 'Tres partidas al año; la primera se trasladó al 15 de abril por el Decreto de Gabinete 52 de 1972.',
    url: 'https://docs.panama.justia.com/federales/decretos-de-gabinete/decreto-de-gabinete-221-de-1971-dec-1-1971.pdf'
  },
  incomeTax: {
    institution: 'Dirección General de Ingresos — MEF',
    title: 'Código Fiscal, art. 700, y Decreto Ejecutivo 170 de 1993',
    detail: 'Tarifa anual de personas naturales; la retención la practica el empleador según las tablas de la DGI (art. 140 del reglamento).',
    url: 'https://dgi.mef.gob.pa/'
  },
  mitradel: {
    institution: 'Ministerio de Trabajo y Desarrollo Laboral',
    title: 'Consultas y cálculo oficial de prestaciones',
    detail: 'Canal oficial para revisar un caso concreto o presentar una reclamación.',
    url: 'https://www.mitradel.gob.pa/'
  }
} satisfies Record<string, OfficialSource>;

export type SourceKey = keyof typeof OFFICIAL_SOURCES;
