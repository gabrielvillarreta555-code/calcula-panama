/**
 * Salario mínimo por hora: Decreto Ejecutivo 13 de 31 de diciembre de 2025 (Gaceta Oficial 30438 de 6 de enero de 2026),
 * vigente desde el 16 de enero de 2026 (art. 5). Transcrito del art. 2 y verificado fila por fila contra las páginas
 * escaneadas de la Gaceta (copia de LEGISPAN, Asamblea Nacional) el 27-11-2026.
 *
 * - `r1` y `r2`: B/. por hora en la Región 1 y la Región 2 (art. 3). `null`: la tasa no se fija para esa región.
 * - `monthly`: el trabajo doméstico se fija como monto mensual (parágrafo del art. 2), no por hora.
 * Antes de cambiar un valor, verifica el decreto vigente y actualiza `MINIMUM_WAGE_SOURCE.reviewedOn`.
 */
export interface WageRate { id: string; group: string; label: string; r1: number; r2: number | null; monthly?: true }

export const MINIMUM_WAGE_SOURCE = {
  decree: 'Decreto Ejecutivo 13 de 31 de diciembre de 2025',
  gazette: 'Gaceta Oficial 30438 de 6 de enero de 2026',
  effective: '2026-01-16',
  reviewedOn: '2026-11-27',
  url: 'https://s3-legispan.asamblea.gob.pa/legispan/GACETAS/2020/2026/30438_2026.pdf'
} as const;

/** Art. 3: distritos de la Región 1. La Región 2 es el resto de los distritos del país. */
export const REGION_1_DISTRICTS = ['Panamá', 'Colón', 'San Miguelito', 'David', 'Santiago', 'Chitré', 'Aguadulce', 'Penonomé', 'Bocas del Toro', 'La Chorrera', 'Arraiján', 'Capira', 'Chame', 'Antón', 'Natá', 'Las Tablas', 'Bugaba', 'Boquete', 'Taboga', 'San Carlos', 'Chepo', 'Guararé', 'Los Santos', 'Pedasí', 'Dolega', 'San Félix', 'Barú', 'Boquerón', 'Portobelo', 'Donoso', 'Santa Isabel', 'Santa María', 'Parita', 'Pesé', 'Atalaya', 'Changuinola', 'Chiriquí Grande', 'Almirante', 'Tierras Altas', 'Omar Torrijos Herrera'] as const;

const g = (group: string, rows: [string, string, number, number | null][]): WageRate[] => rows.map(([id, label, r1, r2]) => ({ id, group, label, r1, r2 }));

