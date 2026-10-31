# Misión 2 — estabilización y seguridad

## Prioridades

1. Diferenciar hallazgos de seguridad de errores operativos en Blue Security Lab.
2. Congelar las fórmulas existentes mediante casos límite adicionales.
3. Introducir fronteras modulares sin migrar todavía navegación ni páginas.
4. Mantener Blue experimental separado de cálculos oficiales.
5. Convertir las pruebas móviles existentes en un job obligatorio del PR.

## Blue Security Lab

El run inicial instaló herramientas, validó hashes y versiones, y pasó las tres pruebas del adaptador. El guard devolvió `1`, que significa revisión privada, pero el workflow trataba cualquier código distinto de cero como error. El workflow ahora clasifica:

- `0`: análisis completo sin señales.
- `1`: análisis completo con advertencia genérica; no revela detalles ni rompe el job.
- `2` u otro: error operativo; el job falla.

Esta clasificación no elimina ni resuelve el hallazgo privado. Un mantenedor autorizado debe revisarlo fuera del log público.

## Resultados verificados en GitHub Actions

Commit `06c35ad`, 31 de octubre de 2026:

- Blue Security Lab: éxito operativo.
- `npm ci`: correcto.
- Vitest: 6 archivos, **81 pruebas aprobadas**.
- Astro check: **0 errores y 0 advertencias**.
- Build: **14 páginas**, 1.13 s en el job principal y 1.54 s en el job móvil.
- Verificación SEO: correcta.
- Playwright/Chromium: **11 pruebas aprobadas en 27.1 s**, cubriendo las cuatro calculadoras, 320/375/768/1280 px, ausencia de desbordamiento, resultados, Blue, movimiento reducido, imagen rota y funcionamiento sin JavaScript.

Las advertencias observadas proceden de dependencias/Actions: deprecación de `punycode`, `url.parse()` y acciones basadas en Node 20 forzadas a Node 24. No causaron fallos, pero deben vigilarse al actualizar Astro y las acciones.

## Riesgos restantes

- Falta inspección privada de la señal de Blue Security Lab.
- Varias normas históricas tienen enlaces a copias secundarias.
- La prueba móvil automatizada no sustituye Android físico ni teclado virtual real.
- AdSense está activo globalmente; Modo Pasillo deberá evitar anuncios entre lista, presupuesto y total.
- La mascota usa imágenes planas y animación DOM; medir consumo en un Android de gama media antes de ampliar interacciones.
- Los datos siguen locales, pero una futura persistencia debe ser opt-in, limitada y borrable.
- Actualizar acciones/dependencias para retirar advertencias de APIs y runtimes deprecados sin hacerlo dentro de este PR de estabilización.

## Puerta para misión 3

La base técnica y automatizada está preparada para comenzar Modo Pasillo. Antes de fusionar este PR o publicar cambios, un mantenedor debe revisar la señal privada de seguridad y aprobar el alcance. La validación en Android físico puede realizarse en paralelo al prototipo, pero es obligatoria antes de producción.
