import { LEGAL_PARAMETERS } from '../data/legal';

const { salary: SALARY, thirteenthMonth: THIRTEENTH, vacation: VACATION, termination: TERMINATION } = LEGAL_PARAMETERS;

export type Frequency = 'monthly' | 'fortnightly' | 'biweekly' | 'weekly';
export const PAYMENTS_PER_YEAR: Record<Frequency, number> = { monthly: 12, fortnightly: 24, biweekly: 26, weekly: 52 };

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/* ------------------------------------------------------------------ fechas */

const DAY_MS = 86_400_000;

function parseIsoDate(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Las fechas no son válidas.');
  const time = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== value) throw new Error('Las fechas no son válidas.');
  return time;
}

function addDays(date: string, amount: number): string {
  return new Date(parseIsoDate(date) + amount * DAY_MS).toISOString().slice(0, 10);
}

/** Días naturales entre dos fechas, ambas incluidas. */
export function daysInclusive(start: string, end: string): number {
  const a = parseIsoDate(start);
  const b = parseIsoDate(end);
  if (b < a) throw new Error('La fecha final debe ser igual o posterior a la inicial.');
  return Math.round((b - a) / DAY_MS) + 1;
}

/* ---------------------------------------------------------- impuesto (ISR) */

/** Impuesto anual según la tarifa del art. 700 del Código Fiscal. */
export function calculateAnnualIncomeTax(taxableAnnual: number): number {
  if (!(taxableAnnual > 0)) return 0;
  const bracket = SALARY.incomeTaxBrackets.find(b => taxableAnnual <= b.upTo) ?? SALARY.incomeTaxBrackets[SALARY.incomeTaxBrackets.length - 1]!;
  return roundMoney(bracket.base + (taxableAnnual - bracket.from) * bracket.rate);
}

export function marginalIncomeTaxRate(taxableAnnual: number): number {
  return SALARY.incomeTaxBrackets.find(b => taxableAnnual <= b.upTo)?.rate ?? 0;
}

/** Proporción del ingreso anual proyectado que corresponde a ISR. */
export function effectiveIncomeTaxRate(projectedAnnual: number): number {
  return projectedAnnual > 0 ? calculateAnnualIncomeTax(projectedAnnual) / projectedAnnual : 0;
}

/* ------------------------------------------------------------ salario neto */

export interface NetSalaryInput {
  grossPerPay: number;
  frequency: Frequency;
  otherPerPay?: number;
  /** El décimo tercer mes está gravado con ISR; se suma a la proyección anual salvo que se indique lo contrario. */
  includeThirteenth?: boolean;
  /** Declaración conjunta de cónyuges: deducción anual de B/.800 (Código Fiscal, art. 709 num. 2). */
  jointFiling?: boolean;
  /** Otras deducciones anuales comprobadas ante el empleador (art. 704 y 709): intereses hipotecarios, seguro médico, etc. */
  otherAnnualDeductions?: number;
}

/**
 * Retención estimada: el empleador proyecta el ingreso anual (salarios + décimo), resta las deducciones
 * del art. 709 y aplica proporcionalmente la tarifa del art. 700 (Código Fiscal, art. 704).
 */
