import { parseCents } from './pay-period';
import { calculateLoan, type LoanInput, type LoanResult } from './loans';

const money = (cents: number) => `B/.${(cents / 100).toFixed(2)}`;
function decimal(value: string): number {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d{1,5}(?:\.\d{1,6})?$/.test(normalized)) throw new Error('Introduce un número válido, sin signos y con hasta seis decimales.');
  return Number(normalized);
}
function readOffer(offer: HTMLElement): LoanInput {
  const field = (name: string) => { const el = offer.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-field="${name}"]`); if (!el) throw new Error('Falta un campo.'); return el.value; };
  const optional = (name: string) => field(name).trim() ? parseCents(field(name)) : 0;
  const term = decimal(field('term')) * (field('unit') === 'years' ? 12 : 1);
  const months = Math.round(term);
  if (Math.abs(months - term) > 1e-9) throw new Error('El plazo debe equivaler a un número entero de meses.');
  return { principal: parseCents(field('principal')), annualRate: decimal(field('rate')), rateType: field('rate-type') as LoanInput['rateType'], months, insurance: optional('insurance'), monthlyCharges: optional('charges'), upfrontFee: optional('fee') };
}
export function mountLoans(root: HTMLElement) {
  const get = <T extends HTMLElement>(selector: string): T => { const node = root.querySelector<T>(selector); if (!node) throw new Error(`Falta ${selector}`); return node; };
  const a = get<HTMLElement>('[data-offer="a"]'), b = get<HTMLElement>('[data-offer="b"]');
  const comparison = get<HTMLDetailsElement>('#comparison'), schedule = get<HTMLDetailsElement>('#schedule'), list = get<HTMLOListElement>('#schedule-list');
  const output = (key: string, value: string) => { get<HTMLElement>(`[data-output="${key}"]`).textContent = value; };
  let current: LoanResult | null = null;
  const renderSchedule = () => {
    list.replaceChildren(); if (!schedule.open || !current) return;
    for (const row of current.installments) {
      const li = document.createElement('li');
      const title = document.createElement('strong'); title.textContent = `Cuota ${row.month} · ${money(row.payment)}`; li.append(title);
      const text = document.createElement('span'); text.textContent = `Capital ${money(row.principal)} · Interés ${money(row.interest)} · Saldo ${money(row.balance)}`; li.append(text); list.append(li);
    }
  };
  const read = (node: HTMLElement) => { const error = node.querySelector<HTMLElement>('[data-error]')!; try { const input = readOffer(node), result = calculateLoan(input); error.textContent = ''; return { input, result }; } catch (e) { error.textContent = e instanceof Error ? e.message : 'Revisa los datos.'; return null; } };
  const render = () => {
    const first = read(a); current = first?.result ?? null;
    if (!first) for (const key of ['monthly','financial','insurance','charges','last','interest','fee','net','cost','total','count']) output(key, '—');
    else {
      const { input, result } = first;
      for (const [key, cents] of Object.entries({ monthly: result.regularTotal, financial: result.regularPayment, insurance: input.insurance, charges: input.monthlyCharges, last: result.finalPayment, interest: result.interestTotal, fee: input.upfrontFee, net: result.netReceived, cost: result.cost, total: result.totalPaid })) output(key, money(cents));
      output('count', result.installments.length === input.months ? String(input.months) : `${result.installments.length} de ${input.months} (ajuste por redondeo)`);
    }
    renderSchedule();
    const result = get<HTMLElement>('#comparison-result'); result.replaceChildren();
    if (!comparison.open) return;
    const second = read(b); if (!first || !second) { result.textContent = 'Completa ambas ofertas para compararlas.'; return; }
    const line = (text: string) => { const p = document.createElement('p'); p.textContent = text; result.append(p); };
    line(`Oferta A: cuota ${money(first.result.regularTotal)} · total ${money(first.result.totalPaid)}.`);
    line(`Oferta B: cuota ${money(second.result.regularTotal)} · total ${money(second.result.totalPaid)}.`);
    const compare = (x: number, y: number, label: string) => x === y ? `Ambas tienen el mismo ${label}.` : `La oferta ${x < y ? 'A' : 'B'} tiene menor ${label}.`;
    line(`${compare(first.result.regularTotal, second.result.regularTotal, 'pago mensual estimado')} ${compare(first.result.totalPaid, second.result.totalPaid, 'total estimado')}`);
    line(first.input.principal !== second.input.principal || first.input.months !== second.input.months ? 'Los montos o plazos son diferentes: estos resultados no identifican automáticamente una mejor oferta.' : 'Incluso con el mismo monto y plazo, revisa todas las condiciones y cargos antes de elegir.');
  };
  get<HTMLFormElement>('#loan-form').addEventListener('submit', e => e.preventDefault());
  root.addEventListener('input', render); root.addEventListener('change', render);
  schedule.addEventListener('toggle', renderSchedule); comparison.addEventListener('toggle', render); render();
}
