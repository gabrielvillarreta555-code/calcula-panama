# Portada editorial CP-DESIGN-006: auditoría e integración

- **Rama:** `design/cp-design-006-portada`, creada desde `main` (`011adf7`).
- **Estado:** integración preparada **sin publicar**. Falta la aprobación del CEO sobre las capturas.

## 1. Auditoría de ramas

| Rama | Portada (`src/pages/index.astro`) | Portada CP-DESIGN-006 |
|---|---|---|
| `main` (producción) | Portada anterior: Blue, tarjetas redondeadas, degradados, cabecera y barra inferior antiguas | No existe |
| `design/cp-design-005-midnight` | `8a1c1c2`: el intento de CP-DESIGN-005, rechazado | Solo como **prototipo HTML estático**: `docs/cp-design-006/prototipos/index.html` + `proto.css` (`e8f034e`, imágenes en `686a11a`) |

**Commits de la rama `design/cp-design-005-midnight` que no están en `main`:**
- `40785b3` y `8a1c1c2`: CP-DESIGN-005 (rechazado);
- `e8f034e` y `686a11a`: prototipos de CP-DESIGN-006.

**Commits de `main` que no están en esa rama:** todo CP-DESIGN-007 (`46fcc25` → `011adf7`).

## 2. Por qué la portada no llegó a producción

