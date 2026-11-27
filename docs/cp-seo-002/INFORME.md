# CP-SEO-002 — Investigación y expansión orgánica

- **Proyecto:** Calcula Panamá (Blue Lab Studios).
- **Fecha:** 27 de noviembre de 2026.
- **Base:** `main` @ `a4f92c6` (33 URLs indexables).
- **Estado:** informe para la dirección. **No se ha modificado código, diseño ni contenido publicado.**

## 0. Cómo leer este informe

| Marca | Significado |
|---|---|
| **[C] Comprobado** | Verificado en el sitio, en el código, en una fuente oficial o en una publicación citada |
| **[D] Dato de la dirección** | Cifra facilitada por el CEO que no puedo comprobar desde aquí (Search Console) |
| **[E] Estimado** | Juicio basado en señales indirectas: cobertura de prensa, competidores que ya posicionan el tema, estacionalidad |

**No hay ningún volumen de búsqueda en este informe.** Desde este entorno **no se pudieron consultar**:
- Google Trends;
- el autocompletado de Google;
- las preguntas relacionadas;
- Search Console.

Las tres primeras son conexiones bloqueadas por la red del entorno [C]; Search Console requiere el acceso del CEO. La **evidencia de demanda** de cada búsqueda es cualitativa: existe cobertura recurrente de prensa nacional, existen páginas de competidores dedicadas al tema o hay un calendario oficial que genera picos previsibles. Cuando se reciba la exportación de Search Console, la priorización debe recalibrarse con datos reales.

---

## 1. Diagnóstico SEO actual

### 1.1 Datos de rendimiento

| Indicador | Valor | Tipo |
|---|---|---|
| Impresiones semanales | 1.140 | [D] |
| Clics orgánicos semanales | 10 | [D] |
| CTR implícito | ≈ 0,9 % (10 ÷ 1.140) | Cálculo sobre [D] |
| URLs indexables | 33: 200, canónica propia, sin `noindex` | [C] (27-11-2026) |
| Sitemap y solicitudes manuales | Enviados; 9 solicitudes hechas | [D] |
| Analítica propia | Ninguna; Cloudflare preparado e inactivo | [C] |

**Lectura [E]:** un CTR inferior al 1 % con un sitio que aún está acumulando impresiones suele indicar posiciones medias bajas (segunda página o más), no títulos defectuosos. **Sin la exportación de consultas y posiciones no se puede afirmar.** Es la primera petición de este informe (§8).

### 1.2 Auditoría técnica de las 33 URLs (build local de `main`)

Métricas de la tabla:
- **T:** caracteres del título.
- **D:** caracteres de la descripción.
- **Palabras:** texto en `<main>`.
- **Enl.:** enlaces internos contextuales recibidos desde el `<main>` de otras páginas. No incluye la cabecera ni el pie.

| URL | T | D | Palabras | Enl. | Observación |
|---|---|---|---|---|---|
| `/` | 66 | 177 | 662 | 31 | El índice de la portada **no enlaza** las 5 herramientas más nuevas |
| `/calculadoras/salario-neto/` | 49 | 153 | 1.631 | 11 | Sólida |
| `/calculadoras/decimo-tercer-mes/` | 72 | 190 | 1.292 | 12 | Título con «2026»; hay que actualizarlo en enero. Temporada: 15 de diciembre |
| `/calculadoras/vacaciones/` | 49 | 135 | 1.015 | 12 | No tiene guía complementaria |
| `/calculadoras/liquidacion-laboral/` | 59 | 148 | 1.742 | 9 | No tiene guía de renuncia ni de preaviso |
| `/calculadoras/horas-extras/` | 42 | 182 | 2.533 | 3 | Título con «2026». Pocos enlaces entrantes |
| `/finanzas/mi-quincena/` | 73 | 121 | 288 | 18 | Es una aplicación: texto corto, aceptable. Título largo |
| `/finanzas/calculadora-prestamos/` | 72 | 135 | 509 | 6 | Título con mayúsculas y guion largo, fuera del patrón. Texto breve y sin preguntas frecuentes |
| `/finanzas/meta-de-ahorro/` | 47 | 139 | 628 | 7 | Sin «Panamá» en el título |
| `/finanzas/tarjeta-de-credito/` | 75 | 128 | 691 | **1** | Huérfana de enlaces contextuales; título largo |
| `/compras/` | 33 | 175 | 491 | 3 | Categoría |
| `/compras/modo-pasillo/` | 67 | 126 | 134 | 7 | Es una aplicación: texto mínimo, aceptable |
| `/compras/precio-por-unidad/` | 62 | 141 | 635 | 5 | — |
| `/compras/descuentos-y-promociones/` | 56 | 135 | 570 | 6 | Sin «Panamá» en el título |
| `/compras/dividir-la-cuenta/` | 64 | 137 | 632 | 4 | — |
| `/impuestos/itbms/` | 62 | 129 | 622 | 3 | — |
| `/vehiculos/financiamiento-de-auto/` | 55 | 154 | 878 | 4 | Sin «Panamá» en el título |
| `/vehiculos/combustible-por-viaje/` | 53 | 150 | 719 | 3 | Sin «Panamá» en el título |
| `/vehiculos/costo-mensual-de-un-auto/` | 57 | 161 | 715 | 4 | Sin «Panamá» en el título |
| `/vida-cotidiana/consumo-electrico/` | 56 | 137 | 643 | 2 | Sin «Panamá»; no menciona ENSA ni Naturgy en el título. Pocos enlaces |
| `/vida-cotidiana/dias-habiles-y-feriados/` | 65 | 137 | 726 | **1** | Huérfana. Solo lista 2027; diciembre de 2026 queda fuera de su contenido |
| `/educacion/promedio-de-notas/` | 66 | 135 | 673 | 2 | — |
| `/guias/` | 54 | 143 | 233 | 6 | — |
| `/guias/descuentos-del-salario-en-panama/` | 72 | 164 | 829 | 2 | Título con «2026» |
| `/guias/fechas-de-pago-del-decimo-tercer-mes/` | 68 | 194 | 848 | 3 | Ya orientada a 2027 |
| `/guias/prima-de-antiguedad-e-indemnizacion/` | 68 | 185 | 989 | 3 | — |
| `/guias/horas-extras-en-panama/` | 71 | 174 | 991 | 2 | — |
| `/guias/itbms-en-panama/` | 60 | 147 | 672 | 2 | — |
| `/herramientas/` | 54 | 144 | 621 | 1 | Recibe enlaces desde la navegación, fuera del `<main>` |
| `/sobre-nosotros/`, `/contacto/`, `/privacidad/`, `/terminos/` | — | — | — | — | Institucionales: sin objetivo de tráfico |

