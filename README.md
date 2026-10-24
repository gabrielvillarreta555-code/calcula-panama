# Calcula Panamá

Sitio estático con calculadoras laborales para Panamá: salario neto, décimo tercer mes, vacaciones y liquidación laboral, además de guías. Los cálculos se ejecutan en el navegador; no hay servidor ni base de datos.

## Arquitectura

- Astro y TypeScript para HTML estático rápido y SEO. Sin fuentes ni scripts de terceros.
- Reglas y parámetros legales, con la norma de cada uno, en `src/data/legal.ts`.
- Funciones puras en `src/lib/calculations.ts`, probadas con Vitest en `src/lib/calculations.test.ts`.
- Configuración del sitio, menú y AdSense en `src/data/site.ts`.
- Utilidades de interfaz del navegador en `src/lib/ui.ts`.
- Las tablas de ejemplo de las guías se generan con las mismas funciones de cálculo, así que nunca contradicen a las calculadoras.
- GitHub Actions: `ci.yml` valida cada pull request y `deploy.yml` publica `main` en GitHub Pages.

## Desarrollo

Requiere Node.js 22 o superior.

```bash
npm install
npm run dev
```

Validación completa:

```bash
npm test
npm run check
npm run build
```

## Publicar en GitHub Pages

1. En GitHub abre **Settings → Pages**.
2. En **Build and deployment**, selecciona **GitHub Actions**.
3. Cada push a `main` ejecuta el flujo «Publicar en GitHub Pages», que prueba, compila y publica `dist`.
4. El sitio se publica en el dominio propio **https://calculapanama.com/** (configurado en **Settings → Pages → Custom domain** y en `public/CNAME`).

Los flujos compilan con `SITE_URL=https://calculapanama.com/` y `BASE_PATH=/`, así que los CSS, JS, enlaces, canonical, sitemap y `robots.txt` apuntan a la raíz del dominio. Si algún día vuelves a publicar en `https://<usuario>.github.io/calcula-panama/` sin dominio propio, cambia esas dos variables en `.github/workflows/deploy.yml` y `ci.yml` a esa URL y a `/calcula-panama/`; si no, la página se verá sin estilos.

## Sitemap y Google Search Console

- `https://calculapanama.com/sitemap.xml` se genera en cada build desde `src/pages/sitemap.xml.ts` con las URL canónicas de todas las páginas públicas (una página nueva entra sola; la 404 queda fuera). `@astrojs/sitemap` sigue generando `sitemap-index.xml` por compatibilidad.
- `robots.txt` permite todo el sitio y enlaza `sitemap.xml`.
- `npm run verify:seo` (también en GitHub Actions, después del build) falla si el sitemap no es XML válido, si alguna URL no es del dominio propio, no coincide con su canonical, no existe o es `noindex`, o si `robots.txt` no enlaza el sitemap.
- En Search Console envía `https://calculapanama.com/sitemap.xml` en **Sitemaps**.

## Activar Google AdSense (cuando la cuenta esté aprobada)

No hay anuncios ni identificadores inventados. Mientras `ADSENSE.client` esté vacío, no se carga ningún script de Google ni se muestra ningún espacio vacío.

1. En `src/data/site.ts` pon tu identificador real en `ADSENSE.client` (`ca-pub-` seguido de 16 cifras) y el id de cada bloque en `ADSENSE.slots` (`afterResult` bajo el resultado de las calculadoras, `inArticle` dentro de las guías).
2. Crea `public/ads.txt` con la línea que te da AdSense: `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`, con tu número. Para que Google lo lea, debe estar en la raíz de un dominio propio.
3. La página de privacidad cambia sola al texto con la información sobre cookies de Google cuando `client` es válido. Si recibes visitas de la UE o del Reino Unido, configura además un mensaje de consentimiento certificado (AdSense → Privacidad y mensajes).
4. Los anuncios se colocan después del resultado y dentro del texto, nunca entre el formulario y el resultado, para no empeorar la experiencia ni el CLS.

## Antes del lanzamiento público

- El canal de contacto actual son las incidencias públicas de GitHub. Si quieres un correo, añádelo en `src/pages/contacto.astro`.
- Validar los parámetros legales con un profesional panameño y registrar la fecha en `src/data/legal.ts`.
- Recomendado: dominio propio (mejor para SEO y necesario para `ads.txt`) y alta en Google Search Console con el sitemap `sitemap-index.xml`.

