/**
 * Valores esperados obtenidos con una implementación de referencia independiente
 * (Python, aritmética decimal con redondeo half-up) escrita desde el texto de las normas.
 * Cada caso indica la operación para poder verificarla a mano.
 */
import { describe, expect, it } from 'vitest';
import {
  calculateAnnualIncomeTax,
  calculateNetSalary,
  calculateTermination,
  calculateThirteenthMonth,
  calculateVacationPay,
  daysInclusive,
  estimatePeriodEarnings,
  serviceYears,
  terminationIncomeTax,
  thirteenthPeriod,
  thirteenthPeriodContaining
} from './calculations';

describe('tarifa anual del ISR (Código Fiscal art. 700, Ley 8 de 2010)', () => {
  it('aplica 0% hasta B/.11,000, 15% del excedente hasta B/.50,000 y B/.5,850 + 25% después', () => {
    expect(calculateAnnualIncomeTax(0)).toBe(0);
    expect(calculateAnnualIncomeTax(11000)).toBe(0);
    expect(calculateAnnualIncomeTax(11000.08)).toBe(0.01);
    expect(calculateAnnualIncomeTax(19500)).toBe(1275); // (19,500 − 11,000) × 15%
    expect(calculateAnnualIncomeTax(50000)).toBe(5850); // 39,000 × 15%
    expect(calculateAnnualIncomeTax(50000.01)).toBe(5850);
    expect(calculateAnnualIncomeTax(60000)).toBe(8350); // 5,850 + 10,000 × 25%
    expect(calculateAnnualIncomeTax(130000)).toBe(25850); // 5,850 + 80,000 × 25%
  });

  it('no produce valores negativos ni NaN', () => {
    expect(calculateAnnualIncomeTax(-5)).toBe(0);
    expect(calculateAnnualIncomeTax(Number.NaN)).toBe(0);
  });
});

describe('salario neto: salarios bajos y altos', () => {
  it('salario bajo: B/.600 × 13 = 7,800 no paga ISR', () => {
    expect(calculateNetSalary({ grossPerPay: 600, frequency: 'monthly' })).toMatchObject({
      socialSecurity: 58.5, educationalInsurance: 7.5, incomeTax: 0, net: 534, projectedAnnualIncome: 7800
    });
  });

  it('umbral exacto: B/.846.15 × 13 = 10,999.95 queda exento', () => {
    expect(calculateNetSalary({ grossPerPay: 846.15, frequency: 'monthly' })).toMatchObject({ incomeTax: 0, net: 753.07 });
  });

  it('un centavo sobre el umbral genera un impuesto anual de B/.0.01 y ninguna retención mensual', () => {
    const result = calculateNetSalary({ grossPerPay: 846.16, frequency: 'monthly' });
    expect(result.annualIncomeTax).toBe(0.01);
    expect(result.incomeTax).toBe(0);
  });

  it('B/.1,500: ISR 1,275 ÷ 13 = 98.08 y no se restan las cuotas de la base', () => {
    const result = calculateNetSalary({ grossPerPay: 1500, frequency: 'monthly' });
    expect(result).toMatchObject({
      socialSecurity: 146.25, educationalInsurance: 18.75, incomeTax: 98.08,
      totalDeductions: 263.08, net: 1236.92, projectedAnnualIncome: 19500, taxableAnnual: 19500, annualIncomeTax: 1275
    });
    expect(result.marginalTaxRate).toBe(0.15);
  });

  it('la retención mensual por 13 pagos reproduce el impuesto anual', () => {
    const result = calculateNetSalary({ grossPerPay: 1500, frequency: 'monthly' });
    expect(result.incomeTax * 13).toBeCloseTo(result.annualIncomeTax, 1);
  });

  it('sin décimo en la proyección: (18,000 − 11,000) × 15% ÷ 12 = 87.50', () => {
    expect(calculateNetSalary({ grossPerPay: 1500, frequency: 'monthly', includeThirteenth: false })).toMatchObject({ incomeTax: 87.5, net: 1247.5 });
  });

  it('salario alto, tramo de 25%: B/.5,000 → 9,600 ÷ 13 = 738.46', () => {
    expect(calculateNetSalary({ grossPerPay: 5000, frequency: 'monthly' })).toMatchObject({ incomeTax: 738.46, net: 3711.54, marginalTaxRate: 0.25 });
  });

  it('salario muy alto: B/.10,000 → 25,850 ÷ 13 = 1,988.46', () => {
    expect(calculateNetSalary({ grossPerPay: 10000, frequency: 'monthly' })).toMatchObject({
      socialSecurity: 975, educationalInsurance: 125, incomeTax: 1988.46, net: 6911.54
    });
  });
});

