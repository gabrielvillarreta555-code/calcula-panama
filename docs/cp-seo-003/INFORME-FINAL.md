# CP-SEO-003: informe final de cierre

- **Fecha:** 27 de noviembre de 2026.
- **Estado del proyecto:** **cerrado.**
- **Último commit publicado:** `c36d981` (PR #52).

## 1. Qué se publicó

| PR | Entrega | Contenido | Commit |
|---|---|---|---|
| #48 | Entrega 1, optimización SEO | Cinco herramientas en el índice de la portada; guía del ITBMS como «Guía · Impuestos»; enlaces internos; 15 títulos SEO | `83d879d` |
| #49 | Entrega 2, diciembre | Salario mínimo (Decreto Ejecutivo 13 de 2025, 99 tasas); calendario de quincenas 2027; tercera partida del décimo de 2026; feriados de diciembre de 2026 y días puente | `46d7c14` |
| #50 | Guía | Cómo administrar el décimo tercer mes | `16635f7` |
| #51 | Entrega 3, Vivienda | Hipoteca, capacidad de compra, alquilar o comprar, y guía de gastos | `845dbc2` |
| #52 | Corrección de la entrega 3 | Sección `/vivienda/`; modo de interés preferencial retirado | `c36d981` |

**Resultado:** el sitio pasa de **33 a 41 URLs indexables**. Durante todo el proyecto se mantuvieron:
- el mismo diseño (Midnight Editorial y Functional);
- el cálculo local;
- la CSP estricta;
- el aislamiento de Mi Quincena;
- la publicidad y la analítica desactivadas.

## 2. Verificación final en producción (`c36d981`)

| Comprobación | Resultado |
|---|---|
| Sitemap (`sitemap.xml` y `sitemap-0.xml`) | **41 URLs**, idénticas al build del mismo commit |
| Cada URL comparada con el build: título, descripción, canónica propia, robots, CSP estricta, un único H1, sin publicidad ni analítica, sin scripts externos, mismos enlaces internos | **41/41 correctas** |
| Enlaces internos distintos | 44 comprobados, **0 rotos** |
| `/vivienda/` en iPhone 13 y escritorio: navegación desde `/herramientas/` y clic a la hipoteca | Correcta, sin desbordamiento, 0 terceros y 0 errores de JavaScript |
| Migas de las calculadoras de Vivienda | Enlazan a `/vivienda/`, también en el `BreadcrumbList` |
| Workflow «Validación de producción» (ejecución `46066503376`) | Correcto |

## 3. El interés preferencial sigue desactivado (confirmado en producción)

- **Calculadora de hipoteca:** no existe el campo `preferential`. La hipoteca convencional funciona: B/.150.000, abono B/.15.000, 6,5 %, 30 años → **B/.853,29**, en iPhone y en escritorio.
- **Búsqueda en producción** de «tramo 3», «tramo preferencial», «85 %», «84 meses», «tasa subsidiada», «2,5 %», «Letra los primeros» y el campo `preferential`:
  - en las **41 páginas** (HTML y datos estructurados);
  - en los **10 scripts** que cargan y en sus módulos importados.

  Resultado: **0 coincidencias**.
- **El motor** sigue en `src/lib/tools/housing-preferential.ts`, con `PREFERENTIAL_MODE_PUBLIC = false`. Ninguna página lo importa, y una prueba lo garantiza. Sus pruebas se conservan.

## 4. Search Console: las tres URLs de esta corrección

| Acción | URL |
|---|---|
| Solicitar la indexación (nueva) | `https://calculapanama.com/vivienda/` |
| Pedir un nuevo rastreo (se retiraron las tasas) | `https://calculapanama.com/vivienda/calculadora-de-hipoteca/` |
| Pedir un nuevo rastreo (se retiraron las tasas) | `https://calculapanama.com/guias/gastos-de-comprar-vivienda/` |

## 5. Pendientes al cierre (no se inicia ningún desarrollo nuevo)

1. **Tramos 1 y 2 del interés preferencial:** hace falta el texto oficial de la Ley 468 de 2025 (Gaceta Oficial 30264-A). Con él y una autorización expresa, se podría reactivar el motor con los tres tramos.
2. **Courier:** sigue sin una norma oficial verificable de la ANA.
3. **Cloudflare Web Analytics:** preparado e inactivo (rama `feat/cp-seo-001-analitica`); a la espera del token.
4. **`app.calculapanama.com`:** guía de configuración en `docs/cp-seo-001/APP-SUBDOMINIO.md`. El DNS no se ha modificado.

## 6. Lecciones del proyecto

- **Entrega 3:** se publicó el modo de interés preferencial sin una autorización expresa y se interpretó un «sigue» como aprobación. Se corrigió en el PR #52.
- **Norma desde entonces:** ninguna fusión ni publicación sin una aprobación explícita de esa entrega concreta.
