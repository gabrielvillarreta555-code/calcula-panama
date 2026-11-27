export const SITE = {
  name: 'Calcula Panamá',
  shortName: 'Calcula PA',
  description: 'Calculadoras gratuitas para Panamá: salario neto, décimo tercer mes, liquidación, préstamos, autos, compras y presupuesto personal, con fórmulas, límites y fuentes explicadas.',
  locale: 'es-PA',
  repositoryUrl: 'https://github.com/gabrielvillarreta555-code/calcula-panama',
  issuesUrl: 'https://github.com/gabrielvillarreta555-code/calcula-panama/issues'
} as const;

/**
 * Google AdSense.
 *
 * Con `client` definido, el script oficial se carga en el <head> de todas las páginas (necesario
 * para verificar el sitio y para los anuncios automáticos). `public/ads.txt` debe usar el mismo ID.
 * Los bloques manuales solo aparecen cuando se rellena el id de cada uno en `slots`.
 * Con `client` vacío no se carga ningún script de Google ni se muestra ningún espacio.
 */
export const ADSENSE = {
  client: 'ca-pub-2150093744862116',
  slots: {
    /** Bloque bajo el resultado de cada calculadora. */
    afterResult: '',
    /** Bloque dentro de las guías, después de la introducción. */
    inArticle: ''
  }
} as const;

export type AdSlotName = keyof typeof ADSENSE.slots;

export const isAdsenseEnabled = () => /^ca-pub-\d{16}$/.test(ADSENSE.client);

export interface NavItem {
  path: string;
  label: string;
  short: string;
  description: string;
  icon: 'salary' | 'thirteenth' | 'vacation' | 'termination';
}

export const CALCULATORS: NavItem[] = [
  {
    path: '/calculadoras/salario-neto/',
    label: 'Salario neto',
    short: 'Salario',
    description: 'Cuánto recibes después de Seguro Social, Seguro Educativo e impuesto sobre la renta.',
    icon: 'salary'
  },
  {
    path: '/calculadoras/decimo-tercer-mes/',
    label: 'Décimo tercer mes',
    short: 'Décimo',
    description: 'Partida de abril, agosto o diciembre con tu salario o con lo devengado en el período.',
    icon: 'thirteenth'
  },
  {
    path: '/calculadoras/vacaciones/',
    label: 'Vacaciones',
    short: 'Vacaciones',
    description: 'Días acumulados y pago de vacaciones completas o proporcionales.',
    icon: 'vacation'
  },
  {
    path: '/calculadoras/liquidacion-laboral/',
    label: 'Liquidación laboral',
    short: 'Liquidación',
    description: 'Vacaciones, décimo proporcional, prima de antigüedad e indemnización según tu caso.',
    icon: 'termination'
  }
];

export const GUIDES = [
  {
    path: '/guias/descuentos-del-salario-en-panama/',
    topic: 'Trabajo',
    title: 'Descuentos del salario en Panamá: CSS, Seguro Educativo e ISR',
    description: 'Qué te descuentan de la quincena, por qué y cuánto queda en salarios habituales.'
  },
  {
    path: '/guias/fechas-de-pago-del-decimo-tercer-mes/',
    topic: 'Trabajo',
    title: 'Décimo tercer mes: fechas de pago, períodos y descuentos',
    description: 'Qué meses cubre cada partida, cómo se calcula y qué pasa si entraste a mitad del período.'
  },
  {
    path: '/guias/prima-de-antiguedad-e-indemnizacion/',
    topic: 'Trabajo',
    title: 'Prima de antigüedad e indemnización: diferencias y cálculo',
    description: 'Quién cobra cada una, cuántas semanas corresponden y qué salario se usa.'
  },
  {
    path: '/guias/horas-extras-en-panama/',
    topic: 'Trabajo',
    title: 'Horas extras en Panamá: recargos, límites, domingos y feriados',
    description: 'Cuánto se paga la hora extra diurna, nocturna y mixta, y el trabajo en descanso o en fiesta nacional.'
  },
  {
    path: '/guias/itbms-en-panama/',
    topic: 'Impuestos',
    title: 'ITBMS en Panamá: tarifas del 7%, 10% y 15% y cómo calcularlo',
    description: 'Qué tarifa corresponde, cómo agregar o quitar el impuesto de un precio y los errores más comunes.'
  }
] as const;
