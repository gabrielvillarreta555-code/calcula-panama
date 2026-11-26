# CP-ADS-002 — Arquitectura para monetizar sin exponer datos personales

Estado: **propuesta, sin ejecutar**. No se ha creado ningún subdominio, no se ha migrado ningún dato y la publicidad sigue pausada (`src/data/ad-policy.json`, `"active": false`).

## 1. El problema

Un script publicitario que se ejecuta en una página de `https://calculapanama.com` tiene los mismos permisos que el código del sitio en ese **origen**:

1. **Almacenamiento del origen.** Puede leer el `localStorage` y el IndexedDB de todo el dominio. Mi Quincena guarda presupuestos en `localStorage['cp-mi-quincena-v1']`, así que un anuncio en la portada o en una guía puede leerlos, aunque Mi Quincena no muestre anuncios. Hoy en producción el script se carga en 10 páginas: este riesgo **ya existe**, y por eso la publicidad queda pausada.
2. **El DOM de la página.** En una calculadora con anuncios, el script puede leer los campos de salario, deuda o notas mientras el usuario escribe.

Excluir páginas sueltas resuelve el punto 2, pero **no el 1**. La única frontera que el navegador garantiza es la del **origen** (esquema + host + puerto).

## 2. Propuesta: un origen sin publicidad para los datos

```
calculapanama.com            (con publicidad, primera y segunda etapa)
 ├─ guías, directorios, portada                  → anuncios
 ├─ herramientas sin datos personales            → anuncios
 ├─ páginas de herramientas con datos personales → texto editorial + anuncios
 │     └─ <iframe src="https://app.calculapanama.com/embed/salario-neto/">  ← sin anuncios
 └─ /finanzas/mi-quincena/  → página de presentación (misma URL) + enlace a la app

app.calculapanama.com        (NUNCA publicidad; CSP estricta; sin scripts de terceros)
 ├─ /quincena/                 Mi Quincena (guardado local en ESTE origen)
 ├─ /importar/                 receptor de la migración
 └─ /embed/<herramienta>/      calculadoras con datos personales
```

`app.calculapanama.com` es un origen distinto. Los scripts de `calculapanama.com` no pueden leer su DOM, su `localStorage` ni el contenido de sus iframes: lo impide la política del mismo origen del navegador.

> Se propone un único subdominio, `app.`, porque Mi Quincena y las calculadoras aisladas comparten la misma regla: ningún script de terceros. Si se prefiere `quincena.calculapanama.com`, el diseño es idéntico, pero las calculadoras de la segunda etapa necesitarían otro subdominio.

### Reglas obligatorias del origen `app.`

- La CSP estricta actual (`STRICT_CSP`): sin scripts ni conexiones externas.
- Sin AdSense, analítica ni fuentes o CDN externos. Una prueba de compilación lo comprueba, igual que hoy `verify:seo`.
- No usar `document.domain` ni cookies con `Domain=.calculapanama.com` para datos.
- Comunicación con la página contenedora solo por `postMessage`, con el origen exacto comprobado en ambos sentidos. Solo se envía la altura del iframe (un número), **nunca datos del formulario**.

## 3. Mi Quincena: traslado sin pérdida de datos

**Objetivo:** que los presupuestos pasen de `calculapanama.com` a `app.calculapanama.com` y que, antes de activar la publicidad, no quede ningún dato financiero en el origen principal.

### 3.1 Flujo de migración (por usuario, en su navegador)

1. El usuario abre `/finanzas/mi-quincena/` en el origen principal. Esa página **no tiene anuncios** y conserva la CSP estricta.
2. Si existe `cp-mi-quincena-v1`, la página ofrece «Trasladar mis datos» y, antes, «Descargar copia» (un archivo JSON generado en el navegador, sin red).
3. La página carga en un iframe `https://app.calculapanama.com/importar/` y le envía los datos con `postMessage(payload, 'https://app.calculapanama.com')`. Los datos van con versión y suma de verificación (SHA-256 mediante `crypto.subtle`).
4. El receptor comprueba que `event.origin === 'https://calculapanama.com'`, valida el esquema y la suma, y los guarda. Si ya hay datos en el destino, **no sobrescribe**: pregunta al usuario. Después responde con la suma de lo que guardó y releyó.
5. El origen principal borra `cp-mi-quincena-v1` **solo** si la suma coincide. Deja una marca sin datos (`cp-mi-quincena-migrated`) y redirige a la app.
6. Ante cualquier fallo (tiempo agotado, suma distinta, almacenamiento bloqueado), los datos **se quedan** donde estaban y se ofrece reintentar o descargar la copia.

