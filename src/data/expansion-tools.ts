export type ToolId = 'unit' | 'discount' | 'savings' | 'grades' | 'energy' | 'car-loan' | 'fuel-trip' | 'car-cost' | 'itbms' | 'split' | 'holidays' | 'card';
export interface Field {
  key: string; label: string; value?: string; type?: 'date' | 'select';
  options?: { value: string; label: string }[]; optional?: boolean; digits?: number;
}
export interface Tool {
  id: ToolId; path: string; category: string; title: string; description: string; intro: string;
  fields: Field[]; rowFields?: Field[]; rowCount?: number; rowLabel?: string; minRows?: number;
  steps: string[]; formula: string; example: string; limits: string[];
  sources: { title: string; url: string }[]; related: { title: string; path: string }[];
  /** Preguntas frecuentes con respuestas verificables (CP-EXP-001). */
  faq?: { q: string; a: string }[];
  /** Contexto práctico para Panamá (CP-ADS-002). */
  context?: string[];
  /** Nota metodológica cuando la fórmula no depende de una norma ni de una fuente externa. */
  sourceNote?: string;
  /** Fecha ISO en que se consultaron las fuentes; por defecto, la de la expansión 3. */
  checkedOn?: string;
}
import { holidayLabel } from '../lib/tools/calculations';
const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
/** Fiestas y duelos nacionales de un año, con su día de la semana, calculados con las reglas verificadas. */
export function holidaysOf(year: number) {
  const list: { day: string; text: string }[] = [];
  for (let t = Date.UTC(year, 0, 1); t <= Date.UTC(year, 11, 31); t += 86400000) {
    const d = new Date(t), name = holidayLabel(d.toISOString().slice(0, 10));
    if (!name) continue;
    const date = `${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`, day = `${WEEKDAYS[d.getUTCDay()]} ${date}`;
    // «9 de enero, día de los mártires (art. 46)» → «sábado 9 de enero: día de los mártires (art. 46)».
    const rest = name.startsWith(date) ? name.slice(date.length).replace(/^, /, '').trim() : name;
    const lower = rest.charAt(0).toLowerCase() + rest.slice(1);
    list.push({ day, text: lower.startsWith('(') ? `${day} ${lower}` : `${day}: ${lower}` });
  }
  return list;
}
const laborCodeSource = { title: 'Código de Trabajo, arts. 46 y 47: fiestas, duelos nacionales y descanso del lunes (copia del Órgano Judicial)', url: 'https://www.organojudicial.gob.pa/uploads/wp_repo/uploads/2016/11/c%C3%B3digo-detrabajo.pdf' };
const law291Source = { title: 'Ley 291 de 2022, art. 7: el 20 de diciembre, día de duelo nacional (Gaceta Oficial 29507-B)', url: 'https://gacetas.procuraduria-admon.gob.pa/29507-B_57996.pdf' };
const nist = { title: 'NIST — unidades de medida, Handbook 44 (2026)', url: 'https://www.nist.gov/system/files/documents/2025/12/30/appc-26-HB44-20251222.pdf' };
/** Ley 8 de 2010 (DGI): fija la tarifa general del ITBMS en 7%. El mismo documento lo cita src/data/legal.ts. */
const itbms = { title: 'DGI — Ley 8 de 2010: tarifa general del ITBMS de 7%', url: 'https://dgi.mef.gob.pa/itbms/Normativa/Ley-8-15-marzo-2010.pdf' };
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
    context: [
      'En los supermercados de Panamá es habitual ver carnes, verduras y granos con precio por libra, y los productos envasados con su contenido en gramos o mililitros. Para compararlos, la herramienta convierte todo a la misma unidad: B/.1.99 la libra equivalen a B/.4.39 el kilo.',
      'Los paquetes múltiples se comparan por su contenido total: un paquete de 6 latas de 355 ml (2,130 ml) a B/.4.50 cuesta B/.2.11 por litro, y una botella de 2 litros a B/.2.75 cuesta B/.1.38 por litro.',
      'Compara precios con el mismo tratamiento del ITBMS: todos con el impuesto incluido o todos sin él. La tarifa general del ITBMS es 7% (Ley 8 de 2010); algunos productos tienen otra tarifa o están exentos, así que revisa la etiqueta o tu factura.',
    ],
    checkedOn: '2026-11-26',
    sources: [nist, itbms], related: [shopping, { title: 'Comparar descuentos y promociones', path: '/compras/descuentos-y-promociones/' }],
    faq: [
      { q: '¿Cómo comparo un precio por libra con uno por kilo?', a: 'Una libra equivale exactamente a 0.45359237 kg. Divide el precio por libra entre 0.45359237 para obtener el precio por kilo: B/.1.99 la libra son B/.4.39 el kilo. La herramienta hace la conversión si eliges la unidad de cada producto.' },
      { q: '¿Puedo comparar gramos con mililitros?', a: 'No. Son medidas de masa y de volumen, y para convertirlas hace falta la densidad de cada producto. Compara productos que la etiqueta exprese en la misma magnitud.' },
      { q: '¿El precio más bajo por kilo siempre conviene?', a: 'No siempre. Una presentación grande solo ahorra si la usas antes de que caduque y si tienes dónde guardarla. Compara también la calidad y lo que realmente vas a consumir.' },
    ],
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
    context: [
      'Un 2x1 solo equivale a pagar la mitad si llevas un número par de unidades: tres productos de B/.6.00 en 2x1 cuestan B/.12.00, un ahorro del 33.33%, no del 50%.',
      'Los descuentos sucesivos no se suman. Un 30% más un 20% adicional deja el 56% del precio: el ahorro real es 44%, no 50%.',
      'La herramienta no añade el ITBMS. Si comparas precios sin impuesto, súmalo igual en todas las opciones: la tarifa general en Panamá es 7%.',
    ],
    checkedOn: '2026-11-26',
    sources: [itbms], related: [shopping, { title: 'Comparar precio por unidad', path: '/compras/precio-por-unidad/' }],
    faq: [
      { q: '¿Un 2x1 es lo mismo que un 50% de descuento?', a: 'Solo si compras las unidades en pares. Con un número impar, la unidad sobrante paga el precio normal: tres productos de B/.6.00 en 2x1 cuestan B/.12.00 y el ahorro efectivo es 33.33%.' },
      { q: '¿Cuánto ahorro con la segunda unidad al 50%?', a: 'Un 25% sobre las dos unidades. Si cada una cuesta B/.10.00, pagas B/.10.00 + B/.5.00 = B/.15.00 en lugar de B/.20.00.' },
      { q: '¿Qué hago si en caja me cobran un precio distinto del anunciado?', a: 'Pide la revisión en el comercio y conserva la factura y, si puedes, una foto del anuncio. Si no se resuelve, puedes presentar una queja ante la Autoridad de Protección al Consumidor y Defensa de la Competencia (ACODECO).' },
    ],
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
    context: [
      'Muchas personas en Panamá cobran por quincena, los días 15 y 30 o el último día del mes. La frecuencia quincenal de esta herramienta usa esas fechas, para que el aporte coincida con el día de pago.',
      'El décimo tercer mes se paga en tres partidas: el 15 de abril, el 15 de agosto y el 15 de diciembre. Si destinas parte de una partida a tu meta, súmala al ahorro inicial y calcula su importe neto con la calculadora del décimo.',
      'Ejemplo hipotético: para reunir B/.1,200 entre el 1 de febrero de 2027 y el 31 de enero de 2028, con aportes mensuales desde el día de inicio, hacen falta 12 aportes de B/.100.00.',
    ],
    sources: [{ title: 'CFPB — Su dinero, sus metas: planificación del ahorro (guía en español)', url: 'https://files.consumerfinance.gov/f/documents/bcfp_your-money-goals_a-financial-empowerment-toolkit_es.pdf' }],
    related: [budget, { title: 'Calcular el décimo tercer mes', path: '/calculadoras/decimo-tercer-mes/' }, { title: 'Estimar una cuota de préstamo', path: '/finanzas/calculadora-prestamos/' }],
    faq: [
      { q: '¿La calculadora tiene en cuenta los intereses de mi cuenta de ahorros?', a: 'No. Reparte la diferencia entre la meta y tu ahorro inicial sin intereses. Si tu cuenta paga intereses, el resultado es conservador: con los intereses alcanzarías la meta aportando algo menos.' },
      { q: '¿Qué frecuencia de aportes conviene elegir?', a: 'La que coincida con tu día de pago. Si cobras por quincena, el aporte quincenal te permite separar el dinero apenas lo recibes, antes de gastarlo.' },
      { q: '¿Puedo usar el décimo tercer mes para mi meta?', a: 'Sí. Las partidas se pagan el 15 de abril, el 15 de agosto y el 15 de diciembre. Calcula el importe neto con la calculadora del décimo y súmalo al ahorro inicial cuando lo recibas.' },
    ],
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
    context: [
      'Cada centro educativo y cada universidad fija su escala, su nota mínima de aprobación y sus reglas de redondeo. Si tu centro califica de 1.0 a 5.0 con 3.0 como mínima de aprobación, escribe 5 como nota máxima y 3 como objetivo; si usa una escala de 0 a 100, escribe 100 y tu objetivo.',
      'Ejemplo hipotético con una escala de 1.0 a 5.0: con 4.0 en una evaluación que pesa 30% y 3.5 en otra del 30%, llevas 2.25 puntos. Para terminar con 3.0, necesitas un promedio de 1.88 en el 40% restante.',
      'Si tu escala empieza en 1.0, no escribas notas menores que 1.0: la herramienta acepta notas desde cero.',
    ],
    sources: [],
    sourceNote: 'El promedio ponderado es una fórmula matemática estándar y no depende de una norma. La escala, los pesos y el redondeo los fija el reglamento de evaluación de cada centro o universidad: confírmalos con tu docente o con la secretaría académica.',
    related: [{ title: 'Planear el ahorro para estudiar', path: '/finanzas/meta-de-ahorro/' }, { title: 'Ver todas las herramientas', path: '/herramientas/' }],
    faq: [
      { q: '¿Cómo se calcula un promedio ponderado?', a: 'Multiplica cada nota por su peso, suma los resultados y divide entre la suma de los pesos. Con 80 (40%) y 90 (60%): 80 × 0.4 + 90 × 0.6 = 86.' },
      { q: '¿Qué significa que el objetivo no es alcanzable?', a: 'Que incluso con la nota máxima en todo lo que falta no llegarías a la nota final que buscas con los pesos introducidos. Revisa los pesos o habla con tu docente; el resultado no es una decisión oficial de aprobación.' },
      { q: '¿Cómo se redondea la nota final?', a: 'Depende del reglamento de tu centro. La herramienta muestra dos decimales y no redondea al alza ni a la baja para decidir si apruebas.' },
    ],
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
    context: [
      'En Panamá la electricidad la distribuyen ENSA y Naturgy (Edemet y Edechi), y la ASEP aprueba sus tarifas. Tu factura mide el consumo en kWh, la misma unidad que calcula esta herramienta.',
      'Los aires acondicionados indican su capacidad de enfriamiento en BTU/h (por ejemplo, 12,000 BTU/h), pero lo que consume electricidad es su potencia en vatios, que figura aparte en la placa o la ficha técnica. Usa siempre los vatios.',
      'Ejemplo hipotético: un aire acondicionado de 1,100 W encendido 8 horas cada noche, con el compresor activo el 60% del tiempo durante 30 días, consume 158.4 kWh. Con un precio supuesto de B/.0.20 por kWh, la energía costaría B/.31.68.',
    ],
    sources: [{ title: 'ENSA — definición de energía eléctrica (potencia por tiempo)', url: 'https://ensa.com.pa/preguntas-frecuentes/que-es-la-energia-electrica/' }, { title: 'ASEP — pliegos tarifarios 2026–2030 (contexto; no se incorporan tarifas)', url: 'https://asep.gob.pa/direcciones/services/reglamentaciones/pliegos-tarifarios-2027-2030/' }],
    related: [budget, { title: 'Planear una meta de ahorro', path: '/finanzas/meta-de-ahorro/' }],
    faq: [
      { q: '¿Qué precio por kWh escribo?', a: 'El de tu propia factura. Una aproximación es dividir el cargo por energía entre los kWh facturados, sin incluir los cargos fijos ni otros conceptos. No uses una tarifa supuesta: varía según la distribuidora, el bloque de consumo y el período.' },
      { q: '¿Por qué el resultado no coincide con mi factura?', a: 'Porque la factura incluye cargos fijos, bloques de consumo, subsidios, impuestos y otros aparatos de la casa. Esta herramienta estima solo la energía de un aparato.' },
      { q: '¿Qué porcentaje de tiempo activo uso para una nevera o un aire acondicionado?', a: 'Trabajan por ciclos: el compresor se enciende y se apaga. Si no conoces el valor, prueba con varios porcentajes para ver un rango; para medir el consumo real, usa un medidor de enchufe.' },
    ],
  },
  {
    id: 'itbms', path: '/impuestos/itbms/', category: 'Impuestos', title: 'Calculadora de ITBMS en Panamá: 7%, 10% y 15%',
    description: 'Agrega el ITBMS a un precio o sepáralo de un total que ya lo incluye. Tarifas del 7%, 10% y 15% según el Código Fiscal de Panamá.',
    intro: 'Calcula el ITBMS de una compra o de una factura. Elige si tu importe ya incluye el impuesto y la tarifa que corresponde; obtienes la base, el impuesto y el total.',
    fields: [
      { key: 'amount', label: 'Importe (B/.)', digits: 2 },
      { key: 'mode', label: '¿El importe incluye ITBMS?', type: 'select', options: [{ value: 'add', label: 'No: agregar el ITBMS' }, { value: 'remove', label: 'Sí: separar el ITBMS del total' }] },
      { key: 'rate', label: 'Tarifa', type: 'select', options: [{ value: '7', label: '7%: tarifa general' }, { value: '10', label: '10%: bebidas alcohólicas y hospedaje' }, { value: '15', label: '15%: productos del tabaco' }] },
    ],
    steps: ['Escribe el importe con hasta dos decimales.', 'Indica si ese importe ya incluye el impuesto: un precio de etiqueta suele incluirlo; una cotización «más ITBMS», no.', 'Elige la tarifa. La general es 7%; usa 10% o 15% solo para los casos que indica la ley.'],
    formula: 'Agregar: ITBMS = base × tarifa; total = base + ITBMS. Separar: base = total ÷ (1 + tarifa); ITBMS = total − base. Cada resultado se redondea al centésimo más cercano.',
    example: 'Ejemplos hipotéticos: B/.100.00 más el 7% son B/.107.00. Un total de B/.53.50 con el 7% incluido tiene una base de B/.50.00 y B/.3.50 de ITBMS. Una noche de hotel de B/.120.00 más el 10% cuesta B/.132.00.',
    limits: ['No determina qué tarifa ni qué exención corresponde a cada producto o servicio: eso lo fija la ley. Si tienes dudas, consulta la DGI o a un contador.', 'No calcula otros impuestos ni cargos, como el impuesto selectivo al consumo, la propina o el envío.', 'El comercio puede redondear producto por producto; el total de una factura con varios artículos puede diferir en algún centésimo.', 'Importe hasta B/.10,000,000 con dos decimales.'],
    context: [
      'El ITBMS es el impuesto a la transferencia de bienes muebles y la prestación de servicios. Desde el 1 de julio de 2010 su tarifa general es 7% (Ley 8 de 2010, que modificó el artículo 1057-V del Código Fiscal).',
      'La misma norma fija dos tarifas especiales: 10% para la importación y venta de bebidas alcohólicas y para el hospedaje, y 15% para los productos derivados del tabaco.',
      'Para quitar el ITBMS de un precio se divide entre 1.07; no se resta el 7% del total. B/.107.00 × 0.93 da B/.99.51, pero la base correcta es B/.100.00.',
    ],
    checkedOn: '2026-11-27',
    sources: [itbms],
    related: [{ title: 'Dividir la cuenta y la propina', path: '/compras/dividir-la-cuenta/' }, { title: 'Comparar descuentos y promociones', path: '/compras/descuentos-y-promociones/' }, shopping],
    faq: [
      { q: '¿Cuál es la tarifa del ITBMS en Panamá?', a: 'La tarifa general es 7%. La ley aplica 10% a las bebidas alcohólicas y al hospedaje, y 15% a los productos derivados del tabaco (Código Fiscal, artículo 1057-V, parágrafo 6, según la Ley 8 de 2010).' },
      { q: '¿Cómo saco el ITBMS de un precio que ya lo incluye?', a: 'Divide el precio entre 1.07 para obtener la base; la diferencia es el impuesto. B/.53.50 ÷ 1.07 = B/.50.00 de base y B/.3.50 de ITBMS. Restar el 7% del total da un resultado incorrecto.' },
      { q: '¿Todos los productos pagan ITBMS?', a: 'No. El Código Fiscal enumera operaciones exentas en el mismo artículo 1057-V. Si un producto de tu factura no muestra ITBMS, puede estar exento; esta herramienta no lo determina.' },
    ],
  },
  {
    id: 'split', path: '/compras/dividir-la-cuenta/', category: 'Compras', title: 'Calculadora para dividir la cuenta y la propina',
    description: 'Divide la cuenta del restaurante entre varias personas, con propina sobre el consumo sin ITBMS y redondeo a monedas de 5 o 25 centésimos.',
    intro: 'Reparte una cuenta en partes iguales. Añade la propina que quieras dejar y, si lo prefieres, redondea lo que paga cada persona para pagar con monedas.',
    fields: [
      { key: 'total', label: 'Total de la factura, con ITBMS (B/.)', digits: 2 },
      { key: 'tax', label: 'ITBMS de la factura (B/.), opcional', digits: 2, optional: true },
      { key: 'tip', label: 'Propina (%)', value: '10' },
      { key: 'people', label: 'Número de personas', value: '2', digits: 0 },
      { key: 'rounding', label: 'Redondear lo que paga cada persona', type: 'select', options: [{ value: 'none', label: 'Sin redondeo: reparto exacto' }, { value: '0.05', label: 'Hacia arriba, a 5 centésimos' }, { value: '0.25', label: 'Hacia arriba, a 25 centésimos' }, { value: '1.00', label: 'Hacia arriba, a B/.1.00' }] },
    ],
    steps: ['Escribe el total de la factura tal como figura, con el ITBMS incluido.', 'Si quieres calcular la propina sobre el consumo sin impuesto, escribe el ITBMS de la factura. Si lo dejas vacío, la propina se calcula sobre el total.', 'Revisa si la factura ya incluye un cargo por servicio o propina; en ese caso, escribe 0%.', 'Indica cuántas personas pagan y si quieres redondear cada parte.'],
    formula: 'Propina = (total − ITBMS) × porcentaje. Total a pagar = total de la factura + propina. Sin redondeo, se reparte en centésimos y las primeras personas pagan un centésimo más si la división no es exacta. Con redondeo, cada parte se redondea hacia arriba y lo sobrante se suma a la propina.',
    example: 'Ejemplo hipotético: factura de B/.85.60 con B/.5.60 de ITBMS. La propina del 10% sobre B/.80.00 es B/.8.00 y el total es B/.93.60. Entre 4 personas, cada una paga B/.23.40. Redondeando a 25 centésimos, cada una paga B/.23.50 y la propina sube a B/.8.40.',
    limits: ['Divide en partes iguales. No reparte por lo que consumió cada persona.', 'No sabe si el comercio ya cobró un cargo por servicio: revísalo en la factura.', 'La propina se redondea al centésimo más cercano. Total hasta B/.10,000,000, propina de 0% a 50% y de 1 a 100 personas.'],
    context: [
      'En Panamá, los precios del menú y la factura suelen incluir el ITBMS del 7%; las bebidas alcohólicas tributan al 10%. Si la factura lo desglosa, escribe ese importe para calcular la propina sobre el consumo.',
      'Las monedas en circulación son de 1, 5, 10, 25 y 50 centésimos, y de un balboa. Redondear a 5 o 25 centésimos facilita pagar en efectivo sin quedarse corto.',
    ],
    checkedOn: '2026-11-27',
    sources: [itbms],
    sourceNote: 'El reparto es una división aritmética en centésimos y no depende de una norma. La propina es una decisión de quien paga: la herramienta no recomienda un porcentaje.',
    related: [{ title: 'Calcular el ITBMS', path: '/impuestos/itbms/' }, shopping, budget],
    faq: [
      { q: '¿La propina se calcula antes o después del ITBMS?', a: 'Es una decisión de quien paga. Si escribes el ITBMS de la factura, la herramienta calcula la propina sobre el consumo sin impuesto; si lo dejas vacío, sobre el total.' },
      { q: '¿Por qué una persona paga un centésimo más?', a: 'Porque no siempre se puede dividir un importe en partes exactas de centésimos. B/.10.00 entre 3 son B/.3.34 + B/.3.33 + B/.3.33: la suma da exactamente B/.10.00.' },
      { q: '¿Qué pasa con lo que sobra al redondear?', a: 'Se suma a la propina. La herramienta te muestra cuánto se recauda en total y cuánto sobra frente al importe exacto.' },
    ],
  },
  {
    id: 'holidays', path: '/vida-cotidiana/dias-habiles-y-feriados/', category: 'Vida cotidiana', title: 'Calculadora de días hábiles y feriados de Panamá',
    description: 'Cuenta los días hábiles entre dos fechas sin fines de semana ni feriados nacionales de Panamá. Incluye el calendario de feriados de 2027.',
    intro: 'Elige dos fechas y obtén los días calendario, los días hábiles y las fiestas y duelos nacionales del intervalo, según el Código de Trabajo.',
    fields: [
      { key: 'start', label: 'Fecha inicial', type: 'date' },
      { key: 'end', label: 'Fecha final', type: 'date' },
      { key: 'week', label: 'Días laborables', type: 'select', options: [{ value: 'mon-fri', label: 'De lunes a viernes' }, { value: 'mon-sat', label: 'De lunes a sábado' }] },
    ],
    steps: ['Elige la fecha inicial y la final. Las dos se cuentan.', 'Indica si trabajas de lunes a viernes o de lunes a sábado.', 'Revisa la lista de feriados del intervalo y si caen en día laborable.'],
    formula: 'Días hábiles = días del intervalo − domingos (y sábados, si no son laborables) − fiestas y duelos nacionales que caen en un día laborable. Viernes Santo y martes de carnaval dependen de la fecha de Pascua de cada año.',
    example: 'En 2027, de lunes a viernes, hay 261 días laborables. Nueve fiestas nacionales caen en un día laborable, así que quedan 252 días hábiles.',
    limits: ['Incluye las fiestas y duelos nacionales del art. 46 del Código de Trabajo y el lunes de descanso del art. 47. No incluye días libres decretados por el Órgano Ejecutivo, feriados locales ni días de cierre de una institución.', 'No sirve para plazos judiciales ni administrativos, que tienen sus propias reglas de cómputo.', 'Intervalo de hasta 10 años, con fechas entre 2000 y 2100.'],
    context: [
      'Fiestas y duelos nacionales de 2027, según el Código de Trabajo:',
      ...holidaysOf(2027).map(h => h.text),
      'Cuando una fiesta nacional cae en domingo, el lunes siguiente es día de descanso obligatorio (art. 47). En 2027 ocurre con el 28 de noviembre: el descanso es el lunes 29.',
      'El día de la toma de posesión presidencial (1 de julio) es fiesta solo en los años en que hay cambio de gobierno: el próximo es 2029.',
    ],
    checkedOn: '2026-11-27',
    sources: [laborCodeSource, law291Source],
    related: [{ title: 'Calcular las horas extras y el trabajo en feriados', path: '/calculadoras/horas-extras/' }, { title: 'Calcular las vacaciones', path: '/calculadoras/vacaciones/' }, { title: 'Planear una meta de ahorro', path: '/finanzas/meta-de-ahorro/' }],
    faq: [
      { q: '¿Cuáles son los feriados de Panamá en 2027?', a: `Según el Código de Trabajo: ${holidaysOf(2027).map(h => h.day).join('; ')}.` },
      { q: '¿Qué pasa si un feriado cae en domingo?', a: 'El lunes siguiente es día de descanso obligatorio (Código de Trabajo, art. 47). Si cae en sábado, la norma no traslada el descanso.' },
      { q: '¿El 4 de noviembre es feriado?', a: 'No figura entre las fiestas nacionales del artículo 46 del Código de Trabajo. Algunos años el Órgano Ejecutivo decreta días libres adicionales; esta herramienta no los incluye.' },
    ],
  },
  {
    id: 'card', path: '/finanzas/tarjeta-de-credito/', category: 'Finanzas', title: 'Calculadora de tarjeta de crédito: intereses y pago mínimo',
    description: 'Calcula cuántos meses tardas en pagar tu tarjeta de crédito y cuántos intereses pagas con un pago fijo o pagando solo el mínimo.',
    intro: 'Escribe el saldo de tu tarjeta, la tasa de interés anual de tu estado de cuenta y cuánto pagarás cada mes. Compara pagar una cuota fija con pagar solo el mínimo.',
    fields: [
      { key: 'balance', label: 'Saldo de la tarjeta (B/.)', digits: 2 },
      { key: 'rate', label: 'Tasa de interés anual (%)' },
      { key: 'mode', label: 'Cómo vas a pagar', type: 'select', options: [{ value: 'fixed', label: 'Un pago fijo cada mes' }, { value: 'minimum', label: 'Solo el pago mínimo' }] },
      { key: 'payment', label: 'Pago fijo mensual (B/.)', digits: 2 },
      { key: 'minPercent', label: 'Pago mínimo: porcentaje del saldo (%)', value: '5' },
      { key: 'minFloor', label: 'Pago mínimo: monto mínimo (B/.)', value: '25', digits: 2 },
    ],
    steps: ['Copia el saldo y la tasa de interés anual de tu estado de cuenta.', 'Elige si pagarás una cantidad fija o solo el mínimo. Para el mínimo, usa el porcentaje y el monto mínimo que indica tu banco.', 'Revisa los meses, los intereses y cuánto tendrías que pagar para saldar la deuda en 12, 24 o 36 meses.'],
    formula: 'Cada mes: interés = saldo × tasa anual ÷ 12; nuevo saldo = saldo + interés − pago. El pago mínimo es el mayor entre el porcentaje indicado del saldo con intereses y el monto mínimo. El pago fijo para saldar en n meses = saldo × i ÷ (1 − (1 + i)^−n), con i = tasa ÷ 12.',
    example: 'Ejemplo hipotético: un saldo de B/.2,000.00 al 36% anual se paga en 31 meses con B/.100.00 al mes, con B/.1,099.92 de intereses. Pagando solo el mínimo (5% del saldo, al menos B/.25.00), tardaría 95 meses y pagaría B/.2,366.65 de intereses.',
    limits: ['Supone que no haces compras nuevas ni retiros, y que la tasa no cambia.', 'Calcula el interés sobre el saldo de cada mes. Tu banco puede usar el saldo promedio diario y cobrar cargos, seguros, comisiones o intereses por mora que aquí no se incluyen.', 'El pago mínimo real lo fija tu banco y puede calcularse de otra forma: revísalo en tu estado de cuenta.', 'Saldo hasta B/.10,000,000, tasa de 0% a 100% y plazo de hasta 50 años.'],
    context: [
      'Pagar solo el mínimo mantiene la tarjeta al día, pero alarga la deuda: como el mínimo baja a medida que baja el saldo, la mayor parte de los primeros pagos se va en intereses.',
      'Si tienes varias deudas, pagar primero la de tasa más alta reduce el total de intereses. Usa la calculadora con cada tarjeta para comparar.',
      'Antes de consolidar la deuda con un préstamo personal, compara la cuota y el costo total con la calculadora de préstamos, incluidas las comisiones y los seguros.',
    ],
    checkedOn: '2026-11-27',
    sources: [],
    sourceNote: 'La simulación aplica la fórmula del interés compuesto mensual y no depende de una norma. La tasa, el pago mínimo y el método de cálculo del interés los fija el contrato de tu tarjeta: consúltalos en tu estado de cuenta o con tu banco.',
    related: [{ title: 'Estimar una cuota de préstamo', path: '/finanzas/calculadora-prestamos/' }, budget, { title: 'Planear una meta de ahorro', path: '/finanzas/meta-de-ahorro/' }],
    faq: [
      { q: '¿Cuánto tardo en pagar mi tarjeta pagando solo el mínimo?', a: 'Depende del saldo, la tasa y cómo calcula el mínimo tu banco. Con B/.2,000.00 al 36% anual y un mínimo del 5% (al menos B/.25.00), serían 95 meses y B/.2,366.65 de intereses. Con un pago fijo de B/.100.00, 31 meses.' },
      { q: '¿Cómo se calcula el interés de la tarjeta de crédito?', a: 'En esta simulación, el saldo de cada mes se multiplica por la tasa anual dividida entre 12. Muchos bancos calculan el interés sobre el saldo promedio diario, así que el importe real puede variar algo.' },
      { q: '¿Qué pasa si mi pago no cubre los intereses?', a: 'La deuda no baja nunca. La calculadora te avisa y te pide un pago mayor.' },
    ],
  },
];

