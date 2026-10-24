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
    /** Ley 51 de 2005, texto único de 2025 (con la Ley 462), art. 96 num. 1. Base: art. 85 (incluye comisiones y vacaciones). */
    socialSecurityEmployeeRate: 0.0975,
    /** Decreto de Gabinete 168 de 1971, art. 1 (Ley 13 de 1987): 1.25% de los «salarios básicos recibidos». */
    educationalInsuranceEmployeeRate: 0.0125,
    /** Código Fiscal, art. 709 num. 2 (Ley 8 de 2010, art. 25): deducción por declaración conjunta de cónyuges. */
    jointFilingDeduction: 800,
    /** Código Fiscal, art. 700 (Ley 8 de 2010, art. 10): tarifa anual para personas naturales. */
    incomeTaxBrackets: [
      { from: 0, upTo: 11000, rate: 0, base: 0 },
      { from: 11000, upTo: 50000, rate: 0.15, base: 0 },
      { from: 50000, upTo: Number.POSITIVE_INFINITY, rate: 0.25, base: 5850 }
    ]
  },
  thirteenthMonth: {
    /**
     * El DG 221 de 1971 (art. 2) fija «un día de salario por cada once días de trabajo efectivo» y el Decreto 19
     * de 1973 (art. 4) manda calcular cada partida sobre lo percibido en su período. La práctica de planillas lo
     * expresa como lo devengado en el período ÷ 12; la calculadora sigue esa práctica y lo advierte.
     */
    divisor: 12,
    /** Ley 51 de 2005, texto único de 2025, art. 96 num. 5: contribución especial del empleado sobre cada partida. */
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
    law44ReviewBefore: '1995-09-01',
    /** Art. 212 num. 1: con menos de dos años el despido sin causa exige indemnización y preaviso de 30 días. */
    stabilityYears: 2,
    noticeDays: 30,
    /** Art. 78: período probatorio de hasta tres meses (se usa el máximo posible, 92 días, para el aviso). */
    probationMaxDays: 92,
    /** Código Fiscal art. 701 lit. j y DE 170 de 1993 art. 119: ISR sobre prima, indemnización y preaviso. */
    taxDeductionPerYear: 0.01,
    taxFixedDeduction: 5000
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
    detail: 'Arts. 54 (vacaciones), 74, 75 y 77 (contratos definidos), 78 (período probatorio), 149 (salario base), 212 (preaviso), 213 C, 215, 223, 224, 225, 226 y 227 (prima e indemnizaciones).',
    url: 'https://www.organojudicial.gob.pa/uploads/wp_repo/uploads/2016/11/c%C3%B3digo-detrabajo.pdf'
  },
  css: {
    institution: 'Caja de Seguro Social (Gaceta Oficial 30284-B de 2025)',
    title: 'Texto único de la Ley 51 de 2005, con las reformas de la Ley 462 de 2025',
    detail: 'Art. 85 (qué es salario: incluye comisiones y vacaciones), art. 86 (no son salario el décimo, el preaviso, la indemnización ni la prima de antigüedad) y art. 96 (9.75% del empleado; 7.25% sobre el décimo).',
    url: 'https://www.css.gob.pa/wp-content/uploads/2025/05/TEXTO-UNICO-DE-LA-LEY-51-DE-2005-CSS-GACETA-OFICIAL-22-5-25.pdf'
  },
  educationalInsurance: {
    institution: 'Gaceta Oficial (copia de LEGISPAN)',
    title: 'Ley 13 de 1987, que modifica el Decreto de Gabinete 168 de 1971 (Seguro Educativo)',
    detail: 'Art. 1: 1.25% de los salarios básicos recibidos, aportado por el empleado.',
    url: 'https://docs.panama.justia.com/federales/leyes/13-de-1987-aug-5-1987.pdf'
  },
  thirteenth: {
    institution: 'Gaceta Oficial (copia de LEGISPAN)',
    title: 'Decreto de Gabinete 221 de 1971, que establece el décimo tercer mes',
    detail: 'Art. 2: un día de salario por cada once días de trabajo efectivo. Art. 3 (DG 52 de 1972): pagos el 15 de abril, 15 de agosto y 15 de diciembre.',
    url: 'https://docs.panama.justia.com/federales/decretos-de-gabinete/decreto-de-gabinete-221-de-1971-dec-1-1971.pdf'
  },
  thirteenthRegulation: {
    institution: 'Gaceta Oficial 17.436 de 1973',
    title: 'Decreto 19 de 1973, que regula el alcance del décimo tercer mes',
    detail: 'Art. 4: cada partida se calcula sobre los salarios del período, con horas extra, comisiones, primas, vacaciones y licencias pagadas.',
    url: 'https://www.sijusa.com/wp-content/uploads/2021/05/d_19_1973_Lab.pdf'
  },
  incomeTax: {
    institution: 'Dirección General de Ingresos — MEF (Gaceta Oficial 26489-A)',
    title: 'Ley 8 de 2010: Código Fiscal, arts. 700, 704 y 709',
    detail: 'Tarifa anual (art. 700), retención del empleador «aplicando proporcionalmente la tarifa» tras las deducciones (art. 704) y deducción de B/.800 por declaración conjunta (art. 709).',
    url: 'https://dgi.mef.gob.pa/itbms/Normativa/Ley-8-15-marzo-2010.pdf'
  },
  incomeTaxRegulation: {
    institution: 'Texto compilado no oficial (impuestospanama.com)',
    title: 'Decreto Ejecutivo 170 de 1993, reglamento del ISR, actualizado a 2010',
    detail: 'Art. 119: ISR de preaviso, prima e indemnización; art. 140: retención según tablas de la DGI; deducción del Seguro Educativo derogada por el DE 98 de 2010.',
    url: 'https://www.impuestospanama.com/images/docs/decretos_ejecutivos_fiscales/Decreto_Ejecutivo_Fiscal_170_de_1993_Actualizado_al_2010.pdf'
  },
  mitradel: {
    institution: 'Ministerio de Trabajo y Desarrollo Laboral',
    title: 'Consultas y cálculo oficial de prestaciones',
    detail: 'Canal oficial para revisar un caso concreto o presentar una reclamación.',
    url: 'https://www.mitradel.gob.pa/'
  }
} satisfies Record<string, OfficialSource>;

export type SourceKey = keyof typeof OFFICIAL_SOURCES;