export function calculateNetSalary({ grossPerPay, frequency, otherPerPay = 0, includeThirteenth = true, jointFiling = false, otherAnnualDeductions = 0 }: NetSalaryInput) {
  const payments = PAYMENTS_PER_YEAR[frequency];
  if (!payments) throw new Error('Frecuencia de pago no válida.');
  if (!(grossPerPay > 0) || !(otherPerPay >= 0)) throw new Error('Introduce un salario mayor que cero.');
  if (!(otherAnnualDeductions >= 0)) throw new Error('Las deducciones no pueden ser negativas.');
  const gross = grossPerPay + otherPerPay;
  const annualSalary = gross * payments;
  const thirteenthAnnual = includeThirteenth ? annualSalary / THIRTEENTH.divisor : 0;
  const projectedAnnualIncome = annualSalary + thirteenthAnnual;
  const annualDeductions = (jointFiling ? SALARY.jointFilingDeduction : 0) + otherAnnualDeductions;
  const taxableAnnual = Math.max(0, projectedAnnualIncome - annualDeductions);
  const annualIncomeTax = calculateAnnualIncomeTax(taxableAnnual);
  const effectiveTaxRate = projectedAnnualIncome > 0 ? annualIncomeTax / projectedAnnualIncome : 0;

  const socialSecurity = roundMoney(gross * SALARY.socialSecurityEmployeeRate);
  const educationalInsurance = roundMoney(gross * SALARY.educationalInsuranceEmployeeRate);
  const incomeTax = roundMoney(gross * effectiveTaxRate);
  const totalDeductions = roundMoney(socialSecurity + educationalInsurance + incomeTax);
  const net = roundMoney(gross - totalDeductions);

  return {
    gross: roundMoney(gross),
    socialSecurity,
    educationalInsurance,
    incomeTax,
    totalDeductions,
    net,
    payments,
    netMonthlyEquivalent: roundMoney((net * payments) / 12),
    annualSalary: roundMoney(annualSalary),
    thirteenthAnnual: roundMoney(thirteenthAnnual),
    projectedAnnualIncome: roundMoney(projectedAnnualIncome),
    annualDeductions: roundMoney(annualDeductions),
    taxableAnnual: roundMoney(taxableAnnual),
    annualIncomeTax,
    effectiveTaxRate,
    marginalTaxRate: marginalIncomeTaxRate(taxableAnnual)
  };
}

/* ------------------------------------------------------ décimo tercer mes */

export type ThirteenthPeriodId = 'abril' | 'agosto' | 'diciembre';

export interface ThirteenthPeriod {
  id: ThirteenthPeriodId;
  year: number;
  start: string;
  end: string;
  payDate: string;
  label: string;
}

