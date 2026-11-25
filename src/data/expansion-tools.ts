export type ToolId = 'unit' | 'discount' | 'savings' | 'grades' | 'energy' | 'car-loan' | 'fuel-trip' | 'car-cost';
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
  /** Fecha ISO en que se consultaron las fuentes; por defecto, la de la expansión 3. */
  checkedOn?: string;
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
