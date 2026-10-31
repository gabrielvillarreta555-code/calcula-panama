# Informe de preparación de lanzamiento

Estado: candidato en revisión; no autorizado para producción. Diagnóstico del 31 de octubre de 2026.

## Grafo y orden

- PR #17 fusionado a `main` (commit de fusión `5d911e3`); la arquitectura y el guard ya están allí.
- PR #18 fusionado a `blue-security-integration` (merge `c449203`), no a `main`. Esa rama contiene exactamente el árbol de `feature/modo-pasillo` y un commit adicional de fusión.
- PR #19 abierto en borrador, basado en `feature/modo-pasillo`; contiene los dos commits adicionales de Blue.
- `main` frente a `feature/blue-interactivo`: 23 commits por delante y uno por detrás, con ancestro común `292935d`. El commit por detrás es el merge de #17; GitHub genera un merge de prueba sin conflicto.
- PR #20 agrupa Modo Pasillo y Blue en un candidato contra `main`. Conserva historia, y no se deben fusionar #19 y #20 independientemente sin revisar duplicación de cambios.

Orden propuesto: resolver y revisar seguridad; revisar #20 y probarlo manualmente; pedir autorización explícita; fusionar únicamente el PR de integración acordado y observar el despliegue que dispara `main`; después decidir si #19 se cierra como incorporado o se retargetea, evitando aplicar sus cambios dos veces. No se realiza ninguna fusión ni despliegue en esta misión.

## Auditoría npm

El audit de GitHub Actions del candidato reporta **10 paquetes afectados**: 3 críticos, 4 altos y 3 moderados. Son paquetes agrupados por npm, no necesariamente diez CVE independientes. El detalle y sus avisos públicos están en el job de auditoría del PR.

| Paquete y versión observada | Severidad npm | Exposición estimada y solución propuesta |
|---|---|---|
| `astro@5.18.2` | Crítica | Dependencia de compilación; el sitio publicado es estático, lo que reduce la exposición de endpoints SSR e imágenes en tiempo de petición, pero no descarta XSS generado en build. npm propone Astro 7.4.4 (mayor): actualizar en PR aislado y revisar compatibilidad. |
| `vitest@2.1.9` | Crítica | Herramienta de desarrollo/CI; el aviso de UI requiere servidor Vitest UI accesible. No se identificó uso en producción. npm propone Vitest 5.0.5 (mayor). |
| `tinypool@1.1.1` | Crítica | Dependencia de desarrollo de Vitest, con avisos de contaminación de prototipo/RCE bajo condiciones específicas. No se ha demostrado explotabilidad en este proyecto. Actualizar cadena Vitest y verificar. |
| `sharp@0.34.5` | Alta | Procesamiento de imágenes en build; no hay endpoint de optimización dinámica identificado en GitHub Pages. Riesgo al procesar imágenes no confiables. npm propone migración de Astro. |
| `vite@5.4.21` | Alta | Copias bajo Vitest/vite-node; avisos en servidor de desarrollo y editor. No se ha establecido exposición en el sitio estático. npm propone Vitest 5.0.5. |
| `zod@3.25.76` | Alta | Copia bajo Astro; agotamiento de memoria al validar colecciones sobredimensionadas. Se requiere establecer si alguna entrada no confiable llega a la validación durante build. npm propone Astro 7.4.4. |
| `zod-to-ts@1.2.0` | Alta | Aviso transitivo por zod en generación de tipos; exposición depende de entradas del build. npm propone Astro 7.4.4. |
| `@vitest/mocker@2.1.9` | Moderada | Solo pruebas; avisos de acceso a archivos y mocks bajo condiciones específicas. npm propone Vitest 5.0.5. |
| `esbuild@0.27.7 / 0.21.5` | Moderada | Avisos del servidor de desarrollo y Windows; no se identificó servidor esbuild en producción. Las copias pertenecen a Astro y Vitest; revisar ambas cadenas. |
| `vite-node@2.1.9` | Moderada | Aviso transitivo por Vite, en desarrollo/CI. npm propone Vitest 5.0.5. |

Las propuestas de npm son versiones sugeridas por el audit, no cambios probados ni prueba de que todas las rutas queden corregidas. Crear PR de actualización controlada, revisar requisitos de Node y ejecutar audit, unitarias, Playwright, SEO y build de nuevo. No usar `npm audit fix --force` indiscriminadamente.

## Blue Security Lab

El job instala binarios y verifica sus hashes, supera las pruebas del adaptador y devuelve el estado de revisión privada. El guard elimina sus informes temporales y no publica categorías ni detalles. Con los permisos y resultados públicos disponibles **no se puede atribuir la señal** a una dependencia, secreto o configuración, ni afirmar que sea inocua. Un mantenedor autorizado debe ejecutar el análisis en un entorno privado, inspeccionar y clasificar sus resultados, sin subir informes ni secretos a este repositorio público.

## Validación del candidato

En el commit `102b7ff`: pruebas unitarias, Astro check, build, SEO y Playwright completados correctamente; una prueba adicional visita `/compras/` y `/compras/modo-pasillo/` y ejecuta los cuatro formularios laborales. Blue Security Lab completó con señal privada. El job de auditoría npm falla deliberadamente mientras existan hallazgos, sin ocultarlos.

Persisten revisión manual en Android físico, lector de pantalla y teclado virtual; revisión del consentimiento y carga de AdSense para rutas de compras; verificación privada de Blue; clasificación y corrección de dependencias; y revisión de todas las diferencias antes de autorizar producción.