describe('salario neto: frecuencias de pago', () => {
  it('quincenal (24 pagos): B/.750 equivale a B/.1,500 mensuales', () => {
    const result = calculateNetSalary({ grossPerPay: 750, frequency: 'fortnightly' });
    expect(result).toMatchObject({ socialSecurity: 73.13, educationalInsurance: 9.38, incomeTax: 49.04, net: 618.45, projectedAnnualIncome: 19500 });
    expect(result.netMonthlyEquivalent).toBe(1236.9);
  });

  it('bisemanal (26 pagos): B/.692.31', () => {
    expect(calculateNetSalary({ grossPerPay: 692.31, frequency: 'biweekly' })).toMatchObject({ socialSecurity: 67.5, educationalInsurance: 8.65, incomeTax: 45.27, net: 570.89 });
  });

  it('semanal (52 pagos): B/.346.15', () => {
    expect(calculateNetSalary({ grossPerPay: 346.15, frequency: 'weekly' })).toMatchObject({ socialSecurity: 33.75, educationalInsurance: 4.33, incomeTax: 22.63, net: 285.44 });
  });

  it('rechaza frecuencias y montos no válidos', () => {
    expect(() => calculateNetSalary({ grossPerPay: 0, frequency: 'monthly' })).toThrow();
    expect(() => calculateNetSalary({ grossPerPay: 100, frequency: 'monthly', otherPerPay: -1 })).toThrow();
    expect(() => calculateNetSalary({ grossPerPay: 100, frequency: 'daily' as never })).toThrow();
    expect(() => calculateNetSalary({ grossPerPay: 100, frequency: 'monthly', otherAnnualDeductions: -1 })).toThrow();
  });
});

describe('salario neto: ingresos variables y deducciones', () => {
  it('suma las comisiones al salario para CSS, Seguro Educativo e ISR', () => {
    const variable = calculateNetSalary({ grossPerPay: 1000, frequency: 'monthly', otherPerPay: 500 });
    const fixed = calculateNetSalary({ grossPerPay: 1500, frequency: 'monthly' });
    expect(variable).toEqual(fixed);
  });

  it('declaración conjunta: resta B/.800 antes de la tarifa (art. 709): 1,155 ÷ 13 = 88.85', () => {
    expect(calculateNetSalary({ grossPerPay: 1500, frequency: 'monthly', jointFiling: true })).toMatchObject({
      annualDeductions: 800, taxableAnnual: 18700, annualIncomeTax: 1155, incomeTax: 88.85, net: 1246.15
    });
  });

  it('otras deducciones anuales se suman a la conjunta: 19,500 − 2,800 → 855 ÷ 13 = 65.77', () => {
    expect(calculateNetSalary({ grossPerPay: 1500, frequency: 'monthly', jointFiling: true, otherAnnualDeductions: 2000 })).toMatchObject({ taxableAnnual: 16700, incomeTax: 65.77 });
  });

  it('deducciones mayores que el ingreso dejan la base en cero, nunca negativa', () => {
    expect(calculateNetSalary({ grossPerPay: 1500, frequency: 'monthly', otherAnnualDeductions: 30000 })).toMatchObject({ taxableAnnual: 0, incomeTax: 0, net: 1335 });
  });
});

