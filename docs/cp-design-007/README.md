# CP-DESIGN-007 — Midnight Functional Edition: informe de prototipos

- **Rama experimental:** `design/cp-design-007-functional`, creada desde `main` (`453f9d3`).
- **Respaldo del trabajo anterior:** rama `design/cp-design-005-midnight` (CP-DESIGN-005 y los prototipos editoriales de CP-DESIGN-006).
- **Estado:** no publicado, sin fusionar con `main` y con la publicidad desactivada.
- **Portada:** no se ha modificado.
- **Alcance:** solo **Salario neto**, **Mi Quincena** y **Modo Pasillo**. El resto del sitio conserva su diseño actual.

## 1. Capturas

En `capturas/`, con datos ficticios.

| Prototipo | Móvil (390 px @2x), por tramos | Escritorio (1440 px), por tramos |
|---|---|---|
| Salario neto (B/. 1,500 mensuales) | `salario-neto-movil-1…7.jpg` | `salario-neto-escritorio-1…4.jpg` |
| Mi Quincena (4 gastos, uno pagado) | `mi-quincena-movil-1…4.jpg` | `mi-quincena-escritorio-1…2.jpg` |
| Modo Pasillo (4 productos, presupuesto B/. 50) | `modo-pasillo-movil-1…3.jpg` | `modo-pasillo-escritorio-1…2.jpg` |

**Antes y después** (primera pantalla, mismo estado):
- `comparacion-<herramienta>-movil.jpg` y `comparacion-<herramienta>-escritorio.jpg`, con el antes a la izquierda y el después a la derecha;
- `antes-*` y `despues-*` por separado.

## 2. Identidad aplicada

Paleta exacta del CEO:

| Uso | Color |
|---|---|
| Fondo | `#08090C` |
| Paneles | `#10151E` |
| Campos | `#12161E` |
| Bordes | `#414B5C` (1 px) |
| Botones | `#2059D1` |
| Acentos y campos activos | `#3978EF` |
| Iconos | `#729EFF` |
| Texto | `#F4F5F7` |
| Texto secundario | `#AEB6C4` |

- **Formas:** esquinas de 6 y 8 px; iconos lineales de 16 a 20 px; marcos de 40 px para las funciones importantes (48 px junto al título).
- **Tipografía:** la del sistema (San Francisco, Roboto, Segoe UI…), sin descargas. Las cifras usan números tabulares.
- **Sin** degradados, sombras exageradas, neón, paneles blancos ni Blue.

## 3. Componentes nuevos (reutilizables)

| Componente | Archivo | Uso |
|---|---|---|
| Variante `functional` del Layout | `src/layouts/Layout.astro` (`variant="functional"`) | Cambia la cabecera, el pie y los estilos. **El `<head>` no cambia**: título, descripción, canónica, datos estructurados, CSP y política de publicidad siguen igual. Sin barra inferior |
| Hoja de estilos | `src/styles/functional.css` | Paleta y componentes acotados a `body.fx`, sin efecto en otras páginas |
| Iconos | `src/lib/fx-icons.ts` + `src/components/fx/FxIcon.astro` | 38 iconos SVG propios, un solo origen para el servidor y el navegador. Incluye `fxCopy` (portapapeles) y `fxPulse` (animación) |
| Cabecera | `src/components/fx/FxHeader.astro` | CALCULA. y botones enmarcados de **búsqueda** (índice local de herramientas y guías, sin peticiones) y **menú** (categorías con icono) |
| Ruta | `src/components/fx/FxCrumb.astro` | Muestra «Inicio / Categoría / Herramienta». El `BreadcrumbList` es **idéntico** al anterior |
| Anillo | `src/components/fx/FxDonut.astro` | Gráfico circular SVG con transición |
| Pie | `src/components/fx/FxFooter.astro` | Enlaces del sitio |
| Clases | `fx-panel`, `fx-stat`, `fx-money`, `fx-segmented`, `fx-details`, `fx-btn`, `fx-action(s)`, `fx-rows`, `fx-progress`, `fx-split`, `fx-dist`, `fx-stepper`, `fx-qty`, `fx-receipt`, `fx-dock`, `fx-error` | Campos, botones, resultados, bordes y gráficos para futuras calculadoras |

## 4. Archivos modificados y qué cambia

