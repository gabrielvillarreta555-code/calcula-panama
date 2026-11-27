# CP-SEO-003, entrega 1: optimización SEO

- **Fecha:** 27 de noviembre de 2026.
- **Rama:** `feat/cp-seo-003-entrega-1`, desde `main` @ `a4f92c6`.
- **Estado:** **sin fusionar ni publicar**; pendiente de aprobación.
- **Alcance:** sin rediseño, sin cambios de URL, sin contenido eliminado, publicidad desactivada, CSP y privacidad intactas.

## 1. Cambios

### 1.1 Portada: índice con las cinco herramientas nuevas

Se usan las mismas piezas aprobadas (listas numeradas `toollist` de cada sección). No hay secciones ni estilos nuevos.

| Sección | Antes | Después |
|---|---|---|
| 02 Finanzas | 3 herramientas | 4: + **2.4 Tarjeta de crédito** |
| 03 Trabajo | 4 herramientas | 5: + **3.5 Horas extras** |
| 04 Hogar | Consumo eléctrico | + **4.2 Días hábiles y feriados** |
| 04 Compras | 3 herramientas | 5: + **4.6 ITBMS** y **4.7 Dividir la cuenta** |

- El reparto entre las columnas Hogar y Compras pasa de una posición fija (`slice`) a un grupo explícito (`group`). El resultado visual es el mismo, con más filas.
- El recuento del índice se actualiza solo: 3 · 4 · 5 · 7 · 1 herramientas y 5 guías.
- Los datos estructurados (`ItemList`) de la portada ya incluían las herramientas de expansión. Se añade la de horas extras, que faltaba.

### 1.2 Clasificación de la guía del ITBMS

- **Causa:** la portada etiquetaba todas las guías como «Guía · Trabajo», con texto fijo en el código.
- **Corrección:** `GUIDES` (`src/data/site.ts`) tiene ahora un campo `topic`. La portada muestra «Guía · Trabajo» en las cuatro laborales y **«Guía · Impuestos»** en la del ITBMS. La propia guía ya decía «Guía · Impuestos».

### 1.3 Colofón compartido (pie de las páginas editoriales)

Enlaces añadidos:
- **Finanzas:** Tarjeta de crédito.
- **Trabajo:** Horas extras.
- **Hogar y compras:** ITBMS, Dividir la cuenta, y Días hábiles y feriados.

### 1.4 Enlaces internos contextuales

| Desde | Hacia |
|---|---|
| Salario neto | Horas extras |
| Décimo tercer mes | Tarjeta de crédito, Metas de ahorro |
| Vacaciones, Liquidación | Días hábiles y feriados |
| Vacaciones, Liquidación y Décimo (bloque común `FxRelated`) | Horas extras |
| Horas extras | Días hábiles y feriados |
| Préstamos | Tarjeta de crédito (en «Entiende tu estimación») |
| Descuentos y promociones | ITBMS |
| Metas de ahorro | Tarjeta de crédito |
| Guía de horas extras | Días hábiles y feriados |
| Guía de fechas del décimo | Tarjeta de crédito |

**Enlaces contextuales recibidos** (desde el `<main>` de otras páginas):

| Página | Antes → después |
|---|---|
| Horas extras | 3 → **8** |
| Días hábiles y feriados | 1 → **6** |
| Tarjeta de crédito | 1 → **6** |
| ITBMS | 3 → **5** |
| Dividir la cuenta | 4 → **5** |

`FxRelated` acepta ahora una lista `extra` de enlaces de la página. Sin ella, se comporta igual que antes, más el enlace a horas extras.

### 1.5 Títulos y descripciones

Se añade a las herramientas generadas un campo opcional `seoTitle`, que **solo cambia `<title>`**. El H1, la URL y la canónica no cambian.

**Herramientas generadas** (`ToolLayout`):

