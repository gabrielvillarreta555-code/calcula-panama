# CP-SEO-003, entrega 2: expansión editorial de diciembre

- **Fecha:** 27 de noviembre de 2026.
- **Rama:** `feat/cp-seo-003-entrega-2` (un commit sobre `main` @ `83d879d`).
- **Estado:** **sin publicar**; pendiente de aprobación.

---

## A. Publicación de la entrega 1 (PR #48)

**CI del PR, en verde:**
- pruebas unitarias;
- interfaz móvil;
- Firefox y Safari (WebKit escritorio y la configuración de iPhone);
- auditoría de dependencias;
- blue-guard.

**Publicación:** fusión `83d879d`; despliegue en GitHub Pages correcto.

**Verificación en producción** (la producción comparada con un build local del mismo commit):

| Comprobación | Resultado |
|---|---|
| Sitemap: `sitemap.xml` y `sitemap-0.xml` | 33 URLs, idénticas al build |
| Cada URL: 200, título, descripción, canónica propia, sin `noindex`, CSP estricta, un único H1, sin publicidad ni analítica, sin scripts externos, mismos enlaces internos que el build | **33/33 correctas** |
| Enlaces internos distintos de todo el sitio | 36 comprobados, **0 rotos** |
| La portada enlaza las cinco herramientas nuevas; la Revista muestra «Guía · Impuestos» | Correcto |
| `robots.txt` y `ads.txt` | 200, contenido correcto |
| iPhone 13 (emulado) en 9 páginas clave, incluido el clic portada → ITBMS | Sin desbordamiento, sin terceros y sin errores de JavaScript |
| Workflow «Validación de producción» (ejecución `46048600370`, `check_app: 0`) | Correcto |

### Enlaces para pedir un nuevo rastreo en Search Console (por prioridad)

```
https://calculapanama.com/
https://calculapanama.com/herramientas/
https://calculapanama.com/finanzas/tarjeta-de-credito/
https://calculapanama.com/impuestos/itbms/
https://calculapanama.com/vida-cotidiana/dias-habiles-y-feriados/
https://calculapanama.com/calculadoras/horas-extras/
https://calculapanama.com/finanzas/calculadora-prestamos/
https://calculapanama.com/vehiculos/financiamiento-de-auto/
```

**Por qué en este orden:**
1. La portada y el directorio enlazan ahora todas las herramientas nuevas.
2. Las tres siguientes son las páginas que tenían menos enlaces internos y cambiaron de título.
3. Horas extras cambió su descripción.
4. Préstamos y financiamiento son los títulos que más cambiaron.

El resto de los títulos cambiados se recogerán en el rastreo normal.

---

## B. Entrega 2: análisis previo de canibalización

| Tema | Páginas existentes revisadas | Decisión |
|---|---|---|
| **Décimo de diciembre de 2026** | Calculadora del décimo (título con «2026»); guía de fechas (orientada a 2027) | **Ampliar** la calculadora existente con una sección «Tercera partida de 2026». Una página nueva competiría con las dos |
| **Feriados y días libres 2027** | Días hábiles y feriados (ya lista 2027) | **Ampliar** la página existente con los feriados restantes de 2026 y los días puente. No se crea una guía aparte |
| **Calendario de quincenas 2027** | Mi Quincena (presupuesto) y metas de ahorro (aportes el 15 y fin de mes) | **Página nueva** (guía): ninguna página atiende la intención «fechas de pago». Enlaza Mi Quincena en lugar de duplicarla |
| **Salario mínimo vigente** | Ninguna página lo trata. Horas extras solo cita el decreto | **Herramienta nueva**, con la tabla completa del decreto en la misma página. Una guía aparte competiría con ella |
| **Cómo administrar el décimo** | — | **No incluido** en esta entrega: el CEO priorizó los cuatro temas anteriores. Propuesto para la siguiente |

---

## C. Contenido de la entrega 2

### C.1 Salario mínimo (`/calculadoras/salario-minimo/`, nueva)

**Fuente:** Decreto Ejecutivo 13 de 31 de diciembre de 2025, Gaceta Oficial 30438 de 6 de enero de 2026 (copia de LEGISPAN, la misma URL que ya cita el sitio). Vigente desde el 16 de enero de 2026 (art. 5).

**Verificación:**
- La Gaceta es un PDF escaneado. Las **99 tasas** se transcribieron del texto extraído y se **comprobaron fila por fila contra las imágenes de las páginas** (págs. 3–6), porque la extracción mezclaba algunas filas:
  - servicios de oficina 2,98 / 2,98;
  - seguridad 3,04 / 3,04;
  - reparación de enseres: pequeña empresa 2,32 / 1,94 y gran empresa 2,98 / 2,52.
- La Zona Libre de Colón no tiene tasa en la Región 2 (el decreto pone «-»).
- El trabajo doméstico es un monto mensual: B/.350 / B/.320.
- Los 40 distritos de la Región 1 (art. 3) se listan en la página.