| Archivo | Cambio | Lógica |
|---|---|---|
| `src/pages/calculadoras/salario-neto.astro` | Orden: encabezado → resultado (cifra, anillo de disponible, bruto y descuentos) → formulario → desglose con iconos → proyección anual → copiar, compartir y reiniciar → metodología y relacionadas → artículo completo, preguntas y fuentes | Mismo motor `calculateNetSalary`, misma validación (`bindCalculator`) y mismos textos y fuentes. Se añaden **copiar** y **reiniciar** como acciones de interfaz |
| `src/components/MiQuincenaApp.astro` | Panel de saldo disponible con barra (libre ÷ dinero inicial), dinero inicial y gastos, seis indicadores, formularios enmarcados, lista con icono por categoría, distribución por categoría, acciones y privacidad | Mismos identificadores. Los datos siguen solo en `localStorage` de este origen |
| `src/lib/finance/budget-ui.ts` | Presentación: total de gastos (pagados + pendientes), barra, iconos, distribución y botón copiar | `summarizeBudget` y la persistencia **no cambian** |
| `src/pages/compras/modo-pasillo.astro` | Total del carrito con barra de presupuesto, presupuesto editable y saldo, formulario compacto, carrito con − / cantidad / + y papelera, recibo de resumen, acciones y barra inferior fija con el total y «Agregar» | Mismos identificadores; sigue en memoria de la pestaña |
| `src/lib/aisle-ui.ts` | Presentación: filas nuevas (± usa la misma edición de cantidad), recibo, barra inferior, copiar y «Agregar» | `summarizeShopping` y las validaciones **no cambian** |
| `src/pages/finanzas/mi-quincena.astro`, `app/layouts/AppLayout.astro`, `app/pages/quincena/index.astro` | Aplican la variante funcional al prototipo de Mi Quincena en el sitio y en la app aislada | La CSP estricta y el aislamiento no cambian. La página de traslado (`quincenaMoved: true`) no se rediseña |
| `e2e/blue-*.e2e.ts`, `e2e/aisle.e2e.ts` | Las pruebas de Blue pasan de salario neto a vacaciones, que conserva a Blue. La de Modo Pasillo verifica la nota de impuestos en lugar de la burbuja de Blue | Misma cobertura |

**No se tocaron:** motores y fórmulas (`src/lib/calculations.ts`, `pay-period.ts`, `shopping.ts`), rutas, sitemap, privacidad, CSP, aislamiento, contenido editorial, imágenes, portada ni publicidad (`active: false`).

## 5. Resultados de las pruebas

| Prueba | Resultado |
|---|---|
| Regresión de cálculos (vitest) | **215/215** |
| e2e del sitio (navegación, móvil, compartir, Modo Pasillo, Mi Quincena, rutas, SEO laboral, Blue) | **87/87** |
| Aislamiento financiero y traslado (`test:isolation`) | **9/9** |
| `astro check` (sitio y app) | 0 errores |
| `verify:seo` y `verify:app` | Correctos (26 URL; CSP estricta; app sin terceros) |
| SEO de las 3 páginas frente a `main` | Título, descripción, canónica, CSP, datos estructurados, robots y texto del H1 **idénticos** |
| 360, 390, 412, 768 y 1440 px | Sin desplazamiento horizontal, 1 H1, 0 campos sin etiqueta, 0 errores de consola |
| Áreas táctiles ≥ 44 × 44 px | Todas, salvo un enlace dentro de una frase en Mi Quincena (exento según WCAG 2.5.8) |
| Movimiento reducido | Sin animaciones ni transiciones (comprobado) |
| Contraste (WCAG) | Texto `#F4F5F7` sobre `#08090C`: 18.25:1 · secundario `#AEB6C4`: 9.75:1 (8.96:1 sobre paneles) · iconos `#729EFF`: 7.63:1 · texto blanco en botón `#2059D1`: 6.16:1. Todo AA, la mayoría AAA |
| Rendimiento (móvil, 4G lenta, CPU ×4) | Salario LCP 0.80 s, CLS 0, 117 KB · Mi Quincena 0.83 s, CLS 0, 80 KB · Modo Pasillo 0.79 s, CLS 0, 76 KB |
| Privacidad | Mi Quincena y Modo Pasillo sin peticiones externas (pruebas e2e); el buscador de la cabecera no hace peticiones |

## 6. Limitaciones y decisiones pendientes

1. **Aviso de presupuesto excedido sin color de alerta.** La paleta no incluye rojo ni ámbar. El aviso usa borde azul `#3978EF`, un icono de advertencia, el texto «Superaste tu presupuesto» y la barra llena. ¿Se autoriza un color de advertencia?
2. **Copiar** pone en el portapapeles el resultado con importes por acción directa del usuario; queda en el dispositivo. **Compartir** mantiene la vista previa con casillas desmarcadas por defecto.
3. **Coherencia temporal:** las otras calculadoras siguen con el diseño anterior y con Blue hasta que se autorice extender Midnight Functional.
4. **Modo Pasillo en escritorio** usa una columna (resumen → formulario → carrito), como exigen las pruebas existentes y el uso con una mano. La barra inferior con el total y «Agregar» queda fija al desplazarse.
5. La **categoría visible** en la ruta (por ejemplo «Trabajo») no se añadió al `BreadcrumbList`, para no cambiar los datos estructurados.
6. **Tipografía del sistema:** el aspecto varía ligeramente entre Android, iOS y Windows.
7. **Navegadores:** solo se probó en Chromium. El workflow «Validación de producción» cubre Firefox y WebKit, pero solo se puede usar una vez publicado.
8. Las **referencias visuales** de Mi Quincena mostraban «Ingresos»; en el prototipo es «Dinero inicial», que es el dato que existe hoy. No se creó una función nueva de ingresos.
