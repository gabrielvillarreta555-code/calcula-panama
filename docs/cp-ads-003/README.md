# CP-ADS-003 — Aislamiento de Mi Quincena y preparación de la primera etapa

**Estado: código listo, nada publicado.**
- La publicidad sigue desactivada (`src/data/ad-policy.json` → `"active": false`).
- Mi Quincena sigue en el dominio principal (`src/data/isolation.json` → `"quincenaMoved": false`).
- No se ha tocado el DNS ni los datos de ningún usuario.

## 1. Pull requests

| PR | Contenido | Estado |
|---|---|---|
| #33 | Validación de importes laborales extremos | Pasado a **listo para revisión**. Probado sobre el `main` actual: vitest 192/192, `astro check` sin errores, `verify:seo` correcto y 12/12 e2e (validación numérica, laborales y rutas). Sin conflictos con `main` ni con #38. Se fusiona por separado. |
| #38 | CP-ADS-002: política por página, pausa global, mejoras editoriales y transparencia | Abierto contra `main` |
| Nuevo | CP-ADS-003 (esta rama, `ccr-a2726a9f-fea9hc-aislamiento`): aislamiento, migración, guardia y pruebas | Apilado sobre #38: fusionar #38 primero |

El PR #32 queda sustituido por #38 y esta rama. Se recomienda cerrarlo después de fusionarlas.

## 2. Qué se implementó

### Dos sitios desde el mismo código

- `npm run build` genera el sitio principal (`dist/`), sin cambios.
- `npm run build:app` (`SITE_TARGET=app`) genera **app.calculapanama.com** (`dist-app/`) a partir de `app/`. Contiene:
  - `/quincena/`: Mi Quincena, reutilizando el mismo componente y las mismas funciones;
  - `/importar/`: receptor del traslado;
  - `/`: portada mínima.
- Reglas de la app, que `npm run verify:app` comprueba en cada compilación:
  - CSP estricta y `noindex`;
  - ningún recurso de otro origen, ni publicidad ni analítica;
  - `robots.txt` sin bloqueos. La documentación de AdSense indica que puede no servir anuncios junto a contenido que no puede evaluar, como el bloqueado por `robots.txt`.
- `app/public/_headers` (Cloudflare Pages) añade `frame-ancestors`:
  - solo el dominio principal puede incrustar `/importar/`;
  - nadie puede incrustar `/quincena/`.

### Traslado de presupuestos

Código en `src/lib/finance/migration.ts` y `migration-bridge.ts`.

1. Con `quincenaMoved: true`, `/finanzas/mi-quincena/` (misma URL, sin anuncios, CSP estricta + `frame-src` solo para la app) pasa a ser la página de presentación. Si el navegador tiene `cp-mi-quincena-v1`, ofrece **Descargar una copia** (JSON generado en el navegador) y **Trasladar mi presupuesto**.
2. El texto guardado se envía por `postMessage` a un iframe de `app.calculapanama.com/importar/`, con su SHA-256. Ambos lados comprueban el origen exacto y la ventana de origen del mensaje.
3. El receptor valida la suma y el esquema (`isBudgetState`). **No sobrescribe** otro presupuesto sin confirmación, guarda el texto, lo relee y devuelve la suma de lo releído.
4. El dominio principal borra su copia **solo** si la suma coincide y el dato no cambió entretanto. Después comprueba que se borró y deja una marca sin datos (`cp-mi-quincena-migrated`).
5. Si algo falla (la app no responde, tiempo agotado, formato inválido o almacenamiento bloqueado), **los datos se quedan** donde estaban.
6. Nada pasa por un servidor ni por terceros.

### Guardia de publicidad (requisito «el dominio principal no conserva presupuestos accesibles»)

- Con la publicidad activa, AdSense **ya no se carga con una etiqueta estática**. Lo carga un script propio, y solo si `localStorage` es legible y **no** contiene `cp-mi-quincena-v1`.
- Si encuentra datos antiguos, esa visita no tiene anuncios y muestra un aviso con el enlace al traslado.
- Tras el cambio, el código del dominio principal nunca vuelve a escribir datos financieros.
- `adsAllowed()` exige `quincenaMoved: true`, y `verify:seo` falla si `ad-policy.json` activa la publicidad sin el traslado, o si alguna página carga AdSense sin la guardia.

## 3. Pruebas de aislamiento (reproducibles)

Se ejecutan con `npm run test:isolation`, también en CI. Usan tres orígenes reales en `*.localhost`: el sitio principal, la app y un sitio ajeno. Un **script espía** sustituye a `adsbygoogle.js` y lee `localStorage`, `sessionStorage`, cookies, IndexedDB, todos los campos y los iframes de la página.

