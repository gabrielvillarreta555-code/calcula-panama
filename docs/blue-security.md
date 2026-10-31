# Blue Security Lab: integración de solo lectura

El flujo `.github/workflows/blue-security.yml` ejecuta Gitleaks 8.24.2, OSV-Scanner 2.1.0 y dos comprobaciones acotadas de configuración en PR hacia `main`, cambios a `main`, semanalmente y manualmente. Las versiones de los binarios y de `actions/checkout` están fijadas; el instalador comprueba SHA-256 y versión antes de ejecutarlos. No se ejecuta `npm install` ni scripts de dependencias durante esta auditoría.

El trabajo usa `contents: read`, no conserva credenciales, no utiliza `pull_request_target` y no publica informes, fragmentos, rutas ni valores. El registro público solo identifica tres estados: comprobaciones completadas, requiere revisión o análisis incompleto. El estado de revisión no demuestra una vulnerabilidad explotable y una ejecución sin coincidencias no certifica seguridad. Para detalles, un mantenedor autorizado debe ejecutar la versión privada/local de Blue Security Lab y conservar los informes fuera del repositorio público.

OSV recibe metadatos de nombres y versiones de dependencias desde el lockfile. Gitleaks analiza el directorio de trabajo, no el historial Git; omite archivos mayores de 1 MiB y sus exclusiones incorporadas. Las comprobaciones de configuración del adaptador solo detectan `pull_request_target` y `permissions: write-all`. Semgrep, el análisis de flujo de datos y las cabeceras HTTP no se ejecutan aquí. El análisis no modifica código, dependencias ni datos de usuarios.

Las pruebas del adaptador pueden ejecutarse sin red:

```sh
python3 -m unittest discover -s tests -p 'test_blue_security_guard.py' -v
```

El adaptador y su instalador se mantienen en Blue Security Lab; su copia se revisa explícitamente en este repositorio para evitar permisos o secretos entre proyectos. Un PR puede modificar sus propios scripts o workflow, por lo que la señal aún no es una barrera confiable sin revisión obligatoria y protección de ramas. No se configuran esas políticas automáticamente.

**Activación:** este flujo no se ejecuta periódicamente en la rama principal hasta incorporarse y verificarse en GitHub. Incorporar cualquier cambio a `main` puede activar el flujo existente de publicación de GitHub Pages. Esta propuesta no cambia ni bloquea el despliegue y no debe fusionarse sin revisar esa consecuencia.