**Hallazgos [C]:**
1. **Enlazado interno desequilibrado.**
   - Las páginas más nuevas reciben 1 a 3 enlaces contextuales; las laborales antiguas, 9 a 12.
   - La portada, con 31 enlaces salientes, no enlaza horas extras, ITBMS, dividir la cuenta, días hábiles ni tarjeta.
2. **Años en los títulos.** Tres páginas dicen «2026»: décimo, horas extras y descuentos del salario. Desde el 1 de enero de 2027 restarán relevancia. Hay que actualizarlas en la primera semana de enero, salvo la del décimo, que debe mantener «2026» hasta el pago del 15 de diciembre.
3. **Títulos largos.** Nueve títulos superan los 60 caracteres por el sufijo «| Calcula Panamá», que puede truncarse en los resultados. Google ya muestra el nombre del sitio aparte.
4. **Localización en los títulos.** Siete herramientas no incluyen «Panamá», lo que debilita la intención local frente a calculadoras genéricas de otros países.
5. **Pares herramienta–guía incompletos.** Vacaciones, préstamos, tarjeta, días hábiles y consumo eléctrico no tienen guía que las alimente.

### 1.3 Canibalización

| Par | Riesgo | Recomendación |
|---|---|---|
| `/impuestos/itbms/` ↔ `/guias/itbms-en-panama/` | Bajo-medio | Mantener las intenciones separadas: «calculadora / calcular» frente a «qué es / tarifas / exenciones». Vigilar en Search Console si ambas aparecen para la misma consulta |
| `/calculadoras/horas-extras/` ↔ `/guias/horas-extras-en-panama/` | Bajo-medio | El mismo criterio |
| `/calculadoras/decimo-tercer-mes/` ↔ `/guias/fechas-de-pago-del-decimo-tercer-mes/` | Bajo | Intenciones distintas: «calcular» frente a «fechas» |
| `/finanzas/calculadora-prestamos/` ↔ `/vehiculos/financiamiento-de-auto/` ↔ futura hipoteca | Medio | Cada página debe nombrar su producto: personal, auto, vivienda. No crear una «calculadora de cuotas» genérica adicional |
| `/vida-cotidiana/dias-habiles-y-feriados/` ↔ futura guía de feriados 2027 | **Medio** | Si se crea la guía, la herramienta debe orientarse a «contar días hábiles» y la guía, a «calendario de feriados» |
| `/compras/` ↔ `/herramientas/#compras` | Bajo | Una es categoría editorial y la otra, directorio. Correcto |

---

## 2. Inventario de 105 búsquedas investigadas

**Columnas:**
- **Intención:** I = informativa, T = transaccional o de cálculo, N = navegacional o de fecha.
- **Evidencia:** P = cobertura recurrente en la prensa nacional, C = competidor con página dedicada, O = fuente o calendario oficial, S = estacionalidad conocida. Ver §8.
- **Cobertura:** URL existente que la atiende, o «Nueva».
- **Encaje:** encaje con el sitio [E]: A = alto, M = medio, B = bajo.

Las consultas son **formulaciones representativas** de cada necesidad, no términos medidos.

### Salarios, prestaciones y derechos laborales

| # | Búsqueda | Int. | Evidencia | Cobertura | Encaje |
|---|---|---|---|---|---|
| 1 | calculadora de salario neto Panamá | T | C | `/calculadoras/salario-neto/` | A |
| 2 | cuánto me descuentan de seguro social | I | P | Salario neto y guía de descuentos | A |
| 3 | cómo calcular el décimo tercer mes | T | P, C | `/calculadoras/decimo-tercer-mes/` | A |
| 4 | tercera partida del décimo, diciembre 2026 | T/N | P, S | Décimo y guía de fechas | A |
| 5 | décimo tercer mes 2027 fechas de pago | N | P, S | `/guias/fechas-de-pago-…` | A |
| 6 | cómo calcular vacaciones en Panamá | T | C | `/calculadoras/vacaciones/` | A |
| 7 | vacaciones proporcionales al renunciar | I/T | C | Vacaciones y liquidación | A |
| 8 | calcular liquidación laboral Panamá | T | C | `/calculadoras/liquidacion-laboral/` | A |
| 9 | prima de antigüedad cálculo | T/I | C | Guía de prima | A |
| 10 | indemnización por despido injustificado | I | C | Guía de prima y liquidación | A |
| 11 | preaviso por renuncia, cuántos días | I | C | **Nueva** | A |
| 12 | renuncia voluntaria, qué me pagan | I | C | **Nueva** | A |
| 13 | cómo calcular horas extras en Panamá | T | C | `/calculadoras/horas-extras/` | A |
| 14 | cuánto pagan por trabajar un feriado | I | P, O | Horas extras y su guía | A |
| 15 | salario mínimo Panamá 2026 | I | P, O | **Nueva** | A |
| 16 | salario mínimo por hora a mensual | T | O (DE 13 de 2025: tarifa por hora) | **Nueva** | A |
| 17 | salario mínimo de la trabajadora doméstica | I | P | **Nueva** | A |
| 18 | licencia de maternidad, cuánto paga la CSS | I | P, C | **Nueva** | M (riesgo legal) |
| 19 | incapacidad de la CSS, cuánto pagan | I | P | **Nueva** | M (riesgo legal) |
| 20 | cuánto cotiza un independiente a la CSS | I | P | **Nueva** | M (tasa no verificada) |
| 21 | jubilación CSS: edad y cuotas tras la Ley 462 | I | P | **Nueva** | M (riesgo legal) |
| 22 | cómo calcular la pensión de vejez | T | P, O (simulador de la CSS) | Enlazar a la CSS | B |
| 23 | costo de un empleado para el empleador | T | C | **Nueva** | A |
| 24 | bono de jubilados diciembre 2026 | N | P | — | B (noticia) |
| 25 | calcular aumento de salario en porcentaje | T | [E] | **Nueva** (menor) | B |