| Página | Antes | Después |
|---|---|---|
| Precio por unidad | Comparador de precio por kilo, litro o unidad \| Calcula Panamá (62) | Comparador de precio por kilo, libra o litro en Panamá (53) |
| Descuentos | Calculadora de descuentos y promociones \| Calcula Panamá (56) | Calculadora de descuentos, 2x1 y 3x2 en Panamá (46) |
| Metas de ahorro | Calculadora de metas de ahorro \| Calcula Panamá (47) | Calculadora de metas de ahorro por quincena en Panamá (52) |
| Promedio de notas | Calculadora de promedio de notas y nota necesaria \| Calcula Panamá (66) | Calculadora de promedio de notas y nota necesaria (49) |
| Consumo eléctrico | Calculadora de consumo eléctrico en kWh \| Calcula Panamá (56) | Calculadora de consumo eléctrico en kWh en Panamá (49) |
| ITBMS | Calculadora de ITBMS en Panamá: 7%, 10% y 15% \| Calcula Panamá (62) | Calculadora de ITBMS en Panamá: 7%, 10% y 15% (45) |
| Dividir la cuenta | Calculadora para dividir la cuenta y la propina \| Calcula Panamá (64) | Dividir la cuenta y la propina: calculadora (42) |
| Días hábiles | Calculadora de días hábiles y feriados de Panamá \| Calcula Panamá (65) | Días hábiles y feriados de Panamá: calculadora (46) |
| Tarjeta de crédito | Calculadora de tarjeta de crédito: intereses y pago mínimo \| Calcula Panamá (75) | Tarjeta de crédito en Panamá: intereses y pago mínimo (53) |
| Financiamiento de auto | Calculadora de financiamiento de autos \| Calcula Panamá (55) | Calculadora de financiamiento de auto en Panamá (47) |
| Combustible | Calculadora de combustible por viaje \| Calcula Panamá (53) | Calculadora de combustible por viaje en Panamá (46) |
| Costo de un auto | Calculadora del costo mensual de un auto \| Calcula Panamá (57) | Costo mensual de un auto en Panamá: calculadora (47) |

**Páginas propias:**

| Página | Antes | Después |
|---|---|---|
| Préstamos | Calculadora de Préstamos en Panamá \| Cuotas e Intereses — Calcula Panamá (72) | Calculadora de préstamos en Panamá: cuota e intereses (53) |
| Mi Quincena | Calculadora de Quincena y Presupuesto Personal en Panamá \| Calcula Panamá (73) | Mi Quincena: presupuesto personal por quincena en Panamá (56) |
| Modo Pasillo | Modo Pasillo: calculadora de compras y presupuesto \| Calcula Panamá (67) | Modo Pasillo: calculadora de compras del supermercado (53) |

**Descripciones:**
- **Horas extras:** se acorta de 182 a 139 caracteres; conserva los recargos, las jornadas y la fuente.
- **`/herramientas/`:** ahora menciona horas extras, ITBMS, tarjeta y feriados.

**Se mantienen sin cambios, por seguir siendo relevantes:**
- **«2026»** en el décimo, que se paga el 15-12-2026; en horas extras; y en los descuentos del salario, con parámetros vigentes en 2026. Se propone revisarlos del 1 al 5 de enero de 2027.
- Los títulos de las guías, de la portada y de las cuatro calculadoras laborales principales: ya eran específicos y la canibalización no lo justifica.

**Criterio:**
- Google muestra el nombre del sitio por separado, así que quitar «| Calcula Panamá» evita que los títulos se corten y deja sitio a «en Panamá».
- Ningún título supera los 60 caracteres.
- No hay títulos duplicados (`verify:seo`).

## 2. Pruebas

| Prueba | Resultado |
|---|---|
| vitest | 294/294 |
| e2e en Chromium | **111/111**: incluye la navegación completa desde la portada (móvil y escritorio), que recorre todas las rutas del sitemap, la portada editorial y las calculadoras |
| Aislamiento de Mi Quincena | 9/9 |
| `astro check` | 0 errores y 0 avisos |
| `verify:seo` | 33 URLs, títulos y descripciones únicos, CSP estricta, sin publicidad |
| Móvil (390 px) y escritorio (1440 px) | Sin desbordamiento horizontal. Etiquetas de la Revista correctas |
| Firefox, WebKit y iPhone | Se ejecutan en la CI del PR |

**Capturas** (`capturas/`):
- `portada-finanzas-*.png`
- `portada-trabajo-*.png`
- `portada-hogar-*.png`
- `portada-revista-*.png`

Cada una en versión móvil y escritorio. El enlace «Saltar al contenido» que aparece en algunas capturas es un efecto de la captura por elementos de Playwright; en una carga normal permanece oculto (comprobado: `top: -80px`, sin foco).

**Prueba ajustada:** `e2e/automoviles.e2e.ts` comprueba ahora el `<title>` con `seoTitle`, si existe.

## 3. Pendiente de aprobación

1. Abrir el PR para pasar la CI en los tres motores, fusionar y publicar.
2. Tras la publicación:
   - verificar en producción;
   - pedir el nuevo rastreo en Search Console de la portada y de `/herramientas/`.
3. Entrega 2 (expansión de diciembre): empieza después de esta aprobación, con un análisis previo de canibalización para cada pieza.
