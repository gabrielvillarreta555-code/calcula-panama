# CP-SEO-001: informe de la entrega 2

**Fecha:** 27 de noviembre de 2026.

## 1. Publicado: ITBMS y Dividir la cuenta (PR #46)

- **CI del PR:** los cinco jobs en verde (pruebas, interfaz móvil, Firefox y Safari, auditoría de dependencias y blue-guard).
  - La primera ejecución falló porque la prueba de aislamiento esperaba 11 páginas de primera etapa y ahora son 13. Se corrigió la prueba.
- **Fusión:** squash `3b38e2d` en `main`. El despliegue en GitHub Pages respondió 200 en menos de un minuto.

**Verificación directa en producción** (`https://calculapanama.com`): **29/29 correctas**, en Chromium de escritorio y en iPhone 13 emulado.

- **Cada página:**
  - responde 200;
  - figura en el sitemap;
  - tiene la URL canónica correcta;
  - aplica la CSP estricta (`connect-src 'none'`);
  - no carga AdSense ni analítica;
  - usa Midnight Functional.
- **Navegación y búsqueda:**
  - el directorio tiene la sección «Impuestos» y el enlace a Dividir la cuenta;
  - el buscador encuentra «itbms».
- **Cálculos en el navegador:**

  | Herramienta | Datos | Resultado esperado y obtenido |
  |---|---|---|
  | ITBMS | B/.53.50 con el 7 % incluido | Base B/.50.00 e ITBMS B/.3.50 |
  | ITBMS | B/.120 + 10 % | B/.132.00 |
  | Dividir la cuenta | B/.85.60 con B/.5.60 de ITBMS, 4 personas | B/.23.40 por persona |
  | Dividir la cuenta | Lo mismo, con redondeo a 0.25 | B/.23.50 por persona y sobran B/.0.40 |

- **Comportamiento:** sin desbordamiento horizontal, sin peticiones a terceros y sin errores de JavaScript.

**Además:** el flujo «Validación de producción» (`produccion.yml`) se lanzó sobre `main` en Chromium, Firefox, WebKit y iPhone. Ver su resultado en Actions.

## 2. Preparado sin publicar

| Rama | Contenido | Pruebas locales |
|---|---|---|
| `feat/cp-seo-001-analitica` | Cloudflare Web Analytics **inactiva** (token vacío) y política de privacidad actualizada | vitest, `verify:seo` en los dos modos y compilación de prueba con un token ficticio |
| `feat/cp-seo-001-articulos` | Guías de **horas extras** e **ITBMS** | vitest, e2e en Chromium y aislamiento |
| `feat/cp-seo-001-feriados` | **Días hábiles y feriados** (contiene las guías) | 288 pruebas unitarias, 109 e2e y 9 de aislamiento |
| `feat/cp-seo-001-tarjeta` | **Tarjeta de crédito** (contiene feriados y guías) | 294 pruebas unitarias, 111 e2e y 9 de aislamiento; `astro check` y `verify:seo` (33 URLs) correctos |

### Cloudflare Web Analytics

- `src/data/analytics.ts` concentra la configuración. Con `CF_ANALYTICS_TOKEN = ''` no se carga nada: compilación comprobada, sin `cloudflareinsights` en ninguna página.
- **Con token:**
  - la baliza se carga solo en las páginas de primera etapa indexables: portada, guías, directorios y herramientas sin datos personales;
  - la CSP se abre solo a `https://static.cloudflareinsights.com` (script) y `https://cloudflareinsights.com` (envío);
  - se mantienen todas las demás protecciones.
- **Exclusiones comprobadas** con un token ficticio:
  - Mi Quincena;
  - la app aislada, que usa su propio `AppLayout` sin la baliza;
  - todas las calculadoras de segunda etapa (salario, horas extras, préstamos, ahorro, tarjeta, notas, autos financiados, Modo Pasillo);
  - páginas legales, 404 y la página de ensayo.
- **Verificación automática:** `verify:seo` falla si la baliza aparece en una página excluida, si falta en una permitida o si la CSP no es la esperada.
- **Política de privacidad:**
  - tiene una nueva sección «Estadísticas de visitas»;
  - con la analítica inactiva dice que no hay analítica; con el token, describe Cloudflare, los datos que recibe y las páginas excluidas;
  - se retiró una frase obsoleta sobre el selector de tema y Blue, que ya no existen;
  - fecha actualizada al 27 de noviembre de 2026.

### Guías (plantilla editorial aprobada)

