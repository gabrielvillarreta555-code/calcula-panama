import { CATEGORIES, MAX_MOVEMENTS, civilDay, emptyBudget, isBudgetState, localToday, newPeriod, parseCents, summarizeBudget, type BudgetState, type Category, type Movement } from './pay-period';

const KEY = 'cp-mi-quincena-v1';
const money = (cents: number) => `B/.${(cents / 100).toFixed(2)}`;
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Revisa los datos.';

export function mountBudget(root: HTMLElement) {
  const get = <T extends HTMLElement>(selector: string): T => {
    const element = root.querySelector<T>(selector);
    if (!element) throw new Error(`Falta ${selector}`);
    return element;
  };
  const start = get<HTMLInputElement>('#budget-start'), payday = get<HTMLInputElement>('#budget-payday');
  const opening = get<HTMLInputElement>('#budget-opening'), savings = get<HTMLInputElement>('#budget-savings');
  const name = get<HTMLInputElement>('#move-name'), amount = get<HTMLInputElement>('#move-amount');
  const category = get<HTMLSelectElement>('#move-category'), kind = get<HTMLSelectElement>('#move-kind');
  const date = get<HTMLInputElement>('#move-date'), recurring = get<HTMLInputElement>('#move-recurring');
  const list = get<HTMLUListElement>('#movement-list'), storageStatus = get<HTMLElement>('#storage-status');
  const periodError = get<HTMLElement>('#period-error'), savingsError = get<HTMLElement>('#savings-error');
  const movementError = get<HTMLElement>('#movement-error');
  let state: BudgetState = emptyBudget();
  let preserveCorrupt = false;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (!isBudgetState(parsed)) throw new Error('Datos inválidos');
      state = parsed;
    }
    storageStatus.textContent = 'Los cambios se guardan en este navegador.';
  } catch {
    preserveCorrupt = true;
    storageStatus.textContent = 'No se pudieron recuperar los datos guardados. Puedes eliminar los datos y empezar de nuevo; mientras tanto, este plan solo estará en memoria.';
  }
  const persist = () => {
    if (preserveCorrupt) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageStatus.textContent = 'Los cambios se guardan en este navegador.'; }
    catch { storageStatus.textContent = 'No se pudo guardar. Tu plan solo estará disponible durante esta visita.'; }
  };
  const output = (key: string, value: string) => { get<HTMLElement>(`[data-result="${key}"]`).textContent = value; };
  const syncInputs = () => { start.value = state.start; payday.value = state.payday; opening.value = (state.openingCents / 100).toFixed(2); savings.value = (state.savingsCents / 100).toFixed(2); };
  const renderSummary = () => {
    let valid = true;
    periodError.textContent = ''; savingsError.textContent = '';
    try { civilDay(start.value); if (payday.value) civilDay(payday.value); state.start = start.value; state.payday = payday.value; }
    catch (e) { periodError.textContent = errorMessage(e); valid = false; }
    try { state.openingCents = parseCents(opening.value); }
    catch (e) { periodError.textContent = errorMessage(e); valid = false; }
    try { state.savingsCents = parseCents(savings.value); }
    catch (e) { savingsError.textContent = errorMessage(e); valid = false; }
    const alert = get<HTMLElement>('#budget-alert'), blue = get<HTMLElement>('[data-blue-message]');
    if (!valid || !state.payday) {
      for (const key of ['free', 'daily', 'days', 'pending', 'savings', 'opening', 'paid', 'current']) output(key, '—');
      alert.textContent = valid ? 'Elige la fecha de tu próximo pago para ver el resumen.' : 'Corrige los datos para ver el resumen.';
      blue.textContent = 'Completa las fechas y los importes para empezar tu plan.';
      if (valid) persist();
      return;
    }
    try {
      const result = summarizeBudget(state);
      output('free', money(result.freeCents)); output('daily', result.dailyCents === null ? '—' : money(result.dailyCents)); output('days', String(result.days));
      output('pending', money(result.pendingCents)); output('savings', money(result.savingsCents)); output('opening', money(state.openingCents)); output('paid', money(result.paidCents)); output('current', money(result.currentCents));
      if (result.past) alert.textContent = 'La fecha de pago es hoy o ya pasó. Actualiza tu próximo período.';
      else if (result.currentCents < result.pendingCents) alert.textContent = 'Los compromisos pendientes superan el saldo actual. Revisa tu plan con calma.';
      else if (result.freeCents < 0) alert.textContent = 'Los compromisos y el ahorro superan el saldo actual. Puedes ajustar tu plan.';
      else if (result.freeCents === 0) alert.textContent = 'No queda dinero libre después de tus reservas.';
      else if (result.dailyCents !== null && result.dailyCents < 100) alert.textContent = 'Tu presupuesto diario es menor de B/.1.00. Revisa si necesitas ajustar alguna reserva.';
      else alert.textContent = 'Tu presupuesto diario se redondea hacia abajo para no asignar más de lo disponible.';
      blue.textContent = result.freeCents <= 0 ? 'Revisemos las reservas para hacer espacio en tu plan.' : 'Vas bien: revisa tu plan cuando cambien tus gastos.';
      persist();
    } catch (e) { for (const key of ['free', 'daily', 'days', 'pending', 'savings', 'opening', 'paid', 'current']) output(key, '—'); periodError.textContent = errorMessage(e); alert.textContent = 'Corrige las fechas para ver el resumen.'; }
  };
  const button = (label: string, action: () => void) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', action); return b; };
  const renderList = () => {
    // Los movimientos deben persistir incluso si el formulario de fechas está incompleto.
    persist();
    list.replaceChildren();
    get<HTMLElement>('#movement-count').textContent = String(state.movements.length);
    get<HTMLElement>('#movement-empty').hidden = state.movements.length > 0;
    state.movements.forEach(item => {
      const li = document.createElement('li'); li.className = 'budget-item';
      const title = document.createElement('strong'); title.textContent = item.name;
      const total = document.createElement('strong'); total.textContent = money(item.cents);
      const top = document.createElement('div'); top.className = 'budget-item-top'; top.append(title, total);
      const details = document.createElement('p'); details.textContent = `${CATEGORIES[item.category]} · ${item.kind === 'deuda' ? 'Deuda' : 'Gasto'} · ${item.status === 'pagado' ? 'Pagado' : 'Pendiente'}${item.date ? ` · ${item.date}` : ''}${item.recurring ? ' · Recurrente' : ''}`;
      const actions = document.createElement('div'); actions.className = 'budget-item-actions';
      actions.append(button(item.status === 'pagado' ? 'Marcar pendiente' : 'Marcar pagado', () => { item.status = item.status === 'pagado' ? 'pendiente' : 'pagado'; renderList(); renderSummary(); }), button('Editar', () => editItem(li, item)), button('Eliminar', () => { state.movements = state.movements.filter(m => m.id !== item.id); renderList(); renderSummary(); }));
      li.append(top, details, actions); list.append(li);
    });
  };
  function editItem(li: HTMLLIElement, item: Movement) {
    if (li.querySelector('form')) return;
    const form = document.createElement('form'); form.className = 'budget-edit';
    const field = (labelText: string, input: HTMLInputElement | HTMLSelectElement) => { const label = document.createElement('label'); label.textContent = labelText; label.append(input); form.append(label); };
    const editName = document.createElement('input'); editName.value = item.name; editName.maxLength = 80; field('Nombre', editName);
    const editAmount = document.createElement('input'); editAmount.value = (item.cents / 100).toFixed(2); editAmount.inputMode = 'decimal'; field('Importe en B/.', editAmount);
    const editCategory = document.createElement('select'); for (const [value, text] of Object.entries(CATEGORIES)) editCategory.add(new Option(text, value)); editCategory.value = item.category; field('Categoría', editCategory);
    const editKind = document.createElement('select'); editKind.add(new Option('Gasto', 'gasto')); editKind.add(new Option('Deuda', 'deuda')); editKind.value = item.kind; field('Tipo', editKind);
    const editDate = document.createElement('input'); editDate.type = 'date'; editDate.value = item.date; field('Fecha prevista', editDate);
    const editRecurring = document.createElement('input'); editRecurring.type = 'checkbox'; editRecurring.checked = item.recurring; field('Recurrente', editRecurring);
    const error = document.createElement('p'); error.className = 'budget-error'; error.setAttribute('role', 'alert'); form.append(error);
    const save = document.createElement('button'); save.type = 'submit'; save.textContent = 'Guardar'; form.append(save, button('Cancelar', () => form.remove()));
    form.addEventListener('submit', event => { event.preventDefault(); try { const cleanName = editName.value.trim(); if (!cleanName) throw new Error('Escribe un nombre.'); const cents = parseCents(editAmount.value); if (cents === 0) throw new Error('El importe debe ser mayor que cero.'); if (editDate.value) civilDay(editDate.value); Object.assign(item, { name: cleanName, cents, category: editCategory.value as Category, kind: editKind.value as Movement['kind'], date: editDate.value, recurring: editRecurring.checked }); renderList(); renderSummary(); } catch (e) { error.textContent = errorMessage(e); } });
    li.append(form); editName.focus();
  }
  get<HTMLFormElement>('#period-form').addEventListener('submit', e => e.preventDefault());
  for (const field of [start, payday, opening, savings]) field.addEventListener('input', renderSummary);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) renderSummary(); });
  get<HTMLFormElement>('#movement-form').addEventListener('submit', event => {
    event.preventDefault(); movementError.textContent = '';
    try {
      if (state.movements.length >= MAX_MOVEMENTS) throw new Error('Se alcanzó el máximo de 200 movimientos.');
      const cleanName = name.value.trim(); if (!cleanName) throw new Error('Escribe un nombre para el movimiento.');
      const cents = parseCents(amount.value); if (cents === 0) throw new Error('El importe debe ser mayor que cero.');
      if (date.value) civilDay(date.value);
      const id = globalThis.crypto.randomUUID();
      state.movements.push({ id, name: cleanName, cents, category: category.value as Category, date: date.value, kind: kind.value as Movement['kind'], status: 'pendiente', recurring: recurring.checked });
      name.value = ''; amount.value = ''; date.value = ''; recurring.checked = false; renderList(); renderSummary(); name.focus();
    } catch (e) { movementError.textContent = errorMessage(e); }
  });
  get<HTMLButtonElement>('#unexpected').addEventListener('click', () => { name.value = 'Gasto imprevisto'; kind.value = 'gasto'; amount.focus(); });
  get<HTMLButtonElement>('#new-period').addEventListener('click', () => { if (!confirm('¿Iniciar un período nuevo? Se retirarán los movimientos anteriores, excepto los recurrentes si eliges conservarlos.')) return; state = newPeriod(state, localToday(), get<HTMLInputElement>('#keep-recurring').checked); syncInputs(); renderList(); renderSummary(); });
  get<HTMLButtonElement>('#delete-data').addEventListener('click', () => { if (!confirm('¿Eliminar todos los datos de Mi Quincena guardados en este navegador?')) return; try { localStorage.removeItem(KEY); preserveCorrupt = true; state = emptyBudget(); syncInputs(); renderList(); renderSummary(); preserveCorrupt = false; storageStatus.textContent = 'Datos eliminados de este navegador. Los nuevos cambios se guardarán aquí.'; } catch { storageStatus.textContent = 'No se pudo acceder al almacenamiento; no podemos confirmar la eliminación.'; } });
  syncInputs(); renderList(); renderSummary();
}
