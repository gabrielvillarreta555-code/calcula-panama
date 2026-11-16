export type ToolId = 'unit' | 'discount' | 'savings' | 'grades' | 'energy';
export interface Field {
  key: string; label: string; value?: string; type?: 'date' | 'select';
  options?: { value: string; label: string }[]; optional?: boolean; digits?: number;
}
export interface Tool {
  id: ToolId; path: string; category: string; title: string; description: string; intro: string;
  fields: Field[]; rowFields?: Field[]; rowCount?: number; rowLabel?: string; minRows?: number;
  steps: string[]; formula: string; example: string; limits: string[];
  sources: { title: string; url: string }[]; related: { title: string; path: string }[];
}
const nist = { title: 'NIST — unidades de medida, Handbook 44 (2026)', url: 'https://www.nist.gov/system/files/documents/2025/12/30/appc-26-HB44-20251222.pdf' };
const math = { title: 'SEP — cálculo de porcentajes y descuentos', url: 'https://aprendeencasa.sep.gob.mx/secundaria/calculo-de-porcentajes-2/' };
const shopping = { title: 'Sumar mi compra con Modo Pasillo', path: '/compras/modo-pasillo/' };
const budget = { title: 'Organizar mi dinero con Mi Quincena', path: '/finanzas/mi-quincena/' };
export const expansionTools: Tool[] = [
  {
    id: 'unit', path: '/compras/precio-por-unidad/', category: 'Compras', title: 'Comparador de precio por kilo, litro o unidad',
    description: 'Compara precios de productos de distintos tamaños. Convierte gramos, libras y mililitros para saber qué presentación cuesta menos por unidad.',
    intro: 'Escribe el precio total de cada paquete y su contenido. Compara presentaciones con la misma medida y descubre cuál cuesta menos por kilo, litro o unidad.',
    fields: [], rowCount: 2, minRows: 2, rowLabel: 'Producto',
    rowFields: [
      { key: 'price', label: 'Precio del paquete (B/.)', digits: 2 },
      { key: 'quantity', label: 'Contenido del paquete' },
      { key: 'unit', label: 'Unidad', type: 'select', options: [{ value: 'g', label: 'Gramos (g)' }, { value: 'kg', label: 'Kilogramos (kg)' }, { value: 'lb', label: 'Libras (lb)' }, { value: 'ml', label: 'Mililitros (ml)' }, { value: 'l', label: 'Litros (L)' }, { value: 'unidad', label: 'Unidades' }] },
    ],
    steps: ['Añade al menos dos productos y el precio de cada paquete.', 'Introduce el contenido total; para un paquete de 6 botellas de 500 ml usa 3000 ml.', 'Compara productos equivalentes en masa, volumen o número de unidades.'],
    formula: 'Precio comparable = precio del paquete ÷ contenido convertido a kg, litros o unidades. Una libra equivale a 0.45359237 kg.',
    example: 'Ejemplo hipotético: 500 g a B/.2.00 cuestan B/.4.00 por kg. Otro paquete de 750 g a B/.2.70 cuesta B/.3.60 por kg: su precio por kg es 10% menor, aunque el paquete cuesta más.',
    limits: ['No consulta precios de supermercados ni compara calidad. Los precios los introduces tú.', 'No convierte masa a volumen: gramos y mililitros no son equivalentes sin conocer la densidad.', 'Acepta hasta 20 productos. Precio hasta B/.10,000,000 con dos decimales; contenido entre 0.001 y 10,000,000. Las unidades contables deben ser enteras.', 'El precio comparable se muestra con hasta cuatro decimales; la comparación usa el valor sin redondear.'],
    sources: [nist], related: [shopping, { title: 'Comparar descuentos y promociones', path: '/compras/descuentos-y-promociones/' }],
  },
  {
    id: 'discount', path: '/compras/descuentos-y-promociones/', category: 'Compras', title: 'Calculadora de descuentos y promociones',
    description: 'Calcula descuentos, ofertas 2x1, 3x2 y segunda unidad rebajada. Revisa el precio final, el ahorro y el descuento efectivo de tu compra.',
    intro: 'Comprueba cuánto pagarías por la cantidad que necesitas. Elige una promoción y distingue el porcentaje anunciado del ahorro efectivo sobre toda la compra.',
    fields: [
      { key: 'price', label: 'Precio por unidad (B/.)', digits: 2 }, { key: 'quantity', label: 'Cantidad de productos', value: '3', digits: 0 },
      { key: 'mode', label: 'Promoción', type: 'select', options: [{ value: 'percent', label: 'Descuento porcentual' }, { value: 'successive', label: 'Dos descuentos sucesivos' }, { value: '2x1', label: '2 por el precio de 1' }, { value: '3x2', label: '3 por el precio de 2' }, { value: 'second', label: 'Segunda unidad con descuento' }] },
      { key: 'discount', label: 'Descuento (%)', value: '20' }, { key: 'secondDiscount', label: 'Segundo descuento (%)', value: '10' },
    ],
    steps: ['Introduce el precio original de una unidad y cuántas llevarás.', 'Selecciona la promoción. En segunda unidad, escribe el porcentaje de rebaja de esa unidad.', 'Consulta el total y el porcentaje ahorrado frente a comprar esa misma cantidad sin promoción.'],
    formula: 'Descuento simple: total × (1 − descuento/100). Dos descuentos: total × (1 − d1/100) × (1 − d2/100). En 3x2 se descuenta una unidad por cada grupo completo de tres.',
    example: 'Ejemplos hipotéticos: tres productos de B/.6.00 en 3x2 cuestan B/.12.00, un ahorro de B/.6.00 (33.33%). Dos descuentos sucesivos de 20% y 10% sobre B/.100.00 dejan B/.72.00: la rebaja es 28%, no 30%.',
    limits: ['Supone productos de igual precio y promociones aplicables a toda la cantidad indicada. Las unidades fuera de un grupo completo pagan precio normal.', 'No añade ITBMS, envío ni cargos. Introduce precios comparables y consulta las condiciones del comercio.', 'Redondea el total final al centésimo; el comercio puede redondear por artículo y obtener una diferencia.', 'Precio hasta B/.10,000,000, cantidad entera de 1 a 10,000 y descuentos entre 0% y 100%.'],
    sources: [math], related: [shopping, { title: 'Comparar precio por unidad', path: '/compras/precio-por-unidad/' }],
  },
  {
    id: 'savings', path: '/finanzas/meta-de-ahorro/', category: 'Finanzas', title: 'Calculadora de metas de ahorro',
    description: 'Calcula cuánto aportar por semana, quincena o mes para alcanzar una meta. Consulta un calendario con tu ahorro inicial y la fecha objetivo.',
    intro: 'Define cuánto quieres reunir y cuándo. Obtén un calendario de aportes que cubra la diferencia entre tu meta y lo que ya tienes ahorrado, sin asumir intereses.',
    fields: [
      { key: 'goal', label: 'Meta total (B/.)', digits: 2 }, { key: 'saved', label: 'Ahorro inicial (B/.)', value: '0', digits: 2 },
      { key: 'start', label: 'Fecha de inicio', type: 'date' }, { key: 'end', label: 'Fecha objetivo', type: 'date' },
      { key: 'frequency', label: 'Frecuencia de los aportes', type: 'select', options: [{ value: 'twice-month', label: 'Quincenal: día 15 y último día del mes' }, { value: 'weekly', label: 'Semanal: cada 7 días desde el inicio' }, { value: 'monthly', label: 'Mensual: día de inicio o fin de mes' }] },
    ],
    steps: ['Escribe la meta y tu ahorro disponible para ella.', 'Selecciona inicio y fecha objetivo. Se incluyen aportes que caigan exactamente en esas fechas.', 'Elige frecuencia y revisa el calendario antes de reservar dinero en Mi Quincena.'],
    formula: 'Faltante = máximo de cero y (meta − ahorro inicial). Se reparte en centésimos entre las fechas disponibles; los primeros aportes reciben, si hace falta, un centésimo adicional.',
    example: 'Ejemplo hipotético: meta B/.600.00, ahorro inicial B/.120.00, del 1 de enero al 30 de junio de 2027 con aportes el 15 y fin de mes. Hay 12 aportes de B/.40.00: B/.120.00 + 12 × B/.40.00 = B/.600.00.',
    limits: ['No incluye intereses, inflación, comisiones ni condiciones de cuentas bancarias. No comprueba tu capacidad de ahorro.', 'Quincenal significa dos veces por mes (15 y último día), no cada 14 días. En mensual se conserva el día inicial; si no existe, se usa el último del mes.', 'Admite fechas de 2000 a 2100 y hasta 600 aportes. Meta y ahorro inicial hasta B/.10,000,000 con dos decimales.', 'La lista se pierde al recargar. No se transfiere automáticamente a Mi Quincena.'],
    sources: [{ title: 'CFPB — Su dinero, sus metas: planificación del ahorro', url: 'https://files.consumerfinance.gov/f/documents/bcfp_your-money-goals_a-financial-empowerment-toolkit_es.pdf' }],
    related: [budget, { title: 'Estimar una cuota de préstamo', path: '/finanzas/calculadora-prestamos/' }],
  },
  {
    id: 'grades', path: '/educacion/promedio-de-notas/', category: 'Educación', title: 'Calculadora de promedio de notas y nota necesaria',
    description: 'Calcula tu promedio ponderado y la nota necesaria para alcanzar tu objetivo. Configura la escala y los porcentajes de tus evaluaciones.',
    intro: 'Introduce las evaluaciones que ya completaste y cuánto pesa cada una en la nota final. Comprueba tu promedio actual y qué promedio necesitarías en lo que falta.',
    fields: [{ key: 'scale', label: 'Nota máxima de la escala', value: '100' }, { key: 'target', label: 'Nota final objetivo', value: '60' }],
    rowLabel: 'Evaluación', rowCount: 2, minRows: 1,
    rowFields: [{ key: 'score', label: 'Nota obtenida' }, { key: 'weight', label: 'Peso en la nota final (%)' }],
    steps: ['Configura la nota máxima y tu objetivo según las reglas de tu curso.', 'Añade solo las evaluaciones completadas, incluyendo una nota cero si corresponde. No añadas notas ficticias para lo pendiente.', 'Los pesos pueden sumar menos de 100%. La herramienta muestra el promedio necesario sobre todo el porcentaje restante.'],
    formula: 'Puntos acumulados = suma de (nota × peso/100). Promedio actual = puntos × 100 / peso evaluado. Nota necesaria = (objetivo − puntos) × 100 / peso pendiente.',
    example: 'Ejemplos hipotéticos: 80 con peso 40% y 90 con peso 60% dan 86 de nota final. Si solo llevas 80 con peso 40% y buscas 70, necesitas un promedio de 63.33 en el 60% restante (valor aproximado).',
    limits: ['No aplica automáticamente reglamentos de MEDUCA ni de universidades. Configura los pesos de tu curso y confirma sus reglas de redondeo.', 'Escala desde cero hasta una nota máxima entre 1 y 1000. Admite de 1 a 20 evaluaciones; cada peso debe ser mayor que cero y el total no puede superar 100%.', 'Si la nota necesaria supera la máxima de la escala, el objetivo no es alcanzable con los pesos introducidos. No equivale a una decisión oficial de aprobación.', 'Los resultados se muestran con dos decimales; usa el valor completo y las reglas del curso para decisiones de redondeo.'],
    sources: [{ title: 'LibreTexts / Cálculo activo — ejemplo de promedio ponderado de notas', url: 'https://espanol.libretexts.org/Bookshelves/Matematicas/Libro%3A_Calculo_activo_%28Boelkins_et_al.%29/06%3A_Uso_de_Integrales_Definitas/6.03%3A_Densidad%2C_Masa_y_Centro_de_Masa' }],
    related: [{ title: 'Planear el ahorro para estudiar', path: '/finanzas/meta-de-ahorro/' }, { title: 'Ver todas las herramientas', path: '/herramientas/' }],
  },
  {
    id: 'energy', path: '/vida-cotidiana/consumo-electrico/', category: 'Vida cotidiana', title: 'Calculadora de consumo eléctrico en kWh',
    description: 'Estima el consumo de un aparato según su potencia y tiempo de uso. Añade tu precio por kWh para calcular un costo de energía orientativo.',
    intro: 'Estima cuánta energía usa un aparato durante un período. Introduce su potencia, las horas de uso y, si lo conoces, el precio de la energía por kWh.',
    fields: [{ key: 'watts', label: 'Potencia del aparato (W)' }, { key: 'hours', label: 'Horas de uso al día' }, { key: 'days', label: 'Días del período', value: '30', digits: 0 }, { key: 'duty', label: 'Porcentaje del tiempo activo (%)', value: '100' }, { key: 'rate', label: 'Precio de energía por kWh (B/., opcional)', optional: true, digits: 6 }],
    steps: ['Consulta la potencia en vatios en la placa del aparato; no introduzcas BTU/h como si fueran vatios eléctricos.', 'Indica horas al día, días del período y porcentaje de tiempo a esa potencia. Usa 100% para funcionamiento continuo.', 'Deja el precio vacío si solo necesitas kWh. Para estimar costo, introduce tu precio de energía; no una tarifa supuesta.'],
    formula: 'Energía (kWh) = potencia (W) ÷ 1000 × horas al día × días × porcentaje activo/100. Costo orientativo de energía = kWh × precio introducido.',
    example: 'Ejemplo hipotético: 100 W durante 5 horas al día, 30 días y 100% de tiempo activo consumen 15 kWh. Con un precio supuesto de B/.0.20/kWh, la energía costaría B/.3.00. Ese precio no es una tarifa oficial.',
    limits: ['No calcula la factura completa de ENSA ni de Naturgy: excluye cargos fijos, bloques, subsidios, impuestos y otros ajustes.', 'La potencia nominal no siempre equivale al consumo real. Neveras y aires acondicionados trabajan por ciclos; el porcentaje activo es un supuesto editable.', 'Potencia de 0 a 100,000 W, hasta 24 horas al día, entre 1 y 366 días y tiempo activo entre 0% y 100%. Precio opcional de 0 a B/.100/kWh.', 'Para medir consumo real utiliza un medidor adecuado. No estima ahorro garantizado.'],
    sources: [{ title: 'ENSA — definición de energía eléctrica (potencia por tiempo)', url: 'https://ensa.com.pa/preguntas-frecuentes/que-es-la-energia-electrica/' }, { title: 'ASEP — pliegos tarifarios 2026–2030 (contexto; no se incorporan tarifas)', url: 'https://asep.gob.pa/direcciones/services/reglamentaciones/pliegos-tarifarios-2027-2030/' }],
    related: [budget, { title: 'Planear una meta de ahorro', path: '/finanzas/meta-de-ahorro/' }],
  },
];