- **`/guias/horas-extras-en-panama/`:**
  - jornadas, límites, recargos del 25 %, 50 % y 75 %, el 75 % adicional por exceso, domingos (+50 %) y feriados (+150 %, con el ejemplo de MITRADEL);
  - tabla de ejemplo calculada con el mismo motor de la calculadora;
  - parámetros de `overtime-rules.ts`, verificados en CP-TOOL-008.
- **`/guias/itbms-en-panama/`:**
  - tarifas, cómo agregar y cómo quitar el impuesto;
  - el error común de restar el 7 %;
  - redondeo y una tabla de ejemplos calculada con el motor de la herramienta.
- **Índice de guías:** ahora cubre «trabajo e impuestos»; se actualizaron el título y la descripción de `/guias/`.

### Días hábiles y feriados (`/vida-cotidiana/dias-habiles-y-feriados/`)

- **Reglas:** reutiliza las de feriados ya verificadas:
  - Código de Trabajo, art. 46;
  - el lunes de descanso del art. 47 cuando la fiesta cae en domingo;
  - el 20 de diciembre (Ley 291 de 2022);
  - carnaval y Viernes Santo calculados desde la Pascua.
- **Calendario de 2027:** 13 fiestas y duelos nacionales; Pascua el 28 de marzo, Viernes Santo el 26 de marzo y martes de carnaval el 9 de febrero. **252 días hábiles** de lunes a viernes.
- **Excluido y advertido:** días libres que decrete el Órgano Ejecutivo, feriados locales y plazos judiciales.

### Tarjeta de crédito (`/finanzas/tarjeta-de-credito/`)

- **Qué calcula:**
  - meses e intereses con un pago fijo o pagando solo el mínimo (porcentaje y monto mínimo);
  - el pago fijo necesario para saldar la deuda en 12, 24 o 36 meses;
  - el calendario de pagos.
- **Avisos:** si el pago no cubre los intereses del mes.
- **Ejemplo:** B/.2,000 al 36 % con B/.100 al mes se saldan en 31 meses (B/.1,099.92 de intereses). Con el mínimo del 5 % (al menos B/.25), son 95 meses (B/.2,366.65). Coincide con la fórmula cerrada.
- **Fuentes:** es una fórmula matemática, sin norma, y se indica así. Las condiciones reales (método de interés diario, cargos y mínimo) dependen del contrato y se advierten.
- **Política:** `stage2`, por ser deuda personal: sin publicidad ni analítica.

## 3. Combustible

**Ya cumple la instrucción sin desarrollo nuevo.** `/vehiculos/combustible-por-viaje/` funciona solo con el precio que escribe el usuario, por litro o por galón. No depende de actualizaciones periódicas ni consulta datos externos. No se modificó.

## 4. Courier: detenido por falta de una fuente oficial verificable

- El umbral de **B/.100** de valor CIF exento y la base del ITBMS (CIF + arancel) aparecen solo en couriers y en la prensa, no en una fuente oficial:
  - [Panamá América](https://www.panamaamerica.com.pa/economia/compras-por-internet-cumplir-las-normas-antes-de-crear-nuevos-impuestos-1199785);
  - [La Prensa](https://www.prensa.com/economia/que-esta-pasando-con-shein-temu-o-aliexpress-y-como-afecta-a-panama/);
  - [Stackry](https://www.stackry.com/duties-and-taxes/panama).
- Las fuentes **discrepan** sobre si el envío forma parte de la base.
- El arancel depende de la partida de cada producto (0 % a 15 % según las fuentes no oficiales).
- **Bloqueo técnico:** el proxy de este entorno rechaza la conexión a `ana.gob.pa`, `www.ana.gob.pa` y `www.aduanas.gob.pa` (403 del proxy). No se intentó ningún método alternativo.
- **Qué hace falta para seguir:**
  - el texto oficial (resolución o decreto de la ANA sobre envíos de courier), o
  - autorizar el acceso de red a `www.ana.gob.pa` para consultarlo.

  Sin eso no se publicará.

## 5. Decisiones pendientes del CEO

1. **Publicar** la siguiente tanda en un único PR: guías de horas extras e ITBMS, días hábiles y feriados, y tarjeta de crédito. La rama `feat/cp-seo-001-tarjeta` las contiene todas.
2. **Cloudflare Web Analytics:** facilitar el **token** del sitio, creado en el panel de Cloudflare con «Add a site» → `calculapanama.com` → fragmento JS. Con el token y la autorización se publica la rama de analítica.
3. **Courier:** aportar la fuente oficial o autorizar el acceso de red a la ANA.