describe('décimo tercer mes', () => {
  it('divide lo devengado entre doce y descuenta 7.25% de CSS (Ley 51, art. 96 del texto único)', () => {
    expect(calculateThirteenthMonth({ ordinaryEarnings: 4000, variableEarnings: 200 })).toMatchObject({
      periodEarnings: 4200, gross: 350, socialSecurity: 25.38, incomeTax: null, net: 324.62
    });
  });

  it('estima el ISR proporcional con el salario habitual: 350 × 1,275 ÷ 19,500 = 22.88', () => {
    expect(calculateThirteenthMonth({ ordinaryEarnings: 4000, variableEarnings: 200, regularMonthlySalary: 1500 })).toMatchObject({ incomeTax: 22.88, net: 301.74 });
  });

  it('no estima ISR con salarios bajo el umbral', () => {
    expect(calculateThirteenthMonth({ ordinaryEarnings: 2400, regularMonthlySalary: 600 })).toMatchObject({ gross: 200, incomeTax: 0, net: 185.5 });
  });

  it('rechaza remuneraciones en cero o negativas', () => {
    expect(() => calculateThirteenthMonth({ ordinaryEarnings: 0 })).toThrow();
    expect(() => calculateThirteenthMonth({ ordinaryEarnings: 100, variableEarnings: -1 })).toThrow();
  });

  it('asigna cada fecha a su partida, incluidas las fechas límite', () => {
    expect(thirteenthPeriodContaining('2026-12-15').id).toBe('diciembre');
    expect(thirteenthPeriodContaining('2026-12-16')).toMatchObject({ id: 'abril', year: 2027, start: '2026-12-16', end: '2027-04-15' });
    expect(thirteenthPeriodContaining('2026-12-31')).toMatchObject({ id: 'abril', year: 2027 });
    expect(thirteenthPeriodContaining('2027-01-01')).toMatchObject({ id: 'abril', year: 2027 });
    expect(thirteenthPeriodContaining('2026-04-15').id).toBe('abril');
    expect(thirteenthPeriodContaining('2026-04-16').id).toBe('agosto');
    expect(thirteenthPeriodContaining('2026-08-15').id).toBe('agosto');
    expect(thirteenthPeriodContaining('2026-08-16').id).toBe('diciembre');
    expect(thirteenthPeriodContaining('2028-02-29')).toMatchObject({ id: 'abril', year: 2028 });
  });

  it('período completo con salario fijo = 4 salarios, también en año bisiesto (122 días)', () => {
    expect(estimatePeriodEarnings(1000, thirteenthPeriod('abril', 2026))).toEqual({ workedDays: 121, periodDays: 121, earnings: 4000 });
    expect(estimatePeriodEarnings(1000, thirteenthPeriod('abril', 2028))).toEqual({ workedDays: 122, periodDays: 122, earnings: 4000 });
  });

  it('décimo proporcional: ingreso a mitad del período', () => {
    expect(estimatePeriodEarnings(1000, thirteenthPeriod('abril', 2026), '2026-02-14').earnings).toBe(2016.53); // 4,000 × 61 ÷ 121
    expect(estimatePeriodEarnings(1000, thirteenthPeriod('abril', 2028), '2028-02-29').earnings).toBe(1540.98); // 4,000 × 47 ÷ 122
    expect(estimatePeriodEarnings(1000, thirteenthPeriod('abril', 2026), '2026-05-01').earnings).toBe(0);
    expect(estimatePeriodEarnings(1000, thirteenthPeriod('abril', 2026), '2026-04-15').earnings).toBe(33.06); // un día
  });
});

