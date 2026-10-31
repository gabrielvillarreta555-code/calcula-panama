# Revisión privada local de Blue Security Lab

El guard público crea informes temporales con `TemporaryDirectory` y los destruye al terminar: se diseñó para no publicar rutas, fragmentos ni posibles credenciales. Por eso el resultado de una ejecución anterior no puede recuperarse.

Esta rama añade una revisión **local e interactiva**, no un artefacto ni un almacén en GitHub:

1. En un equipo privado controlado por un mantenedor autorizado, sin grabación de terminal ni sesión compartida, preparar checkout y herramientas verificadas mediante `scripts/blue-security-install.sh`.
2. Ejecutar `python3 scripts/blue-private-review.py . DIRECTORIO_HERRAMIENTAS` fuera de CI.
3. El programa abre la terminal propietaria del proceso y mantiene en memoria durante un máximo de 300 segundos un resumen: indicador de configuración, cantidad de señales de secretos, cantidad e identificadores públicos GHSA/CVE de dependencias. Enter termina antes. No guarda el resumen ni publica artefactos.
4. Los informes crudos y redactados se crean dentro del directorio temporal privado del proceso y se eliminan al terminar el análisis. Los IDs permiten revisar los avisos de dependencias; el resumen no identifica archivos para evitar exponer rutas y contenidos. La investigación de una señal de secretos requiere que el mantenedor ejecute Gitleaks de forma controlada en su equipo privado.

La exclusividad depende de que el mantenedor use un sistema, cuenta, terminal y sesiones de registro realmente privados. Comprobar la propiedad del terminal no verifica la autorización organizacional. Un administrador del sistema, procesos del mismo usuario o una grabación de terminal pueden acceder a lo mostrado. No usar en runners compartidos, CI ni terminales grabadas. La retención de 300 segundos se refiere al resumen en memoria del proceso; el terminal puede conservar scrollback y debe limpiarse por el operador.

Un código 1 sigue siendo señal de revisión y 2 un error. El flujo público y sus comprobaciones no se desactivan.
