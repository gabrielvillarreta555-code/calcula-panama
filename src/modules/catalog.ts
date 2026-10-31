export type ModuleId = 'work-income' | 'shopping-expenses' | 'personal-finance' | 'blue';
export type ToolStatus = 'active' | 'planned' | 'experimental';
export type TrustLevel = 'official-calculation' | 'general-calculation' | 'experimental-assistant';

export interface ToolDefinition {
  id: string;
  label: string;
  path: string | null;
  status: ToolStatus;
  trust: TrustLevel;
  localOnly: boolean;
}

export interface ModuleDefinition {
  id: ModuleId;
  label: string;
  description: string;
  tools: readonly ToolDefinition[];
}

/**
 * Catálogo funcional 2.0.
 *
 * Es deliberadamente independiente de la navegación actual. Permite incorporar módulos de forma
 * incremental sin cambiar las calculadoras laborales existentes hasta que cada migración tenga
 * pruebas de regresión. Las funciones experimentales de Blue nunca usan el nivel
 * `official-calculation`.
 */
export const MODULE_CATALOG: readonly ModuleDefinition[] = [
  {
    id: 'work-income',
    label: 'Trabajo e ingresos',
    description: 'Cálculos laborales con parámetros legales versionados y fuentes identificadas.',
    tools: [
      { id: 'net-salary', label: 'Salario neto', path: '/calculadoras/salario-neto/', status: 'active', trust: 'official-calculation', localOnly: true },
      { id: 'thirteenth-month', label: 'Décimo tercer mes', path: '/calculadoras/decimo-tercer-mes/', status: 'active', trust: 'official-calculation', localOnly: true },
      { id: 'vacation-pay', label: 'Vacaciones', path: '/calculadoras/vacaciones/', status: 'active', trust: 'official-calculation', localOnly: true },
      { id: 'termination', label: 'Liquidación laboral', path: '/calculadoras/liquidacion-laboral/', status: 'active', trust: 'official-calculation', localOnly: true }
    ]
  },
  {
    id: 'shopping-expenses',
    label: 'Compras y gastos',
    description: 'Herramientas cotidianas que no interpretan normas laborales.',
    tools: [
      { id: 'aisle-mode', label: 'Modo Pasillo', path: '/compras/modo-pasillo/', status: 'active', trust: 'general-calculation', localOnly: true }
    ]
  },
  {
    id: 'personal-finance',
    label: 'Finanzas personales',
    description: 'Herramientas de planificación; no sustituyen asesoría financiera.',
    tools: [
      { id: 'my-pay-period', label: 'Mi Quincena', path: '/finanzas/mi-quincena/', status: 'active', trust: 'general-calculation', localOnly: true },
      { id: 'loan-calculator', label: 'Calculadora de Préstamos', path: '/finanzas/calculadora-prestamos/', status: 'active', trust: 'general-calculation', localOnly: true }
    ]
  },
  {
    id: 'blue',
    label: 'Blue',
    description: 'Orientación de interfaz experimental, separada de todo resultado financiero.',
    tools: [
      { id: 'blue-guide', label: 'Blue te orienta', path: null, status: 'experimental', trust: 'experimental-assistant', localOnly: true }
    ]
  }
] as const;

export const tools = () => MODULE_CATALOG.flatMap(module => module.tools);
export const activeTools = () => tools().filter(tool => tool.status === 'active');
