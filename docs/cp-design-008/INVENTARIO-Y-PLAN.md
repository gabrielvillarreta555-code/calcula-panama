# CP-DESIGN-008: unificación visual integral

## Inventario de rutas y plan de implementación

- **Rama:** `design/cp-design-008-unificacion`, creada desde `main` (`4a9bbf4`, lo publicado hoy).
- **Estado:** solo inventario y plan. **No se ha implementado ni publicado nada.**
- **CP-TOOL-008:** cerrado en su rama `feat/cp-tool-008-horas-extras` (`0e7473c`, CI en verde en Chromium, Firefox, WebKit y iPhone). Se conserva íntegro y sin publicar.

## 1. Método

- Se compiló `main` y se abrió cada ruta en Chromium (390 px).
- Para cada página se midió:
  - **identidad:** clase del `<body>`;
  - **Blue:** imágenes y elementos `blue-*`;
  - **degradados:** elementos con `background-image: gradient`;
  - **cabecera, pie y barra inferior antiguos;**
  - **radios de 14 px o más;**
  - **selector de tema;**
  - **campos interactivos;**
  - **clics desde la portada:** recorrido de todos los enlaces internos.

Contacto visual de las 24 páginas antiguas: `inventario-diseno-antiguo-movil.jpg`.

## 2. Inventario

### 2.1 Ya aprobadas, no se rediseñan

| Ruta | Identidad |
|---|---|
| `/` | Midnight Editorial (CP-DESIGN-006) |
| `/calculadoras/salario-neto/` | Midnight Functional (CP-DESIGN-007) |
| `/finanzas/mi-quincena/` | Midnight Functional (CP-DESIGN-007) |
| `/compras/modo-pasillo/` | Midnight Functional (CP-DESIGN-007) |
| `/calculadoras/horas-extras/` | Midnight Functional (CP-TOOL-008, rama propia, sin publicar) |
| `app.calculapanama.com` (4 páginas) | Midnight Functional (`AppLayout`, `body.fx`) |

### 2.2 Pendientes: 24 rutas con el diseño antiguo, todas a 1 clic de la portada (salvo las indicadas)

Todas comparten la **cabecera, el pie y la barra inferior antiguos**, el **selector de tema** y al menos **2 degradados**, procedentes de la cabecera y el fondo de `global.css`.

**Herramientas interactivas → Midnight Functional (13)**

| Ruta | Plantilla | Blue | Degradados | Radios ≥14 px | Campos |
|---|---|---|---|---|---|
| `/calculadoras/decimo-tercer-mes/` | Página propia + `BlueHelp` | **24** | 3 | 18 | 9 |
| `/calculadoras/vacaciones/` | Página propia + `BlueHelp` | **24** | 2 | 15 | 8 |
| `/calculadoras/liquidacion-laboral/` | Página propia + `BlueHelp` | **24** | 4 | 15 | 10 |
| `/finanzas/calculadora-prestamos/` | Página propia + `LoanFields` | **2** | 3 | 30 | 8 |
| `/vehiculos/financiamiento-de-auto/` | `ToolLayout` | 0 | 2 | 9 | 8 |
| `/vehiculos/combustible-por-viaje/` | `ToolLayout` | 0 | 2 | 8 | 7 |
| `/vehiculos/costo-mensual-de-un-auto/` | `ToolLayout` | 0 | 2 | 8 | 10 |
| `/finanzas/meta-de-ahorro/` | `ToolLayout` | 0 | 2 | 7 | 5 |
| `/educacion/promedio-de-notas/` | `ToolLayout` | 0 | 2 | 12 | 6 |
| `/vida-cotidiana/consumo-electrico/` | `ToolLayout` | 0 | 2 | 7 | 5 |
| `/compras/descuentos-y-promociones/` | `ToolLayout` | 0 | 2 | 7 | 5 |
| `/compras/precio-por-unidad/` | `ToolLayout` | 0 | 2 | 12 | 6 |
| `/ensayo/traslado-quincena/` | Página interna (`noindex`, fuera del sitemap, sin enlaces) | 0 | 2 | 3 | — |

**Categorías, guías e información → Midnight Editorial (11)**

| Ruta | Tipo | Blue | Degradados | Radios ≥14 px | Clics desde la portada |
|---|---|---|---|---|---|
| `/herramientas/` | Directorio (categorías) | 0 | 2 | 22 | 1 |
| `/compras/` | Categoría + `ShoppingScene` | **2** | 4 | 10 | 2 |
| `/guias/` | Índice de guías | 0 | 2 | 9 | 1 |
| `/guias/descuentos-del-salario-en-panama/` | Artículo | 0 | 2 | 12 | 1 |
| `/guias/fechas-de-pago-del-decimo-tercer-mes/` | Artículo | 0 | 2 | 13 | 1 |
| `/guias/prima-de-antiguedad-e-indemnizacion/` | Artículo | 0 | 2 | 14 | 1 |
| `/sobre-nosotros/` | Institucional | 0 | 2 | 0 | 1 |
| `/contacto/` | Institucional | 0 | 2 | 2 | 1 |
| `/privacidad/` | Legal | 0 | 2 | 0 | 1 |
| `/terminos/` | Legal | 0 | 2 | 0 | 1 |
| `/404` | Error | 0 | 2 | 6 | — |