| Prueba | Resultado |
|---|---|
| Con un presupuesto guardado en la app, el espía se carga en las **11 páginas de la primera etapa** y no encuentra ningún dato financiero | ✅ |
| Segunda etapa, Mi Quincena, páginas legales y 404 (estado 404): nunca cargan AdSense y tienen CSP estricta | ✅ |
| Con datos antiguos en el dominio principal, AdSense no se carga y aparece el aviso de traslado | ✅ |
| Traslado completo: llega idéntico (byte a byte) a la app, la interfaz lo muestra, se borra del dominio principal, no hay peticiones a terceros y después el espía no ve nada | ✅ |
| Si la app no responde, los datos se conservan y no se marca el traslado | ✅ |
| Si la app ya tiene otro presupuesto: Cancelar conserva ambos y Aceptar reemplaza y completa el traslado | ✅ |
| Un sitio ajeno no puede escribir en la app ni recibe respuestas del receptor | ✅ |
| La app no carga recursos de terceros, aplica la CSP estricta, es `noindex` y guarda en su propio origen | ✅ |

Además pasan:
- **vitest 210/210**: +10, con 7 del protocolo (suma, esquema, no sobrescritura, idempotencia y fallos de almacenamiento) y 3 de la regla de activación;
- `astro check` sin errores en el sitio principal y en la app;
- `verify:seo` y `verify:app`;
- **82/82** e2e existentes, sin cambios visibles mientras `quincenaMoved` sea `false`.

**Límites:**
- Solo se probó en Chromium. Firefox y Safari particionan el almacenamiento por sitio; `app.` y el dominio principal son el mismo sitio, así que el diseño debería funcionar, pero **hay que comprobarlo a mano** en Safari para iOS y en Firefox antes de activar el traslado.
- Los interruptores de prueba (`CP_TEST_*`) solo funcionan si ambos orígenes son `*.localhost`. Una prueba unitaria verifica que la compilación real no los acepta.

## 4. Requisitos de DNS y alojamiento (pendiente de autorización)

**Recomendado: Cloudflare Pages.** Es gratuito, permite cabeceras (`_headers`) y se despliega solo desde este repositorio, sin tokens en GitHub.

1. En Cloudflare, ve a Workers & Pages → Create → Pages → Connect to Git y elige este repositorio.
   - Rama de producción: `main`.
   - Comando de compilación: `npm ci && npm run build:app`.
   - Directorio de salida: `dist-app`.
   - Variable de entorno: `NODE_VERSION=22`.
2. En el proyecto, ve a Custom domains → `app.calculapanama.com`.
3. **Registro DNS** (en el proveedor que administra hoy `calculapanama.com`):

   | Tipo | Nombre | Valor | Proxy/TTL |
   |---|---|---|---|
   | CNAME | `app` | `<proyecto>.pages.dev` (el nombre que asigne Cloudflare) | Automático |

   No hay que tocar los registros actuales del dominio principal (GitHub Pages).
4. Comprobaciones después de la propagación:
   - `https://app.calculapanama.com/quincena/` carga con un certificado válido.
   - `curl -I https://app.calculapanama.com/importar/` devuelve `content-security-policy: frame-ancestors https://calculapanama.com`.
   - `curl -I https://app.calculapanama.com/quincena/` devuelve `frame-ancestors 'none'` y `x-robots-tag: noindex`.

**Alternativa:** GitHub Pages en un segundo repositorio. Es gratuita, pero no permite `frame-ancestors` y necesita otro flujo con un token para publicar.

**Dominio principal:** AdSense exige que, con HTTPS, **HTTP redirija a HTTPS**. Desde esta sesión no se pudo comprobar, porque el proxy solo permite HTTPS. Revisa en GitHub → Settings → Pages que **Enforce HTTPS** esté activado.

## 5. Instrucciones de publicación (cada paso, con autorización)

1. **Fusionar #33 y #38.** Se despliega el sitio principal con la publicidad pausada y CSP estricta en todo el sitio. Ajusta antes las fechas de Privacidad y Términos al día real.
2. **Fusionar el PR de CP-ADS-003.** Sin cambios visibles: `quincenaMoved` sigue en `false`. CI empieza a compilar y probar la app.
3. **[Autorización DNS] Configurar Cloudflare Pages y el CNAME** (§4). Comprobar la app en producción.
4. **[Autorización migración]** Ensayo en producción con un perfil de navegador de prueba y datos ficticios: guarda un presupuesto en la versión actual, publica el cambio y trasládalo.
   - Repetir en Safari para iOS y en Firefox.
   - Si todo es correcto, cambiar `isolation.json` → `"quincenaMoved": true` en un PR y publicarlo.
   - Desde ese momento, cada usuario traslada sus datos al abrir Mi Quincena.
