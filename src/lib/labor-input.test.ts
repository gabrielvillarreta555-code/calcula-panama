import { describe, expect, it } from 'vitest';
import { MAX_LABOR_INPUT, assertLaborInput } from './labor-input';
import { calculateNetSalary, calculateThirteenthMonth, calculateVacationPay, calculateTermination, estimatePeriodEarnings } from './calculations';
import { readNumber } from './ui';

describe('validación numérica laboral, independiente de las fórmulas', () => {
  it('acepta el límite técnico y rechaza valores no finitos o fuera de rango', () => {
    expect(() => assertLaborInput(MAX_LABOR_INPUT)).not.toThrow();
    for (const value of [NaN, Infinity, -Infinity, 1e308, MAX_LABOR_INPUT + 1, -MAX_LABOR_INPUT - 1]) {
      expect(() => assertLaborInput(value)).toThrow(/número finito/);
    }
  });
  it('no transforma entradas vacías en cero ni deja pasar números imposibles', () => {
    const data = new FormData();
    expect(readNumber(data, 'amount')).toBeUndefined();
    data.set('amount', '1e308'); expect(() => readNumber(data, 'amount')).toThrow(/límite técnico/);
    data.set('amount', 'Infinity'); expect(() => readNumber(data, 'amount')).toThrow(/número finito/);
    data.set('amount', '10000000'); expect(readNumber(data, 'amount')).toBe(MAX_LABOR_INPUT);
  });
  it('valida importes y valores opcionales en las cuatro herramientas', () => {
    expect(() => calculateNetSalary({ grossPerPay: 1e308, frequency: 'monthly' })).toThrow();
    expect(() => calculateNetSalary({ grossPerPay: 1000, frequency: 'monthly', otherPerPay: Infinity })).toThrow();
    expect(() => estimatePeriodEarnings(1e308, { start: '2026-01-01', end: '2026-04-01' })).toThrow();
    expect(() => calculateThirteenthMonth({ ordinaryEarnings: 1000, variableEarnings: NaN })).toThrow();
    expect(() => calculateVacationPay({ monthlySalary: 1000, pendingDays: Infinity })).toThrow();
    expect(() => calculateTermination({ monthlySalary: 1000, startDate: '2025-01-01', endDate: '2026-01-01', contractType: 'indefinite', reason: 'resignation', currentPeriodEarnings: 1e308 })).toThrow();
  });
  it('mantiene el ejemplo ordinario sin cambiar su resultado', () => {
    expect(calculateNetSalary({ grossPerPay: 1500, frequency: 'monthly' }).net).toBe(1236.92);
  });
});