**Componentes y recursos obsoletos que se retirarán al final:**
- **En `Layout.astro`:** cabecera, pie, barra inferior, selector de tema y script `cp-theme`.
- **Componentes:** `BlueHelp`, `BlueCharacter`, `CalculatorArtwork` (ya sin uso tras la portada nueva), `ShoppingScene`, `Breadcrumbs`, `RelatedCalculators` y `Icon` (cuando ya no se usen).
- **Estilos:** reglas de `global.css` y `expansion-tools.css` que queden sin uso.
- **Recursos:** imágenes `blue-*` de `public/`.
- **Pruebas:** `e2e/blue-*.e2e.ts`.

## 3. Principios

1. **Sin tercera identidad.** Las herramientas usan los componentes `fx-*` de `functional.css` y `FxHeader`/`FxFooter`. Las páginas editoriales usan `editorial.css` y la cabecera y el colofón de la portada.
2. **Sin tocar lo aprobado:** portada, Salario neto, Mi Quincena, Modo Pasillo y Horas extras.
3. **Lo que no cambia:**
   - motores (`calculations.ts`, `lib/tools/calculations.ts`, `finance/*`);
   - identificadores de campos;
   - rutas;
   - `<head>`: título, descripción, canónica y datos estructurados;
   - CSP estricta;
   - aislamiento;
   - privacidad;
   - publicidad desactivada.
4. **Comprobación automática del SEO.** Un script compara, página por página, título, descripción, canónica, robots, datos estructurados y texto del H1 antes y después. Cualquier diferencia bloquea la publicación.

## 4. Plan por fases (un PR por fase, sin publicar sin autorización)

| Fase | Alcance | Cómo | Pruebas | Esfuerzo |
|---|---|---|---|---|
| **1. Plantilla funcional** | Las 8 herramientas de `ToolLayout` | Se migra **una sola plantilla** a `variant="functional"` con `FxCrumb`, `fx-panel`, `fx-form`, `fx-money`, `fx-stats`, `fx-actions` y `fx-error`. Los ids que usa `scripts/expansion-tools.ts` no cambian | `expansion-tools.e2e`, `automoviles.e2e`, navegación, Firefox y WebKit | Bajo |
| **2. Calculadoras laborales y préstamos** | Décimo, Vacaciones, Liquidación y Préstamos | Mismo patrón que Salario neto: resultado arriba, formulario, desglose y acciones. Se retira `BlueHelp`; su ayuda contextual pasa a texto en el formulario y en la metodología, como decidió CP-DESIGN-006 | `validacion-numerica`, `compartir`, `prestamos` y `seo-laboral`. Las de Blue (`blue-interactivo`, `blue-living`) se sustituyen por pruebas de la ayuda en texto | Medio |
| **3. Editorial** | `/herramientas/`, `/compras/`, `/guias/`, 3 guías, 4 páginas institucionales y la 404 | Se extraen la cabecera, el índice y el colofón de la portada a componentes (`EdMasthead`, `EdColophon`) y se usan con `variant="editorial"`. Las guías usan la tipografía, filetes, `label` y retícula de `editorial.css` (titular serif, sumario, tablas con filetes). **Primero una guía piloto** para tu aprobación; después el resto | Navegación, contraste y SEO por página | Medio |
| **4. Limpieza** | Retirar lo obsoleto del §2 | Se elimina sin cambiar ninguna página visible. `global.css` se reduce a lo que sigan usando las páginas | Suite completa, `verify:seo`, `verify:app` y aislamiento | Bajo |
| **5. Verificación integral** | Todo el sitio | Recorrido automatizado desde la portada hasta las 28 rutas, haciendo clic en móvil (390 px) y escritorio (1440 px), en Chromium, Firefox y WebKit. Capturas por ruta, auditoría de contraste, rendimiento y comparación de SEO | Nuevo `e2e/navegacion-completa.e2e.ts` | Bajo |

Cada fase entrega:
- capturas antes y después en móvil y escritorio;
- resultados de pruebas;
- un PR con CI en los tres motores.

**No se publica ninguna fase sin tu autorización.**

## 5. Decisiones que necesito antes de implementar

1. **Plantilla de artículo editorial.** CP-DESIGN-006 solo aprobó la portada y dos herramientas, no un artículo. Propongo componer las guías con las piezas ya aprobadas de la portada: titular serif, `label`, filetes, retícula y colofón. Sería sin elementos nuevos y con una guía piloto para tu revisión antes de extenderlo. ¿De acuerdo?
2. **Solo modo oscuro en todo el sitio.** Al unificar desaparecería el selector de tema, que ya no existe en la portada ni en las herramientas funcionales. ¿Se confirma?
3. **Blue en la integración continua.** Hay dos flujos de CI ligados a Blue (`blue-security.yml` y `blue-private-tests.yml`, este último con el job `blue-guard`). Al retirar Blue de la interfaz, ¿se retiran también, o se conservan mientras existan recursos privados de Blue?
4. **Página interna `/ensayo/traslado-quincena/`.** No es pública (`noindex`, sin enlaces). Propongo pasarla a Midnight Functional en la fase 2, con prioridad baja.
5. **Orden de publicación.** Propongo publicar por fases (1 → 2 → 3 → 4), cada una con tu autorización, para limitar el riesgo. La alternativa es una única publicación al final.
