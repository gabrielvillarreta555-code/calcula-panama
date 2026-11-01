/** El mensaje se construye exclusivamente en memoria a partir de opciones autorizadas. */
export type ShareTool = 'salary' | 'thirteenth' | 'vacation' | 'termination' | 'budget' | 'loan' | 'aisle';
export interface ShareData { tool: ShareTool; primary?: string; details?: readonly string[]; products?: readonly string[] }
export interface ShareOptions { includePrimary: boolean; includeDetails: boolean; selectedProducts: readonly number[] }

export const SHARE_TOOLS: Record<ShareTool, { title: string; path: string; explanation: string }> = {
  salary: { title: 'Salario neto', path: '/calculadoras/salario-neto/', explanation: 'Resultado orientativo; los descuentos reales pueden variar.' },
  thirteenth: { title: 'Décimo tercer mes', path: '/calculadoras/decimo-tercer-mes/', explanation: 'Estimación orientativa; consulta las condiciones aplicables.' },
  vacation: { title: 'Vacaciones', path: '/calculadoras/vacaciones/', explanation: 'Estimación orientativa del pago de vacaciones.' },
  termination: { title: 'Liquidación laboral', path: '/calculadoras/liquidacion-laboral/', explanation: 'Estimación orientativa; los conceptos dependen del caso.' },
  budget: { title: 'Mi Quincena', path: '/finanzas/mi-quincena/', explanation: 'Herramienta de planificación personal.' },
  loan: { title: 'Calculadora de Préstamos', path: '/finanzas/calculadora-prestamos/', explanation: 'Resultado orientativo; las condiciones reales dependen de la entidad financiera.' },
  aisle: { title: 'Modo Pasillo', path: '/compras/modo-pasillo/', explanation: 'Resumen orientativo de compras, sin impuestos automáticos.' }
};
export const EMPTY_SHARE_OPTIONS: ShareOptions = { includePrimary: false, includeDetails: false, selectedProducts: [] };

export function buildShareText(data: ShareData, options: ShareOptions = EMPTY_SHARE_OPTIONS): string {
  const meta = SHARE_TOOLS[data.tool];
  const parts = [`${meta.title} — Calcula Panamá`];
  if (options.includePrimary && data.primary) parts.push(data.primary);
  if (options.includeDetails && data.details?.length) parts.push(data.details.join('\n'));
  const products = [...new Set(options.selectedProducts)].filter(n => Number.isInteger(n) && n >= 0 && n < (data.products?.length ?? 0));
  if (products.length) parts.push(`Productos seleccionados:\n${products.map(n => `• ${data.products![n]}`).join('\n')}`);
  parts.push(meta.explanation, `Calcula aquí: https://calculapanama.com${meta.path}`);
  return parts.join('\n\n');
}

export function whatsappShareUrl(text: string): string { return `https://wa.me/?text=${encodeURIComponent(text)}`; }
