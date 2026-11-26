/**
 * Directorio único de Calcula Panamá (CP-DESIGN-005). Alimenta el menú, el buscador, la portada y
 * /herramientas/. Una herramienta nueva solo necesita añadirse aquí para aparecer en todos ellos.
 * No contiene fórmulas: solo títulos, descripciones y rutas existentes.
 */
import { CALCULATORS, GUIDES } from './site';
import { expansionTools, vehicleTools, type Tool } from './expansion-tools';

export interface DirectoryTool { title: string; description: string; path: string; keywords?: string }
export interface Category {
  /** Ancla en /herramientas/ (se conservan las existentes). */
  id: string;
  number: string;
  label: string;
  kicker: string;
  headline: string;
  lede: string;
  /** Clave de la fotografía en src/data/photos.ts, si la sección tiene una. */
  photo?: string;
  tools: DirectoryTool[];
}

const fromTool = (tool: Tool, keywords = ''): DirectoryTool => ({ title: tool.title, description: tool.description, path: tool.path, keywords });
const byId = (id: string) => expansionTools.find(tool => tool.id === id)!;

export const CATEGORIES: Category[] = [
  {
    id: 'vehiculos', number: '01', label: 'Movilidad', kicker: 'Vehículos', photo: 'movilidad',
    headline: 'Más allá del precio.', lede: 'Comprar, financiar y mantener tu próximo vehículo, con la tasa y los costos que tú escribes.',
    tools: vehicleTools.map(tool => fromTool(tool, 'carro auto letra gasolina diésel combustible'))
  },
  {
    id: 'finanzas', number: '02', label: 'Finanzas', kicker: 'Finanzas personales', photo: 'finanzas',
    headline: 'Tu futuro comienza hoy.', lede: 'Préstamos, metas de ahorro y el dinero de tu quincena, explicados con ejemplos que puedes comprobar.',
    tools: [
      { title: 'Calculadora de préstamos', description: 'Estima la cuota, los intereses y el costo total de un préstamo, con tabla de amortización.', path: '/finanzas/calculadora-prestamos/', keywords: 'cuota interés banco crédito' },
      fromTool(byId('savings'), 'ahorro meta'),
      { title: 'Mi Quincena', description: 'Organiza tu dinero disponible hasta el próximo pago: gastos, deudas y ahorro.', path: '/finanzas/mi-quincena/', keywords: 'presupuesto quincena gastos' }
    ]
  },
  {
    id: 'trabajo', number: '03', label: 'Trabajo', kicker: 'Trabajo y salarios', photo: 'trabajo',
    headline: 'El valor de tu esfuerzo.', lede: 'Salario neto, décimo tercer mes, vacaciones y liquidación con la norma que respalda cada regla.',
    tools: CALCULATORS.map(item => ({ title: item.label, description: item.description, path: item.path, keywords: 'salario sueldo planilla css isr seguro social' }))
  },
  {
    id: 'vida-cotidiana', number: '04', label: 'Vida cotidiana', kicker: 'Hogar y compras', photo: 'cotidiano',
    headline: 'El costo de vivir.', lede: 'Compras del supermercado, ofertas que sí ahorran y la electricidad de tu hogar.',
    tools: [
      { title: 'Modo Pasillo', description: 'Suma los productos de tu compra y controla tu presupuesto mientras recorres el supermercado.', path: '/compras/modo-pasillo/', keywords: 'supermercado lista compras' },
      fromTool(byId('discount'), 'oferta 2x1 3x2 rebaja'),
      fromTool(byId('unit'), 'libra kilo litro supermercado'),
      fromTool(byId('energy'), 'luz electricidad kwh factura ensa naturgy')
    ]
  },
  {
    id: 'educacion', number: '05', label: 'Educación', kicker: 'Educación',
    headline: 'Cuentas claras para estudiar.', lede: 'Tu promedio ponderado y la nota que necesitas en lo que falta.',
    tools: [fromTool(byId('grades'), 'notas promedio colegio universidad')]
  }
];

export const MAGAZINE = GUIDES.map(guide => ({ title: guide.title, description: guide.description, path: guide.path }));

/** Índice del buscador: herramientas, guías y páginas de categoría. */
export const SEARCH_INDEX = [
  ...CATEGORIES.flatMap(category => category.tools.map(tool => ({ t: tool.title, d: tool.description, p: tool.path, c: category.label, k: tool.keywords ?? '' }))),
  ...MAGAZINE.map(guide => ({ t: guide.title, d: guide.description, p: guide.path, c: 'Guía', k: 'guía artículo' })),
  { t: 'Compras y gastos', d: 'Herramientas para comprar en Panamá y su guía de uso.', p: '/compras/', c: 'Vida cotidiana', k: 'supermercado' }
];
