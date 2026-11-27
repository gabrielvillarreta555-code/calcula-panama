# Configurar app.calculapanama.com: guía operativa

- **Fecha:** 27 de noviembre de 2026.
- **Estado:** solo documentación. **No se ha modificado el DNS** ni ninguna configuración de Cloudflare o de GitHub.
- **Antecedentes:**
  - CP-ADS-002 (`docs/cp-ads-002/arquitectura-aislamiento.md`): por qué la app va en otro origen;
  - CP-ADS-003 (`docs/cp-ads-003/README.md`): implementación;
  - CP-ADS-004, fase B (`docs/cp-ads-004/README.md`): primeras instrucciones.

  Este documento las consolida y las actualiza con lo comprobado hoy.

## 1. Situación actual (comprobada el 27-11-2026)

| Punto | Estado | Cómo se comprobó |
|---|---|---|
| Servidores DNS de `calculapanama.com` | Cloudflare: `corey.ns.cloudflare.com` y `walk.ns.cloudflare.com` | Consulta NS pública (dns.google) |
| Dominio principal | Registros A de GitHub Pages; `www` es un CNAME a `gabrielvillarreta555-code.github.io` | Consulta pública |
| `app.calculapanama.com` | **No existe**: NXDOMAIN, tanto A como CNAME | Consulta pública y fallo `ENOTFOUND` en el workflow de producción con `check_app: 1` |
| Compilación de la app | Correcta: `npm run build:app` → `dist-app/` con 4 páginas (`/`, `/quincena/`, `/importar/`, `/ensayo/`), `_headers` y `robots.txt` | Compilación local |
| Verificación de la app | `npm run verify:app` correcta: CSP estricta, `noindex` y sin recursos de terceros | Ejecución local |
| Interruptores | `isolation.json` → `quincenaMoved: false`; `ad-policy.json` → `active: false` | Repositorio |

**Por qué hace falta un servicio distinto de GitHub Pages:**
- GitHub Pages no permite cabeceras HTTP propias.
- La app necesita `frame-ancestors` (protección contra el *clickjacking*), que no funciona en una CSP dentro de `<meta>`.
- Por eso se usa **Cloudflare Pages**, que lee `app/public/_headers` y es gratuito para sitios estáticos.

## 2. Pasos (manuales, en el panel de Cloudflare, unos 10 minutos)

> Requieren la cuenta de Cloudflare que contiene la zona `calculapanama.com`. Desde esta sesión no hay acceso a esa cuenta.

1. Entra en **dash.cloudflare.com** con la cuenta de la zona.
2. **Workers & Pages → Create application → Pages → Import an existing Git repository.**
   - Si es la primera vez, pulsa **Connect GitHub**.
   - Autoriza «Cloudflare Workers & Pages» con **Only select repositories → `gabrielvillarreta555-code/calcula-panama`**.
3. **Configuración de la compilación:**

   | Campo | Valor |
   |---|---|
   | Project name | `calcula-panama-app` (URL técnica: `calcula-panama-app.pages.dev`) |
   | Production branch | `main` |
   | Framework preset | `None` |
   | Build command | `npm run build:app` |
   | Build output directory | `dist-app` |
   | Root directory | *(vacío)* |
   | Environment variables | Ninguna |

4. **Save and Deploy.** Espera a que la compilación termine en «Success».
5. **Comprobación previa sin DNS:** abre `https://calcula-panama-app.pages.dev/quincena/`. Debe cargar Mi Quincena.
6. **Settings → Builds → Branch control → Preview branch: None.** Así solo compila `main` y no consume compilaciones con cada rama.
7. **Custom domains → Set up a custom domain → `app.calculapanama.com`.**
   - Como la zona está en la misma cuenta, Cloudflare propone crear **un único registro nuevo**: `CNAME app → calcula-panama-app.pages.dev`, con proxy.
   - **No hay que tocar ningún registro existente:** los A del dominio principal, `www`, MX y **los dos TXT de verificación de Google**, que deben conservarse.
8. Espera a que el dominio aparezca como **Active**; el certificado TLS es automático. Suele tardar unos minutos.

## 3. Verificación después de configurar el DNS (la hago yo cuando me avises)

1. **DNS:** `app.calculapanama.com` resuelve (CNAME a `*.pages.dev`).
2. **Cabeceras**, desde `app/public/_headers`:
   - `/importar/*` → `Content-Security-Policy: frame-ancestors https://calculapanama.com`;
   - `/quincena/*` → `frame-ancestors 'none'`;
   - todo el sitio → `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` y `X-Robots-Tag: noindex`.
3. **Workflow «Validación de producción» con `check_app: 1`** (Chromium, Firefox, WebKit y iPhone):
   - cabeceras de la app, CSP estricta y `noindex`;
   - ensayo del traslado con **datos ficticios** (`/ensayo/traslado-quincena/`, verificado con SHA-256);
   - conservación de los datos ante errores.
4. **Prueba manual en un iPhone real**, de 2 minutos, según CP-ADS-004 fase C: crear el presupuesto ficticio, trasladarlo, comprobar los tres ✔ y borrar el ensayo.

## 4. Lo que NO se hará sin una autorización específica

- **Activar la migración real** (`quincenaMoved: true`). Afecta a los datos de los usuarios y no tiene vuelta atrás una vez que haya usuarios trasladados. Requiere que todo el §3 esté en verde.
- **Activar la publicidad** (`active: true`). `verify:seo` lo impide mientras `quincenaMoved` sea `false`.
- **Cambiar o borrar registros DNS existentes.**

## 5. Costo y reversión

- **Costo:** Cloudflare Pages Free. Peticiones estáticas ilimitadas y 500 compilaciones al mes. La app no usa Functions. No genera costos adicionales (verificado en la documentación de Cloudflare el 26-11-2026, CP-ADS-004).
- **Reversión, mientras `quincenaMoved` siga en `false`:** basta con borrar el dominio propio en el proyecto de Pages; eso elimina el CNAME `app`, o se elimina a mano. El sitio principal no se ve afectado y ningún usuario tiene datos en la app.

## 6. Qué necesito del CEO

1. Que alguien con acceso a la cuenta de Cloudflare haga los pasos del §2.
2. Que me avise cuando `app.calculapanama.com` aparezca como **Active**. Entonces haré la verificación del §3 y entregaré un informe antes de proponer la migración real.