describe('vacaciones (art. 54)', () => {
  it('un día por cada once de servicio: 330 días → 30 días = un mes', () => {
    expect(calculateVacationPay({ monthlySalary: 1000, serviceDays: 330 })).toMatchObject({ days: 30, gross: 1000, socialSecurity: 97.5, educationalInsurance: 12.5, netBeforeIncomeTax: 890 });
  });

  it('vacaciones proporcionales: 165 días → 15 días = B/.500', () => {
    expect(calculateVacationPay({ monthlySalary: 1000, serviceDays: 165 })).toMatchObject({ days: 15, gross: 500 });
  });

  it('descuenta los días ya disfrutados: 30 − 10 = 20 días → B/.666.67', () => {
    expect(calculateVacationPay({ monthlySalary: 1000, serviceDays: 330, takenDays: 10 })).toMatchObject({ accruedDays: 30, takenDays: 10, days: 20, gross: 666.67 });
  });

  it('todas disfrutadas: no queda pago', () => {
    expect(calculateVacationPay({ monthlySalary: 1000, serviceDays: 330, takenDays: 30 })).toMatchObject({ days: 0, gross: 0 });
  });

  it('rechaza más días disfrutados que acumulados', () => {
    expect(() => calculateVacationPay({ monthlySalary: 1000, serviceDays: 110, takenDays: 11 })).toThrow();
  });

  it('año bisiesto completo: 366 ÷ 11 = 33.27 días acumulados', () => {
    const days = daysInclusive('2024-01-01', '2024-12-31');
    expect(days).toBe(366);
    expect(calculateVacationPay({ monthlySalary: 1000, serviceDays: days })).toMatchObject({ days: 33.27, gross: 1109.09 });
  });

  it('usa el promedio de once meses cuando es más favorable', () => {
    expect(calculateVacationPay({ monthlySalary: 1000, averageLastElevenMonths: 1200, pendingDays: 15 })).toMatchObject({ gross: 600, usedAverage: true });
    expect(calculateVacationPay({ monthlySalary: 1000, averageLastElevenMonths: 900, pendingDays: 15 })).toMatchObject({ gross: 500, usedAverage: false });
  });
});

describe('tiempo de servicio', () => {
  it('cuenta los días con ambas fechas incluidas', () => {
    expect(daysInclusive('2025-01-01', '2025-12-31')).toBe(365);
    expect(daysInclusive('2025-01-01', '2025-01-01')).toBe(1);
    expect(() => daysInclusive('2025-02-01', '2025-01-01')).toThrow();
    expect(() => daysInclusive('2025-02-30', '2025-03-01')).toThrow();
  });

  it('cuenta años por aniversarios, sin desviación por años bisiestos', () => {
    expect(serviceYears('2021-01-01', '2025-12-31')).toEqual({ fullYears: 5, years: 5 });
    expect(serviceYears('2024-01-01', '2024-12-31')).toEqual({ fullYears: 1, years: 1 });
    expect(serviceYears('2010-01-01', '2025-12-31')).toEqual({ fullYears: 16, years: 16 });
    expect(serviceYears('2024-02-29', '2025-02-27')).toEqual({ fullYears: 1, years: 1 });
    expect(serviceYears('2025-01-01', '2025-07-01').years).toBeCloseTo(182 / 365, 10);
    expect(serviceYears('2020-03-15', '2026-06-30').years).toBeCloseTo(6 + 108 / 365, 10);
  });
});