export const MINIMUM_WAGES: WageRate[] = [
  ...g('Agricultura, ganadería, caza, silvicultura, acuicultura y pesca', [
    ['agro-pequena', 'Agricultura y ganadería: pequeña empresa', 1.64, 1.64],
    ['agro-gran', 'Agricultura y ganadería: gran empresa (11 empleados o más)', 2.10, 2.10],
    ['bananeras', 'Actividades bananeras', 2.58, 2.58],
    ['pesca-artesanal', 'Pesca artesanal', 2.30, 2.30],
    ['pesca-industrial', 'Pesca industrial', 2.65, 2.65],
  ]),
  ...g('Agroindustrias', [
    ['agroind-pequena-agricola', 'Agroindustria, parte agrícola: pequeña empresa', 1.67, 1.67],
    ['agroind-gran-agricola', 'Agroindustria, parte agrícola: gran empresa', 2.12, 2.12],
    ['agroind-pequena-proceso', 'Agroindustria, parte de procesamiento: pequeña empresa', 2.37, 2.00],
    ['agroind-gran-proceso', 'Agroindustria, parte de procesamiento: gran empresa', 3.04, 2.49],
  ]),
  ...g('Explotación de canteras', [
    ['areneras', 'Actividades areneras', 3.20, 3.20],
    ['minas-metalicas', 'Minas metálicas', 3.39, 3.39],
    ['minas-no-metalicas', 'Minas no metálicas', 3.20, 3.20],
  ]),
  ...g('Industrias manufactureras', [
    ['manuf-pequena', 'Industria manufacturera: pequeña empresa', 2.32, 1.95],
    ['manuf-gran', 'Industria manufacturera: gran empresa (16 empleados o más)', 3.13, 2.58],
    ['bebidas-pinturas', 'Bebidas alcohólicas (destilación y mezcla), pinturas y barnices', 3.08, 2.61],
    ['cemento', 'Fabricación de cemento o concreto', 3.39, 3.24],
    ['refrigeracion', 'Reparación de maquinaria y equipo de refrigeración', 3.15, 2.57],
    ['cana', 'Procesamiento de la caña de azúcar', 3.12, 3.12],
  ]),
  ...g('Electricidad, gas, agua y saneamiento', [
    ['electricidad', 'Suministro de electricidad, gas, vapor y aire acondicionado', 3.50, 3.50],
    ['hielo', 'Producción de hielo', 3.07, 2.53],
    ['agua', 'Suministro de agua, alcantarillado, desechos y saneamiento', 3.50, 3.50],
    ['alcantarillado', 'Alcantarillado', 3.18, 2.63],
    ['desechos', 'Recolección, tratamiento y eliminación de desechos', 3.21, 2.67],
    ['reciclaje', 'Procesamiento y recuperación de materiales de desecho', 3.04, 2.51],
  ]),
  ...g('Construcción', [
    ['construccion', 'Construcción', 3.51, 3.30],
    ['drenaje', 'Drenaje de tierras agrícolas y bosques', 2.12, 2.12],
  ]),
  ...g('Comercio', [
    ['mayor', 'Comercio al por mayor y en comisiones', 3.02, 2.48],
    ['cana-venta', 'Venta de productos derivados de la caña de azúcar', 3.02, 3.02],
    ['tanques', 'Tanques de combustible', 3.04, 2.50],
    ['menor-pequena', 'Comercio al por menor: pequeña empresa', 2.37, 1.99],
    ['menor-gran', 'Comercio al por menor: gran empresa (11 empleados o más)', 3.02, 2.48],
    ['supermercados', 'Supermercados (empresas con 5 o más sucursales)', 3.09, 2.54],
    ['estaciones', 'Estaciones de combustible', 3.02, 2.48],
    ['zonas-francas', 'Zonas francas y zonas económicas especiales', 3.77, 2.52],
    ['zona-libre', 'Zona Libre de Colón', 3.44, null],
  ]),
  ...g('Hoteles y restaurantes', [
    ['hotel-pequena', 'Hoteles: pequeña empresa', 2.38, 1.98],
    ['hotel-gran', 'Hoteles: gran empresa (11 empleados o más)', 2.96, 2.43],
    ['hotel-franquicia', 'Hoteles con franquicia o más de 200 habitaciones; hoteles de ocasión, moteles, pensiones y residenciales', 3.10, 2.55],
    ['rest-pequena', 'Restaurantes: pequeña empresa', 2.32, 1.95],
    ['rest-gran', 'Restaurantes: gran empresa (11 empleados o más)', 3.09, 2.54],
    ['discotecas', 'Discotecas, bares y cantinas', 3.40, 3.40],
  ]),
  ...g('Transporte, almacenamiento y correos', [
    ['transporte', 'Transporte', 3.16, 2.61],
    ['carga-zf-pequena', 'Transporte de carga en zonas francas: pequeña empresa (hasta 10)', 3.47, 2.58],
    ['carga-zf-gran', 'Transporte de carga en zonas francas: gran empresa (11 o más)', 3.49, 2.60],
    ['acuatico-pequena', 'Transporte acuático y aéreo: pequeña empresa (hasta 10)', 3.16, 2.58],
    ['acuatico-gran', 'Transporte acuático y aéreo: gran empresa (11 o más)', 3.18, 2.60],
    ['portuarios', 'Trabajadores portuarios', 3.64, 3.64],
    ['aeropuertos', 'Aeropuertos internacionales', 3.84, 3.84],
    ['buses', 'Conductores de buses', 3.47, 3.47],
    ['buses-colegiales', 'Conductores de buses colegiales', 3.02, 2.49],
    ['tripulantes', 'Tripulantes de cabina de vuelos internacionales', 5.01, 5.01],
    ['almacenamiento', 'Almacenamiento, depósitos y correos', 3.02, 2.48],
  ]),
  ...g('Información y comunicación', [
    ['informacion', 'Información y comunicación', 3.16, 3.16],
    ['edicion', 'Actividades de edición', 3.16, 2.62],
    ['audiovisual', 'Producción de radio, televisión, cine, video y sonido; salas de cine; agencias de noticias', 3.16, 2.61],
    ['telecom', 'Telecomunicaciones y difusión de televisión', 3.47, 3.47],
    ['radio-nacional', 'Difusión de radio con licencia nacional', 3.47, 3.47],
    ['radio-local', 'Difusión de radio con licencia local', 3.40, 3.40],
    ['camarografos', 'Camarógrafos', 3.47, 3.47],
  ]),
  ...g('Finanzas e inmobiliarias', [
    ['financieras', 'Actividades financieras y de seguros', 3.58, 3.58],
    ['empeno', 'Casas de empeño', 3.14, 3.14],
    ['inmobiliarias', 'Actividades inmobiliarias', 3.47, 3.10],
    ['centros-comerciales', 'Centros comerciales (con más de 50 locales)', 3.47, 3.47],
  ]),
  ...g('Servicios administrativos y de apoyo', [
    ['alquiler', 'Actividades de alquiler y arrendamiento', 3.12, 3.12],
    ['alquiler-autos', 'Renta y alquiler de vehículos', 3.43, 3.43],
    ['internet-cafes', 'Internet cafés', 2.82, 2.62],
    ['agencias-empleo', 'Agencias de empleo', 3.16, 3.16],
    ['viajes', 'Agencias de viajes, operadores turísticos y servicios de reserva', 3.09, 2.44],
    ['edificios', 'Servicios a edificios y paisajes', 2.98, 2.98],
    ['jardines', 'Mantenimiento y cuidado de paisajes (jardines, áreas verdes)', 2.12, 2.12],
    ['oficinas', 'Oficinas administrativas, apoyo a negocios y fotocopiado', 2.98, 2.98],
    ['seguridad', 'Agencias de seguridad y vigilancia', 3.04, 3.04],
  ]),
  ...g('Actividades profesionales, científicas y técnicas', [
    ['profesionales', 'Actividades profesionales, científicas y técnicas', 3.02, 3.02],
    ['veterinarias', 'Actividades veterinarias', 3.02, 2.48],
    ['firmas-grandes', 'Firmas de abogados, contabilidad y auditoría (15 empleados o más)', 3.18, 3.18],
    ['firmas-pequenas', 'Firmas de abogados, contabilidad y auditoría (14 empleados o menos)', 2.89, 2.89],
    ['abogados', 'Abogados', 3.70, 3.70],
    ['periodistas', 'Periodistas de radio, periódicos y televisión', 3.45, 3.45],
    ['mecanicos-aereo', 'Mecánicos de transporte aéreo', 4.92, 4.92],
    ['mecanicos-terrestre', 'Mecánicos de transporte terrestre', 3.45, 3.45],
    ['mecanicos-maritimo', 'Mecánicos de transporte marítimo', 3.83, 3.83],
  ]),
  ...g('Enseñanza y salud', [
    ['ensenanza', 'Enseñanza (personal administrativo)', 3.09, 2.52],
    ['salud', 'Servicios sociales y de salud humana', 3.22, 2.64],
    ['clinicas', 'Clínicas de salud y hospitales', 3.54, 2.66],
    ['tecnicos-salud', 'Técnicos de salud', 3.54, 3.54],
  ]),
  ...g('Artes, entretenimiento y otros servicios', [
    ['artes', 'Artes, entretenimiento y creatividad', 3.11, 3.11],
    ['juegos', 'Juegos de azar y apuestas', 3.63, 3.63],
    ['casino-talladores', 'Casinos: talladores, gerentes, jefes de sala y operadores de CCTV', 3.72, 3.72],
    ['casino-otros', 'Casinos: seguridad, aseo, saloneros, oficinistas y cajeros', 3.61, 3.61],
    ['gimnasios', 'Gimnasios', 3.43, 3.43],
    ['otros-servicios', 'Otras actividades de servicios', 3.12, 2.55],
    ['sin-fines-lucro', 'Organizaciones sin fines de lucro', 2.98, 2.45],
    ['computadoras', 'Reparación y mantenimiento de computadoras', 2.96, 2.96],
    ['enseres-pequena', 'Reparación de enseres personales y domésticos: pequeña empresa', 2.32, 1.94],
    ['enseres-gran', 'Reparación de enseres personales y domésticos: gran empresa (11 o más)', 2.98, 2.52],
    ['ph', 'Propiedades horizontales residenciales (más de 10 plantas) y asociaciones de inquilinos', 3.43, 3.43],
    ['spas', 'Spas y clínicas estéticas', 3.43, 2.57],
    ['extraterritoriales', 'Organizaciones y órganos extraterritoriales', 3.16, 3.16],
  ]),
  { id: 'domestico', group: 'Trabajo doméstico', label: 'Trabajador doméstico (monto mensual)', r1: 350, r2: 320, monthly: true },
];