**Qué hace la herramienta:**
- Elige actividad (incluido el tamaño de empresa) y región.
- Muestra la tasa por hora y su equivalente semanal, quincenal y mensual.
- La conversión a mes (× 48 h × 52 ÷ 12) se presenta como **estimación**: el decreto solo fija tasas por hora (la misma advertencia que en horas extras).
- Incluye la tabla completa.
- Hereda la plantilla `ToolLayout`, ampliada con un campo opcional `tables` que usa el estilo `.table-wrap` existente (sin estilos nuevos).

**Integración en el sitio:**
- Portada (3.6), colofón, directorio (Trabajo), buscador y sitemap.
- Enlaces desde salario neto y horas extras.
- Política `stage1` (actividad, región y horas: no son datos personales).

### C.2 Calendario de quincenas 2027 (`/guias/calendario-de-quincenas-2027/`, nueva)

**Base legal verificada en el Código de Trabajo** (copia del Órgano Judicial):
- **art. 148:** el salario no puede pagarse en plazos mayores de una quincena;
- **art. 153:** se paga en el lugar y en las horas de trabajo;
- **art. 37:** el pago incluye las horas extras hasta cinco días laborables antes del día de pago.

**El Código no fija días de pago.** La guía lo dice expresamente: el 15 y el fin de mes son práctica habitual, no obligación.

**Contenido:**
- Tabla de las **24 fechas** de 2027, calculada con las reglas de feriados ya verificadas.
- Marca las que caen en fin de semana o feriado (**6 en 2027**: 31 de enero, 28 de febrero, 15 de mayo, 31 de julio, 15 de agosto y 31 de octubre) y muestra el «día hábil anterior» solo como referencia, porque el Código no regula ese caso.
- Las fechas del décimo de 2027: el 15 de agosto cae en domingo. Enlaza a la guía de fechas del décimo en lugar de repetirla.
- Fuente nueva en `legal.ts`: `laborCodePay` (arts. 37, 148 y 153).

### C.3 Tercera partida del décimo de 2026 (ampliación de `/calculadoras/decimo-tercer-mes/`)

- **Nueva sección** «Tercera partida de 2026: pago el 15 de diciembre»:
  - pago el **martes 15 de diciembre de 2026**;
  - período del 16 de agosto al 15 de diciembre de 2026;
  - descuentos (CSS 7,25 %, ISR proporcional, sin Seguro Educativo).
- **Tabla de ejemplos** para B/.650, 1.000, 1.500 y 2.000, calculada con el **mismo motor** de la calculadora.
- **Pregunta frecuente nueva** sobre la fecha de 2026.
- Enlaces a tarjeta de crédito y metas de ahorro.
- **Sin cambios** de título ni de URL. «2026» se mantiene hasta el pago.

### C.4 Feriados y días libres (ampliación de `/vida-cotidiana/dias-habiles-y-feriados/`)

- **Feriados que quedan en 2026:**
  - martes 8 de diciembre;
  - domingo 20 de diciembre, duelo nacional;
  - lunes 21 de diciembre, descanso por caer en domingo (art. 47);
  - viernes 25 de diciembre.
- **Días puente:** regla del art. 46, párrafos añadidos por la Ley 65 de 2001, verificada en el Código. Martes o miércoles → lunes anterior; jueves o viernes → lunes siguiente. **Solo con decreto del Ejecutivo**; la calculadora no lo supone.
- **Dos preguntas frecuentes nuevas:** feriados de diciembre de 2026 y qué es un día puente.

---

## D. Pruebas

| Prueba | Resultado |
|---|---|
| vitest | **320/320**: 26 nuevas de salario mínimo, con 19 tasas contrastadas con el decreto, los 40 distritos, la Zona Libre en la Región 2, el trabajo doméstico y los límites |
| e2e en Chromium | **114/114**: salario mínimo, quincenas (24 filas), feriados de 2026 y la sección del décimo, más la navegación completa con las 35 rutas |
| Aislamiento | 9/9 (la primera etapa pasa a 18 páginas) |
| `astro check` | 0 errores y 0 avisos |
| `verify:seo` | **35 URLs** |
| `verify:app` | Correcto |
| Móvil, 390 px | Sin desbordamiento en las tres páginas. Capturas en `capturas/e2-*.png` |
| Firefox, WebKit y iPhone | En la CI del PR, cuando se autorice |

## E. Pendiente de aprobación

1. Abrir el PR de la entrega 2, pasar la CI en los tres motores, fusionar y publicar.
2. Guía «Cómo administrar el décimo»: ¿se incluye en una tanda siguiente, antes del 10 de diciembre?
3. La entrega 3 (Vivienda: investigación, sin publicar una categoría vacía) empieza tras esta aprobación.
