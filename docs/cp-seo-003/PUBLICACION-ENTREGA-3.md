# CP-SEO-003, entrega 3 (Vivienda): publicación y verificación

**Fecha:** 27 de noviembre de 2026.

## Publicación

- **PR #51:** CI 5/5 en verde (pruebas, interfaz móvil, Firefox y Safari/iPhone, auditoría de dependencias y blue-guard).
- **Fusión:** `845dbc2`. Despliegue correcto.

## Verificación en producción

| Comprobación | Resultado |
|---|---|
| Sitemap | 40 URLs, idénticas al build de `845dbc2` |
| Cada URL comparada con el build: título, descripción, canónica, robots, CSP, H1, sin publicidad ni scripts externos, enlaces | **40/40 correctas**; 43 enlaces internos distintos, 0 rotos |
| iPhone 13, clic desde la portada (Hogar → Hipoteca) | Tramo 3: B/.391.17 durante 84 meses y luego B/.573.54; sin desbordamiento |
| Capacidad de compra | Letra máxima de B/.300.00 en el ejemplo |
| Alquilar o comprar | Resultado a 10 años |
| Guía de gastos | Dice que el ITBI corresponde al vendedor; escala hasta 1.80% |
| Terceros y errores de JavaScript | 0 y 0 |
| Workflow «Validación de producción» (ejecución `46057932391`) | Correcto |

## Search Console: solicitar la indexación

```
https://calculapanama.com/vivienda/calculadora-de-hipoteca/
https://calculapanama.com/vivienda/capacidad-de-compra/
https://calculapanama.com/guias/gastos-de-comprar-vivienda/
https://calculapanama.com/vivienda/alquilar-o-comprar/
```

Ninguna página actualizada necesita un nuevo rastreo: la portada, el directorio, el colofón y Préstamos solo ganaron enlaces, que el sitemap y el rastreo normal recogerán.

## Pendiente

Tramos 1 y 2 del interés preferencial: se publicarán cuando se disponga del texto oficial de la Ley 468 de 2025 (Gaceta Oficial 30264-A).
