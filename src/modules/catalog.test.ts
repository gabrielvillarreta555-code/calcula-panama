import { describe, expect, it } from 'vitest';
import { MODULE_CATALOG, activeTools, tools } from './catalog';

describe('catálogo modular 2.0', () => {
  it('mantiene identificadores y rutas únicas', () => {
    const ids = tools().map(tool => tool.id);
    const paths = tools().flatMap(tool => tool.path ? [tool.path] : []);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('conserva activas las cuatro calculadoras laborales actuales', () => {
    expect(activeTools().map(tool => tool.id)).toEqual([
      'net-salary', 'thirteenth-month', 'vacation-pay', 'termination', 'aisle-mode', 'my-pay-period'
    ]);
    expect(activeTools().every(tool => tool.localOnly)).toBe(true);
  });

  it('separa Blue experimental de los cálculos oficiales', () => {
    const blue = MODULE_CATALOG.find(module => module.id === 'blue');
    expect(blue?.tools.length).toBeGreaterThan(0);
    expect(blue?.tools.every(tool => tool.trust === 'experimental-assistant')).toBe(true);
    expect(blue?.tools.every(tool => tool.status === 'experimental')).toBe(true);
  });

  it('activa Modo Pasillo como cálculo general y local', () => {
    const aisle = tools().find(tool => tool.id === 'aisle-mode');
    expect(aisle).toMatchObject({ status: 'active', localOnly: true, trust: 'general-calculation' });
  });
});
