# CP-SEO-001: plan de ejecución aprobado

- **Fecha:** 27 de noviembre de 2026.
- **Base:** aprobación del CEO con modificaciones.
  - Sección `/impuestos/` autorizada.
  - Cloudflare Web Analytics en evaluación.
  - Los registros DNS de Google se conservan.
  - La revisión jurídica externa se aplaza.
  - Prioridad para herramientas cotidianas.
  - Tres artículos.
  - Arquitectura Midnight.
  - Publicidad desactivada.
- **Rama:** `feat/cp-seo-001-fase1`.
- **Estado:** **sin publicar**. Cada entrega requiere autorización.

## 1. Orden de ejecución, de menor a mayor complejidad

| # | Entrega | Complejidad | Fuente oficial | Estado |
|---|---|---|---|---|
| 1 | **Calculadora de ITBMS** `/impuestos/itbms/` | Baja | Ley 8 de 2010 (DGI), art. 76, que modifica el parágrafo 6 del art. 1057-V del Código Fiscal: **7 %** general, **10 %** para bebidas alcohólicas y hospedaje, **15 %** para productos derivados del tabaco. **Verificado** en el PDF de la DGI | **Implementada y probada** |
| 2 | **Dividir la cuenta y la propina** `/compras/dividir-la-cuenta/` | Baja | No depende de ninguna norma; es aritmética. Solo cita el ITBMS por contexto | **Implementada y probada** |
| 3 | **Artículo: horas extras** | Baja | Las reglas ya verificadas en `src/data/overtime-rules.ts` (CP-TOOL-008): Código de Trabajo, arts. 30 a 36 y 47 a 49 | Siguiente |
| 4 | **Artículo: ITBMS** | Baja | Las mismas que la herramienta 1 | Siguiente |
| 5 | **Feriados 2027 y días hábiles**, herramienta y artículo | Media | Código de Trabajo, art. 46 y las leyes que añaden fiestas nacionales y días de duelo; puentes por decreto ejecutivo. **Falta verificar** la lista vigente en una fuente oficial descargable | Falta verificar la fuente |
| 6 | **Tarjeta de crédito** (intereses y pago mínimo) | Media | La fórmula es matemática (reutiliza `finance/loans`). La terminología de tasa efectiva viene del Acuerdo SBP 3-2002, ya citado en el sitio | Pendiente |
| 7 | **Combustible**: precio vigente dentro de *Combustible por viaje* | Media (mantenimiento) | Secretaría Nacional de Energía, con resoluciones en la Gaceta Oficial cada **14 días**. La CSP impide consultarlas en línea: habría que actualizarlas a mano en cada período. Requiere decidir quién mantiene el dato | Requiere una decisión de mantenimiento |
| 8 | **Courier** (impuestos de importación de compras por internet) | Alta | Autoridad Nacional de Aduanas: umbral de valor, arancel e ITBMS en la importación. **Falta verificar** en una fuente oficial; es un tema de alto riesgo de error | Falta verificar la fuente |

**Regla para todas las entregas:**
- se usa la plantilla `ToolLayout` (Midnight Functional) y los artículos usan `EditorialPage` (Midnight Editorial);
- cada ficha lleva fuente oficial, fecha de consulta, ejemplo verificable, límites y preguntas frecuentes;
- cálculo local, sin peticiones de red;
- política de publicidad explícita (`stage1` solo cuando no hay datos personales), con `active: false`;
- si una fuente oficial no está accesible sin evadir protecciones (Incapsula en gacetaoficial.gob.pa y mitradel.gob.pa), se detiene la entrega y se informa. No se publica sin verificar.

## 2. Entrega 1: ITBMS y dividir la cuenta

**Cambios:**
- **Motores puros:** `itbms()` y `splitBill()` en `src/lib/tools/calculations.ts`.
  - Trabajan con centésimos enteros.
  - En `itbms()`, la base más el impuesto siempre suman el total introducido.
  - En `splitBill()`, el reparto exacto no pierde ni inventa centésimos.
  - Con redondeo a 5 o 25 centésimos o a B/.1, cada parte se redondea hacia arriba y lo que sobra se muestra como propina adicional.
- **Fichas** en `src/data/expansion-tools.ts`.
- **Páginas:** `src/pages/impuestos/itbms.astro` y `src/pages/compras/dividir-la-cuenta.astro`.
- **Registro en el sitio:**
  - nueva categoría «Impuestos» en el directorio `/herramientas/`, con su icono y su miga de pan;
  - entrada automática en el buscador y en el sitemap;
  - política `stage1` para ambas páginas;
  - `verify:seo` ampliado.