describe('liquidación laboral', () => {
  const base = { monthlySalary: 1000, startDate: '2021-01-01', endDate: '2025-12-31', unusedVacationDays: 0, currentPeriodEarnings: 0 } as const;

  it('renuncia voluntaria, contrato indefinido: prima de 5 semanas, sin indemnización', () => {
    const result = calculateTermination({ ...base, contractType: 'indefinite', reason: 'resignation' });
    expect(result).toMatchObject({ indemnity: 0, indemnityStatus: 'not-applicable', seniorityPremium: 1153.85, preaviso: 0, total: 1153.85 });
  });

  it('despido justificado, contrato indefinido: conserva la prima, sin indemnización', () => {
    const result = calculateTermination({ ...base, contractType: 'indefinite', reason: 'justified' });
    expect(result).toMatchObject({ seniorityPremium: 1153.85, indemnity: 0 });
  });

  it('despido injustificado, 5 años: 230.77 × 5 × 3.4 = 3,923.08 (art. 225 C)', () => {
    const result = calculateTermination({ ...base, contractType: 'indefinite', reason: 'unjustified' });
    expect(result).toMatchObject({ indemnity: 3923.08, seniorityPremium: 1153.85, total: 5076.93, indemnityStatus: 'calculated' });
    expect(result.notes.some(n => n.text.includes('reintegro'))).toBe(true);
  });

  it('más de diez años: 10 × 3.4 + 6 × 1 semanas (causa económica, art. 213 C)', () => {
    const result = calculateTermination({ ...base, startDate: '2010-01-01', contractType: 'indefinite', reason: 'economic' });
    expect(result).toMatchObject({ indemnity: 9230.77, seniorityPremium: 3692.31 });
    expect(result.notes.some(n => n.text.includes('art. 215'))).toBe(true);
  });

  it('renuncia con causa justificada da indemnización (art. 223)', () => {
    expect(calculateTermination({ ...base, contractType: 'indefinite', reason: 'justified-resignation' }).indemnity).toBe(3923.08);
  });

  it('antigüedad con fracción de año: 6 años y 108 días', () => {
    const result = calculateTermination({ ...base, startDate: '2020-03-15', endDate: '2026-06-30', contractType: 'indefinite', reason: 'unjustified' });
    expect(result).toMatchObject({ seniorityPremium: 1452.9, indemnity: 4939.85, fullYears: 6 });
  });

  it('no automatiza la indemnización de relaciones anteriores a la Ley 44 de 1995', () => {
    const result = calculateTermination({ ...base, startDate: '1990-05-01', contractType: 'indefinite', reason: 'unjustified' });
    expect(result).toMatchObject({ indemnity: 0, indemnityStatus: 'needs-review' });
  });

  it('menos de dos años sin preaviso: suma un mes de salario (art. 212)', () => {
    const result = calculateTermination({ ...base, startDate: '2025-01-01', contractType: 'indefinite', reason: 'unjustified', noticeGiven: false });
    expect(result).toMatchObject({ seniorityPremium: 230.77, indemnity: 784.62, preaviso: 1000, total: 2015.39 });
  });

  it('menos de dos años: sin dato de preaviso avisa; con preaviso dado no lo suma', () => {
    const unknown = calculateTermination({ ...base, startDate: '2025-01-01', contractType: 'indefinite', reason: 'unjustified' });
    expect(unknown.preaviso).toBe(0);
    expect(unknown.notes.some(n => n.text.includes('art. 212'))).toBe(true);
    expect(calculateTermination({ ...base, startDate: '2025-01-01', contractType: 'indefinite', reason: 'unjustified', noticeGiven: true }).preaviso).toBe(0);
  });

  it('con dos años o más no aplica el preaviso del art. 212 num. 1', () => {
    expect(calculateTermination({ ...base, startDate: '2024-01-01', contractType: 'indefinite', reason: 'unjustified', noticeGiven: false }).preaviso).toBe(0);
  });

  it('avisa del período probatorio en relaciones de hasta tres meses', () => {
    const result = calculateTermination({ ...base, startDate: '2025-11-01', contractType: 'indefinite', reason: 'unjustified' });
    expect(result.notes.some(n => n.text.includes('art. 78'))).toBe(true);
  });

  it('contrato definido despedido sin causa: salarios del tiempo restante (art. 227)', () => {
    const result = calculateTermination({ ...base, startDate: '2026-01-01', endDate: '2026-06-30', contractType: 'fixed', reason: 'unjustified', agreedEndDate: '2026-12-31' });
    expect(result).toMatchObject({ indemnity: 6049.32, seniorityPremium: 0 }); // 1,000 × 12 × 184 ÷ 365
    expect(result.notes.some(n => n.text.includes('art. 77') || n.text.includes('arts. 75 y 77'))).toBe(true);
  });

  it('contrato definido: renuncia y vencimiento no dan prima ni indemnización', () => {
    expect(calculateTermination({ ...base, contractType: 'fixed', reason: 'resignation' })).toMatchObject({ seniorityPremium: 0, indemnity: 0 });
    expect(calculateTermination({ ...base, contractType: 'fixed', reason: 'expiry' })).toMatchObject({ seniorityPremium: 0, indemnity: 0 });
  });

  it('contrato definido sin fecha pactada pide revisión; si ya venció no indemniza', () => {
    expect(calculateTermination({ ...base, contractType: 'fixed', reason: 'unjustified' })).toMatchObject({ indemnityStatus: 'needs-review', indemnity: 0 });
    expect(calculateTermination({ ...base, contractType: 'fixed', reason: 'unjustified', agreedEndDate: '2025-12-31' })).toMatchObject({ indemnityStatus: 'not-applicable', indemnity: 0 });
  });

  it('advierte si un contrato definido supera un año (art. 74)', () => {
    const result = calculateTermination({ ...base, startDate: '2025-01-01', endDate: '2025-06-30', contractType: 'fixed', reason: 'unjustified', agreedEndDate: '2026-06-30' });
    expect(result.notes.some(n => n.text.includes('art. 74'))).toBe(true);
  });

  it('advierte si un contrato indefinido se marca como vencido', () => {
    expect(calculateTermination({ ...base, contractType: 'indefinite', reason: 'expiry' }).notes.some(n => n.text.includes('no termina por vencimiento'))).toBe(true);
  });

  it('vacaciones pendientes y disfrutadas: usa el saldo indicado', () => {
    expect(calculateTermination({ ...base, unusedVacationDays: 12, contractType: 'indefinite', reason: 'resignation' })).toMatchObject({ vacation: 400, vacationEstimated: false });
  });

  it('estima vacaciones del año de servicio en curso y el décimo proporcional', () => {
    const result = calculateTermination({ monthlySalary: 1000, startDate: '2024-03-10', endDate: '2025-09-09', contractType: 'indefinite', reason: 'mutual' });
    expect(result).toMatchObject({ vacationEstimated: true, vacationDays: 16.73, vacation: 557.58, thirteenthEstimated: true, thirteenth: 68.31 });
  });

  it('limita las vacaciones estimadas a 30 días y maneja ingresos un 29 de febrero', () => {
    expect(calculateTermination({ monthlySalary: 1000, startDate: '2024-03-10', endDate: '2026-03-09', contractType: 'indefinite', reason: 'mutual' }).vacation).toBe(1000);
    const leap = calculateTermination({ monthlySalary: 1000, startDate: '2024-02-29', endDate: '2025-03-01', contractType: 'indefinite', reason: 'mutual' });
    expect(leap.vacationDays).toBe(0.18); // aniversario el 28-feb-2025: 2 días ÷ 11
    expect(leap.fullYears).toBe(1);
  });

  it('descuentos: CSS y Seguro Educativo sobre vacaciones, 7.25% sobre el décimo, nada sobre prima e indemnización exentas', () => {
    const result = calculateTermination({ ...base, unusedVacationDays: 30, currentPeriodEarnings: 1200, contractType: 'indefinite', reason: 'unjustified' });
    expect(result.deductions).toMatchObject({
      vacationSocialSecurity: 97.5, vacationEducationalInsurance: 12.5, thirteenthSocialSecurity: 7.25,
      terminationTaxable: 0, terminationIncomeTax: 0, total: 117.25
    });
    expect(result.netEstimate).toBe(result.total - 117.25);
  });
});

describe('ISR sobre prima, indemnización y preaviso (DE 170 de 1993, art. 119)', () => {
  it('resta 1% por año completo y B/.5,000 antes de aplicar la tarifa', () => {
    // 50,769.23 − 10% − 5,000 = 40,692.31 → (40,692.31 − 11,000) × 15% = 4,453.85
    expect(terminationIncomeTax(50769.23, 10)).toEqual({ taxable: 40692.31, tax: 4453.85 });
    expect(terminationIncomeTax(4000, 3)).toEqual({ taxable: 0, tax: 0 });
    expect(terminationIncomeTax(0, 3)).toEqual({ taxable: 0, tax: 0 });
  });

  it('se aplica en una liquidación con salario alto y diez años', () => {
    const result = calculateTermination({ monthlySalary: 5000, startDate: '2016-01-01', endDate: '2025-12-31', contractType: 'indefinite', reason: 'unjustified', unusedVacationDays: 0, currentPeriodEarnings: 0 });
    expect(result).toMatchObject({ seniorityPremium: 11538.46, indemnity: 39230.77 });
    expect(result.deductions.terminationIncomeTax).toBe(4453.85);
  });
});