### Calendarios, pagos y feriados

| # | Búsqueda | Int. | Evidencia | Cobertura | Encaje |
|---|---|---|---|---|---|
| 26 | días feriados Panamá 2027 | N | P, C, S | Días hábiles | A |
| 27 | feriados de diciembre 2026 | N | P, S | Días hábiles, solo como herramienta | A |
| 28 | carnaval 2027, fecha | N | P, S | Días hábiles | A |
| 29 | Semana Santa 2027 Panamá | N | S | Días hábiles | A |
| 30 | días hábiles entre dos fechas | T | [E] | Días hábiles | A |
| 31 | cuándo pagan la quincena de diciembre | N | P | Mi Quincena (parcial) | B |
| 32 | décimo del sector público, fecha | N | P | Guía de fechas (solo sector privado) | M |
| 33 | pago del PASE-U 2027 | N | P | — | B (sin fecha oficial) |
| 34 | fecha límite de la declaración de renta 2027 | N | O, S | **Nueva** | A |
| 35 | calendario escolar 2027 MEDUCA | N | S | **Nueva** | M |
| 36 | cuántos días faltan para… | T | [E] | Días hábiles (parcial) | B |

### Bancos, préstamos, intereses y tarjetas

| # | Búsqueda | Int. | Evidencia | Cobertura | Encaje |
|---|---|---|---|---|---|
| 37 | calculadora de préstamo personal Panamá | T | C | `/finanzas/calculadora-prestamos/` | A |
| 38 | tasa efectiva y tasa nominal, diferencia | I | O (Acuerdo SBP 3-2002) | Préstamos (parcial) | A |
| 39 | pago mínimo de la tarjeta de crédito | I/T | [E] | `/finanzas/tarjeta-de-credito/` | A |
| 40 | cuánto tardo en pagar mi tarjeta | T | [E] | Tarjeta | A |
| 41 | intereses de la tarjeta de crédito en Panamá | I | [E] | Tarjeta | A |
| 42 | cómo consolidar deudas | I | P | **Nueva** (guía) | M |
| 43 | calculadora de plazo fijo | T | O (informes de la SBP) | **Nueva** | M |
| 44 | tasas de plazo fijo de los bancos 2026 | I | P, O | — | B (datos volátiles) |
| 45 | calculadora de interés compuesto | T | [E] | **Nueva** | M |
| 46 | qué hacer con el décimo: ahorrar o pagar deudas | I | P, S | **Nueva** (guía) | A |
| 47 | presupuesto de gastos de diciembre | T | S | Mi Quincena y meta de ahorro | M |
| 48 | qué es el FECI | I | [E] | **Nueva** (por verificar con la DGI) | M |
| 49 | regla 50/30/20 con la quincena | I | [E] | Mi Quincena | M |

### Vivienda, alquiler e hipotecas

| # | Búsqueda | Int. | Evidencia | Cobertura | Encaje |
|---|---|---|---|---|---|
| 50 | calculadora de hipoteca Panamá | T | P | **Nueva** | A |
| 51 | interés preferencial 2026: tramos | I | P, C (KPMG) | **Nueva** | M (norma cambiante) |
| 52 | ITBI de la primera vivienda, Ley 546 | I | P | **Nueva** | M (verificar en la Gaceta) |
| 53 | cómo calcular el impuesto de inmueble | T | O (DGI) | **Nueva** | M |
| 54 | patrimonio familiar tributario, cómo registrarlo | I | O, P | **Nueva** | M |
| 55 | depósito de garantía del alquiler | I | P, C (Landager) | **Nueva** | M |
| 56 | cuánto puede aumentar el alquiler | I | C | **Nueva** | B (tope no verificado) |
| 57 | ¿alquilar o comprar? | T | [E] | **Nueva** | M |
| 58 | cuánto puedo pedir de hipoteca según mi salario | T | [E] | **Nueva** (dentro de hipoteca) | A |
| 59 | gastos de cierre de la compra de vivienda | I | [E] | — | B |

### Vehículos y combustible

| # | Búsqueda | Int. | Evidencia | Cobertura | Encaje |
|---|---|---|---|---|---|
| 60 | calculadora de combustible por viaje | T | [E] | `/vehiculos/combustible-por-viaje/` | A |
| 61 | precio de la gasolina en Panamá hoy | N | P, O (cada 14 días) | Combustible (precio manual) | M |
| 62 | cuánto cuesta mantener un carro | T | [E] | `/vehiculos/costo-mensual-de-un-auto/` | A |
| 63 | financiamiento de auto, cuota | T | C (bancos) | `/vehiculos/financiamiento-de-auto/` | A |
| 64 | placa 2027: requisitos y fecha | N | P | — | B (municipal y volátil) |
| 65 | revisado vehicular: costo | N | P | — | B |
| 66 | km/l a millas por galón | T | O (NIST) | Combustible (parcial) | M |
| 67 | impuesto de circulación: costo | I | P | — | B |
| 68 | multas de tránsito ATTT | N | P | — | B |

### Electricidad, agua, telefonía e internet

| # | Búsqueda | Int. | Evidencia | Cobertura | Encaje |
|---|---|---|---|---|---|
| 69 | calcular el consumo eléctrico de un aparato | T | [E] | `/vida-cotidiana/consumo-electrico/` | A |
| 70 | cuánto consume un aire acondicionado | I/T | P (calor) | Consumo eléctrico | A |
| 71 | subsidio eléctrico de 300 kWh | I | P, O (ASEP) | **Nueva** (guía) | A |
| 72 | cómo leer la factura de luz de ENSA y Naturgy | I | P | **Nueva** (guía) | M |
| 73 | precio del kWh en Panamá 2026 | I | P | Consumo eléctrico (parcial) | M |
| 74 | tarifa del agua del IDAAN: cálculo | T | O (ASEP), P | **Nueva** | M (tarifa por verificar) |
| 75 | metros cúbicos a galones | T | O (ACP: 264,172) | **Nueva** (menor) | B |
| 76 | ahorrar electricidad en temporada de calor | I | P, S (abril–mayo) | **Nueva** (guía) | M |
| 77 | planes de internet y móvil: comparar | T | [E] | — | B (comercial y volátil) |
| 78 | precio del gas de 25 libras | N | P | — | B (por verificar) |

