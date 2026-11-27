# CP-SEO-003, entrega 3: Vivienda

- **Fecha:** 27 de noviembre de 2026.
- **Rama:** `feat/cp-seo-003-vivienda`, un commit sobre `main` @ `16635f7`.
- **Estado:** **sin publicar**; pendiente de aprobación.

---

## A. Publicación de la guía del décimo (PR #50)

- **CI:** 5/5 en verde (pruebas, interfaz móvil, Firefox y Safari/iPhone, auditoría de dependencias y blue-guard).
- **Fusión:** `16635f7`; despliegue correcto.

**Verificación en producción:**

| Comprobación | Resultado |
|---|---|
| Sitemap | 36 URLs, idénticas al build de `16635f7` |
| Cada URL comparada con el build: título, descripción, canónica, robots, CSP, H1, sin publicidad ni scripts externos, enlaces internos | **36/36 correctas**; 39 enlaces internos distintos, 0 rotos |
| Guía en iPhone 13, desde el enlace de la calculadora del décimo | Cifras correctas (B/.301.47 neto; B/.366.56 menos de intereses), sin desbordamiento, 0 terceros, 0 errores de JavaScript; enlazada desde `/guias/` |
| Workflow «Validación de producción» (ejecución `46053531932`) | Correcto |

**Search Console:**

| Acción | URL | Motivo |
|---|---|---|
| Solicitar la indexación | `https://calculapanama.com/guias/como-administrar-el-decimo/` | Página nueva |
| Pedir un nuevo rastreo (opcional) | `https://calculapanama.com/guias/` | Cambiaron su título y su descripción |

---

## B. Entrega 3: Vivienda

### B.1 Análisis previo: sin duplicar la calculadora de préstamos

La calculadora de préstamos ya calcula la cuota de cualquier préstamo (hasta 600 meses). Las piezas nuevas solo hacen lo que ella no hace:
- partir del **precio y el abono**;
- sumar los **gastos iniciales** y el dinero necesario al inicio;
- el **interés preferencial en dos fases**;
- la **capacidad de compra según el ingreso**;
- la comparación entre **alquilar y comprar**.

Préstamos enlaza ahora a la hipoteca, y la hipoteca enlaza a Préstamos para comparar dos ofertas.

### B.2 Contenido

| Ruta | Tipo | Qué hace | Política |
|---|---|---|---|
| `/vivienda/calculadora-de-hipoteca/` | Calculadora | Precio, abono, tasa, plazo (1–40 años), seguros y gastos iniciales que escribe el usuario. Devuelve la letra, el monto financiado, los intereses, el dinero necesario al inicio y el costo total. **Modo preferencial solo para el tramo 3** (vivienda nueva de B/.80.000,01 a B/.120.000): 84 meses a la tasa del banco menos el menor entre 4 puntos y el 85 % de esa tasa; después, el saldo se recalcula a la tasa del banco (esto último se presenta como **suposición**). Rechaza precios fuera del tramo | `stage2` |
| `/vivienda/capacidad-de-compra/` | Calculadora | Ingreso neto, otras deudas, **porcentaje máximo que escribe el usuario** (sin valor por defecto: no hay norma general de la SBP), tasa, plazo, abono y seguros. Devuelve la letra, el préstamo y el precio máximos | `stage2` |
| `/vivienda/alquilar-o-comprar/` | Calculadora | Patrimonio de quien compra (valor menos saldo) frente a quien alquila e invierte el abono, los gastos y la diferencia mensual. **Todos los supuestos los escribe el usuario.** Tabla año por año y año en que comprar empieza a convenir | `stage2` |
| `/guias/gastos-de-comprar-vivienda/` | Guía | Abono, gastos de cierre y seguros como conceptos (sin cifras no verificadas). ITBI de la vivienda nueva con la tabla de la Ley 546 calculada por el motor; **el ITBI lo paga el vendedor**. Ejemplo del tramo 3 frente a la misma hipoteca sin subsidio | `stage1` |

