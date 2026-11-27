# CP-SEO-003, entrega 3: Vivienda (investigación)

- **Fecha:** 27 de noviembre de 2026.
- **Estado:** solo investigación y propuesta. **No se ha implementado ni publicado nada.** No se publicará una categoría vacía.

## 1. Qué cubre ya el sitio, para no duplicarlo

| Página | Qué hace | Consecuencia |
|---|---|---|
| `/finanzas/calculadora-prestamos/` | Cuota con sistema francés, tasa nominal o efectiva, plazo de hasta 600 meses, seguros, cargos, comisión y comparación de dos ofertas | **Ya calcula la cuota de una hipoteca.** Una «calculadora de hipoteca» que solo pida monto, tasa y plazo sería un duplicado |
| `/vehiculos/financiamiento-de-auto/` | Precedente: especializa el mismo motor (precio, abono, seguros, tasa efectiva) | Patrón válido: una herramienta de vivienda debe aportar lo que la de préstamos no hace |

**Lo que hoy no existe en el sitio:**
- partir del **precio de la vivienda y el abono**;
- calcular la **capacidad de compra según el ingreso**;
- el **interés preferencial en dos fases** (tasa subsidiada durante 7 u 8 años y luego la del banco);
- los **gastos de la compra**;
- la comparación entre **alquilar y comprar**.

## 2. Fuentes oficiales verificadas