## Actualizar reglas

Modifica primero `src/data/legal.ts`, actualiza o añade casos en `src/lib/calculations.test.ts` y ejecuta la validación completa. Las limitaciones deliberadas deben mantenerse hasta contar con una regla verificable: relaciones anteriores a la Ley 44 de 1995, causas económicas o renuncias justificadas en contratos definidos, fueros y recargos.

### Criterios de cálculo verificados (auditoría 2026-10-24)

Cada regla se contrastó con el texto de la norma. Los valores esperados de `src/lib/calculations.test.ts` se generaron con una implementación de referencia independiente (aritmética decimal) escrita desde esas normas.

| Concepto | Regla aplicada | Fuente primaria |
| --- | --- | --- |
| Seguro Social | 9.75% del salario, incluidas comisiones y vacaciones; 7.25% sobre cada partida del décimo; no aplica a prima, indemnización ni preaviso | Ley 51 de 2005, texto único de 2025 (G.O. 30284-B), arts. 85, 86 y 96 |
| Seguro Educativo | 1.25% de los «salarios básicos»; no aplica al décimo; no es deducible del ISR | Ley 13 de 1987 (DG 168 de 1971); DE 98 de 2010 derogó la deducción |
| ISR: tarifa | 0% hasta 11,000 · 15% hasta 50,000 · 5,850 + 25% | Código Fiscal art. 700 (Ley 8 de 2010, art. 10) |
| ISR: retención | Proyección anual (salarios + décimo) − deducciones, tarifa aplicada proporcionalmente a cada pago | Código Fiscal art. 704 (Ley 8 de 2010, art. 17) |
| ISR: deducciones | B/.800 por declaración conjunta; otras comprobadas por el empleador | Código Fiscal art. 709 (Ley 8 de 2010, art. 25) |
| ISR: liquidación | Prima, indemnización y preaviso no se acumulan: −1% por año completo, −B/.5,000, tarifa del art. 700 | Código Fiscal art. 701 lit. j; DE 170 de 1993 art. 119 |
| Décimo | Devengado en el período ÷ 12 (práctica de planilla); pagos 15 abr / 15 ago / 15 dic; base con horas extra, comisiones, vacaciones | DG 221 de 1971 arts. 2 y 3; DG 52 de 1972; Decreto 19 de 1973 art. 4 |
| Vacaciones | 1 día por cada 11 trabajados; 30 días = 1 mes o promedio de 11 meses si es mayor | Código de Trabajo, art. 54 |
| Prima de antigüedad | 1 semana por año (aniversarios + fracción), contratos indefinidos, cualquier causa; promedio de 5 años | arts. 224 y 226 |
| Indemnización | 3.4 semanas por año (10 primeros) + 1 por año adicional | arts. 225 C y 149; también arts. 213 C, 215 y 223 |
| Preaviso | 30 días si el despido sin causa ocurre con menos de 2 años y sin aviso | art. 212 |
| Contratos definidos u obra | Salarios del tiempo restante; avisos de conversión a indefinido y plazo máximo | arts. 74, 75, 77 y 227 |

### Limitaciones conocidas (se muestran como avisos o resultados orientativos)

- La DGI aplica la retención con tablas e instrucciones propias (DE 170, art. 140) que pueden diferir en centavos (redondeos del art. 142) o por ajustes de meses anteriores.
- Ingresos variables: se usa un promedio por pago; los bonos únicos no se modelan.
- El décimo se calcula como devengado ÷ 12, como se hace en planilla; el decreto lo expresa como «un día por cada once días de trabajo efectivo». Los cortes del día 15 son los habituales; la norma solo fija las fechas de pago.
- No se automatiza: relaciones iniciadas antes de la Ley 44 de 1995, recargos y salarios caídos, fueros, otros casos del art. 212 (domésticos, empresas pequeñas), causa económica o renuncia justificada en contratos definidos, ni el ISR ordinario sobre vacaciones y décimo en la liquidación.
- El reglamento del ISR se consultó en un texto compilado no oficial actualizado a 2010; los artículos usados (119, 140, 142) no muestran reformas posteriores en esa compilación.
