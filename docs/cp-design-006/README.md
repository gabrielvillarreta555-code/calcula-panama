# CP-DESIGN-006 — Midnight Edition: prototipos para revisión del CEO

Rama `design/cp-design-005-midnight`. **Solo prototipos estáticos**, en `docs/cp-design-006/prototipos/`. Quedan fuera del sitio, del *build* y del sitemap (`noindex`).

**No se modificó** ninguna página, motor de cálculo, URL, CSP ni configuración. No hay publicación, fusión ni publicidad.

El trabajo de CP-DESIGN-005 queda como respaldo en el commit `8a1c1c2` de esta rama.

## Cómo verlos

Sirve la raíz del repositorio y abre las tres páginas:

```sh
node scripts/static-server.mjs "$PWD":4350
```

- `http://localhost:4350/docs/cp-design-006/prototipos/index.html`
- `…/salario-neto.html`
- `…/modo-pasillo.html`

**Capturas** (`capturas/`), en móvil (390 px, @2x) y escritorio (1440 px):

| Pantalla | Móvil | Escritorio |
|---|---|---|
| Portada | `portada-movil.jpg` | `portada-escritorio.jpg` |
| Índice en móvil (navegación) | `portada-indice-movil.jpg` | — |
| Salario neto | `salario-neto-movil.jpg` | `salario-neto-escritorio.jpg` |
| Modo Pasillo | `modo-pasillo-movil.jpg` | `modo-pasillo-escritorio.jpg` |

Sin desplazamiento horizontal en ninguna de las seis vistas y sin errores de consola.

## Qué se eliminó

- **Blue:** mascota, animaciones, burbujas, mensajes y ayuda flotante. Solo queda el texto «Una plataforma de Blue Lab Studios» en el pie.
- **Barra de navegación inferior.**
- **Cabecera anterior:** logotipo, iconos, botón de tema y menú desplegable.
- **Tarjetas y contenedores:** paneles con fondo, bordes y sombras; tarjetas de herramientas, de guías y de «principios».
- **Distribución anterior de formularios y resultados:** campos en cajas, botones redondeados, el panel azul de resultado, las cuadrículas de mini-tarjetas y los chips.
- **Bordes redondeados:** ahora todas las esquinas son rectas.
- **Degradados, brillos, sombras y efectos** (incluido el *blur*).
- **Estilos heredados:** los prototipos no cargan `global.css`, `midnight.css` ni ningún componente anterior. Su hoja (`proto.css`) se escribió desde cero.

## Componentes nuevos

| Componente | Qué es |
|---|---|
| **Riel + cabecera de revista** | Una línea superior de edición («Calcula Panamá — Edición Midnight»), la marca CALCULA./PANAMÁ, las secciones en texto (escritorio) y dos acciones en texto: **Buscar** e **Índice** |
| **Índice a pantalla completa** | Sustituye a la barra inferior y al menú: búsqueda arriba, las secciones numeradas en tipografía grande y los enlaces secundarios. Es la navegación móvil |
| **Fotografía a sangre con pie de foto** | La imagen ocupa el ancho completo y el crédito va debajo, como en una revista, no superpuesto |
| **Titular editorial** | Serif display (Instrument Serif) a gran escala; la segunda línea en cursiva plata |
| **Índice tipográfico** | La portada presenta las secciones como un sumario numerado (01–05 + Revista) separado por filetes, sin tarjetas |
| **«El dato»** | Una cifra protagonista del motor real (B/. 1,236.92) con barra proporcional y leyenda: la portada abre con información, no con decoración |
| **Doble página asimétrica** | Foto en 7 columnas que sangra hasta el borde; texto en 4 columnas, con listas numeradas (1.1, 1.2…) |
| **Lista numerada de herramientas** | Filas con número, nombre, descripción y flecha serif, sin cajas |
| **Encabezado de herramienta** | Número de sección, título serif enorme, entradilla y ficha lateral (base legal, revisión, privacidad) separada por un filete |
| **Formulario minimalista** | Pestañas de texto subrayadas, campo de importe sin caja (solo línea base) con la cifra en serif, opciones plegables en una línea y un botón rectangular marfil a todo el ancho |
| **Estado de cuenta** | El resultado como documento financiero: cifra grande (céntimos en plata), barra de 4 px, libro de líneas con filetes, total con doble raya y proyección anual en tres columnas |
| **Metodología en ensayo** | «Cómo se calcula» como artículo: título fijo a la izquierda, pasos numerados en serif y notas al pie con las normas |
| **Ticket de compra (Modo Pasillo)** | Total protagonista, medidor de presupuesto de 2 px con marca de umbral, disponible en serif y una lista como recibo (cantidad × precio, importe a la derecha, «Quitar» en texto) |
| **Colofón** | La palabra CALCULA a todo el ancho y las secciones en columnas pequeñas |
| **Espacio de imagen** | Marco rotulado para cada imagen aprobada cuyo archivo aún no se ha entregado |

