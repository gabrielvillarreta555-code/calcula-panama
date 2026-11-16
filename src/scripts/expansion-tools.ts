import { compareUnits, decimal, electricity, grades, promotion, savings, type Frequency, type Promotion, type Unit } from '../lib/tools/calculations';
const number = (n: number, digits = 2) => n.toLocaleString('es-PA', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const money = (n: number, digits = 2) => `B/.${number(n, digits)}`;
for (const root of document.querySelectorAll<HTMLElement>('[data-tool]')) {
  const form = root.querySelector<HTMLFormElement>('form')!;
  const error = root.querySelector<HTMLElement>('[data-error]')!;
  const result = root.querySelector<HTMLElement>('[data-result]')!;
  const details = root.querySelector<HTMLElement>('[data-details]')!;
  const placeholder = root.querySelector<HTMLElement>('[data-placeholder]')!;
  const rows = root.querySelector<HTMLElement>('[data-rows]');
  const prototype = rows?.querySelector<HTMLElement>('.tool-row')?.cloneNode(true) as HTMLElement | undefined;
  let nextId = 100;
  const field = (key: string, scope: ParentNode = form) => scope.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${key}"]`)!;
  const value = (key: string) => field(key).value;
  const num = (key: string, scope: ParentNode = form) => {
    const input = field(key, scope) as HTMLInputElement;
    try { return decimal(input.value, input.dataset.label ?? key, Number(input.dataset.digits ?? 3)); }
    catch (e) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', `${root.dataset.tool}-error`); throw e; }
  };
  error.id = `${root.dataset.tool}-error`;
  function invalidate() {
    result.replaceChildren(); details.replaceChildren(); placeholder.hidden = false; error.hidden = true;
    form.querySelectorAll('[aria-invalid]').forEach(el => { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); });
  }
  function rowButtons() {
    if (!rows) return;
    const list = rows.querySelectorAll<HTMLElement>('.tool-row');
    list.forEach((row, index) => {
      row.querySelector('legend')!.textContent = `${rows.dataset.label} ${index + 1}`;
      const button = row.querySelector<HTMLButtonElement>('[data-remove]')!;
      button.textContent = `Eliminar ${rows.dataset.label!.toLowerCase()} ${index + 1}`;
      button.disabled = list.length <= Number(rows.dataset.min);
    });
    root.querySelector<HTMLButtonElement>('[data-add]')!.disabled = list.length >= 20;
  }
  function syncPromotion() {
    if (root.dataset.tool !== 'discount') return;
    for (const key of ['discount', 'secondDiscount']) {
      const visible = key === 'secondDiscount' ? value('mode') === 'successive' : ['percent', 'successive', 'second'].includes(value('mode'));
      const input = field(key); input.disabled = !visible;
      input.closest<HTMLElement>('[data-field]')!.hidden = !visible;
    }
  }
  form.addEventListener('input', () => { invalidate(); syncPromotion(); });
  form.addEventListener('change', () => { invalidate(); syncPromotion(); });
  root.querySelector('[data-add]')?.addEventListener('click', () => {
    if (!prototype || !rows || rows.children.length >= 20) return;
    const row = prototype.cloneNode(true) as HTMLElement;
    row.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select').forEach(input => {
      const old = input.id; input.id = `extra-${nextId++}-${input.name}`;
      row.querySelector(`label[for="${old}"]`)!.setAttribute('for', input.id);
      input.value = input.tagName === 'SELECT' ? (input as HTMLSelectElement).options[0]!.value : '';
    });
    rows.append(row); rowButtons(); invalidate(); row.querySelector<HTMLInputElement>('input')!.focus();
  });
  rows?.addEventListener('click', event => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-remove]');
    if (!target || rows.children.length <= Number(rows.dataset.min)) return;
    target.closest('.tool-row')!.remove(); rowButtons(); invalidate(); root.querySelector<HTMLButtonElement>('[data-add]')!.focus();
  });
  form.addEventListener('reset', () => {
    if (rows) while (rows.children.length > Number(rows.dataset.min)) rows.lastElementChild!.remove();
    queueMicrotask(() => { invalidate(); syncPromotion(); rowButtons(); form.querySelector<HTMLInputElement>('input')?.focus(); });
  });
  const line = (text: string) => { const p = document.createElement('p'); p.textContent = text; result.append(p); };
  const table = (headers: string[], data: string[][], caption: string) => {
    const element = document.createElement('table'); element.className = 'tool-table';
    const cap = element.createCaption(); cap.textContent = caption;
    const head = element.createTHead().insertRow(); headers.forEach(text => { const th = document.createElement('th'); th.scope = 'col'; th.textContent = text; head.append(th); });
    const body = element.createTBody(); data.forEach(values => { const row = body.insertRow(); values.forEach(text => { row.insertCell().textContent = text; }); });
    return element;
  };
  form.addEventListener('submit', event => {
    event.preventDefault(); invalidate();
    try {
      switch (root.dataset.tool) {
        case 'unit': {
          const items = [...rows!.querySelectorAll('.tool-row')].map(row => ({ price: num('price', row), quantity: num('quantity', row), unit: field('unit', row).value as Unit }));
          const comparison = compareUnits(items);
          line(`${comparison.winners.length > 1 ? 'Empate entre productos' : 'Menor precio: producto'} ${comparison.winners.map(i => i + 1).join(', ')}.`);
          line(`Precio mínimo: ${money(comparison.best, 4)} por ${comparison.label}.`);
          details.append(table(['Producto', `Precio por ${comparison.label}`], comparison.values.map((n, i) => [`${i + 1}`, money(n, 4)]), 'Comparación de presentaciones'));
          break;
        }
        case 'discount': {
          const mode = value('mode') as Promotion;
          const r = promotion(num('price'), num('quantity'), mode, field('discount').disabled ? 0 : num('discount'), field('secondDiscount').disabled ? 0 : num('secondDiscount'));
          line(`Total con promoción: ${money(r.total)}`); line(`Sin promoción: ${money(r.original)}. Ahorro: ${money(r.saved)} (${number(r.effective)}%).`); line(`Promedio por unidad: ${money(r.perUnit, 4)}.`); break;
        }
        case 'savings': {
          const r = savings(num('goal'), num('saved'), value('start'), value('end'), value('frequency') as Frequency);
          line(r.remaining === 0 ? 'Tu ahorro inicial ya cubre la meta.' : `Aporte máximo por fecha: ${money(r.maximum)}`);
          line(`Faltan ${money(r.remaining)}. El calendario tiene ${r.plan.length} aportes; los importes suman exactamente lo pendiente.`);
          const section = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = 'Ver calendario de aportes'; section.append(summary);
          section.append(table(['Fecha', 'Aporte'], r.plan.map(p => [p.date.split('-').reverse().join('/'), money(p.amount)]), 'Plan sin intereses')); details.append(section); break;
        }
        case 'grades': {
          const r = grades([...rows!.querySelectorAll('.tool-row')].map(row => ({ score: num('score', row), weight: num('weight', row) })), num('scale'), num('target'));
          line(`${r.remaining < 1e-9 ? 'Nota final' : 'Promedio de lo evaluado'}: ${number(r.average)}`);
          line(`Peso evaluado: ${number(r.weight)}%. Puntos acumulados en la nota final: ${number(r.points)}.`);
          if (r.required === null) line(r.possible ? 'Con el 100% evaluado, alcanzas tu objetivo.' : 'Con el 100% evaluado, no alcanzas tu objetivo.');
          else if (!r.possible) line(`Objetivo no alcanzable: necesitarías ${number(r.required)} en el ${number(r.remaining)}% restante, por encima de la escala.`);
          else line(`Promedio necesario en el ${number(r.remaining)}% restante: ${number(Math.max(0, r.required))} (aproximado; confirma el redondeo de tu curso).`);
          break;
        }
        case 'energy': {
          const r = electricity(num('watts'), num('hours'), num('days'), num('duty'), value('rate').trim() ? num('rate') : undefined);
          line(`Consumo estimado: ${number(r.kwh, 3)} kWh`);
          line(r.cost === null ? 'Sin estimación de costo: no introdujiste un precio por kWh.' : `Costo orientativo de energía: ${money(r.cost)}.`);
          line('No incluye cargos fijos, subsidios, bloques tarifarios ni otros ajustes de la factura.'); break;
        }
      }
      placeholder.hidden = true;
    } catch (e) {
      result.replaceChildren(); details.replaceChildren(); error.textContent = e instanceof Error ? e.message : 'Revisa los datos.'; error.hidden = false; error.focus();
    }
  });
  rowButtons(); syncPromotion();
  root.querySelector<HTMLElement>('[data-nojs]')!.hidden = true;
  form.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled = false;
}
