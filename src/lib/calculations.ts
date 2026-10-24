import { LEGAL_PARAMETERS } from '../data/legal';

export type Frequency = 'monthly' | 'biweekly' | 'fortnightly' | 'weekly';
const PAYMENTS: Record<Frequency, number> = { monthly: 12, biweekly: 26, fortnightly: 24, weekly: 52 };

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateAnnualIncomeTax(taxableAnnual: number): number {
  if (taxableAnnual <= 11000) return 0;
  if (taxableAnnual <= 50000) return roundMoney((taxableAnnual - 11000) * 0.15);
  return roundMoney(5850 + (taxableAnnual - 50000) * 0.25);
}

export function calculateNetSalary(grossPerPay: number, frequency: Frequency, otherPerPay = 0) {
  const payments = PAYMENTS[frequency];
  const assessablePerPay = grossPerPay + otherPerPay;
  const annualGross = assessablePerPay * payments;
  const socialSecurityAnnual = annualGross * LEGAL_PARAMETERS.salary.socialSecurityEmployeeRate;
  const educationalInsuranceAnnual = annualGross * LEGAL_PARAMETERS.salary.educationalInsuranceEmployeeRate;
  const taxableAnnual = Math.max(0, annualGross - socialSecurityAnnual - educationalInsuranceAnnual);
  const incomeTaxAnnual = calculateAnnualIncomeTax(taxableAnnual);
  const socialSecurity = roundMoney(socialSecurityAnnual / payments);
  const educationalInsurance = roundMoney(educationalInsuranceAnnual / payments);
  const incomeTax = roundMoney(incomeTaxAnnual / payments);
  return {
    gross: roundMoney(assessablePerPay), socialSecurity, educationalInsurance, incomeTax,
    net: roundMoney(assessablePerPay - socialSecurity - educationalInsurance - incomeTax),
    annualGross: roundMoney(annualGross), taxableAnnual: roundMoney(taxableAnnual)
  };
}

export function calculateThirteenthMonth(ordinaryPeriodEarnings: number, variablePeriodEarnings = 0) {
  const periodEarnings = ordinaryPeriodEarnings + variablePeriodEarnings;
  const gross = roundMoney(periodEarnings / LEGAL_PARAMETERS.thirteenthMonth.divisor);
  const socialSecurity = roundMoney(gross * LEGAL_PARAMETERS.thirteenthMonth.socialSecurityEmployeeRate);
  return { periodEarnings: roundMoney(periodEarnings), gross, socialSecurity, netBeforeIncomeTax: roundMoney(gross - socialSecurity) };
}

export type ContractType = 'indefinite' | 'fixed' | 'specific-work';
export type TerminationReason = 'resignation' | 'mutual' | 'justified' | 'unjustified' | 'expiry';

function utcDaysBetween(start: string, end: string): number {
  const a = Date.parse(`${start}T00:00:00Z`);
  const b = Date.parse(`${end}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) throw new Error('Las fechas no son válidas.');
  return Math.floor((b - a) / 86400000) + 1;
}

export function calculateTermination(input: {
  monthlySalary: number; startDate: string; endDate: string; contractType: ContractType;
  reason: TerminationReason; unusedVacationDays?: number; currentPeriodEarnings?: number;
}) {
  const days = utcDaysBetween(input.startDate, input.endDate);
  const years = days / 365;
  const weeklySalary = input.monthlySalary * 12 / 52;
  const dailySalary = input.monthlySalary / 30;
  const vacation = roundMoney(input.unusedVacationDays === undefined
    ? (input.monthlySalary * 12 * years) / LEGAL_PARAMETERS.termination.vacationDivisor
    : input.unusedVacationDays * dailySalary);
  const thirteenth = roundMoney((input.currentPeriodEarnings ?? 0) / 12);
  const seniorityPremium = input.contractType === 'indefinite'
    ? roundMoney(weeklySalary * years * LEGAL_PARAMETERS.termination.seniorityWeeksPerYear) : 0;
  let indemnity = 0;
  let limitation: string | null = null;
  if (input.reason === 'unjustified' && input.contractType === 'indefinite') {
    const firstTen = Math.min(years, 10);
    const afterTen = Math.max(0, years - 10);
    indemnity = roundMoney(weeklySalary * (firstTen * 3.4 + afterTen));
  } else if (input.reason === 'unjustified' && input.contractType !== 'indefinite') {
    limitation = 'La indemnización de contratos definidos u obra determinada depende del plazo pendiente y circunstancias del caso; requiere revisión profesional y no se estima automáticamente.';
  }
  const total = roundMoney(vacation + thirteenth + seniorityPremium + indemnity);
  return { days, years: roundMoney(years), vacation, thirteenth, seniorityPremium, indemnity, total, limitation };
}