### Supermercado, alimentación y compras

| # | Búsqueda | Int. | Evidencia | Cobertura | Encaje |
|---|---|---|---|---|---|
| 79 | costo de la canasta básica en Panamá 2026 | I | O (informe mensual del MEF), P | **Nueva** (guía) | A |
| 80 | control de precios: lista de productos | N | P | — | B (en retirada) |
| 81 | precio por libra a kilo | T | O (NIST) | `/compras/precio-por-unidad/` | A |
| 82 | 2x1 y 3x2: cuánto ahorro | T | [E] | `/compras/descuentos-y-promociones/` | A |
| 83 | presupuesto del supermercado | T | [E] | `/compras/modo-pasillo/` | A |
| 84 | ofertas de fin de año: descuentos reales | I | S | Descuentos | M |
| 85 | cuánto se deja de propina en Panamá | I | [E] | `/compras/dividir-la-cuenta/` | A |
| 86 | dividir la cuenta del restaurante | T | [E] | Dividir la cuenta | A |
| 87 | supermercado o abarrotería: diferencia de precio | I | P (ACODECO: brecha de casi B/.58) | **Nueva** (guía) | M |

### Importaciones e impuestos

| # | Búsqueda | Int. | Evidencia | Cobertura | Encaje |
|---|---|---|---|---|---|
| 88 | calcular el ITBMS del 7 % | T | C | `/impuestos/itbms/` | A |
| 89 | quitar el ITBMS de un precio | T | [E] | ITBMS | A |
| 90 | impuestos de courier en Panamá: 100 dólares | I/T | P, C | **Bloqueada** (sin norma oficial) | A |
| 91 | Shein y Temu: impuestos en Panamá | I | P | Courier (bloqueada) | A |
| 92 | calcular la declaración de renta de persona natural | T | O (DGI), S | **Nueva** | A |
| 93 | devolución de impuestos de la DGI | I | O, P | **Nueva** (guía) | A |
| 94 | tabla de retención del ISR del salario | I | O | Salario neto | A |
| 95 | impuesto selectivo al consumo | I | O | — | B |
| 96 | deducciones de la declaración de renta | I | O, P | **Nueva** (dentro de la guía de renta) | A |

### Educación y familia

| # | Búsqueda | Int. | Evidencia | Cobertura | Encaje |
|---|---|---|---|---|---|
| 97 | calcular el promedio de notas | T | [E] | `/educacion/promedio-de-notas/` | A |
| 98 | qué nota necesito para pasar | T | [E] | Promedio de notas | A |
| 99 | monto del PASE-U 2026 | N | P | — | B |
| 100 | presupuesto del regreso a clases 2027 | T | S (febrero–marzo) | **Nueva** (guía) | M |
| 101 | pensión alimenticia: cálculo | T | [E] | — | B (riesgo legal: no recomendado) |
| 102 | préstamo educativo del IFARHU | I | P | — | B |

### Otras oportunidades descubiertas

| # | Búsqueda | Int. | Evidencia | Cobertura | Encaje |
|---|---|---|---|---|---|
| 103 | convertir salario por hora, quincena, mes y año | T | O (DE 13 de 2025 fija tarifas por hora) | **Nueva** (dentro del salario mínimo) | A |
| 104 | regla de tres y porcentajes | T | [E] | — | B (genérico, sin ángulo local) |
| 105 | cuánto gastar en regalos de Navidad | T | S | Mi Quincena y meta de ahorro | M |

---

## 3. Análisis de competidores

