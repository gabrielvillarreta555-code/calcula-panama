# CP-ADS-004 — Publicación y validación final

Fecha: 26-11-2026. **Publicidad desactivada y migración real desactivada** (`ad-policy.json` → `"active": false`; `isolation.json` → `"quincenaMoved": false`).

## Fase A — Integración ✅

| Paso | Resultado |
|---|---|
| Verificaciones de #33, #38 y #39 | Todas en verde (`test`, `Interfaz móvil`, `dependency-audit`, `blue-guard`). #33 tenía verificaciones antiguas, de su base del 1-11, y se probó además sobre el `main` actual |
| Fechas de Privacidad y Términos | Ya indicaban 26-11-2026, que es la fecha de publicación. Sin cambios |
| Fusión de #33 | `68622ba` |
| Fusión de #38 | Tras integrar #33 en su rama y repetir las pruebas (vitest 204, `astro check` y `verify:seo`) y la CI → `96cab8c` |
| Fusión de #39 | Base cambiada a `main`, integración repetida (vitest 214, e2e 87/87, aislamiento 8/8, `verify:seo` y `verify:app`) y CI en verde → `93f3a76` |
| PR #32 | Cerrado: lo sustituyen #38 (pausa global y CSP) y #39 (aislamiento) |
| Publicación | GitHub Pages publica `main`. Producción ya sirve el nuevo título, la CSP estricta y ningún script de AdSense |
| PR #40 (herramientas de validación) | Ver Fase C |

## Fase B — Infraestructura (requiere tu intervención en Cloudflare)

**Lo que comprobé:**
- El DNS de `calculapanama.com` **ya está en Cloudflare** (`corey.ns.cloudflare.com` y `walk.ns.cloudflare.com`). Los registros A apuntan a GitHub Pages y `www` es un CNAME a `gabrielvillarreta555-code.github.io`.
- `app.calculapanama.com` no existe todavía.
- No tengo acceso a tu cuenta de Cloudflare, y conectar el repositorio exige autorizar la aplicación de GitHub desde el panel. Los pasos son manuales; tardan unos 10 minutos.

### Instrucciones precisas

1. Entra en **dash.cloudflare.com**, en la cuenta que contiene la zona `calculapanama.com`.
2. Ve a **Workers & Pages → Create application → Pages → Import an existing Git repository**. Si es la primera vez, también verás **Connect GitHub**.
   - En GitHub, autoriza «Cloudflare Workers & Pages» con **Only select repositories → `gabrielvillarreta555-code/calcula-panama`**.
3. Configura el proyecto:
   - **Project name:** `calcula-panama-app`. La URL técnica será `calcula-panama-app.pages.dev`.
   - **Production branch:** `main`.
   - **Framework preset:** `None`.
   - **Build command:** `npm run build:app`
   - **Build output directory:** `dist-app`
   - **Root directory:** vacío.
   - **Environment variables:** ninguna. La imagen v3 instala las dependencias y usa Node.js 22.
4. Pulsa **Save and Deploy** y espera a que la compilación termine en «Success».
5. En el proyecto, ve a **Custom domains → Set up a custom domain** y escribe `app.calculapanama.com`.
   - Como la zona está en la misma cuenta, Cloudflare **crea él mismo** un registro nuevo `CNAME app → calcula-panama-app.pages.dev`. Confirma.
   - **No hay que modificar ningún registro existente** (A, `www`, MX, TXT).
6. Recomendado: en **Settings → Builds → Branch control**, elige **Preview branch: None**. Así solo se compila `main` y no se consumen compilaciones con cada rama.
7. Avísame cuando el dominio aparezca como **Active**. Yo lanzaré la validación (Fase C).

**Costo (verificado en la documentación de Cloudflare, 26-11-2026):**
- En el plan Free, las peticiones a recursos estáticos son gratuitas e ilimitadas («On both free and paid plans, requests to static assets are free and unlimited»).
- Límites del plan Free: 500 compilaciones al mes, 1 compilación a la vez, 100 dominios propios por proyecto y 20,000 archivos. La app usa 4 páginas y se compila con cada cambio en `main`.
- **No genera costos adicionales.** La app no usa Pages Functions, que son lo único que se factura como Workers.

**Comprobación de HTTPS del dominio principal:** el certificado es válido. La redirección HTTP→HTTPS que exige AdSense la verificará el workflow de producción. Si fallara, ve a GitHub → Settings → Pages y activa **Enforce HTTPS**.

## Fase C — Validación de producción