const PERIOD_LABELS: Record<ThirteenthPeriodId, string> = {
  abril: 'Primera partida',
  agosto: 'Segunda partida',
  diciembre: 'Tercera partida'
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Período de cada partida: 16 dic–15 abr, 16 abr–15 ago y 16 ago–15 dic; se paga el día 15 del mes final. */
export function thirteenthPeriod(id: ThirteenthPeriodId, year: number): ThirteenthPeriod {
  const ranges: Record<ThirteenthPeriodId, [string, string]> = {
    abril: [`${year - 1}-12-16`, `${year}-04-15`],
    agosto: [`${year}-04-16`, `${year}-08-15`],
    diciembre: [`${year}-08-16`, `${year}-12-15`]
  };
  const [start, end] = ranges[id];
  return { id, year, start, end, payDate: end, label: PERIOD_LABELS[id] };
}

export function thirteenthPeriodContaining(date: string): ThirteenthPeriod {
  parseIsoDate(date);
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const md = m * 100 + d;
  if (md >= 1216) return thirteenthPeriod('abril', y + 1);
  if (md <= 415) return thirteenthPeriod('abril', y);
  if (md <= 815) return thirteenthPeriod('agosto', y);
  return thirteenthPeriod('diciembre', y);
}

/**
 * Estima lo devengado en un período con salario fijo: cuatro salarios por período completo,
 * proporcional a los días trabajados dentro de él.
 */
export function estimatePeriodEarnings(monthlySalary: number, period: { start: string; end: string }, workedFrom?: string, workedTo?: string) {
  const from = workedFrom && workedFrom > period.start ? workedFrom : period.start;
  const to = workedTo && workedTo < period.end ? workedTo : period.end;
  const periodDays = daysInclusive(period.start, period.end);
  const workedDays = to < from ? 0 : daysInclusive(from, to);
  return {
    workedDays,
    periodDays,
    earnings: roundMoney((monthlySalary * THIRTEENTH.monthsPerPeriod * workedDays) / periodDays)
  };
}

export interface ThirteenthInput {
  ordinaryEarnings: number;
  variableEarnings?: number;
  /** Salario mensual habitual: permite estimar la parte proporcional de ISR. */
  regularMonthlySalary?: number;
}

export function calculateThirteenthMonth({ ordinaryEarnings, variableEarnings = 0, regularMonthlySalary }: ThirteenthInput) {
  if (!(ordinaryEarnings >= 0) || !(variableEarnings >= 0) || ordinaryEarnings + variableEarnings <= 0) {
    throw new Error('Introduce una remuneración mayor que cero.');
  }
  const periodEarnings = ordinaryEarnings + variableEarnings;
  const gross = roundMoney(periodEarnings / THIRTEENTH.divisor);
  const socialSecurity = roundMoney(gross * THIRTEENTH.socialSecurityEmployeeRate);
  const incomeTaxRate = regularMonthlySalary && regularMonthlySalary > 0
    ? effectiveIncomeTaxRate(regularMonthlySalary * (12 + 12 / THIRTEENTH.divisor))
    : null;
  const incomeTax = incomeTaxRate === null ? null : roundMoney(gross * incomeTaxRate);
  return {
    periodEarnings: roundMoney(periodEarnings),
    gross,
    socialSecurity,
    incomeTax,
    incomeTaxRate,
    net: roundMoney(gross - socialSecurity - (incomeTax ?? 0))
  };
}

/* -------------------------------------------------------------- vacaciones */

export interface VacationInput {
  /** Último salario mensual. */
  monthlySalary: number;
  /** Promedio mensual de los últimos 11 meses (incluye variables). Se usa si es más favorable. */
  averageLastElevenMonths?: number;
  /** Días de servicio que generan vacaciones (si no se indican días pendientes). */
  serviceDays?: number;
  /** Días de vacaciones pendientes, si se conocen. */
  pendingDays?: number;
  /** Días ya disfrutados dentro del período de `serviceDays`. */
  takenDays?: number;
}

/** Código de Trabajo, art. 54: un día de vacaciones por cada 11 días de servicio; 30 días pagados con un mes de salario. */
export function calculateVacationPay({ monthlySalary, averageLastElevenMonths, serviceDays, pendingDays, takenDays = 0 }: VacationInput) {
  if (!(monthlySalary > 0)) throw new Error('Introduce un salario mayor que cero.');
  const base = Math.max(monthlySalary, averageLastElevenMonths ?? 0);
  const usedAverage = (averageLastElevenMonths ?? 0) > monthlySalary;
  let days: number;
  let accruedDays: number | null = null;
  if (pendingDays !== undefined) {
    if (!(pendingDays >= 0)) throw new Error('Los días pendientes no son válidos.');
    days = pendingDays;
  } else {
    if (!(serviceDays !== undefined && serviceDays >= 0)) throw new Error('Indica los días trabajados o los días pendientes.');
    if (!(takenDays >= 0)) throw new Error('Los días disfrutados no son válidos.');
    accruedDays = serviceDays / VACATION.serviceDaysPerVacationDay;
    if (takenDays > accruedDays + 1e-9) throw new Error('Los días disfrutados superan los días acumulados en el período.');
    days = accruedDays - takenDays;
  }
  const dailyRate = base / VACATION.daysPerElevenMonths;
  const gross = roundMoney(days * dailyRate);
  const socialSecurity = roundMoney(gross * SALARY.socialSecurityEmployeeRate);
  const educationalInsurance = roundMoney(gross * SALARY.educationalInsuranceEmployeeRate);
  return {
    days: Math.round(days * 100) / 100,
    accruedDays: accruedDays === null ? null : Math.round(accruedDays * 100) / 100,
    takenDays: accruedDays === null ? 0 : takenDays,
    base: roundMoney(base),
    usedAverage,
    dailyRate: roundMoney(dailyRate),
    gross,
    socialSecurity,
    educationalInsurance,
    netBeforeIncomeTax: roundMoney(gross - socialSecurity - educationalInsurance)
  };
}

/* ----------------------------------------------------------- liquidación */

export type ContractType = 'indefinite' | 'fixed' | 'specific-work';
export type TerminationReason =
  | 'resignation'
  | 'mutual'
  | 'justified'
  | 'unjustified'
  | 'justified-resignation'
  | 'economic'
  | 'expiry';

export interface TerminationInput {
  /** Salario mensual base (art. 149: promedio de 6 meses o de los últimos 30 días, el más favorable). */
  monthlySalary: number;
  /** Promedio mensual de los últimos cinco años para la prima (art. 226). Si falta, se usa `monthlySalary`. */
  averageSalaryLastFiveYears?: number;
  startDate: string;
  /** Último día de trabajo (incluido). */
  endDate: string;
  contractType: ContractType;
  reason: TerminationReason;
  /** Días de vacaciones pendientes. Si falta, se estima el año de servicio en curso. */
  unusedVacationDays?: number;
  /** Remuneración devengada desde la última partida del décimo. Si falta, se estima con el salario. */
  currentPeriodEarnings?: number;
  /** Fecha pactada de vencimiento (contratos definidos u obra) para el art. 227. */
  agreedEndDate?: string;
  /** Si el empleador notificó el despido por escrito con 30 días de anticipación (art. 212). */
  noticeGiven?: boolean;
}

export interface TerminationNote {
  kind: 'info' | 'warning';
  text: string;
}

const INDEMNITY_REASONS: TerminationReason[] = ['unjustified', 'justified-resignation', 'economic'];

/** Fecha del aniversario de `start` en `year` (un 29 de febrero cae el 28 en años no bisiestos). */
function anniversaryIn(start: string, year: number): string {
  const [, sm, sd] = start.split('-').map(Number) as [number, number, number];
  const lastDay = new Date(Date.UTC(year, sm, 0)).getUTCDate();
  return `${year}-${pad(sm)}-${pad(Math.min(sd, lastDay))}`;
}

/** Último aniversario de `start` que no es posterior a `date` (o `start` si aún no se cumple ninguno). */
function lastAnniversary(start: string, date: string): string {
  const startYear = Number(start.slice(0, 4));
  for (let year = Number(date.slice(0, 4)); year > startYear; year--) {
    const candidate = anniversaryIn(start, year);
    if (candidate <= date) return candidate;
  }
  return start;
}

/**
 * Tiempo de servicio de `start` a `end` (ambos incluidos): años completos contados por aniversarios
 * más la fracción del año en curso. Así 1-ene-2021 a 31-dic-2025 son exactamente 5 años,
 * aunque el período incluya un 29 de febrero.
 */
export function serviceYears(start: string, end: string) {
  daysInclusive(start, end);
  const endExclusive = addDays(end, 1);
  const anniversary = lastAnniversary(start, endExclusive);
  const fullYears = Number(anniversary.slice(0, 4)) - Number(start.slice(0, 4));
  const next = anniversaryIn(start, Number(anniversary.slice(0, 4)) + 1);
  const fraction = (daysInclusive(anniversary, endExclusive) - 1) / (daysInclusive(anniversary, next) - 1);
  return { fullYears, years: fullYears + fraction };
}

/**
 * ISR sobre preaviso, prima de antigüedad e indemnización (Código Fiscal art. 701 lit. j; Decreto
 * Ejecutivo 170 de 1993, art. 119): no se acumulan al salario, se deduce 1% por cada año completo
 * de servicio y luego B/.5,000, y al saldo se le aplica la tarifa del art. 700.
 */
export function terminationIncomeTax(amount: number, fullYears: number) {
  if (!(amount > 0)) return { taxable: 0, tax: 0 };
  const yearsDeduction = amount * Math.min(1, TERMINATION.taxDeductionPerYear * Math.max(0, Math.floor(fullYears)));
  const taxable = Math.max(0, amount - yearsDeduction - TERMINATION.taxFixedDeduction);
  return { taxable: roundMoney(taxable), tax: calculateAnnualIncomeTax(taxable) };
}

export function calculateTermination(input: TerminationInput) {
  const { monthlySalary, startDate, endDate, contractType, reason } = input;
  if (!(monthlySalary > 0)) throw new Error('Introduce un salario mayor que cero.');
  const days = daysInclusive(startDate, endDate);
  const { years, fullYears } = serviceYears(startDate, endDate);
  const weeklySalary = (monthlySalary * 12) / 52;
  const notes: TerminationNote[] = [];

  // Vacaciones (art. 54).
  let vacationDays: number;
  let vacationEstimated = false;
  if (input.unusedVacationDays !== undefined) {
    if (!(input.unusedVacationDays >= 0)) throw new Error('Los días de vacaciones no son válidos.');
    vacationDays = input.unusedVacationDays;
  } else {
    const cycleDays = daysInclusive(lastAnniversary(startDate, endDate), endDate);
    vacationDays = Math.min(VACATION.daysPerElevenMonths, cycleDays / VACATION.serviceDaysPerVacationDay);
    vacationEstimated = true;
    notes.push({ kind: 'info', text: 'Vacaciones estimadas solo para el año de servicio en curso. Si tienes períodos anteriores sin disfrutar, indica el total de días pendientes.' });
  }
  const vacation = roundMoney((vacationDays * monthlySalary) / VACATION.daysPerElevenMonths);

  // Décimo tercer mes proporcional.
  let thirteenth: number;
  let thirteenthEstimated = false;
  if (input.currentPeriodEarnings !== undefined) {
    if (!(input.currentPeriodEarnings >= 0)) throw new Error('Lo devengado no puede ser negativo.');
    thirteenth = roundMoney(input.currentPeriodEarnings / THIRTEENTH.divisor);
  } else {
    const period = thirteenthPeriodContaining(endDate);
    const { earnings } = estimatePeriodEarnings(monthlySalary, period, startDate, endDate);
    thirteenth = roundMoney(earnings / THIRTEENTH.divisor);
    thirteenthEstimated = true;
  }

  // Prima de antigüedad (arts. 224 y 226).
  let seniorityPremium = 0;
  if (contractType === 'indefinite') {
    const primeBase = input.averageSalaryLastFiveYears && input.averageSalaryLastFiveYears > 0 ? input.averageSalaryLastFiveYears : monthlySalary;
    seniorityPremium = roundMoney(((primeBase * 12) / 52) * years * TERMINATION.seniorityWeeksPerYear);
    if (startDate < TERMINATION.law44ReviewBefore) {
      notes.push({ kind: 'warning', text: 'La relación empezó antes de la Ley 44 de 1995. La prima del período anterior al fondo de cesantía solo se paga con 10 años o más de servicio continuo (art. 224, parágrafo). Revisa el cálculo con MITRADEL.' });
    }
  }

  // Indemnización (arts. 225 y 227) y preaviso (art. 212).
  let indemnity = 0;
  let preaviso = 0;
  let indemnityStatus: 'not-applicable' | 'calculated' | 'needs-review' = 'not-applicable';
  if (contractType === 'indefinite' && INDEMNITY_REASONS.includes(reason)) {
    if (startDate < TERMINATION.law44ReviewBefore) {
      indemnityStatus = 'needs-review';
      notes.push({ kind: 'warning', text: 'Para relaciones iniciadas antes de la Ley 44 de 1995 la indemnización combina escalas distintas (art. 225, acápites A y B). No la estimamos automáticamente.' });
    } else {
      const firstTen = Math.min(years, 10);
      const afterTen = Math.max(0, years - 10);
      indemnity = roundMoney(weeklySalary * (firstTen * TERMINATION.indemnityWeeksFirstTenYears + afterTen * TERMINATION.indemnityWeeksAfterTenYears));
      indemnityStatus = 'calculated';
    }
    if (reason === 'unjustified') {
      if (years < TERMINATION.stabilityYears) {
        if (input.noticeGiven === false) {
          preaviso = roundMoney(monthlySalary * TERMINATION.noticeDays / VACATION.daysPerElevenMonths);
          notes.push({ kind: 'info', text: 'Con menos de dos años de servicio el empleador puede despedir sin causa, pero debe pagar la indemnización y avisar con 30 días de anticipación o pagar ese preaviso (art. 212). Lo incluimos porque indicaste que no hubo aviso.' });
        } else if (input.noticeGiven === undefined) {
          notes.push({ kind: 'warning', text: 'Con menos de dos años de servicio, si no te avisaron por escrito con 30 días de anticipación, también te corresponde el preaviso: un mes de salario (art. 212). Indícalo para incluirlo.' });
        }
      } else {
        notes.push({ kind: 'info', text: 'Con dos años o más de servicio, el trabajador despedido sin causa justificada puede reclamar el reintegro o la indemnización; si lo resuelve un juez puede haber salarios caídos y recargos que aquí no se calculan. En empresas pequeñas y otros casos del art. 212 se aplica el régimen de preaviso.' });
      }
      if (days <= TERMINATION.probationMaxDays) {
        notes.push({ kind: 'warning', text: 'Si tu contrato escrito fijaba un período probatorio (hasta 3 meses, art. 78), cualquiera de las partes podía terminarlo en ese plazo sin responsabilidad: en ese caso no hay indemnización ni preaviso.' });
      }
    }
    if (reason === 'economic') {
      notes.push({ kind: 'warning', text: 'El despido por causa económica debe comprobarse previamente ante la autoridad de trabajo (art. 215). Sin ese trámite se considera injustificado.' });
    }
    if (reason === 'justified-resignation') {
      notes.push({ kind: 'info', text: 'La renuncia con causa justificada (art. 223) da derecho a la indemnización solo si la causa se acredita.' });
    }
  } else if (contractType !== 'indefinite' && reason === 'unjustified') {
    if (input.agreedEndDate && input.agreedEndDate > endDate) {
      const remainingDays = daysInclusive(endDate, input.agreedEndDate) - 1;
      indemnity = roundMoney((monthlySalary * 12 * remainingDays) / 365);
      indemnityStatus = 'calculated';
      notes.push({ kind: 'info', text: `Indemnización del art. 227: salarios del tiempo restante (${remainingDays} días) hasta el vencimiento pactado.` });
    } else if (input.agreedEndDate) {
      notes.push({ kind: 'info', text: 'La fecha pactada no es posterior al último día de trabajo: no queda tiempo restante que indemnizar por el art. 227.' });
    } else {
      indemnityStatus = 'needs-review';
      notes.push({ kind: 'warning', text: contractType === 'fixed'
        ? 'Indica la fecha pactada de vencimiento para estimar los salarios del tiempo restante (art. 227).'
        : 'En obra determinada la indemnización equivale a los salarios hasta la total ejecución de la obra (art. 227). Indica la fecha prevista de conclusión para estimarla.' });
    }
  }

  if (contractType !== 'indefinite') {
    if (reason === 'justified-resignation' || reason === 'economic') {
      indemnityStatus = 'needs-review';
      notes.push({ kind: 'warning', text: 'En contratos definidos u obra determinada este motivo requiere revisión profesional; no se atribuye indemnización automática.' });
    }
    notes.push({ kind: 'info', text: 'Un contrato definido o por obra se considera por tiempo indefinido si seguiste trabajando tras su vencimiento o fin de la obra, si hubo contratos sucesivos o si cubría un puesto permanente (arts. 75 y 77). En ese caso te corresponderían prima e indemnización como en un contrato indefinido.' });
    if (contractType === 'fixed' && input.agreedEndDate && daysInclusive(startDate, input.agreedEndDate) > 366) {
      notes.push({ kind: 'warning', text: 'Un contrato por tiempo definido no puede pactarse por más de un año, salvo servicios con preparación técnica especial (hasta tres años, art. 74).' });
    }
  } else if (reason === 'expiry') {
    notes.push({ kind: 'warning', text: 'Un contrato por tiempo indefinido no termina por vencimiento. Revisa el tipo de contrato o el motivo.' });
  }

  // Descuentos estimados.
  const vacationSocialSecurity = roundMoney(vacation * SALARY.socialSecurityEmployeeRate);
  const vacationEducationalInsurance = roundMoney(vacation * SALARY.educationalInsuranceEmployeeRate);
  const thirteenthSocialSecurity = roundMoney(thirteenth * THIRTEENTH.socialSecurityEmployeeRate);
  const terminationPayments = roundMoney(seniorityPremium + indemnity + preaviso);
  const terminationTax = terminationIncomeTax(terminationPayments, fullYears);
  const totalDeductions = roundMoney(vacationSocialSecurity + vacationEducationalInsurance + thirteenthSocialSecurity + terminationTax.tax);

  const total = roundMoney(vacation + thirteenth + seniorityPremium + indemnity + preaviso);
  return {
    days,
    years: Math.round(years * 10000) / 10000,
    fullYears,
    weeklySalary: roundMoney(weeklySalary),
    vacationDays: Math.round(vacationDays * 100) / 100,
    vacation,
    vacationEstimated,
    thirteenth,
    thirteenthEstimated,
    seniorityPremium,
    indemnity,
    indemnityStatus,
    preaviso,
    total,
    deductions: {
      vacationSocialSecurity,
      vacationEducationalInsurance,
      thirteenthSocialSecurity,
      terminationTaxable: terminationTax.taxable,
      terminationIncomeTax: terminationTax.tax,
      total: totalDeductions
    },
    /** Neto estimado antes del ISR ordinario sobre vacaciones y décimo, que depende del ingreso anual. */
    netEstimate: roundMoney(total - totalDeductions),
    notes
  };
}
