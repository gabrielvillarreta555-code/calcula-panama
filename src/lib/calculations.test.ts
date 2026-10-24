import { describe, expect, it } from 'vitest';
import { calculateAnnualIncomeTax, calculateNetSalary, calculateTermination, calculateThirteenthMonth } from './calculations';

describe('impuesto anual', () => {
  it('respeta los límites y tramos', () => {
    expect(calculateAnnualIncomeTax(11000)).toBe(0);
    expect(calculateAnnualIncomeTax(50000)).toBe(5850);
    expect(calculateAnnualIncomeTax(60000)).toBe(8350);
  });
});

describe('salario', () => {
  it('calcula descuentos mensuales sin ISR bajo el umbral', () => {
    expect(calculateNetSalary(800, 'monthly')).toEqual({
      gross: 800, socialSecurity: 78, educationalInsurance: 10, incomeTax: 0,
      net: 712, annualGross: 9600, taxableAnnual: 8544
    });
  });
});

describe('décimo', () => {
  it('divide remuneración del período entre doce', () => {
    expect(calculateThirteenthMonth(4000, 200)).toEqual({ periodEarnings: 4200, gross: 350, socialSecurity: 25.38, netBeforeIncomeTax: 324.62 });
  });
});

describe('liquidación', () => {
  it('no concede indemnización a una renuncia', () => {
    const result = calculateTermination({ monthlySalary: 1000, startDate: '2025-01-01', endDate: '2025-12-31', contractType: 'indefinite', reason: 'resignation', unusedVacationDays: 0, currentPeriodEarnings: 0 });
    expect(result.indemnity).toBe(0);
    expect(result.seniorityPremium).toBeGreaterThan(0);
  });
});
