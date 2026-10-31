import { describe, expect, it } from 'vitest';
import {
  calculateAnnualIncomeTax,
  calculateNetSalary,
  calculateThirteenthMonth,
  calculateVacationPay,
  daysInclusive
} from './calculations';

describe('límites de ISR', () => {
  it('mantiene continuidad en B/.11,000 y B/.50,000', () => {
    expect(calculateAnnualIncomeTax(11000)).toBe(0);
    expect(calculateAnnualIncomeTax(11000.01)).toBe(0);
    expect(calculateAnnualIncomeTax(50000)).toBe(5850);
    expect(calculateAnnualIncomeTax(50000.01)).toBe(5850);
  });

  it('no produce impuesto para base nula o negativa', () => {
    expect(calculateAnnualIncomeTax(0)).toBe(0);
    expect(calculateAnnualIncomeTax(-1)).toBe(0);
  });
});

describe('entradas límite de cálculos laborales', () => {
  it('rechaza salario nulo e ingresos adicionales negativos', () => {
    expect(() => calculateNetSalary({ grossPerPay: 0, frequency: 'monthly' })).toThrow();
    expect(() => calculateNetSalary({ grossPerPay: 1000, frequency: 'monthly', otherPerPay: -1 })).toThrow();
  });

  it('mantiene el divisor y la cuota especial del décimo', () => {
    expect(calculateThirteenthMonth({ ordinaryEarnings: 4000, variableEarnings: 200 }))
      .toMatchObject({ periodEarnings: 4200, gross: 350, socialSecurity: 25.38 });
  });

  it('acepta un saldo de vacaciones igual a cero sin inventar pago', () => {
    expect(calculateVacationPay({ monthlySalary: 1000, pendingDays: 0 }))
      .toMatchObject({ days: 0, gross: 0, socialSecurity: 0, educationalInsurance: 0 });
  });

  it('valida fechas imposibles y orden inverso', () => {
    expect(() => daysInclusive('2026-02-30', '2026-03-01')).toThrow();
    expect(() => daysInclusive('2026-03-02', '2026-03-01')).toThrow();
  });
});
