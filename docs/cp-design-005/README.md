# CP-DESIGN-005 — Calcula Panamá: Midnight Edition

Rama `design/cp-design-005-midnight`, basada en `main` (`453f9d3`). **No publicada**: se publica solo tras la aprobación visual definitiva del CEO. La publicidad y la migración real siguen desactivadas.

## Identidad

| Token | Valor | Uso |
|---|---|---|
| `--obsidian` | `#08090C` | Fondo principal (tema por defecto) |
| `--midnight` | `#101824` | Superficies y secciones alternas |
| `--steel` | `#25364B` | Bordes marcados, paneles de resultado |
| `--silver` | `#8CABC9` | Índices, acentos, enlaces y foco |
| `--ivory` | `#E7E9ED` | Texto y botón principal |

- Sin rojo, vino, dorado ni degradados azules brillantes. Los errores se señalan con texto de alto contraste, un filete y «⚠», no con rojo.
- Las tonalidades intermedias de gráficos y superficies (`#131d2b`, `#1a2636`, `#5a7593`, `#c9d6e3`…) se derivan de la paleta.
- **Tipografía:** Inter Tight (variable, licencia OFL-1.1), servida desde el propio sitio. Solo el subconjunto latino (45 KB, con *preload*) y sin peticiones a terceros, de modo que la CSP no cambia.
- **Marca:** «CALCULA.» con «PANAMÁ» espaciado debajo. Esquinas de 6 y 10 px, filetes de 1 px, índices «01 — VEHÍCULOS» y composiciones asimétricas (foto 1.35 : texto 1).
- **Tema:** Midnight por defecto. El botón de tema conserva la función actual y alterna con **Marfil**, una variante clara construida con la misma paleta.
- **Blue:** sale de la portada. Queda un icono de 24 px en el pie («Una plataforma de Blue Lab Studios») y su ayuda contextual en las calculadoras y en Modo Pasillo, con los colores de la nueva estética.

## Sistema de diseño reutilizable

| Pieza | Archivo | Qué hace |
|---|---|---|
| Tokens | `src/styles/global.css` | Paleta, superficies, tonos de gráficos, radios y fuente, para Midnight y Marfil |
| Capa Midnight | `src/styles/midnight.css` | Tipografía, cabecera, buscador, componentes editoriales (`mn-*`), formularios, resultados, errores y pie. Se carga en todas las páginas: una calculadora nueva que use las clases existentes (`panel`, `field`, `result-hero`, `tool-panel`…) adopta la identidad sin trabajo adicional |
| Directorio | `src/data/directory.ts` | Fuente única de categorías y herramientas para el menú, el buscador, la portada, `/herramientas/` y el pie. Una herramienta añadida aquí aparece en todos ellos |
| Buscador | `src/components/ToolSearch.astro` | Filtra en el navegador (sin peticiones), sin distinguir acentos; Enter abre el primer resultado; flechas para navegar |
| Fotografía | `src/components/Photo.astro` | `<picture>` con AVIF y WebP en 800 y 1600 px, `width`/`height` fijos (sin saltos de diseño), carga diferida salvo en la portada y crédito visible con licencia |
| Fotos | `scripts/fotos.mjs` y `docs/cp-design-005/seleccion-fotos.json` | Comprueba de nuevo la licencia y el EXIF en Commons, genera los formatos y escribe `src/data/photos.json` con los créditos |

Para añadir una calculadora, basta con usar `ToolLayout` (o las clases existentes) y añadirla a `directory.ts`.

## Portada

En este orden:

1. **Cabecera:** marca, buscador, tema y menú por categorías.
2. **Portada:** fotografía de la ciudad al anochecer, «Decisiones inteligentes. / Una vida mejor.», «Descubre cuánto cuesta lo que realmente importa», «Explorar herramientas» y el buscador.
3. **01 Movilidad** — «Más allá del precio.»
4. **02 Finanzas** — «Tu futuro comienza hoy.»: préstamos, ahorro y Mi Quincena.
5. **03 Trabajo** — «El valor de tu esfuerzo.»: las 4 laborales, el ejemplo de salario neto y las fechas del décimo.
6. **04 Vida cotidiana** — «El costo de vivir.»: Modo Pasillo, descuentos, precio por unidad y electricidad.
7. **05 Educación**
8. **Revista** — «Conocimiento que vale.»: las 3 guías.
9. **Principios.**

Se conservan el título, la descripción, los datos estructurados (`WebSite` e `ItemList` con las 17 herramientas) y todos los enlaces internos.

## Conservado sin cambios

- URL, contenido editorial, metadatos, sitemap y canónicas.
- Motores de cálculo: **no se tocó ningún archivo de `src/lib/` con fórmulas**.
- La CSP estricta en todas las páginas, la política de publicidad (`active: false`) y el aislamiento de Mi Quincena (`quincenaMoved: false`).
- El ensayo de traslado y las validaciones de CP-ADS-002, CP-ADS-003 y CP-ADS-004.

## Fotografías

Ver [creditos-fotos.md](creditos-fotos.md).

- Todas son fotografías reales de **Wikimedia Commons**, con licencia que permite el uso comercial: CC BY o CC BY-SA, con atribución.
- La autoría, la licencia y la procedencia se verificaron por la API de Commons, y el EXIF confirma la cámara.
- Ninguna figura en categorías de imágenes generadas por IA.
- Cada fotografía muestra su crédito, con enlace a la página de origen y a la licencia.
- Las fotos de las capturas de referencia (créditos «athenapgr», «carview.yahoo.co», «herbertyoung») **no se usaron**: no tienen licencia documentada.
