# Calcula Panamá

Sitio estático con calculadoras laborales para Panamá. Los cálculos se ejecutan en el navegador; no hay servidor ni base de datos.

## Arquitectura

- Astro y TypeScript para HTML estático rápido y SEO.
- Reglas y parámetros legales en `src/data/legal.ts`.
- Funciones puras en `src/lib/calculations.ts`.
- Pruebas automatizadas con Vitest.
- GitHub Actions para pruebas, compilación y GitHub Pages.

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

1. Crea un repositorio vacío en GitHub y sube el contenido de esta carpeta a la rama `main`.
2. En GitHub abre **Settings → Pages**.
3. En **Build and deployment**, selecciona **GitHub Actions**.
4. Abre la pestaña **Actions**. El flujo “Publicar en GitHub Pages” ejecutará pruebas y publicará `dist`.
5. Sustituye la URL provisional de `site` en `astro.config.mjs` por el dominio final si usas dominio propio.

El flujo configura automáticamente la ruta base `/<nombre-del-repositorio>/`, por lo que los enlaces funcionan en un proyecto de GitHub Pages.

## Antes del lanzamiento público

- Añadir un canal de contacto real y el responsable de las políticas; no se incluyeron datos inventados.
- Validar los parámetros legales con un profesional panameño y registrar la fecha en `src/data/legal.ts`.
- Configurar el dominio final para canonical, sitemap y robots.
- No activar AdSense hasta disponer de aprobación e identificadores reales; los espacios actuales son solo marcadores visuales.

## Actualizar reglas

Modifica primero `src/data/legal.ts`, actualiza o añade casos en `src/lib/calculations.test.ts` y ejecuta la validación completa. Las limitaciones deliberadas (por ejemplo, indemnización en contratos definidos) deben mantenerse como tales hasta contar con una regla verificable.
