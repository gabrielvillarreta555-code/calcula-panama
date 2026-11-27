/**
 * Interfaz de la calculadora de horas extras (CP-TOOL-008). Solo presentación y estado en memoria: los cálculos
 * están en overtime.ts. No usa almacenamiento local ni envía datos (el registro vive mientras la pestaña esté abierta).
 */
import {
  calculateLog, calculateQuick, DAY_LABELS, formatMinutes, holidayName, hourlyRate, legalWeeklyHours, toCsv,
  type Bucket, type DayKind, type LogResult, type PayBasis, type PeriodKind, type QuickDay, type QuickOvertime,
  type Settings, type ShiftEntry, type ShiftType, type Alert, type Conditional
} from './overtime';
import { formatMoney } from './format';
import { fxCopy, fxIcon, fxIconFrame, fxPulse } from './fx-icons';
import { bindShare } from './ui';
import { buildShareText, type ShareData } from './share';

const PERIOD_LABEL: Record<PeriodKind, string> = { weekly: 'Salario de la semana', fortnightly: 'Salario de la quincena', monthly: 'Salario del mes' };
const TYPE_LABEL: Record<ShiftType, string> = { diurna: 'Diurna', mixta: 'Mixta', nocturna: 'Nocturna' };
const weekday = new Intl.DateTimeFormat('es-PA', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const hoursText = (minutes: number) => formatMinutes(minutes);

/** Convierte «1,234.50» o «1234,5» en número; vacío → undefined. */
export function parseAmount(raw: string): number | undefined {
  const text = raw.trim().replace(/\s/g, '');
  if (!text) return undefined;
  const normalized = /,\d{1,2}$/.test(text) && !text.includes('.') ? text.replace(',', '.') : text.replace(/,/g, '');
  if (!/^\d+(\.\d+)?$/.test(normalized)) return Number.NaN;
  return Number(normalized);
}

export function mountOvertime(root: HTMLElement) {
  const $ = <T extends Element = HTMLElement>(s: string) => root.ownerDocument.querySelector<T>(s)!;
  const settingsForm = $<HTMLFormElement>('#ot-settings');
  const quickForm = $<HTMLFormElement>('#ot-quick-form');
  const entryForm = $<HTMLFormElement>('#ot-entry-form');
  const out = (key: string, value: string) => root.ownerDocument.querySelectorAll(`[data-ot="${key}"]`).forEach(el => { el.textContent = value; });
  const status = $('#ot-status');

  let entries: ShiftEntry[] = [];
  let editing: string | null = null;
  let weeklyTouched = false;
  let lastLog: LogResult | null = null;
  let shareData: ShareData = { tool: 'overtime' };
  let seq = 0;
  const newId = () => `j${Date.now().toString(36)}${(seq++).toString(36)}`;

  const mode = () => (root.ownerDocument.querySelector<HTMLInputElement>('input[name="ot-mode"]:checked')?.value ?? 'quick') as 'quick' | 'log';

  function readSettings(): { settings?: Settings; error?: string } {
    const data = new FormData(settingsForm);
    const salary = parseAmount(String(data.get('salary') ?? ''));
    const weekly = parseAmount(String(data.get('weekly') ?? ''));
    const basis = String(data.get('basis') ?? 'monthly') as PayBasis;
    const period = $<HTMLSelectElement>('#ot-period').value as PeriodKind;
    if (salary === undefined) return { error: '' };
    if (!Number.isFinite(salary) || salary <= 0) return { error: 'Escribe un salario mayor que cero.' };
    if (basis !== 'hourly' && (weekly === undefined || !Number.isFinite(weekly) || weekly <= 0 || weekly > 168)) return { error: 'Las horas ordinarias por semana deben estar entre 1 y 168.' };
    return { settings: { salary, basis, weeklyHours: weekly ?? 48, period } };
  }

  /* ------------------------------------------------------------------ Resultado principal compartido */

  function renderHero(o: { total: number | null; caption: string; extraMinutes: number | null; hourly: number | null; buckets: { label: string; value: number }[]; alerts: Alert[]; conditional?: Conditional[] }) {
    out('total', o.total === null ? 'B/. —' : formatMoney(o.total));
    // Las estimaciones condicionadas se señalan junto a la cifra y se explican en la lista de avisos.
    const conditional = o.total !== null && (o.conditional?.length ?? 0) > 0;
    const badge = $('#ot-conditional'); badge.hidden = !conditional;
    out('caption', o.caption);
    out('extraHours', o.extraMinutes === null ? '—' : hoursText(o.extraMinutes));
    out('hourly', o.hourly === null ? '—' : formatMoney(o.hourly));
    const split = $('#ot-split'), legend = $('#ot-legend');
    split.replaceChildren(); legend.replaceChildren();
    const total = o.buckets.reduce((a, b) => a + b.value, 0);
    o.buckets.filter(b => b.value > 0).forEach((b, i) => {
      const tone = (i % 6) + 1;
      const bar = document.createElement('span'); bar.className = `fx-tone-${tone}`; bar.style.flex = String(b.value); split.append(bar);
      const li = document.createElement('li'), dot = document.createElement('i'); dot.className = `fx-tone-${tone}`;
      li.append(dot, `${b.label} ${total ? Math.round((b.value / total) * 100) : 0}%`); legend.append(li);
    });
    split.setAttribute('aria-label', o.buckets.length ? o.buckets.map(b => `${b.label}: ${formatMoney(b.value)}`).join('; ') : 'Sin datos');
    split.hidden = legend.hidden = !o.buckets.length;
    const list = $('#ot-alerts'); list.replaceChildren();
    for (const alert of dedupeAlerts(o.alerts)) {
      const li = document.createElement('li'); li.className = `is-${alert.level}`;
      li.append(fxIcon(alert.level === 'info' ? 'info' : 'alert', 18));
      const span = document.createElement('span'); span.textContent = alert.message; li.append(span);
      list.append(li);
    }
    for (const c of (o.total === null ? [] : o.conditional ?? [])) {
      const li = document.createElement('li'); li.className = 'is-conditional'; li.dataset.conditional = c.code;
      li.append(fxIcon('info', 18));
      const span = document.createElement('span'); span.textContent = c.message; li.append(span);
      list.append(li);
    }
    fxPulse($('#ot-hero'));
  }

  function dedupeAlerts(alerts: Alert[]): Alert[] {
    const seen = new Set<string>(); const order = { error: 0, warn: 1, info: 2 } as const;
    return [...alerts].sort((a, b) => order[a.level] - order[b.level]).filter(a => { const k = `${a.code}|${a.message}`; if (seen.has(k)) return false; seen.add(k); return true; });
  }

  /* ------------------------------------------------------------------ Modo rápido */

  function runQuick() {
    const err = $('#ot-quick-error'), rows = $('#ot-quick-rows');
    err.textContent = ''; $('#ot-settings-error').textContent = '';
    const { settings, error } = readSettings();
    const data = new FormData(quickForm);
    const hours = parseAmount(String(data.get('hours') ?? '')) ?? 0, minutes = parseAmount(String(data.get('minutes') ?? '')) ?? 0;
    const clear = (caption: string) => { rows.hidden = true; renderHero({ total: null, caption, extraMinutes: null, hourly: null, buckets: [], alerts: [] }); shareData = { tool: 'overtime' }; };
    if (error) { $('#ot-settings-error').textContent = error; return clear('Corrige tu salario para ver el cálculo.'); }
    if (!settings) return clear('Escribe tu salario y tus horas para ver el cálculo.');
    if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || minutes < 0 || minutes > 59) { err.textContent = 'Usa horas enteras y de 0 a 59 minutos.'; return clear('Corrige las horas para ver el cálculo.'); }
    const total = hours * 60 + minutes;
    if (total === 0) { rows.hidden = true; return renderHero({ total: null, caption: 'Indica cuántas horas trabajaste.', extraMinutes: null, hourly: safeHourly(settings), buckets: [], alerts: [] }); }
    try {
      const overtime = String(data.get('overtime')) as QuickOvertime, day = String(data.get('day')) as QuickDay;
      const r = calculateQuick({ ...settings, minutes: total, overtime, day, overLimit: data.get('overLimit') === 'on' });
      out('qHourly', formatMoney(r.hourly)); out('qHourValue', formatMoney(r.hourValue)); out('qParts', r.parts.join(' · '));
      out('qSurcharge', formatMoney(r.surcharge)); out('qTotal', formatMoney(r.total));
      rows.hidden = false;
      const alerts: Alert[] = [];
      if (overtime !== 'none' && total > 180 && data.get('overLimit') !== 'on') alerts.push({ level: 'warn', code: 'q-limit', message: 'Más de 3 horas extraordinarias en un día superan el límite del art. 36: el excedente lleva 75% adicional. Para separarlo, usa el registro de jornadas.' });
      if (day === 'feriado' && settings.basis !== 'hourly') alerts.push({ level: 'info', code: 'q-holiday', message: `Con salario fijo, el feriado ya está pagado en tu salario (art. 45): lo adicional es el recargo, ${formatMoney(r.surcharge)}.` });
      renderHero({
        total: r.total, caption: `${hoursText(total)} × ${formatMoney(r.hourValue)} por hora (${r.parts.join(' · ')})`,
        extraMinutes: overtime === 'none' ? 0 : total, hourly: r.hourly,
        buckets: [{ label: 'Paga de las horas', value: r.base }, { label: 'Recargos', value: r.surcharge }], alerts, conditional: r.conditional
      });
      shareData = { tool: 'overtime', primary: `Pago estimado por ${hoursText(total)}: ${formatMoney(r.total)}${r.conditional.length ? ' (estimación condicionada)' : ''}`, details: [`Hora ordinaria: ${formatMoney(r.hourly)}`, `Hora con recargo: ${formatMoney(r.hourValue)} (${r.parts.join(', ')})`, `Recargo: ${formatMoney(r.surcharge)}`] };
    } catch (e) { err.textContent = e instanceof Error ? e.message : String(e); clear('Corrige los datos para ver el cálculo.'); }
  }

  const safeHourly = (s: Settings) => { try { return hourlyRate(s.salary, s.basis, s.weeklyHours); } catch { return null; } };

  /* ------------------------------------------------------------------ Registro de jornadas */

  function runLog() {
    $('#ot-settings-error').textContent = '';
    const { settings, error } = readSettings();
    const listPanel = $('#ot-list-panel'), dist = $('#ot-dist-panel');
    listPanel.hidden = false;
    renderList(null);
    if (error) $('#ot-settings-error').textContent = error;
    if (!settings || !entries.length) {
      lastLog = null; dist.hidden = true; $('#ot-summary').hidden = true; out('dockTotal', formatMoney(0));
      renderHero({ total: null, caption: !settings ? 'Escribe tu salario para valorar tus jornadas.' : 'Añade tus jornadas para ver el total.', extraMinutes: null, hourly: settings ? safeHourly(settings) : null, buckets: [], alerts: [] });
      shareData = { tool: 'overtime' };
      return;
    }
    const r = calculateLog(entries, settings);
    lastLog = r;
    renderList(r);
    const fixed = settings.basis !== 'hourly';
    const special = r.distribution.filter(b => b.additional > 0);
    renderHero({
      total: r.additional,
      caption: fixed ? `Adicional a tu salario por ${r.days} ${r.days === 1 ? 'día' : 'días'} registrados: horas extras y recargos.` : `Horas extras y recargos de ${r.days} ${r.days === 1 ? 'día' : 'días'}. Las horas ordinarias suman ${formatMoney(r.ordinaryPay)} aparte.`,
      extraMinutes: r.extraMinutes, hourly: r.hourly,
      buckets: special.map(b => ({ label: b.label, value: b.additional })), alerts: r.alerts, conditional: r.conditional
    });
    out('days', String(r.days)); out('ordinaryHours', hoursText(r.ordinaryMinutes)); out('logExtra', hoursText(r.extraMinutes)); out('overLimit', hoursText(r.overLimitMinutes));
    out('periodLabel', fixed ? PERIOD_LABEL[settings.period] : 'Horas ordinarias pagadas');
    out('periodSalary', fixed ? (r.periodSalary === null ? '—' : formatMoney(r.periodSalary)) : formatMoney(r.ordinaryPay));
    out('grandTotal', r.grandTotal === null ? '—' : formatMoney(r.grandTotal));
    out('dockTotal', formatMoney(r.additional));
    $('#ot-summary').hidden = false;
    renderDistribution(special);
    dist.hidden = !special.length;
    shareData = { tool: 'overtime', primary: `Adicional estimado por horas extras y recargos: ${formatMoney(r.additional)}${r.conditional.length ? ' (estimación condicionada)' : ''}`, details: [`Días registrados: ${r.days}`, `Horas extraordinarias: ${hoursText(r.extraMinutes)}`, `Hora ordinaria: ${formatMoney(r.hourly)}`, ...special.map(b => `${b.label}: ${formatMoney(b.additional)}`)] };
  }

  function renderDistribution(buckets: Bucket[]) {
    const list = $('#ot-dist'); list.replaceChildren();
    const max = Math.max(...buckets.map(b => b.additional), 0);
    for (const b of buckets) {
      const li = document.createElement('li');
      const name = document.createElement('span'); name.className = 'fx-dist-name';
      name.append(fxIcon(b.ordinary ? 'calendar' : b.overtimeSurcharge >= 0.5 ? 'moon' : 'sun', 18), `${b.label} · ${hoursText(b.minutes)}`);
      const value = document.createElement('strong'); value.textContent = formatMoney(b.additional);
      const bar = document.createElement('span'); bar.className = 'fx-dist-bar'; bar.setAttribute('aria-hidden', 'true');
      const fill = document.createElement('span'); fill.style.setProperty('--fx-value', `${max ? (b.additional / max) * 100 : 0}%`); bar.append(fill);
      li.append(name, value, bar); list.append(li);
    }
  }

  function renderList(r: LogResult | null) {
    const list = $('#ot-list');
    $('#ot-count').textContent = String(entries.length);
    $('#ot-empty').hidden = entries.length > 0;
    list.replaceChildren();
    const sorted = [...entries].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
    for (const entry of sorted) {
      const res = r?.shifts.find(s => s.id === entry.id);
      const li = document.createElement('li'); li.className = 'fx-shift'; li.dataset.id = entry.id;
      if (res && !res.included) li.classList.add('is-excluded');
      const night = res?.type === 'nocturna' || res?.type === 'mixta';
      li.append(fxIconFrame(night ? 'moon' : 'sun'));
      const label = document.createElement('span'); label.className = 'fx-row-label';
      const title = document.createElement('strong'); title.textContent = `${weekday.format(new Date(`${entry.date}T00:00:00Z`))} · ${entry.start}–${entry.end}`;
      const meta = document.createElement('small');
      const bits = [res?.type ? TYPE_LABEL[res.type] : null, entry.dayKind !== 'normal' ? DAY_LABELS[entry.dayKind] : null, res?.included ? `${hoursText(res.workedMinutes)} trabajadas` : null, res && res.extraMinutes ? `${hoursText(res.extraMinutes)} extra` : null, res && !res.included ? 'No se cuenta' : null, entry.breakMinutes ? `descanso ${entry.breakMinutes} min` : null].filter(Boolean);
      meta.textContent = bits.join(' · ');
      label.append(title, meta);
      if (res?.included && res.buckets.length) {
        const details = document.createElement('details'); details.className = 'fx-shift-detail';
        const summary = document.createElement('summary'); summary.textContent = 'Ver desglose'; details.append(summary);
        const ul = document.createElement('ul');
        for (const b of res.buckets) { const item = document.createElement('li'); item.textContent = `${b.label}: ${hoursText(b.minutes)} → ${formatMoney(b.additional)} adicional`; ul.append(item); }
        details.append(ul); label.append(details);
      }
      const amount = document.createElement('strong'); amount.textContent = res?.included ? formatMoney(res.additional) : '—';
      const actions = document.createElement('div'); actions.className = 'fx-row-actions';
      const button = (icon: 'pencil' | 'duplicate' | 'trash', text: string, action: () => void) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'fx-iconbtn fx-small'; b.setAttribute('aria-label', `${text} la jornada del ${entry.date} de ${entry.start} a ${entry.end}`);
        b.append(fxIcon(icon, 18)); b.addEventListener('click', action); return b;
      };
      actions.append(button('pencil', 'Editar', () => startEdit(entry.id)), button('duplicate', 'Duplicar', () => duplicate(entry.id)), button('trash', 'Eliminar', () => remove(entry.id)));
      li.append(label, amount, actions);
      list.append(li);
    }
  }

  function readEntry(): ShiftEntry {
    const d = new FormData(entryForm);
    const text = (k: string) => String(d.get(k) ?? '').trim();
    if (!text('date') || !text('start') || !text('end')) throw new Error('Indica la fecha, la entrada y la salida.');
    const breakMinutes = parseAmount(text('break')) ?? 0;
    if (!Number.isInteger(breakMinutes) || breakMinutes < 0 || breakMinutes > 1440) throw new Error('El descanso debe ser un número entero de minutos.');
    const contract = parseAmount(text('contract'));
    if (contract !== undefined && (!Number.isFinite(contract) || contract <= 0 || contract > 24)) throw new Error('Las horas diarias del contrato deben estar entre 0 y 24.');
    const crosses = text('end') <= text('start');
    return {
      id: editing ?? newId(), date: text('date'), start: text('start'), end: text('end'), breakMinutes,
      breakStart: text('breakStart') || undefined, breakPaid: d.get('breakPaid') === 'on',
      dayKind: text('dayKind') as DayKind, nextDayKind: crosses ? (text('nextDayKind') as DayKind) : undefined,
      contractDailyHours: contract,
      contractStart: text('contractStart') || undefined, contractEnd: text('contractEnd') || undefined
    };
  }

  function validateSingle(entry: ShiftEntry) {
    // Valida la jornada por sí sola antes de guardarla (los solapamientos se avisan en el resumen).
    const { settings } = readSettings();
    const r = calculateLog([entry], settings ?? { salary: 1, basis: 'hourly', weeklyHours: 48, period: 'weekly' });
    const error = r.alerts.find(a => a.level === 'error');
    if (error) throw new Error(error.message);
  }

  function startEdit(id: string) {
    const e = entries.find(x => x.id === id); if (!e) return;
    editing = id;
    const set = (sel: string, v: string) => { $<HTMLInputElement | HTMLSelectElement>(sel).value = v; };
    set('#ot-date', e.date); set('#ot-start', e.start); set('#ot-end', e.end); set('#ot-break', String(e.breakMinutes));
    set('#ot-daykind', e.dayKind); set('#ot-nextkind', e.nextDayKind ?? 'normal'); set('#ot-breakstart', e.breakStart ?? '');
    set('#ot-contract', e.contractDailyHours === undefined ? '' : String(e.contractDailyHours));
    set('#ot-contract-start', e.contractStart ?? ''); set('#ot-contract-end', e.contractEnd ?? '');
    $<HTMLInputElement>('#ot-breakpaid').checked = Boolean(e.breakPaid);
    $('#ot-entry-submit').lastChild!.textContent = 'Guardar cambios';
    $('#ot-entry-cancel').hidden = false;
    syncEntryHints();
    $('#ot-log').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    $<HTMLInputElement>('#ot-date').focus({ preventScroll: true });
    status.textContent = `Editando la jornada del ${e.date}.`;
  }

  function stopEdit() {
    editing = null;
    $('#ot-entry-submit').lastChild!.textContent = 'Añadir jornada';
    $('#ot-entry-cancel').hidden = true;
  }

  function duplicate(id: string) {
    const e = entries.find(x => x.id === id); if (!e) return;
    const next = new Date(`${e.date}T00:00:00Z`); next.setUTCDate(next.getUTCDate() + 1);
    const copy = { ...e, id: newId(), date: next.toISOString().slice(0, 10), dayKind: 'normal' as DayKind, nextDayKind: e.nextDayKind ? 'normal' as DayKind : undefined };
    entries.push(copy); runLog();
    status.textContent = `Jornada duplicada para el ${copy.date}. Revisa el tipo de día.`;
  }

  function remove(id: string) {
    const e = entries.find(x => x.id === id); if (!e) return;
    entries = entries.filter(x => x.id !== id);
    if (editing === id) { stopEdit(); entryForm.reset(); }
    runLog();
    status.textContent = `Jornada del ${e.date} eliminada.`;
  }

  function syncEntryHints() {
    const date = $<HTMLInputElement>('#ot-date').value, start = $<HTMLInputElement>('#ot-start').value, end = $<HTMLInputElement>('#ot-end').value;
    const name = date ? holidayName(date) : null;
    $('#ot-holiday-hint').textContent = name ? `Esta fecha es ${name}. Si la trabajaste, marca «Fiesta o duelo nacional».` : '';
    $('#ot-next-wrap').hidden = !(start && end && end <= start);
  }

  entryForm.addEventListener('input', syncEntryHints);
  entryForm.addEventListener('submit', event => {
    event.preventDefault();
    const err = $('#ot-entry-error'); err.textContent = '';
    try {
      const entry = readEntry();
      validateSingle(entry);
      const wasEditing = editing;
      if (wasEditing) entries = entries.map(x => (x.id === wasEditing ? entry : x)); else entries.push(entry);
      stopEdit();
      // Deja la fecha del día siguiente lista para seguir registrando.
      const next = new Date(`${entry.date}T00:00:00Z`); next.setUTCDate(next.getUTCDate() + 1);
      const keep = { start: entry.start, end: entry.end, brk: String(entry.breakMinutes) };
      entryForm.reset();
      $<HTMLInputElement>('#ot-date').value = next.toISOString().slice(0, 10);
      $<HTMLInputElement>('#ot-start').value = keep.start; $<HTMLInputElement>('#ot-end').value = keep.end; $<HTMLInputElement>('#ot-break').value = keep.brk;
      syncEntryHints();
      runLog();
      status.textContent = wasEditing ? 'Jornada actualizada.' : `Jornada del ${entry.date} añadida.`;
    } catch (e) { err.textContent = e instanceof Error ? e.message : String(e); }
  });
  $('#ot-entry-cancel').addEventListener('click', () => { stopEdit(); entryForm.reset(); syncEntryHints(); status.textContent = 'Edición cancelada.'; });

  /* ------------------------------------------------------------------ Modo, ajustes y acciones */

  function setMode(m: 'quick' | 'log') {
    root.dataset.mode = m;
    $('#ot-quick').hidden = m !== 'quick';
    $('#ot-log').hidden = m !== 'log';
    $('#ot-list-panel').hidden = m !== 'log';
    $('#ot-dock').hidden = m !== 'log';
    $('#ot-hero-label').textContent = m === 'quick' ? 'Pago por horas extras (bruto estimado)' : 'Pago extraordinario bruto estimado';
    if (m !== 'log') $('#ot-dist-panel').hidden = true;
    run();
  }
  const run = () => (mode() === 'quick' ? runQuick() : runLog());

  root.ownerDocument.querySelectorAll<HTMLInputElement>('input[name="ot-mode"]').forEach(r => r.addEventListener('change', () => setMode(r.value as 'quick' | 'log')));
  $<HTMLSelectElement>('#ot-shift').addEventListener('change', e => {
    if (!weeklyTouched) $<HTMLInputElement>('#ot-weekly').value = String(legalWeeklyHours((e.target as HTMLSelectElement).value as ShiftType));
    run();
  });
  $<HTMLInputElement>('#ot-weekly').addEventListener('input', () => { weeklyTouched = true; });
  settingsForm.addEventListener('input', run);
  settingsForm.addEventListener('submit', e => { e.preventDefault(); run(); });
  quickForm.addEventListener('input', runQuick);
  quickForm.addEventListener('change', runQuick);
  quickForm.addEventListener('submit', e => { e.preventDefault(); runQuick(); });
  $<HTMLSelectElement>('#ot-period').addEventListener('change', runLog);

  bindShare($<HTMLButtonElement>('#ot-share'), () => shareData);
  $('#ot-copy').addEventListener('click', async () => {
    if (!shareData.primary) { status.textContent = 'Todavía no hay un resultado para copiar.'; return; }
    const text = buildShareText(shareData, { includePrimary: true, includeDetails: true, selectedProducts: [] });
    status.textContent = (await fxCopy(text)) ? 'Resumen copiado.' : 'No se pudo copiar. Usa Compartir para ver el texto.';
  });
  $('#ot-csv').addEventListener('click', () => {
    if (!entries.length || !lastLog) { status.textContent = 'Registra al menos una jornada para exportar el CSV.'; return; }
    const blob = new Blob([toCsv(entries, lastLog)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `horas-extras-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'CSV generado en tu dispositivo.';
  });
  $('#ot-reset').addEventListener('click', () => {
    if (entries.length && !confirm('¿Borrar todas las jornadas registradas?')) return;
    entries = []; stopEdit();
    settingsForm.reset(); quickForm.reset(); entryForm.reset(); weeklyTouched = false;
    $<HTMLInputElement>('#ot-weekly').value = '48';
    $('#ot-quick-error').textContent = ''; $('#ot-entry-error').textContent = '';
    syncEntryHints(); setMode(mode());
    status.textContent = 'Cálculo reiniciado.';
    $<HTMLInputElement>('#ot-salary').focus();
  });
  $('#ot-dock-add').addEventListener('click', () => {
    $('#ot-log').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    $<HTMLInputElement>('#ot-date').focus({ preventScroll: true });
  });

  // Fecha de hoy por defecto (zona local del dispositivo).
  const now = new Date();
  $<HTMLInputElement>('#ot-date').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  syncEntryHints();
  setMode(mode());
}