| Tema | Comprobado | Fuente |
|---|---|---|
| **Interés preferencial: subsidio** | El Estado subsidia **el menor** entre la tasa del tramo y la que resulta de aplicar **hasta el 85 %** de la tasa ofrecida por el banco (art. 6 de la Ley 468, en la redacción de la Ley 481) | Ley 481 de 9-9-2025, Gaceta Oficial 30361-C ([LEGISPAN](https://s3-legispan.asamblea.gob.pa/legispan/NORMAS/2020/2025/LEY/JOSEPH%20VALENCIA_30361-C_2025_9_9_ASAMBLEA%20NACIONAL_481.pdf)) |
| **Regiones** | Región 1: provincias de Panamá y Panamá Oeste. Región 2: Colón y el resto del país. **Son distintas de las regiones del salario mínimo** | Ley 481, art. 4 |
| **Tramo 3** | Vivienda nueva de **B/.80.000,01 a B/.120.000**: tasa subsidiada máxima del **4 %** durante **7 años (84 meses)**, no renovable, en **las dos regiones** | Ley 481, art. 4 |
| **Vigencia** | Desde el 1 de enero de 2026 (Ley 481, art. 7). La Ley 472 de 2025 había suspendido la Ley 468 hasta el 31-12-2025 | Ley 481; Ley 472 ([LEGISPAN](https://s3-legispan.asamblea.gob.pa/legispan/NORMAS/2020/2025/LEY/Eloy%20Vivar_30302-A_2025_6_17_ASAMBLEA%20NACIONAL_472.pdf)) |
| **Reglamento** | El Decreto Ejecutivo 23 de 2026 reglamenta la Ley 468 modificada: **vivienda nueva** (que se comercializa por primera vez), **residencia principal** y precio que **no puede exceder B/.120.000** | Gaceta Oficial 30545 de 12-6-2026 ([LEGISPAN](https://s3-legispan.asamblea.gob.pa/legispan/GACETAS/2020/2026/30545_2026.pdf)) |
| **ITBI en la primera venta de vivienda nueva** | **Exentos los primeros B/.120.000** de la base, si la venta se formaliza dentro de los **2 años** siguientes al permiso de ocupación. Entre B/.120.000 y B/.200.000, el impuesto recae solo sobre el excedente, con una escala de **0,50 %, 1,00 %, 1,40 %, 1,60 % y 1,80 %**. Por encima de B/.200.000, el excedente paga el régimen general. **Es nula** cualquier cláusula que traslade el impuesto al comprador | Ley 546 de 31-8-2026, Gaceta Oficial 30601-B ([LEGISPAN](https://s3-legispan.asamblea.gob.pa/legispan/GACETAS/2020/2026/30601-B_2026.pdf)) |
| **Régimen transitorio del ITBI** | Ventas formalizadas desde la vigencia de la ley, aunque el permiso sea anterior: plazo de **30 meses** desde el permiso de ocupación | Ley 546, art. 2 |
| **ITBI general** | 2 % sobre el mayor entre el valor de la escritura y el valor catastral; lo paga quien transmite (el vendedor) | Ley 106 de 1974 ([copia de Justia](https://docs.panama.justia.com/federales/leyes/106-de-1974-feb-3-1975.pdf)). **Pendiente** de contrastar con el texto vigente de la DGI |

## 3. Pendiente de verificar (bloquea parte de la propuesta)

1. **Tramos 1 y 2 del interés preferencial** (viviendas de hasta B/.80.000).
   - Están en el art. 7 de la **Ley 468 de 2025** (Gaceta Oficial 30264-A), que la Ley 481 no modificó.
   - El PDF oficial de la Gaceta **no es accesible desde este entorno**: el sitio devuelve una página en lugar del PDF, y no se ha intentado eludirlo. No se encontró copia en LEGISPAN.
   - Las fuentes no oficiales ([TVN](https://www.tvn-2.com/nacionales/mulino-sanciona-nueva-ley-intereses_1_2186808.html), [KPMG](https://kpmg.com/pa/es/home/insights/2025/10/ci-actualizacion-regimen-intereses-hipotecarios.html), portales inmobiliarios) **no coinciden entre sí**.
   - **Necesito el texto oficial de la Ley 468** (PDF de la Gaceta 30264-A) para publicar esos tramos.
2. **Decreto Ejecutivo 36 de 2026** (gestión y pago del subsidio), citado por la prensa. No se ha leído; no afecta al cálculo del comprador.
3. **Tarifas de notaría y del Registro Público.** No se encontró un arancel oficial consultable. Se tratarán como importes que escribe el usuario, sin cifras propias.
4. **Abono mínimo y relación cuota/ingreso.** No se encontró ninguna norma de la SBP que los fije.
   - El indicador de endeudamiento de los hogares (en torno al 40 %, según la SBP) es una estadística, no un tope.
   - Las herramientas los tratarán como **parámetros editables**, sin presentarlos como regla.

## 4. Propuesta de contenido (para aprobación)

**Sección `/vivienda/`:** se publica solo cuando tenga al menos dos herramientas y una guía.

| # | Pieza | Qué aporta frente a lo existente | Fuentes | Estado |
|---|---|---|---|---|
| 1 | **Calculadora de compra de vivienda e hipoteca**: precio, abono (% o B/.), plazo de hasta 30 años, seguros mensuales; muestra la cuota, el monto financiado y el total. Modo opcional **«con interés preferencial»**: el usuario escribe la tasa del banco y el sistema calcula la tasa subsidiada (el menor entre el tramo y el 85 % de la del banco), la cuota de la fase subsidiada y la posterior | Precio + abono e interés preferencial en dos fases, que Préstamos no hace. Reutiliza `finance/loans` | Ley 481 y DE 23 de 2026. **Tramos 1 y 2 pendientes** | El modo preferencial solo con el tramo 3 hasta verificar la Ley 468, o se publica completo cuando se tenga |
| 2 | **Capacidad de compra según ingresos**: ingreso neto, otras deudas, % máximo de cuota (editable), tasa y plazo. Devuelve la cuota máxima, el préstamo máximo y el precio máximo con el abono disponible | Nueva intención («cuánto puedo pagar») | Fórmula financiera; enlaza a Salario neto para el ingreso neto | Lista para implementar |
| 3 | **Guía: gastos de comprar vivienda en Panamá** | ITBI (exención de la Ley 546, quién paga, escala); avalúo, notaría, registro y seguros como conceptos, sin cifras no verificadas; abono | Ley 546, Ley 106 y DE 23 de 2026 | Lista para redactar |
| 4 | **Alquilar o comprar**: comparador con el alquiler, la cuota, los gastos, el mantenimiento y el costo de oportunidad del abono (tasa que escribe el usuario), año por año | Nueva intención | Fórmula; sin datos de mercado propios | Lista para implementar |
| 5 | **Guía: interés preferencial 2026** | Cómo funciona el subsidio, el tramo 3 y ejemplos | Ley 481, DE 23 de 2026 y Ley 468 (pendiente) | **Tras verificar la Ley 468** |

**Orden propuesto:**
1. Piezas 1 (sin el modo preferencial o solo con el tramo 3), 2 y 3. Así la sección se publica con contenido.
2. Después, la pieza 4.
3. Las piezas 5 y el modo preferencial completo, cuando la Ley 468 esté verificada.

**Mismas garantías que el resto del sitio:**
- Midnight Functional y Editorial;
- cálculo local;
- CSP estricta;
- política `stage2` para las calculadoras con ingresos o deudas (sin publicidad ni analítica);
- `stage1` para las guías.

## 5. Decisiones que necesito

1. **¿Apruebas la propuesta** (piezas 1 a 4) y el orden de publicación?
2. **Texto oficial de la Ley 468 de 2025** (Gaceta Oficial 30264-A): ¿puedes facilitar el PDF, o autorizas publicar el modo preferencial solo con el tramo 3, que está verificado, hasta tenerlo?
3. **La ruta `/vivienda/`:** ¿confirmas esta ruta para la nueva sección?
