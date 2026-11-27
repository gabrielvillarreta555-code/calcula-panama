# CP-DESIGN-008 — Unificación visual integral: informe de implementación

- **Rama:** `design/cp-design-008-unificacion`, desde `main` (`4a9bbf4`).
- **Estado:** las cinco fases implementadas y verificadas. **Sin publicar**: queda pendiente la autorización del CEO para la publicación única.
- **Publicidad:** desactivada (`active: false`).
- **CP-TOOL-008:** se conserva íntegro en su rama, sin publicar. La imagen de la calculadora mantiene el pie «Imagen ilustrativa», sin etiqueta de IA.

## Resultado

| | Antes (`main`) | Ahora |
|---|---|---|
| Rutas con identidad Midnight | 4 de 28 | **28 de 28**: 16 Functional y 12 Editorial |
| Blue, degradados, cabecera, pie y barra antiguos, selector de tema | En 24 rutas | **0** |
| SEO por página (título, descripción, canónica, robots, datos estructurados y H1) | — | **Idéntico** en las 28 páginas, por comparación automática con `main` |
| Navegación por clics desde la portada a cada ruta del sitemap | — | **Correcta** en 390 px y 1440 px |

Capturas antes y después de las 24 rutas: `capturas/antes-24-rutas-movil.jpg` y `capturas/despues-24-rutas-movil.jpg`.

## Fases

| Fase | Qué se hizo |
|---|---|
| **1. Plantilla funcional** | `ToolLayout` (8 herramientas) pasa a Midnight Functional: `FxCrumb`, `fx-panel`, `fx-form` y `fx-btn`. Se conservan los ganchos `data-*` y `.tool-row` de su script y su `BreadcrumbList` (`FxCrumb` admite `schema={false}` para no duplicarlo) |
| **2. Calculadoras laborales y préstamos** | Décimo, Vacaciones, Liquidación y Préstamos con el patrón de Salario neto: resultado arriba y formulario lateral. Se conservan el marcado, los ids y los scripts. **Blue retirado**: su ayuda se conserva como «Guía rápida» en texto (`FxGuide`, sobre `fx-details`). Préstamos deja `loans.css`. La página de ensayo pasa a Functional y sigue `noindex`, sin enlaces y ahora también fuera de `sitemap-0.xml` |
| **3. Editorial** | `EdMasthead` y `EdColophon` extraídos de la portada (la portada queda **idéntica píxel a píxel**). `EditorialPage` compone piezas aprobadas de CP-DESIGN-006: `crumb`, `tool-head`, `essay`, `step`, `notes`, `toollist` e índice numerado. Se aplica a las 3 guías, al índice de guías, Herramientas, Compras (sin Blue y con la foto aprobada del supermercado), las páginas institucionales y legales, y la 404 |
| **4. Limpieza** | `Layout` sin cabecera, pie, barra inferior ni selector de tema: **solo modo oscuro**. Retirados `BlueHelp`, `BlueCharacter`, `src/lib/blue`, `CalculatorArtwork`, `ShoppingScene`, `RelatedCalculators`, `Icon`, cinco hojas de estilo sin uso y las imágenes de Blue. **Se conservan** `blue-security.yml` y `blue-private-tests.yml` (escáneres de secretos y dependencias) |
| **5. Verificación** | Nueva prueba `e2e/navegacion-completa.e2e.ts`: hace clic desde la portada hasta cada ruta del sitemap y comprueba que cada una tenga identidad Midnight, ningún elemento antiguo, un H1, ningún desbordamiento ni errores. Incluida en el job de Firefox y WebKit |

**Hallazgo corregido en la fase 5:**
- La categoría `/compras/` no estaba enlazada desde la portada nueva ni desde el directorio.
- Sin tocar la portada aprobada, el directorio ahora enlaza a la sección («Guía de compras y gastos →»).

## Guía piloto (para revisión)

`/guias/descuentos-del-salario-en-panama/`. Capturas en `piloto/`: 8 tramos en móvil (390 px @2x) y 6 en escritorio (1440 px).
- **Encabezado:** cabecera de la portada, ruta y etiqueta «Guía · Trabajo», titular serif, entradilla y ficha lateral.
- **Cuerpo:** en 7 columnas, con títulos serif, tablas con filetes, fórmulas entre filetes y preguntas frecuentes con «+».
- **Columna lateral fija:** «Herramientas relacionadas» con la lista numerada de la portada.
- **Final:** colofón de la portada.

Las otras dos guías y las páginas informativas usan la misma plantilla. Cualquier ajuste del piloto se aplica a todas desde `EditorialPage` y `editorial.css`.

## Pruebas

| Prueba | Resultado |
|---|---|
| vitest | 207/207 (se retiraron las 8 pruebas de la animación de Blue, junto con su código) |
| e2e en Chromium | 93/93, con navegación completa en móvil y escritorio |
| Aislamiento de Mi Quincena | 9/9 |
| `astro check`, `check:app`, `verify:seo` y `verify:app` | Correctos |
| Contraste AA del texto visible, en las 28 rutas | Sin fallos (salvo el punto decorativo del colofón, `aria-hidden`, como en la portada aprobada) |
| Rendimiento (móvil, 4G lenta, CPU ×4) | Herramientas: LCP 0.90 s · Guía: 0.92 s · Vacaciones: 1.00 s · Financiamiento: 0.93 s · Préstamos: 0.98 s. CLS ≤ 0.037 |
| Firefox, WebKit y WebKit iPhone | CI de la rama (ver el informe de entrega) |

## Pendiente para la publicación única

1. **Aprobación de la guía piloto.**
2. **Autorización de la publicación.** Se hará un único PR de esta rama a `main`, con CI en los tres motores, y después la verificación en producción.
3. **CP-TOOL-008** sigue aparte. Al autorizar su publicación habrá que integrar su rama con esta. Los conflictos previstos, manejables, están en `herramientas/index.astro` y `functional.css`; ambas ramas ya comparten los mismos iconos y la exclusión del sitemap.
