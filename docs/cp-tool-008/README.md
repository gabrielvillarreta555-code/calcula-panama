# CP-TOOL-008 — Calculadora de horas extras (Panamá)

- **Rama experimental:** `feat/cp-tool-008-horas-extras`, creada desde `main` (`011adf7`).
- **Estado:** prototipo funcional, **sin publicar** y sin fusionar.
  - `OVERTIME_TOOL.published = false` (`src/data/launch.ts`): la página lleva `noindex` y no figura en los sitemaps, el buscador ni el catálogo.
  - Publicidad desactivada: la ruta no tiene entrada en `ad-policy.json`, así que cuenta como `never`.
- **Ruta:** `/calculadoras/horas-extras/`.
- **Diseño:** Midnight Functional Edition (CP-DESIGN-007), sin Blue, degradados ni componentes antiguos.
- **No modificado:** portada, otras calculadoras, motores existentes, privacidad, CSP y aislamiento de Mi Quincena. La excepción es la corrección de legibilidad de la §8.

## 1. Investigación legal

**Fuente primaria.** Código de Trabajo de Panamá, en la recopilación de normas laborales de MITRADEL y el Proyecto MATAC (OIT), publicada por el Órgano Judicial: <https://www.organojudicial.gob.pa/uploads/wp_repo/uploads/2016/11/c%C3%B3digo-detrabajo.pdf>.

- **Artículos leídos:** 30 a 50 (jornada, horas extraordinarias y descansos) y 140 a 149 (salario).
- **Método:** el texto se extrajo del PDF oficial y cada valor del código cita su artículo (`src/data/overtime-rules.ts`).

**Documentos de MITRADEL.** Su sitio (boletín de prestaciones y manual de orientación laboral) está protegido por Incapsula, que bloquea las descargas automáticas. No se intentó evadir esa protección.

- Las reglas que el Código no fija quedan como **criterios de cálculo**, señalados como tales (§2.3), y como **pendientes** (§7).
- Se puede confirmarlas con MITRADEL por un canal humano.

### Hallazgos por tema

| Tema | Regla verificada | Artículo |
|---|---|---|
| Períodos | Diurno de 6 a.m. a 6 p.m.; nocturno de 6 p.m. a 6 a.m. | 30 |
| Tipos de jornada | **Nocturna**: más de 3 h dentro del período nocturno. **Mixta**: horas de ambos períodos con 3 h nocturnas o menos | 30 |
| Límites diarios y semanales | Diurna 8 h / 48 h; nocturna 7 h / 42 h; mixta 7 h 30 min / 45 h | 31 |
| Equivalencia salarial | 7 h nocturnas y 7.5 h mixtas se remuneran como 8 h diurnas (para salario mínimo y empresas con turnos) | 31 |
| Turnos rotativos | Salario uniforme aunque cambien las horas | 32 |
| Qué es jornada | Todo el tiempo a disposición del empleador | 33, 34 |
| Recargos de horas extra | **25%** en período diurno. **50%** en período nocturno o en prolongación de mixta iniciada de día. **75%** en prolongación de nocturna o de mixta iniciada de noche | 33 |
| Límites contractuales | Se computa extra lo que excede el límite legal **o el contractual o reglamentario inferior** | 33 |
| Tiempo computable | Disponibilidad exclusiva, inactividad ajena al trabajador y comida dentro del local si debe permanecer | 34 |
| Límites de horas extra | Máximo **3 diarias y 9 semanales**. Prohibidas en trabajos peligrosos o insalubres y a menores de 16 años | 36 |
| Exceso del límite | El excedente se paga con **75% de recargo adicional**, sin perjuicio de sanciones | 36 |
| Descansos | Entre 30 min y 2 h dentro de la jornada. 12 h continuas entre jornadas diurna y nocturna consecutivas | 39 |
| Descanso semanal | De preferencia el domingo o un día pactado. Si se trabaja, se concede otro día | 40, 41 |
| Feriados | Su descanso se remunera como jornada ordinaria. Lista de días | 45, 46 |
| Feriado en domingo | El lunes siguiente es descanso obligatorio | 47 |
| Domingo o descanso semanal | **50%** sobre la jornada ordinaria; también 50% en el día compensatorio | 48 |
| Fiesta o duelo nacional | **150%** sobre el salario de la jornada ordinaria, que **incluye la remuneración del día de descanso**; el día compensatorio, 50% | 49 |
| Días libres de semana corta | **50%** en jornada diurna y **75%** en mixta o nocturna | 49 |
| Acumulación de recargos | Primero el del domingo o feriado; sobre el resultado, el de las horas excedentes. «Igual principio» en cualquier otro caso con varios recargos | 50 |
| Salario con comisiones | Los recargos se calculan sobre el promedio del período de pago | 148 |

