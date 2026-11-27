# CP-SEO-001: informe de la entrega 3

**Fecha:** 27 de noviembre de 2026.

## 1. Publicado: segunda entrega (PR #47 → `a4f92c6`)

**Contenido publicado:**
- `/guias/horas-extras-en-panama/`
- `/guias/itbms-en-panama/`
- `/vida-cotidiana/dias-habiles-y-feriados/`
- `/finanzas/tarjeta-de-credito/`
- El índice de guías actualizado.

**Validación previa de las fuentes:**

| Fuente | Resultado |
|---|---|
| Código de Trabajo (PDF del Órgano Judicial) | 200. Texto releído: art. 46 (fiestas y duelos, días puente que decreta el Ejecutivo) y art. 47 (lunes de descanso y compensación si la fiesta coincide con otro día de descanso semanal) |
| Ley 291 de 2022 (Gaceta Oficial 29507-B) | 200. Art. 7 releído: el 20 de diciembre es duelo nacional |
| Ley 8 de 2010 (DGI) | 200 |
| Páginas de MITRADEL | Responden 302 por su protección contra bots. No se evadió. Son las mismas fuentes verificadas en CP-TOOL-008 y ya publicadas |

**Corrección por la relectura:** la pregunta frecuente de días hábiles decía que un feriado en sábado «no traslada el descanso». Se corrigió: el art. 47 da derecho a otro día libre si la fiesta coincide con el día de descanso semanal de la persona. También se precisaron los límites de la herramienta: no incluye los días puente del Ejecutivo ni los días compensatorios individuales.

**Pruebas:**

| Prueba | Resultado |
|---|---|
| vitest | 294/294 |
| e2e en Chromium | 111/111 |
| Aislamiento | 9/9 |
| `astro check` | 0 errores |
| `verify:seo` | 33 URLs |
| CI del PR | 5/5 en verde: pruebas, interfaz móvil, Firefox y Safari, auditoría de dependencias y blue-guard |

**Verificación directa en producción: 32/32 correctas**, en Chromium de escritorio y en iPhone 13 emulado.
- Las cuatro páginas responden 200, figuran en el sitemap, tienen canónica, CSP estricta y la identidad Midnight correcta, y no cargan AdSense ni analítica.
- El índice de guías y el directorio enlazan las páginas nuevas.
- **Cálculos en el navegador:**

  | Herramienta | Resultado |
  |---|---|
  | Días hábiles de 2027 | 252 |
  | Tarjeta con pago fijo | 31 meses y B/.1,099.92 de intereses |
  | Tarjeta con pago mínimo | 95 meses |
  | Guía del ITBMS | El ejemplo de B/.107.00 se muestra y el enlace a la calculadora funciona |

- Sin desbordamiento horizontal, sin peticiones a terceros y sin errores de JavaScript.

**Workflow «Validación de producción»:** ejecución `46039623801` sobre `a4f92c6`, con `check_app: 0`. Correcto.

## 2. Courier: investigación oficial en la ANA, aún sin regla verificable

- **Acceso:** se añadió `www.ana.gob.pa` a la red del entorno, autorizado por el CEO. El sitio responde 200. Solo se usaron sus páginas públicas y su buscador público (API de WordPress); no se eludió ninguna protección.
- **Hallazgos:**
  - El sitio publica noticias sobre courier: la lista de [empresas autorizadas](https://www.ana.gob.pa/index.php/2026/11/09/actualizacion-de-empresas-courier-autorizadas/) y la nota [Empresas de Entrega Rápida o Courier](https://www.ana.gob.pa/index.php/2026/06/17/empresas-de-entrega-rapida-o-courier/), que no tiene texto.
  - **No** publica en forma consultable la norma que fija el umbral exento ni la base imponible (CIF, arancel e ITBMS). Las páginas de Decretos y Resoluciones cargan sus listas de forma dinámica. Su archivo de PDFs públicos solo devolvió una resolución (920-0) y un decreto sobre el arroz, ninguno sobre courier.
  - **Hallazgo relevante:** en una [entrevista publicada por la ANA el 20 de mayo de 2026](https://www.ana.gob.pa/index.php/2026/05/20/sub-director-logistico-aborda-avances-aduaneros-en-entrevista-radial/), el subdirector logístico anunció que se modificaría la **reglamentación de los envíos de correo rápido**, prevista para julio. No se encontró en el sitio que ya se haya aprobado. La regla puede estar cambiando.
- **Conclusión:** Courier **no se desarrolla todavía**.
  - El umbral de B/.100 y la base del impuesto siguen sin una fuente oficial verificable.
  - La propia ANA anunció un cambio de reglamento.
- **Para continuar hace falta una de estas tres cosas:**
  1. El número del decreto o la resolución vigente sobre envíos de courier o de entrega rápida, para leerlo en la Gaceta Oficial o en la ANA.
  2. La confirmación escrita de la ANA. Su central telefónica es el 506-6400 y su correo de procesos, grupo_procesos@ana.gob.pa, ambos publicados en su sitio.
  3. La publicación del nuevo reglamento anunciado.

## 3. Cloudflare Web Analytics

**Sigue desactivado.**
- La rama `feat/cp-seo-001-analitica` está lista, con el token vacío. No se ha publicado.
- Al recibir el token, se integrará con `main` (que ya contiene las páginas nuevas). Se comprobará que la tarjeta de crédito (`stage2`) queda excluida y que las guías y días hábiles (`stage1`) quedan incluidas.

## 4. Configuración de app.calculapanama.com (solo documentada)

Ver `docs/cp-seo-001/APP-SUBDOMINIO.md`. **No se modificó el DNS.**

**Estado comprobado hoy:**
- La zona está en Cloudflare.
- `app.calculapanama.com` no existe (NXDOMAIN).
- `npm run build:app` y `verify:app` son correctos.

**La guía describe:**
- la creación del proyecto en Cloudflare Pages (`npm run build:app` → `dist-app`);
- el dominio propio con **un único CNAME nuevo**, sin tocar los registros existentes, incluidos los TXT de Google;
- la verificación posterior: cabeceras, workflow con `check_app: 1` y prueba en un iPhone real;
- la reversión;
- lo que no se activará sin una autorización específica: la migración real y la publicidad.

## 5. Estado general

| Elemento | Estado |
|---|---|
| Publicidad | Desactivada (`active: false`) |
| Analítica | Desactivada |
| CSP estricta y cálculos locales | Sin cambios |
| Flujos de seguridad (`blue-security.yml`, `blue-private-tests.yml`) | Intactos |
| Diseño y herramientas existentes | Sin cambios |
| URLs en el sitemap | 33 |

## 6. Decisiones pendientes del CEO

1. **Courier:** aportar el número de la norma vigente o la confirmación de la ANA, o esperar al nuevo reglamento.
2. **Analítica:** facilitar el token de Cloudflare Web Analytics cuando se quiera activar.
3. **App:** hacer los pasos de `APP-SUBDOMINIO.md` en Cloudflare y avisarme para verificar.
