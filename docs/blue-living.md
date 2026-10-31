# Blue Living: fundamentos y movimiento

Este documento describe exclusivamente las fases 1 y 2. El componente `BlueHelp` sigue instalado en las cuatro calculadoras y mantiene los textos de ayuda de `BLUE_GUIDES`. Las fórmulas y `bindCalculator` no se modifican. La ayuda se puede abrir sin JavaScript; con JavaScript se mejora la ubicación de la mascota.

## Recursos y limitaciones

- `public/blue-referencia.jpg` es la lámina de referencia; `blue-flotante.webp` es la ilustración transparente que usa la ayuda; `blue-orienta.webp` se usa en la portada. Son imágenes planas, sin extremidades ni ojos separados.
- El movimiento se aplica a la imagen completa mediante traslación, inclinación y deformación leve. No hay articulación, mirada independiente, parpadeo ni gestos reales. Integrar esas capacidades requiere recibir las capas originales oficiales y adaptarlas sin cambiar la identidad de Blue.
- No se añaden librerías de animación ni servicios externos. Playwright es una dependencia exclusiva de desarrollo para ejecutar las pruebas de navegador; no forma parte del código enviado al visitante.

## Arquitectura e integración

`BlueHelp.astro` conserva la guía como HTML nativo. El controlador `src/lib/blue/living.ts` mejora progresivamente su posición y conecta módulos pequeños: `geometry.ts` calcula candidatos y trayectorias seguras, `environment.ts` mide el viewport y las zonas ocupadas, `state.ts` limita las transiciones y `motion.ts` controla y cancela el único ciclo de vuelo.

Para usarlo en otra calculadora Astro, importar `BlueHelp` y pasarle una guía del mismo tipo que las existentes; colocar el componente fuera del formulario. Conservar la clase `.calculator-shell` alrededor de formulario y resultados. El registro de zonas protegidas está en `environment.ts`: ampliarlo si se agregan controles, ventanas, barras fijas o regiones que deban evitarse.

En el vuelo se usa una caja barrida conservadora y márgenes de seguridad; los cambios de layout cancelan el movimiento antes de volver a medir. Si no hay espacio, la guía permanece en el flujo de la página. Mientras el formulario tiene foco, Blue no vuela. La guía abierta vuelve al flujo si el usuario desplaza la página o cambia el tamaño. La preferencia `cp-blue-visible` oculta la imagen, no la guía; si el almacenamiento falla solo se conserva durante la visita. Si falla la imagen, se conserva la guía textual. Con movimiento reducido Blue no vuela ni ejecuta la flotación repetitiva.

El componente cancela temporizadores, fotogramas, observadores y listeners al salir; restaura el controlador si la página regresa desde la caché de navegación. No lee valores de entrada ni genera mensajes o eventos de cálculo.

## Pruebas y rendimiento

```sh
npm ci
npm test
npm run check
npm run build
npm run verify:seo
npx playwright install chromium
npm run test:e2e
```

En un entorno con Chromium del sistema se puede usar `CHROMIUM_PATH=/ruta/a/chromium npm run test:e2e`. La compilación debe ejecutarse antes de las pruebas de navegador, que utilizan `astro preview`. Estas pruebas verifican varias anchuras, la guía, colisiones con formulario y resultados, preferencias, movimiento reducido, fallo de imagen, funcionamiento sin JavaScript, vuelo y cambios de tamaño.

La compilación revisada produjo un módulo de la guía de aproximadamente 7.7 kB (3.1 kB comprimidos con gzip), sin incluir el WebP existente de aproximadamente 46 kB. Solo se ejecuta un `requestAnimationFrame` durante un vuelo; las mediciones DOM se hacen tras eventos de layout, no en cada fotograma. Una muestra de dos segundos en Chromium sin interfaz, con viewport de 1920 × 1100 durante el vuelo, registró 113 fotogramas en 2008 ms (aproximadamente 56 FPS y un intervalo máximo de 83 ms). Es una medición de este entorno de escritorio, no una prueba representativa ni una garantía. No se ha medido FPS en un teléfono Android real: queda pendiente validar rendimiento, teclado virtual y experiencia táctil en dispositivos físicos.