1. **CP-DESIGN-006 se encargó y entregó como prototipo.** Las órdenes eran «No publicar en producción. No fusionar ramas» e «Integra las seis imágenes exclusivamente en el prototipo». Por eso se construyó como HTML estático en `docs/`, fuera del sitio y del *build*. Nunca se portó a `src/pages/index.astro`.
2. **No hubo una orden de integración.** En el historial de la sesión no hay ningún mensaje que apruebe la portada de CP-DESIGN-006 ni que pida llevarla al sitio. Su informe dejaba 7 decisiones pendientes del CEO (navegación, tipografía, tema único oscuro, retirar Blue, «El dato», resultados como estado de cuenta, licencias de imágenes).
3. **CP-DESIGN-007 pidió no tocar la portada.** Decía «La portada editorial actual debe permanecer intacta», y su aprobación, «Mantener intacta la portada editorial». Se interpretó como la portada **publicada** en `main`, la única que existía en el sitio. Por eso la publicación del 27-11 (PR #41) conservó la portada anterior.

**Conclusión:** no hubo un fallo de despliegue. La portada editorial nunca se integró en el código del sitio; solo existía como prototipo en `docs/`. La lectura de «portada editorial actual» como la publicada fue errónea respecto a la intención del CEO.

## 3. Integración (sin rediseñar)

**Origen:** `docs/cp-design-006/prototipos/index.html` y `proto.css`, de la rama de diseño.

| Elemento | Qué se hizo |
|---|---|
| Composición, tipografía y retícula | Copiadas sin cambios. Las alturas de cada sección (portada, índice, «El dato», Movilidad, colofón) son **idénticas** al prototipo en 390 y 1440 px |
| CSS | `src/styles/editorial.css` es `proto.css` (solo la parte de portada e índice), con dos ajustes. **Acotado** a `body.ed` para no mezclarse con `global.css`. `.hero` y `.feature` se renombran a `.ed-hero` y `.ed-feature`, porque `global.css` les daba degradado y forma de tarjeta |
| Tipografías | Instrument Serif e Inter Tight (OFL-1.1), servidas desde `/fonts/` con sus licencias |
| Imágenes | Las 6 de IA en `/editorial/`, y las 2 fotografías reales (Ciudad de Panamá y Canal) en `/fotos/`, con sus créditos y licencias CC. Todas en AVIF y WebP de 800 y 1600 px, con `width` y `height` |
| Enlaces | Los `#` y `.html` del prototipo pasan a las **15 rutas reales** de herramientas, 3 guías y las páginas legales |
| Cifras | «El dato» y los porcentajes salen del motor real de salario neto (B/.1,236.92). Los recuentos del índice salen de las listas |
| Búsqueda e índice | Usan el **mismo índice local** que la cabecera de las calculadoras (`src/lib/search-index.ts`, extraído de FxHeader sin cambiar su comportamiento). No hacen peticiones. El índice se abre y cierra con foco y Escape |
| Calculadoras | Las páginas Midnight Functional (CP-DESIGN-007) no cambian. La portada enlaza a ellas |
| `<head>` | Igual: título, descripción, canónica, datos estructurados (`WebSite` + `ItemList`), CSP estricta y política de publicidad |

**Añadido respecto al prototipo:**
- un enlace a las fechas de pago del décimo, que la portada anterior mostraba;
- el estilo de los resultados de búsqueda (reutiliza `.toollist`);
- el enlace «Saltar al contenido».

**Retirado de la portada:**
- Blue;
- la cabecera y la barra inferior antiguas;
- el selector de tema: el prototipo es solo oscuro, decisión 3 de CP-DESIGN-006 pendiente.

Las demás páginas del sitio no cambian.

## 4. Capturas (`integracion/`)

Sección por sección, en móvil (390 px @2x) y escritorio (1440 px):

1. portada;
2. índice;
3. el dato;
4. movilidad;
5. finanzas;
6. trabajo;
7. hogar y compras;
8. educación;
9. revista;
10. pie;
11. índice abierto con búsqueda.

## 5. Pruebas

| Prueba | Resultado |
|---|---|
| e2e del sitio (Chromium) | **99/99**. Incluye la nueva `portada-editorial.e2e.ts`: <br>• 360, 390, 768 y 1440 px <br>• sin Blue, sin degradados y sin desbordamiento <br>• las 15 rutas y todos los enlaces responden 200 <br>• búsqueda, índice y Escape <br>• SEO, CSP y sin AdSense |
| Pruebas antiguas de la portada | Se retiraron las que exigían Blue y las tarjetas (`blue-showcase`, `home-shopping`); se conservan sus comprobaciones de `/compras/` |
| vitest | 215/215 |
| `astro check` y `check:app` | 0 errores |
| `verify:seo` y `verify:app` | Correctos |
| Aislamiento | 9/9 |
| Rendimiento de la portada (móvil, 4G lenta, CPU ×4) | LCP 0.96 s, CLS 0.001, 155 KB |
| Contraste | Sin fallos, salvo el punto decorativo del colofón (`aria-hidden`, igual que en el prototipo) |

## 6. Decisiones del CEO (27-11-2026)

1. **Solo modo oscuro:** la portada es siempre oscura, también con el sistema en modo claro o con el tema claro guardado (prueba e2e). El resto del sitio conserva su selector.
2. **Apartamento:** generado con IA; el pie dice «Imagen generada con IA».
3. **Hilux:** imagen ilustrativa, sin sugerir afiliación.
   - Pie: «Camioneta pickup · Imagen ilustrativa generada con IA. Calcula Panamá no tiene afiliación con Toyota ni con sus marcas».
   - El texto alternativo ya no menciona la marca.
4. **Publicación autorizada** tras superar las verificaciones. La calculadora de horas extras sigue sin publicar.

**Corrección añadida:** el fondo de `<html>` usaba una variable definida solo en `body.ed`. Ahora es `#08090C` literal, para que la zona de rebote al desplazarse también sea negra.

## 7. Publicación y verificación en producción (27-11-2026)

- **PR #42** (contraste de Salario neto): fusionado (`550070c`) y publicado.
- **PR #43** (portada editorial): CI completa en verde, con 102/102 en Firefox, WebKit y WebKit iPhone. Fusionado (`4a9bbf4`) y publicado.
- **Verificación directa en https://calculapanama.com: 22/22.**
  - **SEO y seguridad:** título, canónica, `WebSite` + `ItemList`, CSP estricta, sin AdSense.
  - **Diseño:** sin Blue ni cabecera antigua, tipografía editorial y solo modo oscuro aunque la preferencia sea clara.
  - **Contenido:** «El dato» B/.1,236.92 y pies de imagen (IA; Hilux sin afiliación).
  - **Enlaces y red:** 25 enlaces internos responden 200; solo hay peticiones al propio sitio y no hay errores de consola.
  - **Calculadoras:** Salario neto, Mi Quincena y Modo Pasillo con Midnight Functional; tabla de Salario neto legible.
  - **Horas extras:** sigue sin publicar (404 y fuera del sitemap).
- **Incidencia transitoria:** la primera verificación, en los segundos posteriores al despliegue, recibió un 503 al cargar una tipografía mientras se propagaba la CDN. Las dos ejecuciones siguientes dieron 22/22.
- **Capturas reales de producción:** `produccion/`. Cubren las 10 secciones de la portada y la tabla de Salario neto, en móvil (390 px @2x) y escritorio (1440 px).
