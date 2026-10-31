# Arquitectura modular de Calcula Panamá 2.0

## Principio de estabilización

Las cuatro calculadoras laborales actuales permanecen en `src/lib/calculations.ts`, con parámetros en `src/data/legal.ts`. Esta misión no cambia sus fórmulas ni sus páginas. El catálogo `src/modules/catalog.ts` añade una frontera de producto sin reemplazar todavía `src/data/site.ts`: la migración de navegación será posterior y deberá conservar URLs y SEO.

## Módulos

- **Trabajo e ingresos:** cálculos sujetos a reglas legales versionadas, pruebas de regresión y fuentes.
- **Compras y gastos:** aritmética cotidiana local. No reutiliza parámetros laborales.
- **Finanzas personales:** futura planificación, con supuestos explícitos y sin prometer asesoría.
- **Blue:** orientación experimental. Puede explicar la interfaz y reaccionar a estados genéricos; no puede alterar, aprobar ni recalcular resultados oficiales.

Cada herramienta declara estado, nivel de confianza y si trabaja localmente. Ninguna herramienta planificada aparece en navegación hasta tener página, accesibilidad, pruebas y revisión de privacidad.

## Blue reutilizable

Se conservan `BlueHelp.astro`, `BlueCharacter.astro`, `src/lib/blue/*` y `src/data/blue-help.ts`. Son reutilizables para ayuda contextual y movimiento progresivo. La integración de Modo Pasillo deberá usar una guía nueva y eventos genéricos; no entregará a Blue nombres, precios, cantidades, presupuesto ni totales.

Blue Security Lab es infraestructura CI y no comparte datos ni código de ejecución con la mascota Blue.

## Especificación de Modo Pasillo

Primera entrega propuesta:

- Página móvil en `/compras/modo-pasillo/`.
- Presupuesto opcional en balboas; lista editable de artículos con nombre opcional, precio unitario y cantidad decimal positiva.
- Total por línea, total acumulado, saldo o exceso y porcentaje usado.
- Operaciones: añadir, editar, eliminar y vaciar con confirmación.
- Cálculo decimal en unidades enteras de centavos cuando precio y cantidad lo permitan; política de redondeo explícita a dos decimales por línea.
- Estado únicamente en memoria en la primera versión. Persistencia local será una decisión separada y opt-in.
- Sin escáner de códigos, cuentas, nube, anuncios entre controles ni IA.
- Botones y campos táctiles de al menos 44 px; funcionamiento a 320, 375, 768 y 1280 px; teclado numérico móvil.
- Blue limitado a instrucciones preparadas, sin leer la lista.

Criterios de aceptación: cálculo determinista, validación de NaN/infinito/negativos/cantidad cero, actualización instantánea, navegación por teclado, lector de pantalla con anuncios no intrusivos, sin desbordamiento horizontal, pruebas unitarias y Playwright.
