# Transferencia CP-DESIGN-002 — 26-11-2026

El prototipo original permanece íntegro en el commit `b6b8909`. Esta rama añade únicamente esta nota de transferencia; no cambia producción. Prototipo aislado en `docs/cp-design-002/`, sin integración Astro ni cambios de rutas, SEO o fórmulas.

## Piezas reutilizables

- `design.css`: tokens visuales, tipografía, composición adaptable, tarjetas, formulario, panel de resultados y tabla. Sus selectores generales deben adaptarse al CSS real para no afectar otras páginas.
- `index.html`: composición propuesta para portada, con SVG originales y enlaces de referencia; extraer secciones hacia la portada Astro conservando estructura, contenido, navegación y metadatos vigentes.
- `vehiculos.html`: propuesta de financiamiento, estructura de formulario y resultados; integrar en la plantilla real manteniendo todas las funciones, límites y fuentes actuales.
- `vehicle.ts`: adaptador de ejemplo que importa `carFinancing` y `decimal` del motor existente. Reutilizar el motor real y el controlador vigente; evitar duplicar lógica o reducir prestaciones.
- `vite.config.mjs`, `verify.mjs`: construcción y comprobación aisladas de la maqueta. Las cuatro imágenes PNG son capturas de escritorio y móvil. `README.md` documenta paleta, recursos, ejemplos y pruebas anteriores.

## Compatibilidad publicitaria: revisión estática

- CP-ADS-002: PR #38 abierto, no fusionado al momento de esta revisión. Modifica `src/pages/index.astro`, `src/layouts/Layout.astro`, `src/layouts/ToolLayout.astro`, `src/styles/global.css`, política y componentes publicitarios. La maqueta no toca esos archivos, así que no hay solapamiento de archivos en este commit; integrar visualmente exige preservar la política por página, CSP, pausa global, modificaciones editoriales, SEO y navegación de #38. No reemplazar los layouts con el HTML estático de la propuesta.
- CP-ADS-003: PR #39 abierto y apilado sobre #38. Extrae Mi Quincena a una app aislada y añade traslado y guardia publicitaria. Mantener la URL pública y flujo vigente, el aislamiento, comprobaciones de origen, integridad y guardia; no cambiar la política ni habilitar publicidad por el rediseño. Los enlaces del prototipo a Mi Quincena requieren verificación con la implementación finalmente integrada.
- CP-ADS-004: no apareció ningún PR, issue o commit con ese identificador en el repositorio y referencias disponibles al 26-11-2026. No es posible evaluar su compatibilidad hasta localizar sus cambios.

Esto es una comparación de archivos y documentación de PR, no una prueba de integración. No se han ejecutado builds ni pruebas en esta sesión. Antes de integrar, actualizar la base según el estado final de los PR, contrastar los diffs completos y ejecutar pruebas de CSP/publicidad, aislamiento, calculadoras, SEO y móviles. No fusionar ni desplegar automáticamente desde esta rama.
