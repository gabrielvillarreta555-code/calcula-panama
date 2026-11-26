# CP-ADS-002 — Correcciones para monetización (informe de implementación)

Rama: `ccr-a2726a9f-fea9hc`, basada en `main` (`50f2fae`). **No publicado.** Producción no cambia hasta que se fusione con `main` con autorización.

## Resumen

| Fase | Estado |
|---|---|
| A. Publicidad y seguridad | Hecho. Política por página en `src/data/ad-policy.json`. **Publicidad pausada en todo el sitio** y CSP estricta en las 27 páginas (antes: 16). Arquitectura de aislamiento propuesta, sin ejecutar ([arquitectura-aislamiento.md](arquitectura-aislamiento.md)) |
| B. Calidad editorial | Hecho. 5 herramientas con contexto panameño, ejemplos prácticos verificados por pruebas y FAQ. Fuentes incorrectas corregidas. `/compras/` enriquecida |
| C. Identidad y transparencia | Hecho. Portada, descripción, navegación, Sobre nosotros, Contacto, Privacidad y Términos. Sin URL nuevas ni eliminadas |
| D. Validación | Pruebas en verde. PR #32 y #33 revisados. **Bloqueado:** documentación oficial de Google y producción, sin acceso de red desde esta sesión |

## Fase A — Publicidad y seguridad

- **`src/data/ad-policy.json`** clasifica las 26 URL y la 404:
  - `stage1` (11): guías, directorios y herramientas sin datos personales;
  - `stage2` (10): requieren calculadora aislada;
  - `never` (6): Mi Quincena, páginas legales e institucionales y la 404.
- Interruptor global `"active": false`. Una ruta sin entrada se trata como `never`.
- **`src/data/ad-policy.ts`** es la única fuente de verdad. `Layout.astro` y `AdSlot.astro` consultan `adsAllowed(ruta)`. Se retiró el atributo `disableAds` de las páginas; el *prop* se mantiene solo para forzar la exclusión.
- **CSP:**
  - Toda página sin publicidad aplica `STRICT_CSP`, sin cambios en su contenido. Ahora la aplican también la portada, las guías, las páginas legales y la 404, que antes no tenían ninguna.
  - Las páginas `stage1`, cuando se active la publicidad, usarán `ADS_CSP` (`object-src 'none'; base-uri 'self'; form-action 'none'`), porque AdSense necesita dominios de Google que cambian. Esas páginas no tienen campos personales.
  - Ninguna página pierde protecciones respecto a `main`, y ninguna herramienta con datos personales puede cargar anuncios desde este código.
- **`scripts/verify-seo.mjs`** recorre todos los HTML compilados, incluida la 404, y falla si:
  - una página sin publicidad no tiene la CSP estricta exacta;
  - una página sin publicidad contiene código publicitario o scripts externos;
  - una página `stage1` activa no tiene el script una sola vez;
  - `ads.txt` no coincide.
- **Simulación de activación** (revertida): con `"active": true`, exactamente 11 páginas cargan AdSense con `ADS_CSP`, y salario neto, Mi Quincena, la 404 y Privacidad mantienen la CSP estricta sin anuncios.
- `ads.txt` y el ID de editor se conservan.

## Fase B — Calidad editorial

| Herramienta | Cambios | Fuentes |
|---|---|---|
| Precio por unidad | Contexto: libra frente a kilo (B/.1.99/lb = B/.4.39/kg), paquetes múltiples, ITBMS. 3 FAQ | NIST (definición de la libra) y **DGI, Ley 8 de 2010 (ITBMS 7%)** |
| Descuentos | 2x1 impar (33.33%), descuentos sucesivos (30% + 20% = 44%), ITBMS. 3 FAQ, incluida la queja ante la ACODECO | ~~SEP de México~~ → **DGI, Ley 8 de 2010** |
| Meta de ahorro | Quincena 15/30, partidas del décimo (15 abr/ago/dic), ejemplo de 12 × B/.100. 3 FAQ. Enlace a la calculadora del décimo | CFPB (guía en español), sin cambios |
| Promedio de notas | Escalas 1.0–5.0 (aprobación 3.0) y 0–100. Ejemplo: necesitas 1.88 en el 40% restante. 3 FAQ | ~~LibreTexts «Densidad, masa y centro de masa»~~ → nota metodológica (media ponderada) sin enlace |
| Consumo eléctrico | ENSA/Naturgy y ASEP, BTU/h frente a vatios, ejemplo de aire acondicionado de 1,100 W = 158.4 kWh. 3 FAQ | ENSA y ASEP, sin cambios |

- `ToolLayout.astro` añade la sección «En la práctica, en Panamá» y la nota metodológica. Si una herramienta no tiene fuentes externas, no muestra la fecha de consulta.
- **Todas las cifras nuevas tienen pruebas** en `tests/expansion-tools.test.ts`, calculadas con las funciones reales.
- **`/compras/`**: de 128 a unas 430 palabras. Incluye las 3 herramientas de compras y una guía de uso con su alcance (ITBMS 7%, ACODECO).
- **No se modificó ninguna fórmula.**

