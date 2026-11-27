/**
 * Lanzamiento controlado de herramientas nuevas (CP-TOOL-008).
 *
 * Publicada el 27-11-2026 con autorización del CEO. Con `published: false`, la página existiría solo como prototipo: lleva `noindex`, no figura en el sitemap,
 * ni en el buscador de la cabecera ni en el catálogo. Cambiarlo a true requiere la aprobación expresa del CEO.
 */
export const OVERTIME_TOOL = {
  path: '/calculadoras/horas-extras/',
  label: 'Horas extras',
  description: 'Valor de la hora extra, recargos nocturnos, domingos y feriados, con registro de jornadas.',
  published: true
} as const;