5. **[Autorización publicidad]**
   - Comprobar en AdSense → Privacidad y mensajes que el mensaje de consentimiento certificado por Google (EEE, Reino Unido y Suiza) esté configurado.
   - Cambiar `ad-policy.json` → `"active": true` y actualizar la fecha de Privacidad.
   - Publicar y solicitar la revisión en AdSense → Sitios. Según Google, la revisión tarda días y a veces de 2 a 4 semanas.

**Vuelta atrás:**
- Desactivar la publicidad (`"active": false`) es seguro en cualquier momento.
- **No** se debe volver a `quincenaMoved: false` después de que haya usuarios trasladados: sus datos ya están en `app.` y la versión antigua los mostraría vacíos. La app debe seguir publicada. No existe traslado inverso.

## 6. Páginas monetizables: 21 frente a 22

- **Primera etapa: 11 páginas.** Disponible al completar los pasos 3 a 5.
- **Segunda etapa: +10.** Herramientas con datos personales mediante calculadora en iframe; no se implementó en esta fase. Suman **21**.
- **22** contaba además la página de presentación de `/finanzas/mi-quincena/`, que tras el traslado ya no guarda datos. Por prudencia **sigue en `never`**: es la página que ejecuta el traslado y lee los datos antiguos. Solo podría monetizarse cuando ya no queden usuarios por trasladar, y con su propia autorización.

**Cifra vigente: 11 páginas ahora y 21 de 26 como máximo planificado.**

## 7. Fuentes oficiales verificadas (26-11-2026)

| Fuente | Resultado |
|---|---|
| **Producción** | Responde 200 y sirve lo mismo que `main` (título anterior y AdSense estático). `ads.txt` correcto, 26 URL en el sitemap, `www` redirige a la raíz, la 404 devuelve 404 y las rutas sin barra final redirigen con la barra. HTTP→HTTPS no verificable desde aquí |
| AdSense, requisitos (answer/9724) | Contenido propio, original y de calidad; cumplir las políticas; ser mayor de 18 años; acceso al HTML del sitio. **No menciona un mínimo de páginas ni de palabras**, ni exige páginas de contacto o «sobre nosotros» |
| AdSense, sitio no preparado (12176698) y contenido y experiencia de usuario (10015918) | Código en el `<head>` o verificación por Search Console; rastreador no bloqueado; SSL válido y **redirección HTTP→HTTPS**; contenido único con buena navegación; evitar páginas similares o duplicadas y enlaces a páginas que no existen. La revisión tarda «unos días» y a veces de 2 a 4 semanas |
| Contenido obligatorio de privacidad (1348695) | Texto sobre proveedores externos y cookies, y exclusión mediante Configuración de anuncios o aboutads.info. **Se ajustó el texto de Privacidad** (versión con publicidad activa) a esa redacción |
| CMP (13554116) | Para servir anuncios en el EEE, el Reino Unido y Suiza es **obligatorio** usar una CMP certificada por Google e integrada con el IAB TCF |
| Pantallas sin contenido (publisherpolicies 11112688) | No se permiten anuncios en páginas de error, de agradecimiento o sin contenido. Coincide con `never` para la 404 y las páginas legales |
| Ubicación de anuncios (1346295) | Prohíbe incitar a clics accidentales junto a botones, navegación o menús. Puede no servir anuncios en contenido que no pueda evaluar (robots.txt o contraseña) |
| Search Central, metaetiqueta robots | `indexifembedded` existe y solo tiene efecto junto con `noindex`. Se usará en la segunda etapa |
| CSP para AdSense (answer/14112906) | La página no existe (404). No hay guía oficial localizada; se mantiene `ADS_CSP` mínima |
| DGI, Ley 8 de 2010 | **Verificado:** art. 76 (parágrafo 6 del art. 1057-V): «La tarifa de este impuesto será de siete por ciento (7%) a partir del 1 de julio de 2010». No menciona exenciones de alimentos: **se corrigió el texto** a «algunos productos tienen otra tarifa o están exentos» |
| MEDUCA (escala 1.0–5.0) | **No verificado.** La portada de meduca.gob.pa no contiene la escala. **Se reescribió el texto** en condicional («si tu centro califica de 1.0 a 5.0…») |
| Resto de fuentes enlazadas | CSS, Superintendencia de Bancos (2), Órgano Judicial, Justia (2), Sijusa, impuestospanama, NIST, CFPB, ENSA, ASEP y policies.google.com: **200**. Incidencias: mitradel.gob.pa devuelve 403 a clientes automáticos (enlace a la portada) y gacetaoficial.gob.pa sirve una protección anti-bots (Incapsula) en lugar del PDF, así que no se pudo comprobar su contenido |

Las herramientas de precio por unidad y descuentos muestran ahora «Fuentes consultadas el 26 de noviembre de 2026», porque su fuente (DGI) se verificó.