## 2. Fórmulas y fuentes

### 2.1 Valor de la hora

| Salario | Fórmula | Fundamento |
|---|---|---|
| Por hora | h = salario | — |
| Semanal | h = salario ÷ horas semanales | Criterio (§2.3) |
| Mensual | h = salario ÷ (horas semanales × 4⅓) | Criterio: art. 54 num. 2 usa «cuatro semanas y un tercio» |
| Quincenal | h = (salario × 2) ÷ (horas semanales × 4⅓) | Criterio: la quincena es medio mes |

Las **horas semanales** son, por defecto, el máximo legal de la jornada habitual (48, 45 o 42, art. 31). Se pueden bajar a las del contrato (art. 33). Con 42 h nocturnas, la misma paga mensual da una hora de mayor valor, coherente con el art. 31.

Ejemplo verificable: B/.1,000 ÷ (48 × 4⅓) = 1,000 ÷ 208 = **B/.4.8077**.

### 2.2 Recargos

| Caso | Factor sobre h | Artículo |
|---|---|---|
| Extra diurna | 1.25 | 33.1 |
| Extra nocturna, o prolongación de mixta iniciada de día | 1.50 | 33.2 |
| Prolongación de nocturna o de mixta iniciada de noche | 1.75 | 33.3 |
| Hora en domingo o descanso semanal; día compensatorio | 1.50 | 48, 49 |
| Día libre de semana corta | 1.50 diurna / 1.75 mixta o nocturna | 49 |
| Hora en fiesta o duelo nacional | 2.50 | 49 |
| Extra por encima de 3 h diarias o 9 semanales | × 1.75 adicional | 36 |
| **Acumulación** | (1 + recargo del día) × (1 + recargo extra) × (1.75 si excede) | 50 |

Ejemplo: una hora extra diurna en el día de descanso vale 1.5 × 1.25 = 1.875 h.

**Pago adicional con salario fijo.** El salario fijo ya paga:
- las horas ordinarias de los días laborables;
- el descanso remunerado del feriado (art. 45).

Por eso, en esos casos lo adicional es el factor − 1. Las horas extra, las de los días de descanso, compensatorios o libres no están cubiertas: lo adicional es el factor completo.

**Salario por hora.** Se muestran por separado:
- la paga de las horas ordinarias;
- lo adicional (horas extra y recargos).

### 2.3 Criterios de cálculo (el Código no los fija)

1. **4⅓ semanas por mes** para pasar de salario mensual o quincenal a hora (art. 54 por analogía).
2. **La semana va de lunes a domingo** para los límites de 48/42/45 h y de 9 h extra.
3. **Descanso sin hora indicada:** se ubica a mitad de la parte ordinaria de la jornada. Solo afecta a qué minutos son nocturnos. La persona puede indicar la hora exacta.
4. **Los días con recargo propio no suman al límite semanal ordinario** (domingo, feriado, compensatorio, día libre). Así no se cuenta dos veces el mismo día. Sí cuentan para los límites diario y semanal de horas extra.
5. **El tipo de jornada se decide con la parte que puede ser ordinaria** (las primeras 8 h, o 7.5 h para comprobar si es mixta). Las horas de prolongación no convierten una jornada diurna en mixta.
6. **Los feriados del art. 46** (con Pascua, carnaval, viernes santo, la toma de posesión y el lunes del art. 47) solo se **sugieren**: la persona marca el tipo de día.

## 3. Arquitectura del motor

```
src/data/overtime-rules.ts   Parámetros con su artículo (un solo lugar para revisar la ley)
src/lib/overtime.ts          Motor puro, sin DOM: hourlyRate, calculateQuick, calculateLog, classify,
                             holidayName, toCsv
src/lib/overtime-ui.ts       Interfaz: estado en memoria, render, editar/duplicar/eliminar, copiar, compartir, CSV
src/pages/calculadoras/horas-extras.astro   Página: herramienta, contenido editorial, FAQ y fuentes
src/data/launch.ts           Interruptor de publicación (noindex, sitemaps, buscador, catálogo)
```

**Flujo de `calculateLog`:**

1. **Validación:** fechas y horas reales; entrada ≠ salida; descanso < duración; descanso dentro del horario.
2. **Expansión:** cada jornada se convierte en minutos absolutos. Si la salida es anterior o igual a la entrada, cruza la medianoche. El descanso se marca como no trabajado, salvo el art. 34.3.
3. **Duplicados y solapamientos:**
   - se ordenan las jornadas;
   - la que se solapa con una anterior se **excluye** con un error visible;
   - así no se pagan dos veces las mismas horas.