| Competidor | Tipo | Fortaleza | Debilidad o hueco [E] |
|---|---|---|---|
| [finiquitojusto.com](https://finiquitojusto.com/) | Calculadoras laborales para 21 países | Muchas guías laborales para Panamá: liquidación, despido, preaviso, renuncia justificada, descuentos | Multipaís (algunas páginas mezclan normas de otros países); solo temas laborales; sus guías de preaviso citan artículos distintos entre sí [C] |
| [toptrabajos.com/pa/blog](https://www.toptrabajos.com/pa/blog/calculo-del-decimo-tercer-mes/) | Blog de portal de empleo | Autoridad de dominio; décimo, finiquito, maternidad | Sin calculadoras integradas |
| [jibble.io](https://www.jibble.io/es/recursos/dias-feriados-panama-2026) | Recursos de un SaaS de recursos humanos | Feriados y salario mínimo por país | Genérico y en inglés en su origen; sin herramientas locales |
| [WageIndicator](https://wageindicator.org/es-pa/ai/trabajo-en-panama/salario-minimo/3707-comercio-al-por-menor-por-mayor-y-en-comisiones/) | Base de datos | Salario mínimo por actividad | Tarifas por hora sin pasar a mensual; navegación compleja |
| [Landager](https://landager.com/es/property-compliance/panama/national/security-deposits) | Guías de alquiler | Depósito de garantía y aumentos | Fuente privada sin citas oficiales completas |
| [Blog de Alegra](https://blog.alegra.com/panama/declaracion-de-renta-panama/) | Blog de un software contable | Renta e ITBMS | Orientado a pymes, no a asalariados |
| KPMG y RSM | Consultoras | Fiscalidad e interés preferencial | Lenguaje técnico; sin herramientas |
| Prensa: [La Estrella «Información útil»](https://www.laestrella.com.pa/economia/como-calcular-el-decimo-tercer-mes-en-panama-guia-y-ejemplos-BP21487372), [Telemetro](https://www.telemetro.com/nacionales/bono-navidad-y-bono-permanente-jubilados-y-pensionados-diciembre-cuanto-recibiran-n6098569), [Panamá América](https://panamaamerica.com.pa/economia/viene-el-decimo-cuanto-es-el-pago-y-que-te-descuentan-1220366), [La Prensa](https://www.prensa.com/economia/salario-minimo-2026-en-panama-estas-son-las-nuevas-tarifas-por-actividad-y-region/), TVN | Medios | Máxima autoridad y actualidad; cubren cada pico estacional | Notas efímeras, sin herramienta; datos a veces contradictorios entre notas [C] |
| Simuladores oficiales (CSS «Mi Retiro Seguro») y tarifarios de bancos | Oficiales y comerciales | Datos de primera mano | Un solo tema cada uno |

**Posicionamiento recomendado [E]:**
- La prensa domina la **noticia** y los competidores laborales, el **cálculo laboral**.
- El hueco es **herramienta + guía + fuente oficial** en temas cotidianos fuera de lo laboral: impuestos personales, vivienda, servicios y calendario.
- También es un hueco ser la referencia **permanente** que la prensa no mantiene, con fecha de revisión visible.

---

## 4. Las 20 mejores oportunidades

**Escalas [E]:**
- **Recurrencia:** A = consulta mensual o anual previsible.
- **Comercial:** potencial de monetización futura con la publicidad desactivada: A = temas financieros.
- **Complejidad:** incluye la verificación legal, no solo el código.

| # | Oportunidad (consulta principal) | Relacionadas | Intención | Evidencia | Competencia | Utilidad | Formato | Recurrencia | Comercial | Complejidad | Prioridad |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **tercera partida del décimo, diciembre 2026** | 3, 4, 46 | T | P, S (15-12) | Prensa | A | Mejora de la calculadora y la guía existentes | A (3 veces al año) | M | **Baja** | **P0 (antes del 10-12)** |
| 2 | **feriados de Panamá 2027** | 26–29 | N | P, C, S | Jibble, prensa | A | Calendario (guía) + herramienta existente | A (anual) | B | Baja: reglas ya verificadas | **P0 (diciembre)** |
| 3 | **qué hacer con el décimo: ahorrar o pagar deudas** | 46, 47, 105 | I | P, S | Prensa | A | Guía que enlaza tarjeta, meta de ahorro y Mi Quincena | A (3 veces al año) | A | Baja | **P0 (diciembre)** |
| 4 | **salario mínimo Panamá 2026–2027** | 15–17, 103 | I/T | P, O | WageIndicator, Jibble, prensa | A | Guía + calculadora de hora a mes | M (cambia cada dos años) | B | Media: transcribir el DE 13 de 2025 desde LEGISPAN, fuente ya usada | **P1 (diciembre–enero)** |
| 5 | **calcular la declaración de renta de persona natural** | 34, 92, 93, 96 | T | O, S (antes del 15-03) | Alegra, consultoras | A | Calculadora + guía | A (anual) | A | Media: deducciones según el instructivo de la DGI | **P1 (enero)** |
| 6 | **renuncia y preaviso en Panamá** | 7, 11, 12 | I | C | finiquitojusto, toptrabajos | A | Guía | M | B | Media: los artículos deben verificarse en el Código | **P1 (enero)** |
| 7 | **mejoras de títulos, años y enlazado interno** | — | — | [C] | — | A | Mejora técnica (§5) | — | — | **Baja** | **P0** |
| 8 | **calculadora de hipoteca en Panamá** | 50, 57, 58 | T | P | Bancos | A | Calculadora; el interés preferencial queda fuera hasta verificarlo | M | A | Media: reutiliza el motor de préstamos | P2 |
| 9 | **subsidio eléctrico y cómo leer la factura** | 70–73, 76 | I | P, O (ASEP) | Prensa | A | Guía, enlazada a consumo eléctrico | A (mensual) | B | Media: pliego de la ASEP | P2 (antes de marzo) |
| 10 | **costo de la canasta básica** | 79, 87 | I | O (MEF mensual), P | Prensa | A | Guía con dato fechado | A (mensual) | B | Baja, pero requiere actualización mensual | P2 |
| 11 | **costo de un empleado para el empleador** | 23 | T | C | Consultoras | A | Calculadora | M | M | Media: tasas patronales en el texto único de la Ley 51 | P2 |
| 12 | **trabajo doméstico: salario y prestaciones** | 17 | I/T | P | — | A | Guía (+ cálculo con los motores existentes) | M | B | Media | P2 |
| 13 | **impuesto de inmueble y patrimonio familiar** | 53, 54 | I/T | O (DGI) | Prensa | M | Guía + estimador | A (anual) | M | Media | P2 |
| 14 | **interés compuesto y plazo fijo** | 43, 45 | T | O (SBP) | Bancos | M | Calculadora (la tasa la escribe el usuario) | M | A | Baja | P2 |
| 15 | **guía de la tarjeta: pago mínimo y consolidación** | 39–42 | I | [E], S (deudas de enero) | Bancos | A | Guía que alimenta la tarjeta | M | A | Baja | **P1 (enero)** |
| 16 | **calendario escolar 2027** | 35, 100 | N | S | Prensa | M | Calendario (solo con resolución del MEDUCA) | A (anual) | B | Baja si la resolución se publica | P1 (enero, condicionada) |
| 17 | **presupuesto del regreso a clases** | 100 | T | S | — | M | Guía que enlaza Modo Pasillo y meta de ahorro | A (anual) | M | Baja | P2 (febrero) |
| 18 | **impuestos de courier** | 90, 91 | I/T | P, C | Couriers | A | Calculadora + guía | A | M | Alta y **bloqueada** (CP-SEO-001) | Condicionada |
| 19 | **licencia de maternidad** | 18, 19 | I | P, C | finiquitojusto, toptrabajos | A | Guía; calculadora solo con verificación | B | B | Alta (legal) | P3 |
| 20 | **jubilación de la CSS tras la Ley 462** | 21, 22 | I | P, O | Prensa | A | Guía que enlaza el simulador oficial; sin calculadora propia | M | B | Alta (legal) | P3 |

**Descartadas por ahora [E]:**
- **Por volatilidad sin mantenimiento:** precio del combustible del día (ya cubierto con precio manual), placa, revisado, PASE-U y bonos de jubilados (notas de prensa).
- **Por riesgo legal sin verificación:** tope de aumento del alquiler, pensión alimenticia, interés preferencial por tramos.
- **Por ser comerciales y volátiles:** comparadores de internet y telefonía.
- **Por ser genéricas y sin ángulo local:** regla de tres.

---

## 5. Mejoras recomendadas para páginas existentes

**Ninguna implica rediseño:** son cambios de texto, metadatos y enlaces dentro de las plantillas Midnight actuales.

1. **Décimo, antes del 10-12-2026:**
   - destacar la tercera partida (16 de agosto – 15 de diciembre de 2026) en el texto introductorio;
   - enlazar la nueva guía «Qué hacer con el décimo» y la tarjeta de crédito.
   - El 16 de diciembre se cambia el título a «2027».
2. **Actualización de año, 1–5 de enero de 2027:** títulos y textos de horas extras y descuentos del salario. Revisar si cambian los parámetros de la CSS (Ley 462, aumento gradual patronal).
3. **Días hábiles y feriados:**
   - añadir las fiestas restantes de 2026 (diciembre) a su contexto;
   - orientar el título a «contar días hábiles» si se crea la guía de feriados 2027, para evitar canibalización.
4. **Títulos:**
   - quitar «| Calcula Panamá» en los nueve títulos de más de 60 caracteres;
   - añadir «en Panamá» en financiamiento de auto, combustible, costo de un auto, consumo eléctrico y descuentos;
   - normalizar el de préstamos: «Calculadora de préstamos personales en Panamá: cuota e intereses».
5. **Enlazado interno**, con frases en el texto, sin nuevos módulos:

   | Desde | Hacia |
   |---|---|
   | Salario neto | Horas extras |
   | Vacaciones y liquidación | Días hábiles |
   | Préstamos | Tarjeta (y viceversa) |
   | Guía del ITBMS | Dividir la cuenta |
   | Consumo eléctrico | Futura guía del subsidio |
   | Guía de horas extras | Días hábiles (feriados) |

6. **Índice de la portada:** añadir las cinco herramientas nuevas a sus listas por categoría. Es contenido de un componente aprobado, no rediseño, pero **requiere tu aprobación** expresa por tratarse de la portada.
7. **Préstamos:** ampliar el texto (509 palabras) con la diferencia entre tasa nominal y efectiva (Acuerdo SBP 3-2002, ya citado) y añadir preguntas frecuentes.

---

## 6. Nuevas guías y herramientas propuestas (las 20 de §4, detalladas)

| # | Título SEO propuesto | Ruta sugerida | Estructura | Herramientas relacionadas | Fuentes necesarias |
|---|---|---|---|---|---|
| 1 | *(Mejora)* «Calculadora del décimo tercer mes: tercera partida de diciembre 2026» | `/calculadoras/decimo-tercer-mes/` | Período, fecha, ejemplo, qué incluye | Guía de fechas, tarjeta, meta de ahorro | DG 221 de 1971 y Decreto 19 de 1973 (ya citados) |
| 2 | «Días feriados de Panamá 2027: calendario completo y fines de semana largos» | `/guias/dias-feriados-panama-2027/` | Lista por mes, carnaval y Semana Santa, domingo → lunes (art. 47), días puente del Ejecutivo, pago si se trabaja | Días hábiles, horas extras | Código de Trabajo, arts. 46 y 47; Ley 291 de 2022 (ya verificados) |
| 3 | «Qué hacer con el décimo: pagar deudas, ahorrar o gastar con un plan» | `/guias/que-hacer-con-el-decimo/` | Orden de prioridades, ejemplo con la tarjeta, reparto en Mi Quincena | Tarjeta, meta de ahorro, Mi Quincena, décimo | Sin cifras externas: ejemplos hipotéticos calculados con los motores |
| 4 | «Salario mínimo en Panamá 2026–2027: tabla por región y cálculo mensual» + calculadora | `/guias/salario-minimo-panama/` y `/calculadoras/salario-minimo/` | Regiones, actividades, de hora a mes, trabajo doméstico | Salario neto, horas extras | DE 13 de 2025 (Gaceta Oficial 30438, copia de LEGISPAN, ya citada en el sitio) |
| 5 | «Calculadora de la declaración de renta para asalariados en Panamá» + «Declaración de renta 2027: plazos, deducciones y devolución» | `/impuestos/declaracion-de-renta/` y `/guias/declaracion-de-renta-2027/` | Quién declara (más de B/.11.000), tarifa, deducciones, retenciones, devolución | Salario neto, ITBMS | Código Fiscal, arts. 700 y 710; instructivo de la DGI para persona natural |
| 6 | «Renuncia en Panamá: preaviso, qué te pagan y cómo calcularlo» | `/guias/renuncia-y-preaviso/` | Preaviso, conceptos, renuncia justificada (art. 223), ejemplo | Liquidación, vacaciones, décimo | Código de Trabajo (texto del Órgano Judicial); MITRADEL |
| 7 | *(Mejoras técnicas, §5)* | — | — | — | — |
| 8 | «Calculadora de hipoteca en Panamá: cuota, abono y capacidad de pago» | `/vivienda/calculadora-de-hipoteca/` | Precio, abono, plazo hasta 30 años, seguros, letra frente a ingreso (parámetro editable) | Préstamos, costo mensual | Acuerdo SBP 3-2002 (tasa efectiva) |
| 9 | «Subsidio eléctrico en Panamá: el límite de 300 kWh y cómo leer tu factura» | `/guias/subsidio-electrico-y-factura-de-luz/` | Quién está protegido, cómo saber el consumo, ejemplos | Consumo eléctrico | Resoluciones y pliego de la ASEP vigentes |
| 10 | «Canasta básica en Panamá: costo actual y cómo comparar tu gasto» | `/guias/canasta-basica-panama/` | Último dato del MEF con su fecha, comparación con el presupuesto propio | Modo Pasillo, precio por unidad | Informe mensual MEF-DAES; ACODECO |
| 11 | «Calculadora del costo de un empleado en Panamá» | `/calculadoras/costo-de-empleado/` | Salario, CSS patronal, Seguro Educativo, riesgos profesionales, décimo y vacaciones | Salario neto | Texto único de la Ley 51 (CSS); Seguro Educativo |
| 12 | «Trabajo doméstico en Panamá: salario mínimo, décimo, vacaciones y CSS» | `/guias/trabajo-domestico/` | Régimen especial, ejemplos | Décimo, vacaciones, liquidación | Código de Trabajo (régimen doméstico); DE 13 de 2025 |
| 13 | «Impuesto de inmueble en Panamá: cálculo y exoneración de vivienda principal» | `/impuestos/impuesto-de-inmueble/` | Base, tramos, patrimonio familiar, trámite | Hipoteca | DGI (página INM y normativa vigente) |
| 14 | «Calculadora de interés compuesto y plazo fijo» | `/finanzas/interes-compuesto/` | Capital, tasa (la escribe el usuario), plazo, capitalización | Meta de ahorro | Fórmula; informes de la SBP solo como contexto |
| 15 | «Tarjeta de crédito: cómo salir del pago mínimo» | `/guias/tarjeta-de-credito-pago-minimo/` | Pago mínimo, prioridad por tasa, consolidación | Tarjeta, préstamos | Contratos tipo; Acuerdo SBP 3-2002 |
| 16 | «Calendario escolar 2027 en Panamá» | `/guias/calendario-escolar-2027/` | Trimestres y vacaciones | Promedio de notas | Resolución del MEDUCA (**solo si se publica**) |
| 17 | «Regreso a clases 2027: cómo armar el presupuesto» | `/guias/presupuesto-regreso-a-clases/` | Lista, ahorro previo, comparación | Modo Pasillo, meta de ahorro | Sin cifras externas |
| 18 | «Impuestos de courier en Panamá» | `/impuestos/courier/` | Umbral, base, arancel, ejemplos | ITBMS | **Norma de la ANA** (pendiente) |
| 19 | «Licencia de maternidad en Panamá» | `/guias/licencia-de-maternidad/` | Duración, requisitos, quién paga | Salario neto | Ley 51 (CSS) y Código de Trabajo; revisión legal |
| 20 | «Jubilación en la CSS tras la Ley 462» | `/guias/jubilacion-css/` | Edad, cuotas, proporcional, anticipada, simulador oficial | — | Ley 462 de 2025 (Gaceta Oficial); CSS |

**Rutas nuevas:** `/vivienda/` sería una sección nueva y necesita tu aprobación. Alternativa: `/finanzas/calculadora-de-hipoteca/`. Todas las piezas usan `ToolLayout` (Midnight Functional) o `EditorialPage` (Midnight Editorial), sin componentes nuevos.

---

## 7. Calendario de ejecución

| Ventana | Entregas | Justificación |
|---|---|---|
| **Días 0–30** (28-11 → 27-12-2026) | **#7** mejoras técnicas: títulos, enlazado y portada si se aprueba · **#1** décimo, tercera partida (antes del 10-12) · **#3** qué hacer con el décimo · **#2** feriados 2027 · **#4** salario mínimo, guía y calculadora (si la transcripción del decreto se verifica a tiempo) | Pico del décimo (15-12) y búsquedas de calendario de fin de año. Todo es de baja complejidad y con fuentes ya verificadas |
| **Días 31–60** (28-12-2026 → 26-01-2027) | Actualización de años (1–5 de enero) · **#5** declaración de renta, calculadora y guía · **#15** guía de la tarjeta · **#6** renuncia y preaviso · **#16** calendario escolar (si el MEDUCA publica) | Temporada fiscal (plazo habitual: 15-03), deudas de fin de año y rotación laboral de inicio de año |
| **Días 61–90** (27-01 → 25-02-2027) | **#8** hipoteca · **#9** subsidio eléctrico (antes del calor de marzo–mayo) · **#17** regreso a clases · **#11** costo del empleado · **#14** interés compuesto · **#10** canasta básica | Demanda previsible de febrero y marzo; complejidad media |
| **Condicionadas** | **#18** courier (norma de la ANA) · **#12**, **#13**, **#19**, **#20** (verificación legal) | Solo con fuente oficial verificada |

**Ritmo propuesto:** 2 o 3 piezas por semana, cada una con:
- fuente oficial y fecha de revisión;
- ejemplo verificable con el motor del sitio;
- pruebas;
- un PR por tanda y publicación solo con autorización.

**No** se generará contenido masivo ni páginas por variaciones de palabra clave.

---

## 8. Fuentes consultadas y limitaciones

### 8.1 Limitaciones

1. **Sin volúmenes:** Google Trends, el autocompletado y las preguntas relacionadas no son accesibles desde este entorno (conexión rechazada) [C]. Search Console requiere el acceso del CEO.
2. **La evidencia de demanda es cualitativa:** cobertura de prensa, competidores y estacionalidad oficial. No equivale a volumen.
3. **Varias normas no se verificaron en esta fase**, porque era solo de investigación: interés preferencial, alquiler, cotización de independientes, maternidad, impuesto de inmueble, tarifa del agua y courier. Las fuentes de prensa sobre ellas **se contradicen** en varios puntos (por ejemplo, la pensión mínima de B/.144 frente a B/.265, y los artículos de preaviso). Ninguna se publicará sin la norma oficial.
4. **Las cifras de prensa citadas son contexto, no datos para publicar:**
   - canasta básica de B/.365,88 en marzo de 2026 según el MEF citado por La Estrella;
   - kWh a 20,82 centavos en enero de 2026 según La Prensa;
   - plazo fijo a un año al 4,88 % al cierre de 2025 según la SBP citada por La Prensa.

### 8.2 Peticiones a la dirección

1. **Exportación de Search Console:** consultas y páginas, 3 a 16 meses, país Panamá. Con ella se reordena §4 y se confirman los problemas de CTR y posición.
2. **Aprobaciones:**
   - las mejoras técnicas del §5, incluido el índice de la portada;
   - la sección `/vivienda/`;
   - el calendario de 30, 60 y 90 días.

### 8.3 Fuentes

**Oficiales:**
- [DGI: impuesto sobre la renta](https://dgi.mef.gob.pa/DInforme/D-IsRenta)
- [DGI: impuesto de inmueble](https://dgi.mef.gob.pa/INM/INM)
- [MEF: canasta básica, junio de 2026](https://www.mef.gob.pa/wp-content/uploads/2026/08/MEF-DAES-Canasta-Basica-Familiar-de-Alimentos-JUNIO-2026.pdf)
- [SBP: informe de actividad bancaria](https://www.superbancos.gob.pa/documentos/financiera_y_estadistica/estudios/IAB/IAB-0726.pdf)
- [ASEP: tarifa del IDAAN](https://asep.gob.pa/wp-content/uploads/agua/tarifas/tarifa_1_IDAAN.pdf)
- [ACP: tarifa del agua (conversión)](https://pancanal.com/wp-content/uploads/2025/12/2030-0000-AGUA.pdf)
- [Ley 93 de 1973 (arrendamientos), Órgano Judicial](https://www.organojudicial.gob.pa/uploads/wp_repo/blogs.dir/cendoj/CIVIL/ley_93_de_1973_por_la_cual_se_dictan_medidas_sobre_los_arrendamientos.pdf)
- Código de Trabajo y Ley 291 de 2022 (verificados en CP-SEO-001)
- ANA (CP-SEO-001, entrega 3)

**Prensa:**
- [La Estrella: décimo](https://www.laestrella.com.pa/economia/como-calcular-el-decimo-tercer-mes-en-panama-guia-y-ejemplos-BP21487372)
- [Panamá América: décimo](https://panamaamerica.com.pa/economia/viene-el-decimo-cuanto-es-el-pago-y-que-te-descuentan-1220366)
- [Panamá América: usar el décimo](https://panamaamerica.com.pa/economia/recomiendan-ahorrar-la-mitad-del-decimo-y-pagar-las-deudas-mas-caras-1131673)
- [Telemetro: feriados](https://www.telemetro.com/c6097777)
- [La Estrella: feriados 2026](https://www.laestrella.com.pa/panama/informacion-util/panama-tendra-12-dias-feriados-nacionales-en-2026-segun-calendario-oficial-HL18751879)
- [La Prensa: interés preferencial](https://www.prensa.com/economia/conozca-las-opciones-para-comprar-viviendas-con-tasas-de-interes-subsidiadas/)
- [KPMG: régimen hipotecario](https://kpmg.com/pa/es/home/insights/2025/10/ci-actualizacion-regimen-intereses-hipotecarios.html)
- [La Prensa: ayuda de B/.3.000 para vivienda](https://www.prensa.com/economia/3000-para-comprar-casa-el-empujon-que-busca-despertar-las-hipotecas/)
- [Telemetro: bonos de jubilados](https://www.telemetro.com/nacionales/bono-navidad-y-bono-permanente-jubilados-y-pensionados-diciembre-cuanto-recibiran-n6098569)
- [La Prensa: PASE-U](https://www.prensa.com/sociedad/ifarhu-planifica-el-primer-pago-del-pase-u-2026-estos-son-los-montos-para-alumnos/)
- [La Estrella: canasta básica](https://www.laestrella.com.pa/economia/informe-del-mef-canasta-basica-de-alimentos-sube-mas-de-2-en-marzo-y-supera-los-365-DO22976104)
- [La Estrella: control de precios](https://www.laestrella.com.pa/economia/acodeco-preve-que-control-de-precios-desaparezca-antes-de-que-acabe-el-2026-lo-que-en-su-momento-fue-presentado-como-una-medida-para-proteger-a-los-s-AH25226512)
- [La Estrella: supermercados y abarroterías](https://www.laestrella.com.pa/economia/canasta-basica-en-panama-costo-en-superes-versus-abarroterias-muestra-brecha-de-casi-58-EI23813061)
- [Telemetro: Ley 462 y cuotas](https://www.telemetro.com/nacionales/ley-462-css-cuantas-cuotas-se-necesita-jubilarse-panama-n6042503)
- [La Prensa: independientes](https://www.prensa.com/economia/asi-funcionaria-la-reforma-de-las-pensiones-para-los-trabajadores-independientes/)
- [La Prensa: tasas de interés](https://www.prensa.com/economia/reduccion-de-tasas-en-panama-podria-verse-hacia-finales-de-2026-segun-superintendencia-de-bancos/)
- [La Prensa: tarifa eléctrica 2026](https://www.prensa.com/economia/tarifas-electricas-se-ajustan-a-partir-del-1-de-enero-de-2026-la-mayoria-de-los-usuarios-no-tendra-aumentos-en-su-factura/)
- [La Prensa: salario mínimo](https://www.prensa.com/economia/salario-minimo-2026-en-panama-estas-son-las-nuevas-tarifas-por-actividad-y-region/)
- [Telemetro: Metro y MiBus](https://www.telemetro.com/nacionales/no-existe-doble-cobro-sonda-aclara-dudas-el-nuevo-sistema-del-metro-y-metrobus-n6091609)
- [La Estrella: placas](https://www.laestrella.com.pa/panama/informacion-util/atencion-conductores-alcaldia-de-panama-inicia-entrega-de-placas-y-calcomanias-de-noviembre-2025-EA17355760)

**Competidores:**
- [finiquitojusto.com](https://finiquitojusto.com/)
- [toptrabajos](https://www.toptrabajos.com/pa/blog/calculo-del-decimo-tercer-mes/)
- [Jibble](https://www.jibble.io/es/recursos/dias-feriados-panama-2026)
- [WageIndicator](https://wageindicator.org/es-pa/ai/trabajo-en-panama/salario-minimo/3707-comercio-al-por-menor-por-mayor-y-en-comisiones/)
- [Landager](https://landager.com/es/property-compliance/panama/national/security-deposits)
- [Alegra](https://blog.alegra.com/panama/declaracion-de-renta-panama/)
