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
4. Si usas dominio propio, cambia `SITE_URL` y `BASE_PATH` en el flujo (o el valor por defecto de `astro.config.mjs`) para que canonical, sitemap y robots apunten al dominio final.

El flujo configura la ruta base `/<nombre-del-repositorio>/`, por lo que los enlaces funcionan en un proyecto de GitHub Pages. `robots.txt` se genera con la URL correcta del sitemap.

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

### Criterios de cálculo verificados (revisión 2026-10-24)

| Concepto | Regla | Fuente |
| --- | --- | --- |
| Seguro Social | 9.75% del salario; 7.25% sobre el décimo | Ley 51 de 2005, art. 101 (la Ley 462 de 2025 no cambió la cuota del empleado) |
| Seguro Educativo | 1.25% del salario; no aplica al décimo; ya no es deducible del ISR | Decreto Ejecutivo 98 de 2010 (derogó el art. 73 del DE 170 de 1993) |
| ISR | Proyección anual de 13 pagos, tarifa 0 / 15% / B/.5,850 + 25%; las cuotas no se restan | Código Fiscal, art. 700 |
| Décimo | Lo devengado en el período ÷ 12; períodos 16 dic–15 abr, 16 abr–15 ago y 16 ago–15 dic | DG 221 de 1971, DG 52 de 1972 |
| Vacaciones | 1 día por cada 11 trabajados; 30 días = 1 mes de salario o promedio de 11 meses si es mayor | Código de Trabajo, art. 54 |
| Prima de antigüedad | 1 semana por año, contratos indefinidos, cualquier causa; promedio de 5 años | arts. 224 y 226 |
| Indemnización | 3.4 semanas por año (10 primeros) + 1 por año adicional; despido injustificado, renuncia justificada (art. 223) o causa económica (art. 213 C) | arts. 225 C y 149 |
| Contratos definidos u obra | Salarios del tiempo restante si el empleador los termina sin justa causa | art. 227 |
