/**
 * Índice local de búsqueda (herramientas y guías). Lo comparten la cabecera Midnight Functional (FxHeader) y la
 * portada editorial (CP-DESIGN-006). Se genera al compilar y se filtra en el navegador: no hace peticiones.
 */
import { CALCULATORS, GUIDES } from '../data/site';
import { expansionTools, vehicleTools } from '../data/expansion-tools';
import { OVERTIME_TOOL } from '../data/launch';

export interface SearchEntry { t: string; p: string; c: string }

export function searchIndex(href: (path: string) => string): SearchEntry[] {
  return [
    ...CALCULATORS.map(c => ({ t: c.label, p: c.path, c: 'Trabajo' })),
    // CP-TOOL-008: entra en el buscador solo cuando se autorice su publicación.
    ...(OVERTIME_TOOL.published ? [{ t: 'Calculadora de horas extras', p: OVERTIME_TOOL.path, c: 'Trabajo' }] : []),
    { t: 'Mi Quincena', p: '/finanzas/mi-quincena/', c: 'Finanzas' },
    { t: 'Calculadora de préstamos', p: '/finanzas/calculadora-prestamos/', c: 'Finanzas' },
    { t: 'Modo Pasillo', p: '/compras/modo-pasillo/', c: 'Compras' },
    ...expansionTools.map(t => ({ t: t.title, p: t.path, c: t.category })),
    ...vehicleTools.map(t => ({ t: t.title, p: t.path, c: t.category })),
    ...GUIDES.map(g => ({ t: g.title, p: g.path, c: 'Guía' }))
  ].map(item => ({ ...item, p: href(item.p) }));
}

export const normalizeSearch = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Coincidencias de todas las palabras de la consulta, sin tildes ni mayúsculas. */
export function searchEntries(entries: readonly SearchEntry[], query: string, limit = 8): SearchEntry[] {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return entries.filter(e => { const n = normalizeSearch(`${e.t} ${e.c}`); return words.every(w => n.includes(w)); }).slice(0, limit);
}
