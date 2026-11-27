import {
  MAX_ITEMS,
  lineSubtotalCents,
  normalizeItemName,
  parseMoneyToCents,
  parseQuantityToMilli,
  summarizeShopping,
  type ShoppingItem
} from './shopping';
import { formatMoney } from './format';
import { openSharePreview } from './share-ui';
import { buildShareText } from './share';
import { fxCopy, fxIcon, fxIconFrame } from './fx-icons';

const quantityText = (milli: number) => {
  const value = milli / 1000;
  return new Intl.NumberFormat('es-PA', { maximumFractionDigits: 3 }).format(value);
};

export function mountAisleMode(root: HTMLElement): () => void {
  const form = root.querySelector<HTMLFormElement>('#aisle-form');
  const list = root.querySelector<HTMLUListElement>('#aisle-list');
  const empty = root.querySelector<HTMLElement>('#aisle-empty');
  const error = root.querySelector<HTMLElement>('#aisle-error');
  const total = root.querySelector<HTMLElement>('[data-aisle-total]');
  const count = root.querySelector<HTMLElement>('[data-aisle-count]');
  const balance = root.querySelector<HTMLElement>('[data-aisle-balance]');
  const budgetInput = root.querySelector<HTMLInputElement>('#aisle-budget');
  const nameInput = root.querySelector<HTMLInputElement>('#aisle-name');
  const priceInput = root.querySelector<HTMLInputElement>('#aisle-price');
  const quantityInput = root.querySelector<HTMLInputElement>('#aisle-quantity');
  const clear = root.querySelector<HTMLButtonElement>('#aisle-clear');
  const submit = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  const meter = root.querySelector<HTMLProgressElement>('#aisle-meter');
  const decrease = root.querySelector<HTMLButtonElement>('#aisle-decrease');
  const increase = root.querySelector<HTMLButtonElement>('#aisle-increase');
  const blueHint = root.querySelector<HTMLElement>('[data-aisle-hint]');
  if (!form || !list || !empty || !error || !total || !count || !balance || !budgetInput || !nameInput || !priceInput || !quantityInput || !clear || !meter) return () => {};

  const meterElement = meter;
  let items: ShoppingItem[] = [];
  let budgetCents: number | null = null;
  let nextId = 1;
  let feedbackTimer = 0;
  const abort = new AbortController();
  const options = { signal: abort.signal };

  function announceError(message = '') {
    error!.textContent = message;
  }

  function parseBudget() {
    budgetCents = budgetInput!.value.trim() === '' ? null : parseMoneyToCents(budgetInput!.value);
  }

  function itemControl(label: string, value: string, inputMode: 'text' | 'decimal', onChange: (value: string) => void) {
    const wrapper = document.createElement('label');
    wrapper.className = 'aisle-edit';
    const text = document.createElement('span');
    text.textContent = label;
    const input = document.createElement('input');
    input.value = value;
    input.inputMode = inputMode;
    input.autocomplete = 'off';
    input.setAttribute('aria-label', label);
    input.addEventListener('change', () => {
      try { onChange(input.value); }
      catch (cause) {
        announceError(cause instanceof Error ? cause.message : 'Revisa el dato del producto.');
        renderItems();
      }
    }, options);
    wrapper.append(text, input);
    return wrapper;
  }

  function renderItems() {
    list!.replaceChildren();
    empty!.hidden = items.length > 0;
    clear!.hidden = items.length === 0;
    for (const item of items) {
      const row = document.createElement('li');
      row.className = 'aisle-item';
      row.dataset.itemId = item.id;
      const label = document.createElement('span');
      label.className = 'fx-row-label';
      const title = document.createElement('strong');
      title.textContent = item.name || 'Producto sin nombre';
      const unit = document.createElement('small');
      unit.textContent = `${formatMoney(item.priceCents / 100)} / unidad`;
      label.append(title, unit);
      const subtotal = document.createElement('strong');
      subtotal.className = 'aisle-line-total fx-line-total';
      subtotal.textContent = formatMoney(lineSubtotalCents(item.priceCents, item.quantityMilli) / 100);
      const productName = item.name || 'producto sin nombre';
      // Controles: cantidad editable con − y +, eliminar y edición de nombre y precio.
      const controls = document.createElement('div');
      controls.className = 'fx-aisle-controls';
      const qty = document.createElement('div');
      qty.className = 'fx-qty';
      const minus = document.createElement('button');
      minus.type = 'button'; minus.textContent = '−'; minus.setAttribute('aria-label', `Quitar una unidad de ${productName}`);
      minus.disabled = item.quantityMilli <= 1000;
      minus.addEventListener('click', () => updateItem(item.id, { quantityMilli: parseQuantityToMilli(String((item.quantityMilli - 1000) / 1000)) }), options);
      const plus = document.createElement('button');
      plus.type = 'button'; plus.textContent = '+'; plus.setAttribute('aria-label', `Añadir una unidad de ${productName}`);
      plus.addEventListener('click', () => updateItem(item.id, { quantityMilli: parseQuantityToMilli(String((item.quantityMilli + 1000) / 1000)) }), options);
      const quantityControl = itemControl('Cantidad', String(item.quantityMilli / 1000), 'decimal', value => updateItem(item.id, { quantityMilli: parseQuantityToMilli(value) }));
      const quantityField = quantityControl.querySelector('input')!;
      qty.append(minus, quantityField, plus);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'aisle-remove fx-trash';
      remove.setAttribute('aria-label', `Eliminar ${productName}`);
      remove.append(fxIcon('trash', 18));
      remove.addEventListener('click', () => {
        items = items.filter(current => current.id !== item.id);
        announceError();
        render();
      }, options);
      controls.append(qty, remove);
      const edit = document.createElement('details');
      edit.className = 'fx-aisle-edit';
      const summary = document.createElement('summary');
      summary.append(fxIcon('pencil', 16), 'Editar nombre y precio');
      const edits = document.createElement('div');
      edits.className = 'aisle-item-edits';
      edits.append(
        itemControl('Nombre', item.name, 'text', value => updateItem(item.id, { name: normalizeItemName(value) })),
        itemControl('Precio unitario', (item.priceCents / 100).toFixed(2), 'decimal', value => updateItem(item.id, { priceCents: parseMoneyToCents(value) }))
      );
      edit.append(summary, edits);
      row.append(fxIconFrame('box'), label, subtotal, controls, edit);
      list!.append(row);
    }
  }
  function updateItem(id: string, patch: Partial<ShoppingItem>) {
    try {
      items = items.map(item => item.id === id ? { ...item, ...patch } : item);
      announceError();
      render();
    } catch (cause) {
      announceError(cause instanceof Error ? cause.message : 'No se pudo actualizar el producto.');
      renderItems();
    }
  }

  function renderSummary() {
    try {
      const summary = summarizeShopping(items, budgetCents);
      const nearBudget = summary.budgetCents !== null && summary.budgetCents > 0 && summary.subtotalCents >= summary.budgetCents * 0.9;
      if (blueHint) blueHint.textContent = summary.overBudget ? 'Tu presupuesto está excedido.' : nearBudget ? 'Tu presupuesto está cerca del límite.' : summary.lineCount ? 'Tu total se actualiza con cada producto.' : 'Añade productos para ver tu total.';
      total!.textContent = formatMoney(summary.subtotalCents / 100);
      // Ticket de resumen y barra inferior (presentación del mismo resumen).
      const set = (selector: string, text: string) => root.querySelectorAll<HTMLElement>(selector).forEach(el => { el.textContent = text; });
      set('[data-aisle-dock-total]', formatMoney(summary.subtotalCents / 100));
      set('[data-aisle-receipt-total]', formatMoney(summary.subtotalCents / 100));
      set('[data-aisle-units]', quantityText(summary.quantityMilli));
      set('[data-aisle-lines]', `${summary.lineCount} ${summary.lineCount === 1 ? 'producto' : 'productos'}`);
      set('[data-aisle-budget-view]', summary.budgetCents === null ? 'Sin presupuesto' : formatMoney(summary.budgetCents / 100));
      set('[data-aisle-remaining]', summary.balanceCents === null ? '—' : summary.overBudget ? `−${formatMoney(Math.abs(summary.balanceCents) / 100)}` : formatMoney(summary.balanceCents / 100));
      count!.textContent = `${summary.lineCount} ${summary.lineCount === 1 ? 'producto' : 'productos'} · ${quantityText(summary.quantityMilli)} unidades`;
      root.classList.toggle('is-over-budget', summary.overBudget);
      if (summary.balanceCents === null) {
        balance!.textContent = 'Añade un presupuesto para ver el saldo';
        meterElement.hidden = true;
      } else {
        balance!.textContent = summary.overBudget
          ? `Excedido por ${formatMoney(Math.abs(summary.balanceCents) / 100)}`
          : `Disponible: ${formatMoney(summary.balanceCents / 100)}`;
        meterElement.hidden = false;
        meterElement.max = Math.max(1, summary.budgetCents ?? 1);
        meterElement.value = Math.min(summary.subtotalCents, meterElement.max);
      }
    } catch (cause) {
      announceError(cause instanceof Error ? cause.message : 'No se pudo calcular el total.');
    }
  }

  function render() {
    renderItems();
    renderSummary();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    try {
      if (items.length >= MAX_ITEMS) throw new Error(`La lista no puede superar ${MAX_ITEMS} productos.`);
      parseBudget();
      const item: ShoppingItem = {
        id: String(nextId++),
        name: normalizeItemName(nameInput.value),
        priceCents: parseMoneyToCents(priceInput.value),
        quantityMilli: parseQuantityToMilli(quantityInput.value)
      };
      items = [...items, item];
      nameInput.value = '';
      priceInput.value = '';
      quantityInput.value = '1';
      announceError();
      render();
      priceInput.focus({ preventScroll: true });
      root.classList.remove('aisle-added');
      void root.offsetWidth;
      root.classList.add('aisle-added');
      window.clearTimeout(feedbackTimer);
      feedbackTimer = window.setTimeout(() => root.classList.remove('aisle-added'), 700);
      form.dispatchEvent(new CustomEvent('calculator:result', { bubbles: true, detail: { status: 'success' } }));
    } catch (cause) {
      announceError(cause instanceof Error ? cause.message : 'Revisa los datos del producto.');
      form.dispatchEvent(new CustomEvent('calculator:result', { bubbles: true, detail: { status: 'invalid' } }));
    }
  }, options);
  if (submit) submit.disabled = false;

  function stepQuantity(direction: -1 | 1) {
    try {
      const current = parseQuantityToMilli(quantityInput!.value);
      const next = direction === 1 ? current + 1000 : current > 1000 ? current - 1000 : current;
      const value = String(next / 1000);
      parseQuantityToMilli(value);
      quantityInput!.value = value;
      announceError();
    } catch (cause) {
      announceError(cause instanceof Error ? cause.message : 'Revisa la cantidad.');
      quantityInput!.focus({ preventScroll: true });
    }
  }
  decrease?.addEventListener('click', () => stepQuantity(-1), options);
  increase?.addEventListener('click', () => stepQuantity(1), options);

  budgetInput.addEventListener('change', () => {
    try { parseBudget(); announceError(); renderSummary(); }
    catch (cause) { budgetCents = null; renderSummary(); announceError(cause instanceof Error ? cause.message : 'Revisa el presupuesto.'); }
  }, options);

  clear.addEventListener('click', () => {
    if (items.length && window.confirm('¿Vaciar toda la lista de compras?')) {
      items = [];
      announceError();
      render();
    }
  }, options);

  root.querySelector<HTMLButtonElement>('#aisle-copy')?.addEventListener('click', async () => {
    const status = root.querySelector<HTMLElement>('#aisle-action-status');
    if (!items.length) { if (status) status.textContent = 'Añade productos para copiar tu lista.'; return; }
    const shopping = summarizeShopping(items, null);
    const products = items.map(item => `${quantityText(item.quantityMilli)} × ${item.name || 'Producto sin nombre'}`);
    const text = buildShareText({ tool: 'aisle', primary: `Total de la compra: ${formatMoney(shopping.subtotalCents / 100)}`, products }, { includePrimary: true, includeDetails: false, selectedProducts: products.map((_, i) => i) });
    if (status) status.textContent = await fxCopy(text) ? 'Lista copiada.' : 'No se pudo copiar. Usa Compartir para ver el texto.';
  }, options);
  root.querySelector<HTMLButtonElement>('#aisle-dock-add')?.addEventListener('click', () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.querySelector('.aisle-entry')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    priceInput.focus({ preventScroll: true });
  }, options);
  const shareButton = root.querySelector<HTMLButtonElement>('#aisle-share');
  shareButton?.addEventListener('click', () => {
    const shopping = summarizeShopping(items, null);
    openSharePreview({ tool: 'aisle', primary: `Total de la compra: ${formatMoney(shopping.subtotalCents / 100)}`, products: items.map(item => `${quantityText(item.quantityMilli)} × ${item.name || 'Producto sin nombre'}`) }, shareButton);
  }, options);

  render();
  return () => { window.clearTimeout(feedbackTimer); abort.abort(); items = []; };
}