El iframe es *same-site* (mismo eTLD+1), así que los navegadores con almacenamiento particionado guardan los datos en la misma partición que verá el usuario al abrir `app.calculapanama.com` directamente. **Hay que verificarlo en Chrome, Safari y Firefox** (§6).

### 3.2 Guardia de publicidad para datos antiguos

Hay usuarios que no volverán a Mi Quincena y cuyos datos seguirán en el origen principal. Por eso, cuando se active la publicidad, el script de AdSense **no** se incluirá como etiqueta estática. Lo cargará un pequeño script propio, y solo si se cumplen estas dos condiciones:

- no existe `cp-mi-quincena-v1` en `localStorage`;
- el almacenamiento es legible (si no se puede comprobar, no se cargan anuncios).

Si hay datos antiguos, esa visita no muestra anuncios y presenta un aviso con el enlace al traslado. Como, tras el cambio, el código del origen principal **nunca vuelve a escribir** datos financieros, la guardia garantiza que un script publicitario no coincida con esos datos en la misma carga de página.

### 3.3 SEO

- La URL `/finanzas/mi-quincena/` se conserva con contenido propio (qué es, cómo funciona, privacidad y el botón para abrir la app). Sigue siendo indexable y en el sitemap.
- `app.calculapanama.com` sería `noindex`: es una aplicación, no contenido nuevo. No hay redirecciones 301 que puedan perder posicionamiento.

## 4. Segunda etapa: calculadoras con datos personales

Patrón de «calculadora aislada» para las 10 herramientas de la segunda etapa (laborales, préstamos, financiamiento y costo del auto, meta de ahorro, notas y Modo Pasillo):

- La URL actual se mantiene en el origen principal con todo su contenido editorial (cómo se calcula, ejemplos, fuentes y FAQ), que es lo que Google evalúa y lo que puede llevar anuncios.
- El formulario y el resultado se sirven desde `app.calculapanama.com/embed/<herramienta>/` dentro de un `<iframe>`:
  - con `title` descriptivo y la altura ajustada por `postMessage` (solo números);
  - con `sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"` y sin `allow-same-origin`. El iframe recibe un origen opaco: ni siquiera puede usar el almacenamiento, porque estas herramientas no guardan nada;
  - con `<meta name="robots" content="noindex, indexifembedded">`, para que Google no indexe la URL suelta y sí la indexe dentro de la página. Esta directiva debe confirmarse en la documentación vigente de Google.
- Los anuncios se colocan fuera del bloque de la calculadora, nunca entre el formulario y el resultado. Se usan bloques manuales o se excluye esa zona de los anuncios automáticos.

**Límite que hay que conocer:** el aislamiento protege lo que el usuario escribe **dentro** del iframe frente a cualquier script de la página contenedora. Un script contenedor malicioso podría, en teoría, sustituir el iframe por un formulario falso. Ninguna incrustación lo evita; el riesgo depende de confiar en el código publicitario de Google. La alternativa sin este riesgo es la primera etapa: sin anuncios en las páginas con formularios personales.

**Clickjacking:** GitHub Pages no permite cabeceras HTTP, y `frame-ancestors` no funciona en una CSP en `<meta>`. Opciones:

- alojar `app.` en un servicio gratuito que permita cabeceras (Cloudflare Pages, con `_headers`) y enviar `Content-Security-Policy: frame-ancestors https://calculapanama.com`;
- o comprobar `location.ancestorOrigins` en el iframe, que funciona en Chromium y Safari pero no en Firefox.

El riesgo es bajo, porque las calculadoras no ejecutan acciones con consecuencias.

## 5. Alojamiento, DNS y costos

