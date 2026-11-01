# Protección del origen que contiene Mi Quincena

## Medida propuesta

Se pausa la carga y el renderizado de publicidad en todas las páginas y en la página 404 del mismo origen; la política CSP bloquea scripts de otros orígenes y conexiones de red desde las páginas. La comprobación de compilación y las pruebas de navegador vigilan la medida. `ads.txt` y el identificador existente se conservan sin activar anuncios. La CSP es una defensa adicional, no aislamiento entre scripts del mismo origen ni una garantía frente a extensiones, una cuenta comprometida o código malicioso servido desde el propio sitio.

## Preservación de presupuestos

No se cambia `cp-mi-quincena-v1`, su estructura, su origen ni el código de lectura/escritura. No hay migración ni eliminación automática; el usuario mantiene el control de los botones existentes. Las pruebas recuperan un presupuesto v1 sintético y comprueban su contenido al navegar por el sitio, incluida la página 404. No se requiere consentimiento de migración porque no se trasladan ni borran datos. Antes de la integración, realizar también una prueba manual en un navegador de prueba con datos ficticios, conservando una copia propia si se desea.

## Limitaciones de despliegue y vuelta atrás

Esta rama no cambia producción. Cuando se integre y publique, una pestaña antigua que ya cargó publicidad, o una versión HTML antigua en caché, puede seguir ejecutando el código anterior: cerrar o recargar todas las pestañas del sitio y esperar la expiración de caché sin borrar los datos del navegador. Esta solución no revoca lecturas o transferencias que pudieran haber ocurrido antes. La reversión del código restauraría la carga de publicidad y el riesgo de acceso al mismo origen; no debe realizarse sin una evaluación específica. Una reversión no requiere borrar ni transformar la clave v1.

Reactivar anuncios exige separar de verdad el almacenamiento financiero de cualquier origen que ejecute scripts publicitarios, evaluar migración con consentimiento y reversión, comprobar las obligaciones de privacidad y contar con autorización explícita. Un subdominio u origen diferente implica diseñar cuidadosamente la migración; la misma clave no se traslada automáticamente. No se propone migración ni publicidad en esta versión.
