# CP-SEO-003, entrega 2: publicación y verificación

**Fecha:** 27 de noviembre de 2026.

## Publicación

- **PR #49:** CI 5/5 en verde (pruebas, interfaz móvil, Firefox y Safari/iPhone, auditoría de dependencias y blue-guard).
- **Fusión:** `46d7c14`. Despliegue en GitHub Pages correcto.

## Verificación en producción

| Comprobación | Resultado |
|---|---|
| Sitemap (`sitemap.xml` y `sitemap-0.xml`) | 35 URLs, idénticas al build de `46d7c14` |
| Cada URL: 200, título, descripción, canónica propia, sin `noindex`, CSP estricta, un único H1, sin publicidad ni analítica, sin scripts externos, mismos enlaces internos que el build | **35/35 correctas** |
| Enlaces internos distintos | 38 comprobados, **0 rotos** |
| Salario mínimo, desde la portada (3.6), en iPhone 13 y escritorio | B/.3.02 por hora y B/.628.16 al mes (comercio al por menor, gran empresa, Región 1); trabajo doméstico B/.350.00 |
| Calendario de quincenas | 24 filas; sin desbordamiento |
| Décimo | Sección de la tercera partida visible, «martes 15 de diciembre de 2026» |
| Días hábiles | Feriados de diciembre de 2026 (incluido el lunes 21) |
| Terceros y errores de JavaScript | 0 y 0 en ambos dispositivos |
| Workflow «Validación de producción» (ejecución `46051177701`, `check_app: 0`) | Correcto |

## Search Console

**Páginas nuevas: solicitar la indexación.**

```
https://calculapanama.com/calculadoras/salario-minimo/
https://calculapanama.com/guias/calendario-de-quincenas-2027/
```

**Páginas actualizadas que sí justifican un nuevo rastreo:**

```
https://calculapanama.com/calculadoras/decimo-tercer-mes/
https://calculapanama.com/vida-cotidiana/dias-habiles-y-feriados/
```

- **Décimo:** contenido nuevo y urgente (pago del 15 de diciembre), con una pregunta frecuente nueva.
- **Días hábiles:** feriados de diciembre de 2026 y días puente.

**No hace falta** solicitarlo para la portada, `/herramientas/`, `/guias/`, salario neto ni horas extras: solo cambiaron enlaces o listas, y el rastreo normal y el sitemap los recogerán.
