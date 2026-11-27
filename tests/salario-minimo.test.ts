import { describe, expect, it } from 'vitest';
import { MINIMUM_WAGES, MINIMUM_WAGE_SOURCE, REGION_1_DISTRICTS } from '../src/data/minimum-wage';
import { minimumWage } from '../src/lib/tools/calculations';

const rate = (id: string) => MINIMUM_WAGES.find(r => r.id === id)!;

describe('tabla del Decreto Ejecutivo 13 de 2025', () => {
  it('tiene identificadores únicos y tasas positivas con dos decimales', () => {
    expect(new Set(MINIMUM_WAGES.map(r => r.id)).size).toBe(MINIMUM_WAGES.length);
    for (const r of MINIMUM_WAGES) for (const v of [r.r1, r.r2]) if (v !== null) {
      expect(v).toBeGreaterThan(0); expect(Math.round(v * 100) / 100).toBe(v);
    }
  });
  it.each([
    // Comprobaciones contra el decreto, página por página.
    ['agro-pequena', 1.64, 1.64], ['agroind-gran-proceso', 3.04, 2.49], ['manuf-gran', 3.13, 2.58], ['construccion', 3.51, 3.30],
    ['menor-gran', 3.02, 2.48], ['supermercados', 3.09, 2.54], ['zona-libre', 3.44, null], ['hotel-gran', 2.96, 2.43],
    ['rest-pequena', 2.32, 1.95], ['tripulantes', 5.01, 5.01], ['inmobiliarias', 3.47, 3.10], ['oficinas', 2.98, 2.98],
    ['seguridad', 3.04, 3.04], ['mecanicos-aereo', 4.92, 4.92], ['clinicas', 3.54, 2.66], ['enseres-pequena', 2.32, 1.94],
    ['enseres-gran', 2.98, 2.52], ['spas', 3.43, 2.57], ['domestico', 350, 320],
  ])('%s: Región 1 %s y Región 2 %s', (id, r1, r2) => expect([rate(id).r1, rate(id).r2]).toEqual([r1, r2]));
  it('fija el trabajo doméstico como monto mensual y la vigencia desde el 16-01-2026', () => {
    expect(MINIMUM_WAGES.filter(r => r.monthly).map(r => r.id)).toEqual(['domestico']);
    expect(MINIMUM_WAGE_SOURCE.effective).toBe('2026-01-16');
  });
  it('lista los 40 distritos de la Región 1 del art. 3', () => {
    expect(REGION_1_DISTRICTS).toHaveLength(40);
    expect(REGION_1_DISTRICTS).toContain('San Miguelito'); expect(REGION_1_DISTRICTS).toContain('Omar Torrijos Herrera');
  });
});

describe('cálculo del salario mínimo', () => {
  it('reproduce el ejemplo publicado (comercio al por menor, gran empresa, Región 1, 48 h)', () => {
    const r = minimumWage('menor-gran', 'r1', 48);
    expect(r.hourly).toBe(3.02); expect(r.weekly).toBeCloseTo(144.96, 10);
    expect(r.monthly).toBeCloseTo(628.16, 10); expect(r.fortnightly).toBeCloseTo(314.08, 10);
  });
  it('usa la tasa de la Región 2 y admite jornadas parciales', () => {
    expect(minimumWage('menor-gran', 'r2', 24).weekly).toBeCloseTo(2.48 * 24, 10);
  });
  it('devuelve el monto mensual del trabajo doméstico sin horas', () => {
    expect(minimumWage('domestico', 'r2', 0)).toMatchObject({ hourly: null, monthly: 320, fortnightly: 160 });
  });
  it('rechaza la Zona Libre en la Región 2, actividades desconocidas y horas fuera de rango', () => {
    expect(() => minimumWage('zona-libre', 'r2', 48)).toThrow(/Región 2/);
    expect(() => minimumWage('inexistente', 'r1', 48)).toThrow();
    expect(() => minimumWage('menor-gran', 'r1', 49)).toThrow();
    expect(() => minimumWage('menor-gran', 'r1', 0)).toThrow();
    expect(() => minimumWage('menor-gran', 'r1', 40.5)).toThrow();
  });
});