**A verificar:**
- El enlace de la DGI ya lo usaba `legal.ts` y se revisó el 24-10-2026, pero la página muestra «consultadas el 16-11-2026»: hay que volver a comprobarlo cuando haya red.
- La escala 1.0–5.0 de MEDUCA figura con la advertencia «en muchos centros… confirma el reglamento».

## Fase C — Identidad y transparencia

- **Portada:** nuevo título y descripción, sección «Más herramientas» con las 6 herramientas de finanzas, vehículos, educación y hogar, y `ItemList` con las 17 herramientas.
- **`SITE.description`**, el pie de página y la barra móvil (Inicio, Salario, Décimo, Herramientas, Guías). `<link rel=sitemap>` ahora apunta a `sitemap.xml`.
- **Sobre nosotros:**
  - alcance actual, responsable (Gabriel Villarreta, Blue Lab Studios) y proceso de verificación con fecha (`legal.ts`);
  - declaración explícita de que **no hay revisión de un abogado ni de un contador externos**;
  - cómo se financia el sitio y política de correcciones.
- **Contacto:** se mantiene GitHub y se dice claramente que **no hay correo público**. Añade el enlace a la web del responsable y las instituciones a las que acudir (MITRADEL, CSS, DGI, Superintendencia de Bancos, ACODECO).
- **Privacidad (26-11-2026):**
  - responsable, qué guarda cada herramienta, preferencias (tema y Blue) y protecciones CSP;
  - publicidad con dos textos: pausada (actual) o activa, con cookies de Google y sus socios, exclusión y consentimiento para el EEE, el Reino Unido y Suiza.
- **Términos (26-11-2026):** cubren todas las categorías, los datos que introduces, la publicidad y los enlaces.
- Las fechas «26 de noviembre de 2026» deben ajustarse al día de publicación.

## Fase D — Validación

| Comprobación | Resultado |
|---|---|
| `vitest` | **200/200** (antes 188: +7 de política y +5 de ejemplos) |
| `astro check` | 0 errores |
| `astro build` | 27 páginas |
| `verify:seo` | Correcto: «publicidad pausada en todo el sitio, CSP estricta en las demás y ads.txt correcto» |
| Playwright e2e (82 pruebas existentes) | **82/82** |
| 320 px | Sin desbordamiento en 8 páginas modificadas; barra móvil sin recortes; 0 errores de consola |
| Enlaces internos | Sin enlaces rotos (`herramientas/#trabajo` y demás anclas existen) |

### PR #32 — «pausar publicidad en el origen de Mi Quincena»

El diagnóstico es correcto y es la base de esta rama. Su solución quedaría **sustituida** por la política por página: la pausa global, la CSP estricta en todo el sitio y la verificación de todos los HTML ya están aquí, y además permite reactivar la publicidad por etapas.

- Choca con esta rama.
- Elimina `AdSlot` y fuerza `isAdsenseEnabled() = false`, lo que impediría la primera etapa.

**Recomendación:** cerrarlo al fusionar esta rama, conservando su documento como antecedente.

### PR #33 — «rechazar importes laborales no finitos o extremos»

Revisado: es correcto.

- `readNumber` ahora lanza un error, pero todos sus llamadores están dentro de `run()`, y `bindCalculator` lo captura y lo muestra.
- No cambia fórmulas, tasas ni redondeos.
- Fusiona sin conflictos con `main`.

**Recomendación:** fusionarlo por separado (está en borrador), antes o después de esta rama.

### No verificado (sin acceso de red)

- **Documentación vigente de Google AdSense**: el proxy de la sesión rechaza `support.google.com` y `developers.google.com`. Los requisitos citados vienen de CP-ADS-001 y deben contrastarse.
- **Producción:** `calculapanama.com` está bloqueado (estado HTTP, redirecciones, `ads.txt` servido). También los enlaces externos.
- **Panel de AdSense:** configuración de la CMP y motivo del rechazo anterior.

## Páginas monetizables

| Momento | Páginas con anuncios |
|---|---|
| Hoy (pausa) | 0 de 26 |
| Primera etapa, tras aislar Mi Quincena | 11 de 26 |
| Segunda etapa (calculadoras en iframe) | 22 de 26 |

Detalle, costos (B/.0 de alojamiento; 37–55 h en total) y pruebas en [arquitectura-aislamiento.md](arquitectura-aislamiento.md).

## Para volver a solicitar AdSense

AdSense necesita el código en el sitio para revisarlo, y ahora mismo está pausado. Orden propuesto:

1. Autorizar y ejecutar el aislamiento de Mi Quincena (§3 de la arquitectura), con la guardia de publicidad.
2. Verificar producción y la documentación de Google con acceso de red.
3. Cambiar `"active": true`, actualizar la fecha de Privacidad y comprobar la CMP en el panel.
4. Presentar la solicitud.

No se garantiza la aprobación.
