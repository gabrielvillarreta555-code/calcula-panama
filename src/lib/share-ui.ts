import { buildShareText, SHARE_TOOLS, whatsappShareUrl, type ShareData, type ShareOptions } from './share';

export function openSharePreview(data: ShareData, opener: HTMLElement) {
  if (document.querySelector('.share-dialog[open]')) return;
  const dialog = document.createElement('dialog'); dialog.className = 'share-dialog';
  dialog.setAttribute('aria-labelledby', 'share-dialog-title');
  dialog.innerHTML = '<div class="share-modal"><div class="share-header"><h2 id="share-dialog-title"></h2><button type="button" data-action="cancel" aria-label="Cerrar vista previa">×</button></div><p>Elige qué compartir. Nada se envía hasta que pulses una acción.</p><div class="share-options"></div><p class="share-warning">Comparte solo lo que quieras revelar. No incluyas nombres, cédulas ni datos personales en los productos.</p><h3>Vista previa exacta</h3><pre class="share-preview" aria-live="polite"></pre><p class="share-status" role="status"></p><div class="share-actions"><button class="share-whatsapp" type="button" data-action="whatsapp">Compartir por WhatsApp</button><button type="button" data-action="native">Compartir con otra aplicación</button><button type="button" data-action="copy">Copiar resumen</button><button type="button" data-action="cancel">Cancelar</button></div><p class="share-note">WhatsApp utiliza un enlace que contiene el texto elegido: tu navegador o WhatsApp podrían conservarlo. El menú nativo puede ser preferible para datos sensibles. Calcula Panamá no guarda un historial.</p></div>';
  const query = <T extends HTMLElement>(selector: string): T => { const el = dialog.querySelector<T>(selector); if (!el) throw new Error('No se pudo abrir la vista previa.'); return el; };
  query<HTMLElement>('#share-dialog-title').textContent = `Compartir ${SHARE_TOOLS[data.tool].title}`;
  const choices = query<HTMLElement>('.share-options');
  const options: ShareOptions = { includePrimary: false, includeDetails: false, selectedProducts: [] };
  const preview = query<HTMLElement>('.share-preview'), status = query<HTMLElement>('.share-status');
  const whatsapp = query<HTMLButtonElement>('[data-action="whatsapp"]');
  const checkbox = (label: string, change: (checked: boolean) => void) => {
    const wrap = document.createElement('label'); wrap.className = 'share-checkbox';
    const input = document.createElement('input'); input.type = 'checkbox';
    const text = document.createElement('span'); text.textContent = label; wrap.append(input, text);
    input.addEventListener('change', () => { change(input.checked); update(); }); choices.append(wrap);
  };
  if (data.primary) checkbox('Incluir el resultado principal', checked => { options.includePrimary = checked; });
  if (data.details?.length) checkbox('Incluir detalles adicionales (pueden contener importes)', checked => { options.includeDetails = checked; });
  if (data.products?.length) {
    const heading = document.createElement('h3'); heading.textContent = 'Productos que deseas incluir'; choices.append(heading);
    data.products.forEach((product, index) => checkbox(`Incluir producto: ${product}`, checked => { options.selectedProducts = checked ? [...options.selectedProducts, index] : options.selectedProducts.filter(n => n !== index); }));
  }
  const update = () => {
    const text = buildShareText(data, options); preview.textContent = text;
    whatsapp.disabled = whatsappShareUrl(text).length > 2000;
    status.textContent = whatsapp.disabled ? 'El resumen es muy largo para WhatsApp. Selecciona menos productos o utiliza copiar.' : '';
  };
  const copy = async (text: string) => {
    try { if (!navigator.clipboard?.writeText) throw new Error('No disponible'); await navigator.clipboard.writeText(text); return true; }
    catch {
      const input = document.createElement('textarea'); input.value = text; input.setAttribute('readonly', ''); input.className = 'share-copy-helper'; dialog.append(input); input.select();
      try { return document.execCommand('copy'); } catch { return false; } finally { input.remove(); }
    }
  };
  query<HTMLButtonElement>('[data-action="native"]').disabled = typeof navigator.share !== 'function';
  if (typeof navigator.share !== 'function') query<HTMLButtonElement>('[data-action="native"]').textContent = 'Compartir con otra aplicación (no disponible)';
  dialog.querySelectorAll<HTMLButtonElement>('[data-action="cancel"]').forEach(button => button.addEventListener('click', () => dialog.close()));
  whatsapp.addEventListener('click', () => { const url = whatsappShareUrl(buildShareText(data, options)); if (url.length <= 2000) window.open(url, '_blank', 'noopener,noreferrer'); });
  query<HTMLButtonElement>('[data-action="native"]').addEventListener('click', async () => { try { await navigator.share({ text: buildShareText(data, options) }); } catch (e) { if (!(e instanceof DOMException && e.name === 'AbortError')) status.textContent = 'No se pudo compartir. Puedes copiar el resumen.'; } });
  query<HTMLButtonElement>('[data-action="copy"]').addEventListener('click', async () => { status.textContent = await copy(buildShareText(data, options)) ? 'Resumen copiado.' : 'No se pudo copiar. Selecciona el texto de la vista previa y cópialo manualmente.'; });
  dialog.addEventListener('close', () => { dialog.remove(); opener.focus(); }, { once: true });
  document.body.append(dialog); update();
  if (typeof dialog.showModal !== 'function') { dialog.remove(); opener.focus(); return; }
  dialog.showModal(); query<HTMLButtonElement>('[data-action="cancel"]').focus();
}