Herramientas (PR #40):
- **Ensayo con datos ficticios:** en `https://calculapanama.com/ensayo/traslado-quincena/` (interna, `noindex`, fuera del sitemap y sin publicidad) se crea un presupuesto **ficticio** en una clave aparte (`cp-ensayo-quincena-v1`) y se traslada a `app.calculapanama.com` por el mismo protocolo que usará la migración real. La página **nunca lee, envía ni borra la clave real**. En la app, `/ensayo/` muestra el SHA-256 recibido.
- **Workflow «Validación de producción»** (Actions → ejecución manual), en Chromium, Firefox, WebKit escritorio y WebKit iPhone:
  - HTTP→HTTPS, `www` → raíz, `ads.txt`, `robots.txt` y sitemap;
  - las 26 URL: 200, canonical, CSP estricta y sin AdSense;
  - la 404 devuelve 404;
  - en la app: cabeceras `frame-ancestors`, `noindex` y `nosniff`, CSP estricta y ningún tercero;
  - traslado del ensayo verificado por SHA-256, aislamiento entre orígenes y conservación ante errores.

Resultados: ver §Resultados.

**Safari real:** WebKit es el motor de Safari, pero no es Safari para iOS. Prueba manual de 2 minutos en un iPhone:
1. Abre `https://calculapanama.com/ensayo/traslado-quincena/`.
2. Pulsa 1 (crear presupuesto ficticio), luego 2 (trasladar) y luego «Comprobar desde esta página». Deben aparecer tres ✔.
3. Abre el enlace «Comprobarlo en la app», confirma el saldo «B/.1234.56» y pulsa «Borrar el ensayo».

## Fase D — Preparación de AdSense

| Requisito (fuente oficial) | Estado |
|---|---|
| Contenido propio y original; mayor de 18 años; acceso al HTML (answer/9724) | Cumple. La edad del titular no es verificable desde aquí |
| Código de AdSense en el `<head>`, o verificación por Search Console (12176698) | Preparado: la guardia lo inserta en el `<head>` de las 11 páginas `stage1` al activar. **Mientras esté pausado, Google no ve el código**. Alternativa: verificar el sitio en Search Console |
| `ads.txt` correcto | Cumple, en producción |
| SSL válido y redirección HTTP→HTTPS (12176698) | Certificado válido; la redirección se comprueba en el workflow |
| Rastreador no bloqueado por robots.txt | Cumple (`Allow: /`). La app tampoco bloquea |
| Política de privacidad con proveedores externos, cookies y exclusión (1348695) | Texto preparado con la redacción de Google. Aparece automáticamente al activar |
| CMP certificada por Google para el EEE, el Reino Unido y Suiza (13554116) | **Pendiente de tu acción:** AdSense → Privacidad y mensajes → Europa → crear el mensaje de consentimiento (la CMP de Google es gratuita) y publicarlo |
| Sin anuncios en páginas de error ni sin contenido (publisherpolicies 11112688) | Cumple: la 404, las páginas legales e institucionales y el ensayo están en `never` |
| Sin clics accidentales cerca de botones o navegación (1346295) | Sin bloques manuales. Al activar los anuncios automáticos, revisa en la vista previa de AdSense que no aparezcan junto a los formularios de las herramientas de la primera etapa; si aparecen, excluye esas zonas |

### Pasos de la activación final (requieren tu autorización)

1. Ejecutar el workflow de producción con la app (**todo en verde**) y hacer la prueba manual en iPhone.
2. **[Autorización: migración real]** Cambiar `src/data/isolation.json` → `"quincenaMoved": true` (PR y publicación). Los usuarios trasladarán sus datos al abrir Mi Quincena. No hay vuelta atrás una vez que haya usuarios trasladados.
3. Crear y publicar el mensaje de consentimiento (CMP) en AdSense.
4. **[Autorización: publicidad]** Cambiar `src/data/ad-policy.json` → `"active": true`. `verify:seo` exige el paso 2.
5. Publicar y comprobar con el workflow que las 11 páginas tienen la guardia y las demás no tienen AdSense. Para ello hay que ajustar la prueba «sin AdSense» de la batería de producción.
6. Pedir la revisión en AdSense → Sitios → `calculapanama.com` → **Request review**. Google indica que tarda unos días, a veces de 2 a 4 semanas.

**No se garantiza la aprobación.**

## Resultados

### Ejecución 1 — sitio principal (26-11-2026, [run 45887935045](https://github.com/gabrielvillarreta555-code/calcula-panama/actions/runs/45887935045)), `check_app=0`

| Comprobación | Resultado |
|---|---|
| `http://calculapanama.com/` y `http://www.calculapanama.com/` → 301/308 a `https://` | ✅ |
| `https://www.calculapanama.com/` → `https://calculapanama.com/` | ✅ |
| `ads.txt` exacto y `robots.txt` enlazando el sitemap | ✅ |
| 26 URL del sitemap: 200, canonical propio, CSP estricta y **sin AdSense** | ✅ |
| URL inexistente → 404 | ✅ |
| App, ensayo del traslado y conservación ante errores (Chromium, Firefox, WebKit, iPhone) | ⏸ Omitidas: la app aún no existe (pendiente de la Fase B) |

### Ejecución 2 — con la app

Pendiente: lanzar «Validación de producción» con `check_app=1` cuando `app.calculapanama.com` esté activo.