const sbpRate = { title: 'Superintendencia de Bancos — Acuerdo 3-2002: tasa de interés nominal y efectiva', url: 'https://www.superbancos.gob.pa/documentos/leyes_y_regulaciones/acuerdos/2002/Acuerdo_3-2002.pdf' };
const sbpTable = { title: 'Superintendencia de Bancos — Acuerdo 6-2026: desglose de cuotas en capital e intereses', url: 'https://www.superbancos.gob.pa/documentos/leyes_y_regulaciones/acuerdos/2026/Acuerdo_06-2026.pdf' };
const sneFuel = { title: 'Secretaría Nacional de Energía — Resolución MIPRE-2026-0034986 (Gaceta Oficial 30603-A): precios máximos por litro', url: 'https://www.gacetaoficial.gob.pa/storage/gacetas/2026/09/30603_A/105013.pdf' };
const carLoan = { title: 'Calcular el financiamiento de un auto', path: '/vehiculos/financiamiento-de-auto/' };
const fuelTrip = { title: 'Calcular el combustible de un viaje', path: '/vehiculos/combustible-por-viaje/' };
const carCost = { title: 'Calcular el costo mensual de un auto', path: '/vehiculos/costo-mensual-de-un-auto/' };
const currency = 'El balboa y el dólar estadounidense circulan a la par (1 B/. = 1 US$), así que puedes escribir los importes en cualquiera de las dos monedas.';
const vehicleCheck = '2026-11-25';

