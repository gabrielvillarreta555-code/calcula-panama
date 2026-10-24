import { describe, expect, it } from 'vitest';
import {
  calculateAnnualIncomeTax,
  calculateNetSalary,
  calculateTermination,
  calculateThirteenthMonth,
  calculateVacationPay,
  daysInclusive,
  estimatePeriodEarnings,
  thirteenthPeriod,
  thirteenthPeriodContaining
} from './calculations';

describe('impuesto anual (art. 700 Código Fiscal)', () => {
  it('respeta los límites y tramos', () => {
    expect(calculateAnnualIncomeTax(0)).toBe(0);
    expect(calculateAnnualIncomeTax(11000)).toBe(0);
    expect(calculateAnnualIncomeTax(19500)).toBe(1275);
    expect(calculateAnnualIncomeTax(50000)).toBe(5850);
    expect(calculateAnnualIncomeTax(60000)).toBe(8350);
  });

  it('no produce valores negativos ni NaN', () => {
    expect(calculateAnnualIncomeTax(-5)).toBe(0);
    expect(calculateAnnualIncomeTax(Number.NaN)).toBe(0);
  });
});

describe('salario neto', () => {
  it('no estima ISR cuando la proyección anual con décimo no supera B/.11,000', () => {
    expect(calculateNetSalary({ grossPerPay: 800, frequency: 'monthly' })).toMatchObject({
      gross: 800, socialSecurity: 78, educationalInsurance: 10, incomeTax: 0, net: 712,
      projectedAnnualIncome: 10400
    });
  });

  it('proyecta 13 salarios y no resta las cuotas antes de aplicar la tarifa', () => {
    const result = calculateNetSalary({ grossPerPay: 1500, frequency: 'monthly' });
    expect(result).toMatchObject({
      socialSecurity: 146.25, educationalInsurance: 18.75, incomeTax: 98.08,
      totalDeductions: 263.08, net: 1236.92, projectedAnnualIncome: 19500, annualIncomeTax: 1275
    });
    expect(result.marginalTaxRate).toBe(0.15);
  });

  it('permite excluir el décimo de la proyección', () => {
    expect(calculateNetSalary({ grossPerPay: 1500, frequency: 'monthly', includeThirteenth: false }).incomeTax).toBe(87.5);
  });

  it('aplica el tramo de 25% en salarios altos', () => {
    expect(calculateNetSalary({ grossPerPay: 5000, frequency: 'monthly' })).toMatchObject({ incomeTax: 738.46, net: 3711.54, marginalTaxRate: 0.25 });
  });

  it('da el mismo resultado anual con pagos quincenales', () => {
    const result = calculateNetSalary({ grossPerPay: 750, frequency: 'fortnightly' });
    expect(result.incomeTax).toBe(49.04);
    expect(result.netMonthlyEquivalent).toBeCloseTo(1236.92, 1);
  });

  it('rechaza salarios no válidos', () => {
    expect(() => calculateNetSalary({ grossPerPay: 0, frequency: 'monthly' })).toThrow();
    expect(() => calculateNetSalary({ grossPerPay: 100, frequency: 'monthly', otherPerPay: -1 })).toThrow();
  });
});

describe('décimo tercer mes', () => {
  it('divide la remuneración del período entre doce y descuenta 7.25%', () => {
    expect(calculateThirteenthMonth({ ordinaryEarnings: 4000, variableEarnings: 200 })).toMatchObject({
      periodEarnings: 4200, gross: 350, socialSecurity: 25.38, incomeTax: null, net: 324.62
    });
  });

  it('estima la parte proporcional de ISR con el salario habitual', () => {
    expect(calculateThirteenthMonth({ ordinaryEarnings: 4000, variableEarnings: 200, regularMonthlySalary: 1500 })).toMatchObject({
      incomeTax: 22.88, net: 301.74
    });
  });

  it('asigna cada fecha a la partida correcta', () => {
    expect(thirteenthPeriodContaining('2026-12-20')).toMatchObject({ id: 'abril', year: 2027, start: '2026-12-16', end: '2027-04-15' });
    expect(thirteenthPeriodContaining('2026-04-15').id).toBe('abril');
    expect(thirteenthPeriodContaining('2026-04-16').id).toBe('agosto');
    expect(thirteenthPeriodContaining('2026-08-15').id).toBe('agosto');
    expect(thirteenthPeriodContaining('2026-08-16').id).toBe('diciembre');
    expect(thirteenthPeriod('diciembre', 2026)).toMatchObject({ start: '2026-08-16', end: '2026-12-15', payDate: '2026-12-15' });
  });

  it('estima cuatro salarios por período completo y prorratea ingresos a mitad de período', () => {
    const period = thirteenthPeriod('abril', 2026);
    expect(estimatePeriodEarnings(1000, period)).toEqual({ workedDays: 121, periodDays: 121, earnings: 4000 });
    expect(estimatePeriodEarnings(1000, period, '2026-02-14').earnings).toBe(2016.53);
    expect(estimatePeriodEarnings(1000, period, '2026-05-01').earnings).toBe(0);
  });
});

