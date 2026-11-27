# CP-SEO-003: corrección de la entrega 3 (Vivienda)

- **Fecha:** 27 de noviembre de 2026.
- **Rama:** `fix/cp-seo-003-correccion-vivienda`, desde `main` @ `845dbc2`.
- **Estado:** **preparada, sin PR, sin fusionar ni publicar.** Pendiente de aprobación final.
- **Producción mientras tanto:** sigue mostrando el modo preferencial publicado en la entrega 3 hasta que se autorice esta corrección.

## 1. Sección Vivienda

- **Nueva página `/vivienda/`**, con las mismas piezas editoriales que `/compras/`:
  - `EditorialPage` con la imagen ya aprobada «Apartamento moderno»;
  - lista `toollist` con las tres calculadoras;
  - pasos `ed-steps`;
  - enlace a la guía de gastos.

  Sin diseño nuevo.
- **Migas de pan:** las tres calculadoras enlazan a `/vivienda/` en lugar de `/herramientas/#vivienda`, tanto en la miga visible como en el `BreadcrumbList` de los datos estructurados.
- **Enlaces:**
  - el directorio `/herramientas/` añade «Sección Vivienda →», como en Compras;
  - la calculadora de hipoteca y la guía de gastos enlazan a la sección.
- **Política de publicidad:** `stage1` (sin campos de usuario). La publicidad sigue desactivada.
- **Sitemap:** **41 URLs**.

## 2. Interés preferencial retirado del contenido público

**Calculadora de hipoteca:**
- Sin la opción «Interés preferencial».
- Fórmula, límites, contexto y preguntas frecuentes reescritos sin tasas, tramos ni plazos.
- Un aviso indica que no calcula el régimen y remite al banco.
- La hipoteca convencional sigue operativa: B/.150.000, abono de B/.15.000, 6,5 %, 30 años → letra de B/.853,29.

**Guía de gastos:**
- Sin la tabla del tramo 3 ni sus tasas.
- Título y descripción sin «interés preferencial».
- El apartado del régimen solo dice que existe (Ley 468 modificada por la Ley 481 y su reglamento) y que las tasas se consultan con el banco.
- Pregunta frecuente sustituida, sin cifras.
- Se mantienen el ITBI de la Ley 546 y el dato de que lo paga el vendedor.

**Datos estructurados y fuentes:**
- La pregunta frecuente con tasas desapareció del `FAQPage`.
- La ficha de la fuente `law481` ya no menciona tramos ni tasas.
- La portada describe la hipoteca como «Letra, abono, seguros y gastos iniciales».

**Motor conservado y desactivado:**
- Movido a `src/lib/tools/housing-preferential.ts`, con el interruptor `PREFERENTIAL_MODE_PUBLIC = false` y sus pruebas intactas.
- **Ninguna página lo importa:** hay una prueba que lo comprueba. Por eso sus textos tampoco aparecen en el JavaScript publicado.
- La hipoteca convencional usa un amortizador común (`amortize`) que conserva los mismos resultados.

**Comprobación en la compilación:** búsqueda de «tramo 3», «85%», «84 meses», «tasa subsidiada», «2.5%» y «Letra los primeros» en todo el HTML, JS, JSON y XML de `dist`: **0 coincidencias**.

## 3. Validación

| Prueba | Resultado |
|---|---|
| vitest | **344/344**: motor preferencial (desactivado), interruptor en `false`, sin campo en la calculadora, ficha sin tasas, ningún importador del módulo |
| e2e en Chromium | **121/121**: navegación completa por las 41 rutas en móvil (390 px) y escritorio (1440 px); hipoteca convencional sin el campo preferencial y con la miga hacia `/vivienda/`; `/vivienda/` en ambos tamaños con clic a la hipoteca |
| Aislamiento | 9/9 (la primera etapa pasa a 21 páginas) |
| `astro check` | 0 errores y 0 avisos |
| `verify:seo` y `verify:app` | Correctos: 41 URLs |
| 41 URLs en la compilación | Canónica propia, un único H1, CSP estricta, sin `noindex`, sin publicidad ni analítica: **41/41** |

**Capturas:** `capturas/corr-*.png` (sección Vivienda en móvil y escritorio, e hipoteca convencional).

## 4. Investigación pendiente

Tramos 1 y 2 de la Ley 468 de 2025: sin nuevas fuentes oficiales accesibles desde este entorno. Sigue haciendo falta el PDF de la Gaceta Oficial 30264-A.

## 5. Para la aprobación final

1. Abrir el PR, pasar la CI en los tres motores, fusionar y publicar.
2. Tras publicar, verificar las 41 URLs en producción y pedir un nuevo rastreo de:
   - `https://calculapanama.com/vivienda/calculadora-de-hipoteca/`
   - `https://calculapanama.com/guias/gastos-de-comprar-vivienda/`
3. Solicitar la indexación de `https://calculapanama.com/vivienda/`.
