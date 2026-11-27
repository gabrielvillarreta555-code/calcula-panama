# CP-TOOL-008: propuesta de persistencia local del registro de jornadas

**Estado:** propuesta para aprobación. **No implementada.** Hoy el registro vive solo en la memoria de la pestaña y se exporta en CSV.

## 1. Por qué no se guarda en calculapanama.com

- `localStorage` es común a **todo el origen** `https://calculapanama.com`.
- La política de publicidad (`ad-policy.json`) está en pausa justamente porque un script publicitario en cualquier página del dominio podría leer lo guardado (ver `pausedReason`).
- Un registro de horas extras contiene **salario, horarios, días trabajados y feriados**: es información financiera y laboral personal.
- Guardarlo en el dominio principal **ampliaría el problema** que CP-ADS-003 resolvió trasladando Mi Quincena a otro origen.

**Regla propuesta:** el dominio principal nunca escribe datos salariales. Una prueba e2e lo comprueba, igual que hoy con Mi Quincena (`test:isolation`).

## 2. Dónde sí: el origen aislado `app.calculapanama.com`

Es la misma arquitectura de CP-ADS-003:
- origen propio;
- sin publicidad ni terceros;
- CSP estricta con `connect-src 'none'`;
- `noindex`;
- `verify:app` comprueba que no haya recursos externos.

| Pieza | Propuesta |
|---|---|
| Ruta | `https://app.calculapanama.com/horas-extras/`. La página pública de `calculapanama.com` conserva el cálculo y el contenido editorial, y ofrece «Guardar mi registro», que lleva a la app |
| Clave | `cp-horas-extras-v1`, solo en el origen de la app |
| Consentimiento | Casilla «Guardar en este dispositivo», **desmarcada por defecto**. Sin ella, todo sigue en memoria |
| Minimización | Se guardan jornadas y ajustes. El **salario es opcional**: casilla «Recordar mi salario», desmarcada; si no se recuerda, se pide al abrir. Nunca se piden nombre, cédula, empresa, número de empleado ni datos bancarios |
| Caducidad | `expiresAt` = fin del período + 60 días. Al abrir, se borra lo vencido y se avisa |
| Control | Botón «Eliminar datos guardados» (como Mi Quincena) y estado visible del almacenamiento: guardado, solo en memoria (navegación privada o bloqueo) o error |
| Límites | Hasta 500 jornadas y 100 KB. Si el contenido guardado está dañado, no se ejecuta: se descarta con aviso |
| Exportar e importar | CSV como hoy, más **importar CSV** para pasar un registro entre dispositivos sin servidor |
| Paso de datos entre dominios | No hace falta: hoy no hay datos guardados en el dominio principal |

### Formato

```json
{
  "version": 1,
  "savedAt": "2026-11-27T10:00:00Z",
  "expiresAt": "2027-01-29",
  "settings": { "basis": "monthly", "weeklyHours": 48, "period": "fortnightly", "salary": null },
  "entries": [
    { "id": "j1", "date": "2026-11-02", "start": "07:00", "end": "17:00", "breakMinutes": 60, "dayKind": "normal",
      "contractStart": "07:00", "contractEnd": "15:00" }
  ]
}
```

La lectura pasa por la misma validación del motor (`calculateLog`). Una jornada inválida se muestra como error y no se pierde en silencio.

## 3. Dependencias y orden

1. **Bloqueante:** activar `app.calculapanama.com` en Cloudflare Pages (pendiente de CP-ADS-004, acción del CEO).
2. Copiar la página de la herramienta a `app/` con la variante funcional, igual que se hizo con `app/pages/quincena/`.
3. Módulo `overtime-storage.ts`:
   - funciones `load`, `save` y `clear`;
   - validación;
   - caducidad;
   - pruebas unitarias.
4. Pruebas:
   - e2e en el origen aislado: guarda solo con consentimiento, borra, caduca y descarta datos dañados;
   - e2e de aislamiento: el dominio principal no escribe la clave;
   - `verify:app` sin terceros.
5. Publicar a la vez que la calculadora, con autorización del CEO.

## 4. Alternativa mientras la app no esté activa

Mantener el estado actual: memoria y CSV. Como mejora, añadir **importar CSV** en la página pública, que no guarda nada. Así se puede continuar un registro otro día sin almacenar datos en el dominio principal.

## 5. Riesgos

| Riesgo | Mitigación |
|---|---|
| Dispositivo compartido | Consentimiento explícito, salario no recordado por defecto, caducidad y botón de borrado |
| Navegación privada o almacenamiento bloqueado | Aviso «solo en memoria», como en Mi Quincena |
| Datos manipulados en el almacenamiento | Validación estricta y límites de tamaño. Nunca se interpreta como HTML |
| Publicidad futura en el dominio principal | Los datos no existen en ese origen |
