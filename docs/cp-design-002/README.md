# CP-DESIGN-002 · Propuesta para revisión del CEO

25 de noviembre de 2026. Rama `design/cp-design-002`, basada en `50f2fae`. **No publicada.** Solo dos vistas: inicio y financiamiento de autos. No se cambian `src`, `public`, URLs, metadatos SEO, motores, dependencias ni workflows. Estos archivos quedan fuera del build Astro y del sitemap de producción.

## Dirección visual

Base carbón `#101111`, texto marfil `#f2eee5` y champán `#d4bd92` en líneas, llamadas a la acción y detalles puntuales. Títulos Georgia (serif del sistema); texto y controles Arial/Helvetica (sans serif del sistema), sin descargar tipografías. Tarjetas rectangulares, márgenes amplios, jerarquía editorial y sombras mínimas. Los formularios conservan labels explícitos y cifras tabulares. En móvil, formulario y resultados pasan a una columna, sin desplazamiento horizontal.

| Familia | Color de referencia | Uso en esta propuesta |
|---|---|---|
| Vehículos | Vino `#6e3043` | Tarjeta, composición del auto, botón y resultados |
| Banca y finanzas | Imperial `#244969` | Tarjeta de finanzas |
| Hogar | Esmeralda `#2c5e4e` | Tarjeta de consumo eléctrico |
| Tecnología | Violeta `#442b60` | Reservado; no se inventa una herramienta ni una ruta |
| Compras | Bronce/café `#725339` | Tarjeta de compras |
| Trabajo y salarios | Acero `#4a6274` | Tarjeta laboral |

Educación usa un neutral independiente. La idea editorial toma la dirección descrita por el CEO; no se encontró una referencia accesible de Vélix Gaming en el espacio de trabajo ni en la búsqueda de repositorios. No se afirma una comparación visual con ese sitio.

## Recursos y derechos

No se utilizaron fotografías, logotipos de fabricantes, fuentes descargadas ni recursos de terceros. Las composiciones SVG (arquitectura abstracta, auto, banco y hogar), los degradados y el monograma C fueron creados para esta propuesta. La alternativa gráfica se utiliza porque no había fotografías con autorización documentada. No sustituye definitivamente la marca vigente.

## Interacción y conservación funcional

`vehicle.ts` importa `carFinancing` y `decimal` desde el motor real; no reescribe fórmulas. Incluye los ocho campos existentes, ambos tipos de tasa, seguros, comisión, gastos, validación, resultados completos y tabla de amortización. Los datos iniciales están marcados como ejemplo, no oferta bancaria. Al editar se limpia el resultado anterior. Sin JavaScript el botón permanece deshabilitado y se muestra una explicación.

Ejemplo comprobado: 25,000 de precio, 5,000 de abono, 8% nominal, 72 meses, 60 de seguros, 300 de comisión y 150 de otros gastos → letra 350.66; con seguros 410.66; total 35,017.98; 72 filas de amortización.

Los enlaces locales permiten recorrer ambas propuestas. Los marcados con flecha externa llevan al portal actual. Todos los enlaces temáticos apuntan a herramientas existentes. No se diseñan páginas adicionales ni se modifica su aspecto. Las vistas de revisión contienen `noindex,nofollow` y no sustituyen los metadatos públicos.

## Revisar y reproducir

```sh
node_modules/.bin/vite build --config docs/cp-design-002/vite.config.mjs
python -m http.server 4330 --directory /tmp/cp-design-002-preview
# En otra terminal:
node docs/cp-design-002/verify.mjs
```

Abrir `http://localhost:4330/` y `http://localhost:4330/vehiculos.html`. Vite ya es una dependencia transitiva del proyecto; no se agregaron paquetes.

Verificación: ambas vistas a 320, 390 y 1440 px, un H1, ausencia de desbordamiento, resultado del motor, validación de abono excesivo, foco de errores, eliminación de resultados obsoletos, tabla de 72 filas y funcionamiento explicativo sin JS. Capturas en 390 y 1440 px. Es una comprobación básica en Chromium Linux, no certificación de accesibilidad ni prueba en dispositivos físicos.

## Capturas

- [Inicio escritorio](index-1440.png) · [Inicio móvil](index-390.png)
- [Vehículos escritorio](vehiculos-1440.png) · [Vehículos móvil](vehiculos-390.png)

## Decisión pendiente

Revisión visual del CEO sobre composición, tipografía, color y presentación de formulario/resultados. No integrar en producción ni extender al resto del portal antes de esa aprobación. No se creó un despliegue ni se fusionó código.
