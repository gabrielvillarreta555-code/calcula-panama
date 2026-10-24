export const LEGAL_PARAMETERS = {
  jurisdiction: 'Panamá',
  reviewedOn: '2026-10-23',
  salary: {
    socialSecurityEmployeeRate: 0.0975,
    educationalInsuranceEmployeeRate: 0.0125,
    incomeTaxBrackets: [
      { upTo: 11000, rate: 0 },
      { upTo: 50000, rate: 0.15 },
      { upTo: Number.POSITIVE_INFINITY, rate: 0.25 }
    ]
  },
  thirteenthMonth: {
    divisor: 12,
    socialSecurityEmployeeRate: 0.0725
  },
  termination: {
    vacationDivisor: 11,
    seniorityWeeksPerYear: 1,
    indemnityWeeksFirstTenYears: 3.4,
    indemnityWeeksAfterTenYears: 1
  }
} as const;

export const OFFICIAL_SOURCES = [
  {
    institution: 'Caja de Seguro Social',
    title: 'Ley 51 de 2005, Orgánica de la Caja de Seguro Social (y reformas)',
    url: 'https://www.css.gob.pa/ley-organica/'
  },
  {
    institution: 'Dirección General de Ingresos — MEF',
    title: 'Impuesto sobre la renta — personas naturales',
    url: 'https://dgi.mef.gob.pa/'
  },
  {
    institution: 'Ministerio de Trabajo y Desarrollo Laboral',
    title: 'Código de Trabajo de la República de Panamá',
    url: 'https://www.mitradel.gob.pa/'
  },
  {
    institution: 'Asamblea Nacional',
    title: 'Ley 52 de 1974 — décimo tercer mes',
    url: 'https://www.asamblea.gob.pa/'
  }
] as const;