4. **Clasificación (art. 30):** diurna, mixta o nocturna, y si la mixta empezó de día o de noche.
5. **Minuto a minuto, en orden cronológico:**
   - ordinario mientras no se supere el límite diario (legal o contractual) ni el semanal;
   - si no, extra con el recargo del art. 33 según la jornada y el período;
   - encima de 3 h diarias o 9 semanales, exceso (+75%);
   - el recargo del día depende de la **fecha de cada minuto**: un turno puede empezar en feriado y terminar en día laborable.
6. **Agrupación** por combinación de recargos. Los importes se acumulan **sin redondear** y se redondean a centavos una sola vez por total; cada fila se muestra redondeada.
7. **Alertas:**
   - errores (datos inválidos, duplicado, solape);
   - avisos en ámbar `#F5A524` (límites del art. 36, jornada de más de 16 h, feriado sugerido, período excedido);
   - informativas en azul (descansos del art. 39, 12 h entre jornadas, turnos rotativos, domingo).

**Privacidad.**
- Todo ocurre en memoria. No se usa `localStorage`, por diseño, para no ampliar los datos salariales guardados en `calculapanama.com` antes del aislamiento de la app.
- No hay peticiones de red; la CSP lleva `connect-src 'none'`.
- No se piden nombre, cédula, empresa, número de empleado ni datos bancarios.
- El CSV se genera en el navegador.
- Si más adelante se quiere guardar el registro, debe hacerse en `app.calculapanama.com` (arquitectura de CP-ADS-003).

## 4. Prototipo

- **Modo rápido:**
  - entrada: salario (mensual, quincenal, semanal o por hora), jornada y horas semanales, horas y minutos, recargo, tipo de día y exceso del límite;
  - resultado: hora ordinaria, hora con recargo, importe del recargo y total bruto.
- **Registro de jornadas:** fecha, entrada, salida, descanso (minutos y hora opcional), descanso pagado (art. 34), tipo de día, tipo del día siguiente (si cruza medianoche) y límite diario del contrato.
  - **Acciones:** editar, duplicar al día siguiente y eliminar.
  - **Resumen semanal, quincenal o mensual:** días, horas ordinarias, extras, horas sobre el límite, salario del período y salario más adicionales.
- **Panel principal arriba:**
  - pago extraordinario bruto, horas extras y hora ordinaria;
  - barra y leyenda de distribución por recargo;
  - alertas;
  - desglose por jornada.
- **Acciones:** copiar, compartir (vista previa sin importes por defecto), CSV y reiniciar.
- **Móvil:** barra inferior fija con el total y el botón «+ Jornada» en el modo de registro.
- **Iconos:** reloj, calendario, sol, luna, salario y calculadora, todos lineales.
- **Contenido editorial original:**
  - responde a: cómo calcular horas extras, cuánto vale una hora extra, horas nocturnas, domingo, feriados, salario mensual y diferencia entre jornadas;
  - incluye: ejemplos calculados con el mismo motor, metodología, límites, fecha de revisión y fuentes.
- **Título:** «Calculadora de horas extras en Panamá 2026». H1 visible: «Horas extras».

## 5. Capturas

En `capturas/`, con datos ficticios (B/.1,000 mensuales, 48 h):

- `rapido-movil-1…5.jpg` y `rapido-escritorio-1…3.jpg`: 2 h 30 min extra diurnas.
- `registro-movil-1…8.jpg` y `registro-escritorio-1…5.jpg`: semana rotativa de seis jornadas, de 7–17 (descanso 60) a un domingo de 12 h. Adicional **B/.126.50**, verificado a mano:
  - lunes: 6.01;
  - nocturnas: 8.41 + 8.41;
  - domingo: 57.69 + 27.04 + 18.93.

Las capturas móviles son de 390 px a @2x; las de escritorio, de 1440 px.

## 6. Resultados de las pruebas