**Integración en el sitio:**
- Portada: columna «Hogar», 4.3 a 4.5, renumerando Compras de 4.6 a 4.10, sin cambios de diseño.
- Colofón, directorio (nueva sección «Vivienda»), buscador, sitemap e índice de guías.
- No se crea una página `/vivienda/` vacía: la miga de pan lleva a `/herramientas/#vivienda`.

**Fuentes nuevas en `legal.ts`:**
- `law546`: Gaceta Oficial 30601-B;
- `law481`: Gaceta Oficial 30361-C;
- `decree23of2026`: Gaceta Oficial 30545;
- `dgiForm106`: instructivo del Formulario 106 de la DGI, actualizado a 2026, que confirma la tarifa general del 2 %.

### B.3 Ejemplos verificados con fórmula independiente

| Caso | Resultado |
|---|---|
| Hipoteca: B/.150.000, abono B/.15.000, 6,5 %, 30 años | Letra de B/.853,29 |
| Tramo 3: B/.110.000, abono del 10 %, banco al 6,5 % | 2,5 % durante 84 meses (letra B/.391,17); después, B/.573,54 al 6,5 % |
| Capacidad: ingreso B/.1.500, deudas B/.150, 30 %, 6,5 %, 30 años, abono B/.10.000 | Letra B/.300; préstamo ≈ B/.47.463; precio ≈ B/.57.463 |
| ITBI de vivienda nueva (Ley 546) | 125.000 → B/.25; 140.000 → B/.200; 160.000 → B/.560; 180.000 → B/.960; 200.000 → B/.1.440 |

### B.4 Tramos 1 y 2 del interés preferencial: siguen sin publicarse

- **Dónde están:** en el art. 7 de la Ley 468 de 2025 (Gaceta Oficial 30264-A).
- **Por qué no se publican:**
  - El PDF oficial de la Gaceta sigue sin ser accesible desde este entorno: el sitio devuelve una página en lugar del documento, y no se ha intentado eludirlo. No hay copia en LEGISPAN.
  - Una nota informativa de la Asamblea Nacional y varias fuentes secundarias dan cifras para esos tramos que **no coinciden entre sí**, sobre todo en la Región 2.
- **Cómo se trata en el sitio:** la calculadora rechaza los precios fuera del tramo 3 con un mensaje que remite al banco, y la guía explica por qué no se publican.
- **Qué hace falta:** el PDF oficial de la Ley 468 para completar el modo preferencial.

### B.5 Pruebas

| Prueba | Resultado |
|---|---|
| vitest | **341/341**, con 21 nuevas de Vivienda: fórmula francesa, cuadre del costo total, subsidio (4 puntos o el 85 %), dos fases, límites del tramo 3, capacidad (cuota ↔ préstamo), alquilar o comprar y la escala completa del ITBI |
| e2e en Chromium | **120/120**: hipoteca (con y sin tramo 3 y error fuera de tramo), capacidad, alquilar o comprar (tabla de 10 años), guía, y navegación completa con las 40 rutas |
| Aislamiento | 9/9 (la primera etapa pasa a 20 páginas) |
| `astro check` | 0 errores y 0 avisos |
| `verify:seo` | **40 URLs** |
| `verify:app` | Correcto |
| Móvil, 390 px | Sin desbordamiento |

**Corrección durante las pruebas:** la tabla de fases de la hipoteca desbordaba en móvil. Ahora usa el contenedor con desplazamiento interno que ya usan las otras tablas anchas.

**Capturas:** `capturas/e3-*.png`.

## C. Pendiente de aprobación

1. Abrir el PR de la entrega 3, pasar la CI en los tres motores, fusionar y publicar.
2. Facilitar el PDF oficial de la Ley 468 de 2025 para completar los tramos 1 y 2.
