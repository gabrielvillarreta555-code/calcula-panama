# Informe de seguridad 4.2

Estado: propuestas de seguridad en borrador. El PR #20 se fusionó a main el 31 de octubre de 2026 a las 20:53 UTC; el estado de su despliegue no ha podido verificarse con el conector disponible. Las actualizaciones #21, #22 y #23 no están fusionadas.

## Confirmados

- El candidato del PR #20 con Astro 5.18.2 y Vitest 2.1.9 reportó 10 paquetes afectados por npm audit: 3 críticos, 4 altos y 3 moderados.
- Blue Security Lab indicó atención privada en ese candidato. Su implementación usa `TemporaryDirectory` y elimina los informes al terminar, de modo que el informe original no es recuperable.
- Los reportes crudos podrían contener rutas o información sensible. No deben enviarse a logs ni artefactos del repositorio público.

## Corregidos en las ramas experimentales, no aún en #20

- El PR #21 propone Astro 7.4.4. npm audit en esa rama pasó de 10 a 6 paquetes afectados; los avisos de Astro, sharp, zod y zod-to-ts dejaron de aparecer. La compilación, 93 pruebas unitarias, Astro check, SEO y Playwright pasaron en el commit probado.
- Este PR #23 propone Vitest 5.0.5 sobre #21. npm audit reportó cero paquetes afectados en el commit probado; 93 pruebas unitarias, Astro check, build, SEO y 20 pruebas Playwright pasaron. Blue Security Lab terminó sin señales, pero sus límites siguen aplicando.
- Astro 7.4.4 requiere Node >=22.23.4; Vitest 5.0.5 requiere Node ^22.12, ^24 o >=26. Los tests usaron Node 22.23.4. Debe fijarse una versión compatible al integrar.

## Aplicabilidad aún no demostrada

- El sitio usa salida estática en GitHub Pages. Los avisos de Astro que requieren servidor SSR, islas de servidor u optimización de imágenes en tiempo de petición no parecen directamente expuestos en esa arquitectura. Esto no descarta fallos de compilación ni XSS en HTML generado.
- Los avisos de Vitest y Vite bajo la cadena de pruebas exigen, según el caso, servidores de desarrollo/UI o entradas maliciosas. No se ha demostrado una explotación en producción. El audit no demuestra explotabilidad ni ausencia de otras vulnerabilidades.
- La caída de 10 a 0 avisos y un guard sin señales en la rama actualizada son compatibles con que las dependencias explicaran la señal previa, pero **no identifican de forma concluyente** su causa.

## Revisión privada pendiente

El PR #22 propone un resumen local en memoria durante hasta 300 segundos en una terminal propiedad del usuario, sin exportar secretos, rutas o fragmentos. Depende de una máquina, cuenta y terminal privadas controladas por un mantenedor; no autentica membresía organizacional, ni protege frente a root, procesos del mismo usuario o grabaciones. No usar en CI, runner compartido ni artefactos públicos.

Ejecutar el PR #22 en un entorno privado autorizado sobre la referencia exacta del PR #20 con las versiones verificadas de Gitleaks y OSV, clasificar sus recuentos e identificadores y proceder a investigación local detallada si indica secretos o configuración. El resumen de recuentos no identifica ubicaciones y no recupera el informe anterior.

## Recomendación

El PR #20 ya está en main, pero su despliegue no está verificado. No realizar nuevos despliegues sin autorización. Revisar los PR #21, #22 y #23, ejecutar la revisión privada sobre el commit b1d34c9, preparar un candidato final de las actualizaciones, volver a ejecutar npm audit, Blue Security Lab, todas las pruebas, build y SEO sobre ese commit y probar Android físico y accesibilidad. Se requiere autorización expresa antes de fusionar o publicar.