export const vehicleTools: Tool[] = [
  {
    id: 'car-loan', path: '/vehiculos/financiamiento-de-auto/', category: 'Vehículos', title: 'Calculadora de financiamiento de autos',
    description: 'Calcula la letra mensual de un auto financiado en Panamá: abono, tasa, plazo, seguros y comisión de cierre. Incluye tabla de amortización y tasa efectiva.',
    intro: 'Estima la letra mensual de un auto nuevo o usado y cuánto pagarás en total. Escribe la tasa que te ofrece tu banco o financiera: la calculadora no supone ninguna.',
    fields: [
      { key: 'price', label: 'Precio del auto (B/. o US$)', digits: 2 },
      { key: 'downPayment', label: 'Abono inicial (B/. o US$)', value: '0', digits: 2 },
      { key: 'rate', label: 'Tasa de interés anual (%)', digits: 6 },
      { key: 'rateType', label: 'Tipo de tasa', type: 'select', options: [{ value: 'nominal', label: 'Nominal anual (la que suele figurar en la oferta)' }, { value: 'effective', label: 'Efectiva anual' }] },
      { key: 'months', label: 'Plazo (meses)', value: '72', digits: 0 },
      { key: 'insurance', label: 'Seguros mensuales: auto y vida (B/., opcional)', value: '0', digits: 2 },
      { key: 'bankFees', label: 'Comisión o gastos de cierre del banco (B/., opcional)', value: '0', digits: 2 },
      { key: 'otherCosts', label: 'Notaría, registro y otros pagos iniciales (B/., opcional)', value: '0', digits: 2 },
    ],
    steps: ['Escribe el precio final del auto, con impuestos incluidos, y el abono que darás. Si entregas tu auto usado como parte de pago, súmalo al abono.', 'Copia la tasa anual y el plazo de la cotización del banco o la financiera, e indica si la tasa es nominal o efectiva.', 'Añade los seguros mensuales y los gastos iniciales si los conoces, y revisa la tabla de amortización antes de firmar.'],
    formula: 'Monto financiado = precio − abono. Cuota = M × i ÷ (1 − (1 + i)^−n), con i = tasa nominal ÷ 12 (o la tasa mensual equivalente a la efectiva) y n = meses. Cada mes, interés = saldo × i redondeado al centésimo, y la última cuota ajusta los centavos. La tasa efectiva estimada es la tasa interna de retorno de los pagos, incluida la comisión de cierre, anualizada como (1 + i)^12 − 1.',
    example: 'Ejemplo hipotético: auto de B/.25,000 con abono de B/.5,000. Se financian B/.20,000 al 8% nominal anual durante 72 meses: la letra es B/.350.66 y los intereses suman B/.5,247.98. Con B/.300 de comisión de cierre, la tasa efectiva estimada sube de 8.30% a 8.89%. La tasa del ejemplo no es una oferta real.',
    limits: ['No consulta tasas de bancos ni financieras y no incluye ninguna por defecto. El resultado depende de la tasa y las condiciones que escribas.', 'Supone cuotas mensuales iguales, tasa fija y ningún abono extraordinario. No calcula el FECI, recargos por mora ni cambios de tasa.', 'Siguiendo el Acuerdo 3-2002 de la Superintendencia de Bancos, la tasa efectiva estimada incluye la comisión de cierre y excluye seguros, notaría y registro. La tasa efectiva oficial de tu préstamo es la que informe tu banco.', 'Precio y gastos hasta B/.10,000,000 con dos decimales; plazo de 1 a 120 meses; tasa de 0% a 1000% con hasta seis decimales.', currency],
    sources: [sbpRate, sbpTable], related: [{ title: 'Calcular otro préstamo', path: '/finanzas/calculadora-prestamos/' }, carCost, { title: 'Ahorrar para el abono', path: '/finanzas/meta-de-ahorro/' }],
    faq: [
      { q: '¿Cómo se calcula la letra de un carro en Panamá?', a: 'Se resta el abono al precio para obtener el monto financiado y se aplica la fórmula de cuota fija: monto × i ÷ (1 − (1 + i)^−n), donde i es la tasa mensual y n el número de meses. Por ejemplo, B/.20,000 al 8% nominal anual durante 72 meses dan una letra de B/.350.66, sin contar los seguros.' },
      { q: '¿Qué diferencia hay entre la tasa nominal y la tasa efectiva?', a: 'La nominal es el porcentaje anual que anuncia el banco. La efectiva refleja el costo real del dinero en el tiempo e incluye comisiones como las de cierre. El Acuerdo 3-2002 de la Superintendencia de Bancos obliga a los bancos a informar la tasa efectiva y la define como una tasa interna de retorno de los flujos del préstamo.' },
      { q: '¿Los seguros forman parte de la tasa efectiva?', a: 'No. Según el Acuerdo 3-2002, las sumas que el banco cobra para pagar pólizas de seguros, notaría, registro, FECI o tributos no se consideran interés. Por eso la calculadora suma los seguros al costo total, pero no a la tasa efectiva.' },
      { q: '¿Conviene dar un abono más alto o pedir un plazo más corto?', a: 'Ambas opciones reducen los intereses totales. Un abono mayor baja el monto financiado y la letra; un plazo más corto sube la letra, pero acorta el tiempo en que pagas intereses. Prueba las dos combinaciones con la calculadora y compara el total pagado.' },
      { q: '¿El resultado es igual a la cotización de mi banco?', a: 'Debería ser muy parecido si usas la misma tasa, plazo y cargos, pero el banco puede redondear distinto, cobrar el FECI o incluir otros cargos. El Acuerdo 6-2026 de la Superintendencia exige que el banco te entregue por escrito el desglose de cada cuota: compáralo con la tabla de esta calculadora.' },
    ],
    checkedOn: vehicleCheck,
  },
  {
    id: 'fuel-trip', path: '/vehiculos/combustible-por-viaje/', category: 'Vehículos', title: 'Calculadora de combustible por viaje',
    description: 'Calcula cuántos litros o galones de gasolina o diésel gastarás en un viaje y cuánto costará. Acepta km/l, km/galón, mpg o l/100 km y reparte el gasto.',
    intro: 'Estima el combustible y el costo de un viaje por carretera. Escribe el precio que pagas en la bomba, por litro o por galón: la calculadora no incluye precios.',
    fields: [
      { key: 'distance', label: 'Distancia del viaje (km)', digits: 2 },
      { key: 'trip', label: 'Recorrido', type: 'select', options: [{ value: 'one-way', label: 'Solo ida' }, { value: 'round', label: 'Ida y vuelta (doble de la distancia)' }] },
      { key: 'efficiency', label: 'Rendimiento del vehículo', digits: 2 },
      { key: 'unit', label: 'Unidad del rendimiento', type: 'select', options: [{ value: 'kml', label: 'Kilómetros por litro (km/l)' }, { value: 'kmgal', label: 'Kilómetros por galón (km/gal)' }, { value: 'mpg', label: 'Millas por galón (mpg, galón de EE. UU.)' }, { value: 'l100', label: 'Litros cada 100 km (l/100 km)' }] },
      { key: 'price', label: 'Precio del combustible (B/. o US$)', digits: 3 },
      { key: 'priceUnit', label: 'El precio es', type: 'select', options: [{ value: 'liter', label: 'Por litro (como lo publica la Secretaría de Energía)' }, { value: 'gallon', label: 'Por galón' }] },
      { key: 'people', label: 'Personas que comparten el gasto', value: '1', digits: 0 },
    ],
    steps: ['Escribe la distancia en kilómetros y elige si es solo ida o ida y vuelta.', 'Indica el rendimiento de tu vehículo en la unidad que conozcas. Lo encontrarás en el manual o en la computadora de viaje del auto.', 'Escribe el precio que pagas en la estación e indica si es por litro o por galón. Si compartes el viaje, indica cuántas personas pagan.'],
    formula: 'Combustible (litros) = kilómetros recorridos ÷ rendimiento en km/l. Costo = litros × precio por litro. Conversiones exactas: 1 galón de EE. UU. = 3.785411784 litros y 1 milla = 1.609344 km. Con l/100 km, el rendimiento en km/l es 100 ÷ el valor.',
    example: 'Ejemplo hipotético: un viaje de 100 km de ida y vuelta (200 km) en un auto que rinde 12 km/l, con gasolina a B/.1.25 por litro, consume 16.67 litros (4.40 galones) y cuesta B/.20.83, es decir, B/.10.42 por persona si lo comparten dos. El precio del ejemplo no es un precio oficial.',
    limits: ['No incluye precios de combustible. La Secretaría Nacional de Energía fija precios máximos por litro para cada localidad y los actualiza cada 14 días en la Gaceta Oficial.', 'El rendimiento real cambia con el tráfico, la velocidad, la carga, el aire acondicionado y el estado del vehículo. Usa un valor realista de tu auto.', 'No incluye peajes, estacionamiento ni desgaste del vehículo. Para esos gastos, usa la calculadora de costo mensual.', 'Distancia de 0.01 a 100,000 km, rendimiento de 0.01 a 1000, precio de B/.0 a B/.100 con hasta tres decimales y de 1 a 100 personas.', currency],
    sources: [sneFuel, nist], related: [carCost, carLoan, { title: 'Organizar el gasto del viaje en Mi Quincena', path: '/finanzas/mi-quincena/' }],
    faq: [
      { q: '¿Cuánta gasolina gasto por kilómetro?', a: 'Divide 1 entre el rendimiento en km/l. Un auto que rinde 12 km/l gasta 0.083 litros por kilómetro. Multiplicado por el precio por litro, obtienes el costo por kilómetro que muestra la calculadora.' },
      { q: '¿En Panamá la gasolina se vende por litro o por galón?', a: 'La Secretaría Nacional de Energía publica los precios máximos de venta en balboas por litro, con el factor 1 galón = 3.785412 litros. Muchas personas siguen hablando de galones, por eso la calculadora acepta el precio en cualquiera de las dos unidades.' },
      { q: '¿Cómo convierto millas por galón a kilómetros por litro?', a: 'Multiplica las mpg por 1.609344 (km por milla) y divide entre 3.785411784 (litros por galón de EE. UU.). Por ejemplo, 30 mpg equivalen a unos 12.75 km/l. La calculadora hace la conversión si eliges mpg.' },
      { q: '¿Cada cuánto cambian los precios del combustible?', a: 'La Secretaría Nacional de Energía actualiza los precios máximos cada 14 días según los precios internacionales de paridad de importación, y son distintos en cada localidad. Por eso conviene escribir el precio vigente el día del viaje.' },
    ],
    checkedOn: vehicleCheck,
  },
  {
    id: 'car-cost', path: '/vehiculos/costo-mensual-de-un-auto/', category: 'Vehículos', title: 'Calculadora del costo mensual de un auto',
    description: 'Suma lo que cuesta mantener un carro cada mes en Panamá: letra, combustible, seguro, mantenimiento, placa, peajes y estacionamiento. Con desglose y costo por km.',
    intro: 'Descubre cuánto te cuesta tener un auto, más allá de la letra. Escribe tus gastos mensuales y anuales: la calculadora los convierte a un total por mes y por año.',
    fields: [
      { key: 'loanPayment', label: 'Letra del financiamiento al mes (B/., opcional)', value: '0', digits: 2 },
      { key: 'fuel', label: 'Combustible al mes (B/.)', value: '0', digits: 2 },
      { key: 'parking', label: 'Estacionamiento al mes (B/., opcional)', value: '0', digits: 2 },
      { key: 'tolls', label: 'Peajes al mes (B/., opcional)', value: '0', digits: 2 },
      { key: 'other', label: 'Lavado y otros gastos al mes (B/., opcional)', value: '0', digits: 2 },
      { key: 'insuranceYear', label: 'Seguro del auto al año (B/.)', value: '0', digits: 2 },
      { key: 'maintenanceYear', label: 'Mantenimiento, reparaciones y llantas al año (B/.)', value: '0', digits: 2 },
      { key: 'registrationYear', label: 'Placa, revisado y otros trámites al año (B/., opcional)', value: '0', digits: 2 },
      { key: 'depreciationYear', label: 'Pérdida de valor estimada al año (B/., opcional)', value: '0', digits: 2 },
      { key: 'kmPerMonth', label: 'Kilómetros recorridos al mes (opcional)', optional: true, digits: 2 },
    ],
    steps: ['Escribe los gastos que pagas cada mes: letra, combustible, estacionamiento, peajes y otros. Deja en cero los que no tengas.', 'Escribe los gastos anuales tal como los pagas: seguro, mantenimiento, placa y revisado. La calculadora los reparte entre 12 meses.', 'Si quieres conocer el costo por kilómetro, indica cuántos kilómetros recorres al mes. La pérdida de valor es opcional, pero muestra el costo completo del auto.'],
    formula: 'Costo mensual = suma de gastos mensuales + (suma de gastos anuales ÷ 12). Costo anual = costo mensual × 12. Costo por kilómetro = costo mensual ÷ kilómetros recorridos al mes.',
    example: 'Ejemplo hipotético: letra de B/.420, combustible B/.140, estacionamiento B/.60, peajes B/.25 y otros B/.15 al mes, más seguro B/.720, mantenimiento B/.600, placa y revisado B/.80 y pérdida de valor B/.1,800 al año. El auto cuesta B/.926.67 al mes (B/.11,120 al año); sin la pérdida de valor, B/.776.67. Con 1,200 km al mes, cada kilómetro cuesta unos B/.0.77.',
    limits: ['No incluye tarifas de seguros, placas, revisado ni peajes: cada importe lo escribes tú con tus recibos o cotizaciones.', 'Los gastos anuales se reparten en partes iguales; en la práctica se pagan en meses concretos. Reserva el dinero cada mes para no tener sorpresas.', 'La pérdida de valor es una estimación tuya; no se paga cada mes, pero refleja cuánto valdrá menos el auto al venderlo.', 'Cada importe hasta B/.10,000,000 con dos decimales; kilómetros al mes de 1 a 100,000. Los totales se redondean al centésimo al mostrarlos.', currency],
    sources: [sneFuel, sbpTable], related: [fuelTrip, carLoan, { title: 'Organizar tus gastos en Mi Quincena', path: '/finanzas/mi-quincena/' }],
    faq: [
      { q: '¿Cuánto cuesta mantener un carro al mes?', a: 'Depende de tu letra, cuánto manejas y tus seguros. Suma los gastos mensuales y divide entre 12 los anuales, como hace esta calculadora. En el ejemplo de esta página, un auto con letra de B/.420 cuesta B/.926.67 al mes con todos los gastos y la pérdida de valor.' },
      { q: '¿Por qué incluir la pérdida de valor si no la pago cada mes?', a: 'Porque es un costo real: el auto vale menos cada año y lo notarás al venderlo o cambiarlo. Si solo quieres saber cuánto dinero sale de tu bolsillo cada mes, déjala en cero; la calculadora muestra también el total sin ella.' },
      { q: '¿Cómo calculo cuánto gasto en combustible al mes?', a: 'Usa la calculadora de combustible por viaje con los kilómetros que recorres en un mes, tu rendimiento y el precio por litro. El resultado es el importe que debes escribir en el campo de combustible.' },
      { q: '¿Qué gastos anuales suelen olvidarse?', a: 'El seguro, la placa y el revisado, el cambio de llantas, la batería y las reparaciones imprevistas. Repartirlos entre 12 meses ayuda a reservar el dinero con tiempo.' },
    ],
    checkedOn: vehicleCheck,
  },
];