describe('vacaciones (art. 54)', () => {
  it('genera un día por cada once de servicio', () => {
    expect(calculateVacationPay({ monthlySalary: 1000, serviceDays: 330 })).toMatchObject({ days: 30, gross: 1000, socialSecurity: 97.5, educationalInsurance: 12.5 });
  });

  it('usa el promedio de once meses cuando es más favorable', () => {
    expect(calculateVacationPay({ monthlySalary: 1000, averageLastElevenMonths: 1200, pendingDays: 15 })).toMatchObject({ gross: 600, usedAverage: true });
  });
});

describe('liquidación', () => {
  const base = { monthlySalary: 1000, startDate: '2021-01-01', endDate: '2025-12-31', unusedVacationDays: 0, currentPeriodEarnings: 0 } as const;

  it('cuenta los días con ambas fechas incluidas', () => {
    expect(daysInclusive('2025-01-01', '2025-12-31')).toBe(365);
    expect(() => daysInclusive('2025-02-01', '2025-01-01')).toThrow();
  });

  it('no concede indemnización a una renuncia, pero sí prima en contrato indefinido', () => {
    const result = calculateTermination({ ...base, contractType: 'indefinite', reason: 'resignation' });
    expect(result.indemnity).toBe(0);
    expect(result.indemnityStatus).toBe('not-applicable');
    expect(result.seniorityPremium).toBe(1154.48);
  });

  it('aplica 3.4 semanas por año en despido injustificado (art. 225 C)', () => {
    const result = calculateTermination({ ...base, contractType: 'indefinite', reason: 'unjustified' });
    expect(result.indemnity).toBe(3925.23);
    expect(result.total).toBe(5079.71);
  });

  it('aplica una semana por año después de los diez años', () => {
    const result = calculateTermination({ ...base, startDate: '2010-01-01', contractType: 'indefinite', reason: 'economic' });
    // 16 años (5,844 días): 10 × 3.4 + 6.01 × 1 semanas de B/.230.77.
    expect(result.indemnity).toBe(9233.3);
    expect(result.notes.some(n => n.text.includes('art. 215'))).toBe(true);
  });

  it('no automatiza la indemnización de relaciones anteriores a la Ley 44 de 1995', () => {
    const result = calculateTermination({ ...base, startDate: '1990-05-01', contractType: 'indefinite', reason: 'unjustified' });
    expect(result.indemnity).toBe(0);
    expect(result.indemnityStatus).toBe('needs-review');
  });

  it('calcula los salarios del tiempo restante en un contrato definido (art. 227)', () => {
    const result = calculateTermination({ ...base, startDate: '2026-01-01', endDate: '2026-06-30', contractType: 'fixed', reason: 'unjustified', agreedEndDate: '2026-12-31' });
    expect(result.indemnity).toBe(6049.32);
    expect(result.seniorityPremium).toBe(0);
  });

  it('pide la fecha pactada si falta en un contrato definido', () => {
    const result = calculateTermination({ ...base, contractType: 'fixed', reason: 'unjustified' });
    expect(result.indemnityStatus).toBe('needs-review');
    expect(result.indemnity).toBe(0);
  });

  it('no indemniza tiempo restante si el contrato definido ya venció', () => {
    const result = calculateTermination({ ...base, contractType: 'fixed', reason: 'unjustified', agreedEndDate: '2025-12-31' });
    expect(result.indemnityStatus).toBe('not-applicable');
    expect(result.indemnity).toBe(0);
  });

  it('estima vacaciones del año de servicio en curso y el décimo proporcional', () => {
    const result = calculateTermination({ monthlySalary: 1000, startDate: '2024-03-10', endDate: '2025-09-09', contractType: 'indefinite', reason: 'mutual' });
    expect(result.vacationEstimated).toBe(true);
    expect(result.vacationDays).toBe(16.73);
    expect(result.vacation).toBe(557.58);
    expect(result.thirteenthEstimated).toBe(true);
    // Partida de diciembre: 16 ago–9 sep = 25 de 122 días; 4,000 × 25/122 ÷ 12.
    expect(result.thirteenth).toBe(68.31);
  });

  it('limita las vacaciones estimadas a 30 días y maneja ingresos un 29 de febrero', () => {
    expect(calculateTermination({ monthlySalary: 1000, startDate: '2024-03-10', endDate: '2026-03-09', contractType: 'indefinite', reason: 'mutual' }).vacation).toBe(1000);
    expect(calculateTermination({ monthlySalary: 1000, startDate: '2024-02-29', endDate: '2025-03-01', contractType: 'indefinite', reason: 'mutual' }).vacationDays).toBe(0.18);
  });
});
