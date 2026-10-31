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
  const meter = root.querySelector<HTMLProgressElement>('#aisle-meter');
  if (!form || !list || !empty || !error || !total || !count || !balance || !budgetInput || !nameInput || !priceInput || !quantityInput || !clear || !meter) return () => {};

  let items: ShoppingItem[] = [];
  let budgetCents: number | null = null;
  let nextId = 1;
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
    input.addEventListener('change', () => onChange(input.value), options);
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
      const top = document.createElement('div');
      top.className = 'aisle-item-top';
      const title = document.createElement('strong');
      title.textContent = item.name || 'Producto sin nombre';
      const subtotal = document.createElement('strong');
      subtotal.className = 'aisle-line-total';
      subtotal.textContent = formatMoney(lineSubtotalCents(item.priceCents, item.quantityMilli) / 100);
      top.append(title, subtotal);
      const edits = document.createElement('div');
      edits.className = 'aisle-item-edits';
      edits.append(
        itemControl('Nombre', item.name, 'text', value => updateItem(item.id, { name: normalizeItemName(value) })),
        itemControl('Precio unitario', (item.priceCents / 100).toFixed(2), 'decimal', value => updateItem(item.id, { priceCents: parseMoneyToCents(value) })),
        itemControl('Cantidad', String(item.quantityMilli / 1000), 'decimal', value => updateItem(item.id, { quantityMilli: parseQuantityToMilli(value) }))
      );
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'aisle-remove';
      remove.textContent = 'Eliminar';
      remove.setAttribute('aria-label', `Eliminar ${item.name || 'producto sin nombre'}`);
      remove.addEventListener('click', () => {
        items = items.filter(current => current.id !== item.id);
        announceError();
        render();
      }, options);
      row.append(top, edits, remove);
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
      total!.textContent = formatMoney(summary.subtotalCents / 100);
      count!.textContent = `${summary.lineCount} ${summary.lineCount === 1 ? 'producto' : 'productos'} · ${quantityText(summary.quantityMilli)} unidades`;
      root.classList.toggle('is-over-budget', summary.overBudget);
      if (summary.balanceCents === null) {
        balance!.textContent = 'Añade un presupuesto para ver el saldo';
        meter.hidden = true;
      } else {
        balance!.textContent = summary.overBudget
          ? `Excedido por ${formatMoney(Math.abs(summary.balanceCents) / 100)}`
          : `Disponible: ${formatMoney(summary.balanceCents / 100)}`;
        meter.hidden = false;
        meter.max = Math.max(1, summary.budgetCents ?? 1);
        meter.value = Math.min(summary.subtotalCents, meter.max);
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
      nameInput.focus();
      root.dispatchEvent(new CustomEvent('calculator:result', { bubbles: true, detail: { status: 'success' } }));
    } catch (cause) {
      announceError(cause instanceof Error ? cause.message : 'Revisa los datos del producto.');
      root.dispatchEvent(new CustomEvent('calculator:result', { bubbles: true, detail: { status: 'invalid' } }));
    }
  }, options);

  budgetInput.addEventListener('change', () => {
    try { parseBudget(); announceError(); renderSummary(); }
    catch (cause) { announceError(cause instanceof Error ? cause.message : 'Revisa el presupuesto.'); }
  }, options);

  clear.addEventListener('click', () => {
    if (items.length && window.confirm('¿Vaciar toda la lista de compras?')) {
      items = [];
      announceError();
      render();
    }
  }, options);

  render();
  return () => { abort.abort(); items = []; };
}