| Prueba | Resultado |
|---|---|
| Unitarias del motor (`src/lib/overtime.test.ts`) | **42/42**. Cubren: conversión salarial, recargos individuales, acumulación (art. 50), turnos nocturnos, medianoche, horas y minutos, descansos, domingos y feriados, días libres y compensatorios, límites diarios, semanales y contractuales, redondeo, registros múltiples, duplicados y solapes, datos inválidos, sugerencia de feriados y CSV |
| Todas las unitarias (vitest) | **257/257** |
| e2e de la herramienta en Chromium (`e2e/horas-extras.e2e.ts`) | **9/9**. Cubren: ambos modos, edición, duplicado, eliminación, descanso inválido, feriado sugerido, medianoche, CSV, copiar, compartir, reiniciar, privacidad, 360/390/412/768/1440 px, áreas táctiles, campos etiquetados, color de alerta, barra inferior, CSP, sin AdSense y fuera de los sitemaps |
| e2e del sitio completo (Chromium) | **103/103** |
| Aislamiento (`test:isolation`) | **9/9** |
| Firefox, WebKit (Safari) y WebKit iPhone | **99/99** en CI, sin reintentos: las 9 pruebas de horas extras en cada motor, más Salario neto, Mi Quincena y Modo Pasillo (ejecución 45964574623) |
| `astro check` y `check:app` | 0 errores, 0 advertencias |
| `verify:seo` y `verify:app` | Correctos (26 URL; la página nueva queda fuera) |
| Contraste de todo el texto visible (4 páginas Midnight Functional) | Sin fallos AA tras la corrección de la §8 |
| Rendimiento (móvil, 4G lenta, CPU ×4) | LCP 0.88 s, CLS 0.011, 94 KB |
| Privacidad | 0 peticiones externas, 0 claves en `localStorage` y `sessionStorage`, CSP `connect-src 'none'` |

## 7. Limitaciones y casos pendientes

1. **Divisor de la hora con salario fijo (pendiente).** Se usa 4⅓ semanas por mes, por analogía con el art. 54. Otros métodos (30 días, 26 días, 240 h) dan resultados distintos.
2. **Domingo con salario fijo.** Se asume que el salario mensual no paga las horas del día de descanso semanal, porque cubre 48 h de seis días. Así, esas horas valen 1.5 h completas. Pendiente de confirmar.
3. **Feriado con salario fijo.** Se interpreta que el salario ya paga el descanso del feriado (art. 45) y que lo adicional es el 150% (total 2.5 h). La frase «el recargo del 150% incluye la remuneración del día de descanso» admite otras lecturas.
4. **Límite semanal ordinario en turnos rotativos.** Se usa un único valor de horas semanales para toda la semana. El Código no dice cómo combinar 48/45/42 cuando cambian las jornadas. Se avisa y se pide revisar el contrato.
5. **Los días con recargo propio** (domingo, feriado, día libre o compensatorio) no suman al límite semanal ordinario (criterio 4 de la §2.3).
6. **20 de diciembre** (duelo nacional, Ley 157): las fuentes de prensa difieren sobre el año de la ley. Se sugiere como feriado, con la norma pendiente de verificar en la Gaceta Oficial.
7. **No se automatizan:** días puente del Órgano Ejecutivo, convenciones colectivas, regímenes especiales (Autoridad del Canal, sector público, marina mercante, agro con art. 35), comisiones (art. 148), salario mínimo ni sanciones.
8. **El resultado es bruto:** no incluye Seguro Social, Seguro Educativo ni ISR.
9. **No hay persistencia:** el registro se pierde al cerrar la pestaña (solución: CSV). Guardarlo requiere hacerlo en el origen aislado de la app.
10. **Clasificación de la jornada:** se usan las primeras 7.5–8 h trabajadas. En turnos partidos muy irregulares, conviene registrar cada tramo por separado.

## 8. Corrección de legibilidad en producción (fuera del alcance original)

La auditoría de contraste detectó texto ilegible en **Salario neto**, ya publicado con CP-DESIGN-007:

- la tabla de ejemplos tenía texto claro sobre fondo blanco (contraste 1.1:1);
- las fórmulas tenían texto azul marino sobre negro (1.17:1);
- el aviso «Importante» de las fuentes tenía texto claro sobre fondo crema.

**Causa:** estilos de `global.css` (uno con `!important`) que Midnight Functional no anulaba.

**Corrección:** seis reglas al final de `src/styles/functional.css`, acotadas a `.fx`. Afectan a Salario neto y a la página nueva; Mi Quincena y Modo Pasillo no tienen esos elementos. **Llegará a producción solo cuando se fusione esta rama.**

**Otra corrección:** el sitemap automático de Astro (`sitemap-0.xml`) incluía la página de ensayo `/ensayo/traslado-quincena/`, excluida de `sitemap.xml`. Ahora ambos aplican las mismas exclusiones.

## 9. Rama y commit

- Rama: `feat/cp-tool-008-horas-extras`.
- Commit del prototipo: `87450d1`.
- CI ejecutada a mano sobre la rama, sin PR (ejecución 45964574623), con los tres jobs en verde:
  - `test`: vitest, `astro check`, build, `verify:seo`, `check:app`, `build:app` y `verify:app`;
  - «Interfaz móvil»: e2e en Chromium y aislamiento;
  - «Navegadores (Firefox y Safari)»: 99/99.
- Sin PR, sin fusión y sin publicar.
- Para publicar, tras la aprobación del CEO:
  1. cambiar `published: true` en `src/data/launch.ts`;
  2. revisar la fecha del título;
  3. fusionar.
