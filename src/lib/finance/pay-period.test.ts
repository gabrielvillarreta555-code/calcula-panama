import { describe, it, expect } from 'vitest';
import { civilDay, emptyBudget, isBudgetState, newPeriod, parseCents, summarizeBudget, type Movement } from './pay-period';

const item: Movement = { id: 'a', name: 'Luz', cents: 18000, category: 'servicios', date: '', kind: 'gasto', status: 'pendiente', recurring: true };
describe('Mi Quincena', () => {
  it('usa los días reales y excluye el día de pago', () => {
    const state = { ...emptyBudget('2026-05-01'), payday: '2026-05-13', openingCents: 50000, savingsCents: 10000, movements: [item] };
    expect(summarizeBudget(state, '2026-05-01')).toMatchObject({ days: 12, freeCents: 22000, dailyCents: 1833, pendingCents: 18000 });
    expect(summarizeBudget(state, '2026-05-08').days).toBe(5);
  });
  it('maneja cambio de mes, año y día bisiesto sin depender de la zona horaria', () => {
    expect(civilDay('2027-01-02') - civilDay('2026-12-30')).toBe(3);
    expect(civilDay('2024-03-01') - civilDay('2024-02-28')).toBe(2);
    expect(() => civilDay('2026-02-29')).toThrow();
  });
  it('evita dividir entre cero y detecta pago pasado', () => {
    const state = { ...emptyBudget('2026-01-01'), payday: '2026-01-02' };
    expect(summarizeBudget(state, '2026-01-02')).toMatchObject({ days: 0, dailyCents: null, past: true });
    expect(() => summarizeBudget({ ...state, payday: state.start }, '2026-01-01')).toThrow();
  });
  it('descuenta cada movimiento una sola vez y conserva saldos negativos', () => {
    const state = { ...emptyBudget('2026-01-01'), payday: '2026-01-05', openingCents: 10000, savingsCents: 2000, movements: [{ ...item, status: 'pagado' as const }] };
    expect(summarizeBudget(state, '2026-01-01')).toMatchObject({ currentCents: -8000, paidCents: 18000, pendingCents: 0, freeCents: -10000, dailyCents: 0 });
    expect(summarizeBudget({ ...state, openingCents: 20000, savingsCents: 2000 }, '2026-01-01').freeCents).toBe(0);
  });
  it('acepta importes decimales seguros y rechaza negativos', () => {
    expect(parseCents('18,33')).toBe(1833);
    for (const value of ['-1', '', '1.999', 'Infinity']) expect(() => parseCents(value)).toThrow();
  });
  it('renueva solo recurrentes sin duplicar ni conservar pagos', () => {
    const state = { ...emptyBudget('2026-01-01'), movements: [{ ...item, status: 'pagado' as const }, { ...item, id: 'b', recurring: false }] };
    expect(newPeriod(state, '2026-02-01', true).movements).toEqual([{ ...item, status: 'pendiente', date: '' }]);
    expect(newPeriod(state, '2026-02-01', false).movements).toEqual([]);
  });
  it('rechaza persistencia dañada y movimientos duplicados', () => {
    const state = { ...emptyBudget('2026-01-01'), movements: [item] };
    expect(isBudgetState(state)).toBe(true);
    expect(isBudgetState({ ...state, movements: [item, item] })).toBe(false);
    expect(isBudgetState({ ...state, openingCents: -1 })).toBe(false);
  });
});