## En qué se diferencia del diseño anterior

| Antes | Ahora |
|---|---|
| Aplicación con tarjetas, paneles y botones redondeados | Revista: retícula de 12 columnas, filetes y esquinas rectas |
| Tipografía de sistema, todo en sans | Serif display para titulares y cifras; sans solo para la interfaz |
| Navegación con barra inferior, iconos y menú desplegable | «Buscar» e «Índice» en texto y un índice a pantalla completa |
| Resultado en un panel azul con mini-tarjetas | Resultado como estado de cuenta tipográfico |
| Fotos como ilustración dentro de bloques | Fotos a sangre como protagonistas, con pie editorial |
| Blue presente en portada y herramientas | Sin Blue en la interfaz |
| Portada como lista de accesos | Portada como sumario, con «El dato» y dobles páginas |

## Imágenes (revisión 2)

| Sección | Imagen | Tipo | Crédito mostrado |
|---|---|---|---|
| Portada | Ciudad de Panamá al anochecer | Fotografía real | Elemaki · CC BY 3.0 (Wikimedia Commons) |
| Trabajo | Esclusas de Miraflores, Canal de Panamá | Fotografía real | GameOfLight · CC BY-SA 3.0 (Wikimedia Commons) |
| Movilidad | Toyota Hilux negra | Generada con IA | Recurso de Calcula Panamá |
| Finanzas | Oficina panorámica | Generada con IA | Recurso de Calcula Panamá |
| Hogar | Apartamento moderno | Generada con IA | Recurso de Calcula Panamá |
| Compras | Supermercado | Generada con IA | Recurso de Calcula Panamá |
| Educación | Biblioteca moderna | Generada con IA | Recurso de Calcula Panamá |
| Revista | Escritorio editorial | Generada con IA | Recurso de Calcula Panamá |

- Las seis imágenes de IA las entregó el CEO el 26-11-2026. Están en `prototipos/img/`, convertidas a AVIF y WebP en 800 y 1600 px: de 24 a 39 KB en móvil (AVIF).
- Cada pie indica «Imagen generada con IA» o «Fotografía real».
- La composición, la tipografía y la navegación no cambiaron. Solo se corrigió un error de CSS que solapaba el pie de foto en móvil.

**Observaciones para el CEO:**
- Se recibió una séptima imagen (equipo de seguridad industrial) que no figura en la lista. No se usó.
- El **apartamento** parece una fotografía real tomada con un móvil, con elementos personales: llaves, router y televisor encendido. Conviene confirmar su origen. Si es una foto real, hace falta el permiso de su autor o propietario, y el pie debería decir «Fotografía real».
- La **Hilux** muestra el logotipo de Toyota y el nombre «HILUX». En la sección de financiamiento podría sugerir una relación con la marca. Conviene confirmar si se acepta o si se prefiere una versión sin logotipo.

**Capturas de revisión:** `capturas/revision-2/`.
- La portada, sección por sección, en móvil (390 px @2x) y escritorio (1440 px).
- Salario neto, Modo Pasillo y el índice de navegación, recortados de las capturas existentes, sin volver a renderizarlos.

## Decisiones que requieren aprobación del CEO antes de generalizar

1. **Navegación:** eliminar la barra inferior y usar «Buscar» + «Índice» a pantalla completa. En el sitio real, el buscador del índice sería el existente (catálogo centralizado, sin peticiones).
2. **Tipografía:** Instrument Serif (OFL-1.1, 21 KB) + Inter Tight (OFL-1.1, 45 KB), servidas desde el propio sitio.
3. **Tema único oscuro:** el prototipo no tiene selector de tema. Habría que decidir si se mantiene la variante clara que existe hoy.
4. **Blue:** se retira por completo de la interfaz (portada, herramientas y Modo Pasillo). Hoy aporta ayuda contextual en 5 herramientas; esa ayuda pasaría a ser texto en el formulario y en la metodología.
5. **«El dato» en la portada:** usar una cifra del motor real como pieza editorial fija.
6. **Resultados como estado de cuenta** en todas las calculadoras.
7. **Imágenes:** entrega de los archivos aprobados y su licencia (ver arriba).

## Lo que no cambia al implementar

Motores y fórmulas, Modo Pasillo y Mi Quincena (lógica y datos), catálogo y buscador, guías, URL, SEO y datos estructurados, CSP estricta, política de publicidad (`active: false`) y aislamiento de Mi Quincena. Los prototipos usan cifras del motor real; no lo sustituyen.