| Opción para `app.calculapanama.com` | Costo | Cabeceras HTTP (`frame-ancestors`) | Mantenimiento |
|---|---|---|---|
| **Cloudflare Pages** (recomendada) | B/.0 | Sí (`_headers`) | Un proyecto más que se despliega desde este mismo repositorio |
| GitHub Pages en un segundo repositorio | B/.0 | No | Otro repositorio y otro flujo, con un token para publicar |

- **DNS:** un registro `CNAME app → <proyecto>.pages.dev` (o `<usuario>.github.io`) donde se administre hoy el dominio. El certificado TLS es automático y gratuito.
- **Código:** una segunda salida de compilación de Astro (o un segundo proyecto en `apps/app/`) que reutilice las funciones de cálculo existentes. **No cambia ninguna fórmula.**
- **Costo monetario:** B/.0, más el dominio que ya se paga.

**Esfuerzo estimado:**

| Fase | Horas |
|---|---|
| Subdominio y despliegue | 3–5 |
| Mi Quincena en `app.`, migración, guardia y pruebas | 14–20 |
| Segunda etapa (iframe para 10 herramientas, altura, accesibilidad y pruebas) | 20–30 |

## 6. Pruebas reproducibles (Playwright, sin red externa)

1. **Espía publicitario:** en las pruebas, la URL de `adsbygoogle.js` se sustituye por un script local que recorre `localStorage`, `sessionStorage`, IndexedDB, cookies, todos los `input`, `select` y `textarea` de la página y los iframes accesibles, e informa de lo que encuentra.
   - Criterio: en las 11 páginas de la primera etapa, con un presupuesto v1 sintético creado antes, **no encuentra nada financiero**.
   - En las páginas de la segunda etapa, **no puede leer el iframe** (la excepción `SecurityError` se registra como éxito).
2. **Guardia:** con `cp-mi-quincena-v1` presente, ninguna página carga el script publicitario. Sin la clave, solo lo cargan las páginas `stage1`.
3. **Migración:**
   - un presupuesto v1 sintético llega idéntico (byte a byte) al destino;
   - el origen solo se borra después de la confirmación;
   - con el iframe bloqueado, el tiempo agotado, una suma distinta o un mensaje desde un origen ajeno, los datos permanecen;
   - si el destino ya tiene datos, no se sobrescriben.
4. **Sin tráfico a terceros:** en `app.` y en las páginas sin publicidad, el registro de peticiones solo contiene el propio origen (como ya hacen `mi-quincena.e2e.ts` y `prestamos.e2e.ts`).
5. **Compilación:** `verify:seo` falla si alguna página de `app.` tiene scripts externos o le falta la CSP estricta, o si una página sin política `stage1` carga anuncios. La segunda parte ya está implementada.
6. **Navegadores:** Chromium, WebKit y Firefox para la partición del almacenamiento en la migración. WebKit y Firefox requieren instalar sus navegadores en CI.

## 7. Páginas monetizables de forma segura

| Etapa | Páginas | Condición |
|---|---|---|
| Primera | 11: portada, índice de guías y 3 guías, `/herramientas/`, `/compras/`, precio por unidad, descuentos, combustible y consumo eléctrico | Mi Quincena aislada en `app.` y guardia activa |
| Segunda | +10: 4 laborales, préstamos, financiamiento y costo del auto, meta de ahorro, notas y Modo Pasillo | Calculadoras en iframe de `app.` |
| Tras la migración | +1: la página de presentación de `/finanzas/mi-quincena/` | Ya no contiene ni escribe datos |
| Nunca | Sobre nosotros, Contacto, Privacidad, Términos y 404 | Política editorial y de AdSense |

**Total:** 11 de 26 URL indexables en la primera etapa y 22 de 26 (85%) al completar la segunda.

## 8. Fuera de alcance y pendientes de autorización

- Crear el subdominio, configurar el DNS y desplegar.
- Ejecutar la migración y activar la publicidad (`"active": true`).
- Configurar en el panel de AdSense el mensaje de consentimiento (CMP) para el EEE, el Reino Unido y Suiza.
- Contrastar con la documentación vigente de Google: políticas de ubicación de anuncios junto a contenido incrustado, `indexifembedded` y requisitos de la CMP. Desde esta sesión no hubo acceso a esos sitios.