- **No se modifican** la portada aprobada ni su colofón, ni los motores existentes.

**Pruebas:**

| Prueba | Resultado |
|---|---|
| vitest | 281/281, con 22 pruebas nuevas de los dos motores y sus fichas |
| e2e en Chromium | 107/107. Incluye dos pruebas nuevas de cálculo en 390 px sin peticiones de red, y la navegación completa con las 29 rutas |
| `astro check`, `verify:seo` y `verify:app` | Correctos: 29 URLs en el sitemap |
| Firefox, WebKit y WebKit iPhone | Se ejecutan en la CI del PR, cuando se autorice abrirlo |

Capturas en `capturas/`: ITBMS, dividir la cuenta y directorio, en móvil (390 px @2x) y escritorio (1440 px).

**Pendiente de decisión:** no se crea todavía una página índice `/impuestos/`, porque con una sola herramienta sería una página pobre. La miga de pan enlaza a `/herramientas/#impuestos`. La página índice se propondrá cuando la sección tenga al menos tres contenidos (ITBMS, artículo del ITBMS y renta anual).

## 3. Evaluación de Cloudflare Web Analytics

| Punto | Hallazgo |
|---|---|
| Funcionamiento sin proxy de Cloudflare (el sitio está en GitHub Pages) | Se instala un fragmento JS con un token: `https://static.cloudflareinsights.com/beacon.min.js`. Los datos se envían a `https://cloudflareinsights.com/cdn-cgi/rum` ([documentación](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/)) |
| Cookies | Cloudflare declara que no usa cookies ni `localStorage`, y que no sigue a usuarios por IP ni por agente de usuario ([blog](https://blog.cloudflare.com/privacy-first-web-analytics/)). Es la posición del proveedor; no la hemos auditado |
| Cambios en la CSP | `script-src` + `https://static.cloudflareinsights.com` y `connect-src 'none'` → `connect-src https://cloudflareinsights.com` ([tabla de CSP](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/content-security-policies/)). Es la **única** apertura de red del sitio |
| Datos de las calculadoras | **Comprobado:** ninguna herramienta escribe valores del usuario en la URL (sin `location.hash`, `URLSearchParams` ni `history.pushState`). La baliza solo vería la ruta, el referente y métricas de rendimiento |
| Mi Quincena y `app.calculapanama.com` | Propuesta: **excluirlas**. Mi Quincena guarda presupuestos en `localStorage`, y la app aislada debe seguir sin recursos de terceros (`verify:app` lo exige) |
| Prueba de integridad (SRI) | Cloudflare no publica un hash fijo de `beacon.min.js`, así que no se puede fijar `integrity`. Es un riesgo de cadena de suministro aceptable solo si se limita el script a las páginas públicas sin datos sensibles |

**Recomendación:** viable con condiciones.
1. Un único dominio en `script-src` y en `connect-src`.
2. Solo en las páginas `stage1` y en las calculadoras sin datos personales; nunca en Mi Quincena ni en la app.
3. Pruebas que fallen si la baliza aparece en una página excluida.
4. Actualizar `/privacidad/` antes de activarla.
5. Mantener Search Console como fuente principal de datos de búsqueda.

**Para implementarla necesito:**
- la autorización expresa del CEO;
- el token del sitio, creado en el panel de Cloudflare por la cuenta de Blue Lab Studios. El token es público en el HTML: no es un secreto.

## 4. DNS y Search Console

- **No se elimina ningún registro de verificación de Google**, por instrucción del CEO.
- La exportación de Search Console sigue pendiente. Cuando llegue, se reordenarán las entregas 5 a 8 según las consultas reales.

## 5. Artículos (siguiente entrega)

| Artículo | Ruta propuesta | Enlaza a |
|---|---|---|
| Horas extras en Panamá: recargos, jornada nocturna, domingos y feriados | `/guias/horas-extras-en-panama/` | `/calculadoras/horas-extras/` |
| ITBMS en Panamá: tarifas del 7 %, 10 % y 15 % y cómo calcularlo | `/guias/itbms-en-panama/` | `/impuestos/itbms/` |
| Días feriados de Panamá 2027 | `/guias/dias-feriados-2027/` | Herramienta de feriados (entrega 5) |

Usarán la plantilla editorial aprobada en CP-DESIGN-008 (`EditorialPage`, como la guía piloto). El artículo de feriados queda sujeto a la verificación de la entrega 5.
