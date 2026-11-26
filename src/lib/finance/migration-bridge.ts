/**
 * Puente del origen antiguo (calculapanama.com/finanzas/mi-quincena/). Solo se monta cuando
 * Mi Quincena ya vive en el origen de la app. Lee el presupuesto antiguo, ofrece una copia
 * descargable y lo traslada al origen de la app; lo borra aquí solo tras una confirmación verificada.
 */
import { BUDGET_KEY, MIGRATED_FLAG_KEY } from './storage-keys';
import { MIGRATION, confirmsTransfer, isImportResult, sha256Hex, type ImportResult } from './migration';

type Outcome = ImportResult | { status: 'timeout' | 'unavailable' };

function transfer(root: HTMLElement, appOrigin: string, payload: string, sha256: string, overwrite: boolean): Promise<Outcome> {
  return new Promise(resolve => {
    const id = crypto.randomUUID();
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.title = 'Traslado de Mi Quincena';
    frame.src = `${appOrigin}/importar/`;
    let timer = window.setTimeout(() => finish({ status: 'timeout' }), MIGRATION.timeoutMs);
    function onMessage(event: MessageEvent) {
      if (event.origin !== appOrigin || event.source !== frame.contentWindow) return;
      if (event.data?.type === MIGRATION.ready) {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => finish({ status: 'timeout' }), MIGRATION.timeoutMs);
        frame.contentWindow?.postMessage({ type: MIGRATION.data, version: MIGRATION.version, id, payload, sha256, overwrite }, appOrigin);
      } else if (isImportResult(event.data, id)) finish(event.data);
    }
    function finish(outcome: Outcome) {
      window.clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      frame.remove();
      resolve(outcome);
    }
    window.addEventListener('message', onMessage);
    frame.addEventListener('error', () => finish({ status: 'unavailable' }));
    root.append(frame);
  });
}

export function mountMigration(root: HTMLElement) {
  const appOrigin = root.dataset.appOrigin ?? '';
  const panel = root.querySelector<HTMLElement>('[data-migration-panel]');
  const done = root.querySelector<HTMLElement>('[data-migration-done]');
  const status = root.querySelector<HTMLElement>('[data-migration-status]');
  const move = root.querySelector<HTMLButtonElement>('[data-migration-move]');
  const download = root.querySelector<HTMLAnchorElement>('[data-migration-download]');
  if (!panel || !done || !status || !move || !download || !appOrigin) return;

  let payload: string | null = null;
  let flag: string | null = null;
  try { payload = localStorage.getItem(BUDGET_KEY); flag = localStorage.getItem(MIGRATED_FLAG_KEY); }
  catch { panel.hidden = false; move.disabled = true; status.textContent = 'No podemos leer el almacenamiento de este navegador, así que no sabemos si guardaste un presupuesto aquí.'; return; }
  if (payload === null) { done.hidden = flag === null; return; }

  panel.hidden = false;
  download.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  download.download = 'mi-quincena-copia.json';

  const run = async (overwrite: boolean): Promise<void> => {
    if (payload === null) return;
    move.disabled = true;
    status.textContent = 'Trasladando tu presupuesto…';
    const sent = payload;
    const sha256 = await sha256Hex(sent);
    const outcome = await transfer(root, appOrigin, sent, sha256, overwrite);
    if ('id' in outcome && confirmsTransfer(outcome, sha256)) {
      try {
        if (localStorage.getItem(BUDGET_KEY) !== sent) { status.textContent = 'Tu presupuesto cambió durante el traslado. Vuelve a intentarlo.'; move.disabled = false; return; }
        localStorage.removeItem(BUDGET_KEY);
        localStorage.setItem(MIGRATED_FLAG_KEY, new Date().toISOString().slice(0, 10));
        if (localStorage.getItem(BUDGET_KEY) !== null) throw new Error('No se pudo borrar');
      } catch {
        status.textContent = 'Tu presupuesto ya está en la nueva dirección, pero no pudimos borrar la copia antigua de este navegador. Vuelve a intentarlo.';
        move.disabled = false;
        return;
      }
      payload = null;
      panel.hidden = true;
      done.hidden = false;
      return;
    }
    if (outcome.status === 'exists') {
      const replace = window.confirm('En la nueva dirección ya hay un presupuesto distinto guardado en este navegador. ¿Quieres reemplazarlo por el de aquí? Si eliges Cancelar, los dos se conservan.');
      if (replace) return run(true);
      status.textContent = 'No se cambió nada: los dos presupuestos se conservan. Puedes descargar una copia de este.';
    } else if (outcome.status === 'invalid') {
      status.textContent = 'El presupuesto guardado aquí no tiene un formato válido, así que no se trasladó. Descarga una copia y repórtalo desde Contacto.';
    } else {
      status.textContent = 'No se pudo completar el traslado. Tu presupuesto sigue guardado en este navegador; inténtalo más tarde o descarga una copia.';
    }
    move.disabled = false;
  };
  move.addEventListener('click', () => { void run(false); });
}
