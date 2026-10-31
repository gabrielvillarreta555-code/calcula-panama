# Misión 2 — estabilización y seguridad

## Prioridades

1. Diferenciar hallazgos de seguridad de errores operativos en Blue Security Lab.
2. Congelar las fórmulas existentes mediante casos límite adicionales.
3. Introducir fronteras modulares sin migrar todavía navegación ni páginas.
4. Mantener Blue experimental separado de cálculos oficiales.
5. Conservar pruebas de móvil y documentar la validación física pendiente.

## Blue Security Lab

El run inicial instaló herramientas, validó hashes y versiones, y pasó las tres pruebas del adaptador. El guard devolvió `1`, que significa revisión privada, pero el workflow trataba cualquier código distinto de cero como error. El workflow ahora clasifica:

- `0`: análisis completo sin señales.
- `1`: análisis completo con advertencia genérica; no revela detalles ni rompe el job.
- `2` u otro: error operativo; el job falla.

Esta clasificación no elimina ni resuelve el hallazgo privado. Un mantenedor autorizado debe revisarlo fuera del log público.

## Verificación

La suite previa reporta 71 pruebas unitarias, 11 pruebas Playwright, Astro check, build y SEO. Esta misión añade pruebas de límites legales y del catálogo modular. La validación remota del PR debe confirmar todos los comandos antes de considerarlo listo.

## Riesgos restantes

- Falta inspección privada del hallazgo de Blue Security Lab.
- Varias normas históricas tienen enlaces a copias secundarias.
- La prueba móvil automatizada no sustituye Android físico ni teclado virtual real.
- AdSense está activo globalmente; Modo Pasillo deberá evitar anuncios entre lista, presupuesto y total.
- La mascota usa imágenes planas y animación DOM; medir consumo en un Android de gama media antes de ampliar interacciones.
- Los datos siguen locales, pero una futura persistencia debe ser opt-in, limitada y borrable.

## Puerta para misión 3

Puede comenzar solo si CI, Astro check, build, SEO y auditoría terminan; el resultado privado de seguridad debe quedar triado y ningún cambio debe alterar las salidas conocidas de las cuatro calculadoras.
