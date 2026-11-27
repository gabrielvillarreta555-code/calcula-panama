import { businessDays, creditCard, minimumWage, type CardMode, type WageRegion, type WorkWeek } from '../lib/tools/calculations';
import { carFinancing, carMonthlyCost, compareUnits, decimal, electricity, fuelTrip, grades, itbms, promotion, savings, splitBill, type EfficiencyUnit, type Frequency, type ItbmsMode, type Promotion, type SplitRounding, type Unit } from '../lib/tools/calculations';
/** Actividad fijada como monto mensual (trabajo doméstico): no usa horas. */
const isMonthlyRate = (id: string) => id === 'domestico';
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
    if (root.dataset.tool === 'minwage') {
      const monthly = isMonthlyRate(value('activity'));
      const input = field('hours'); input.disabled = monthly; input.closest<HTMLElement>('[data-field]')!.hidden = monthly;
      return;
    }
    if (root.dataset.tool === 'card') {
      const minimum = value('mode') === 'minimum';
      for (const [key, visible] of [['payment', !minimum], ['minPercent', minimum], ['minFloor', minimum]] as const) {
        const input = field(key); input.disabled = !visible; input.closest<HTMLElement>('[data-field]')!.hidden = !visible;
      }
      return;
    }
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
  /** Tablas anchas: desplazamiento horizontal dentro del panel, nunca en la página. */
  const scroll = (element: HTMLElement) => { const wrap = document.createElement('div'); wrap.className = 'tool-table-scroll'; wrap.tabIndex = 0; wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label', element.querySelector('caption')?.textContent ?? 'Tabla'); wrap.append(element); return wrap; };
  const optional = (key: string) => value(key).trim() ? num(key) : undefined;
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
        case 'car-loan': {
          const r = carFinancing({ price: num('price'), downPayment: num('downPayment'), annualRate: num('rate'), rateType: value('rateType') as 'nominal' | 'effective', months: num('months'), insurance: num('insurance'), bankFees: num('bankFees'), otherCosts: num('otherCosts') });
          line(`Letra mensual: ${money(r.payment)}${r.paymentWithInsurance > r.payment ? ` (${money(r.paymentWithInsurance)} con seguros)` : ''}`);
          line(`Monto financiado: ${money(r.financed)} en ${r.payments} cuotas${Math.abs(r.finalPayment - r.payment) > 0.001 ? `; la última es de ${money(r.finalPayment)} por ajuste de centavos` : ''}.`);
          line(`Intereses totales: ${money(r.interest)}.${r.insuranceTotal > 0 ? ` Seguros en todo el plazo: ${money(r.insuranceTotal)}.` : ''}`);
          line(`Costo del financiamiento (intereses, seguros y gastos): ${money(r.financingCost)}. Total pagado por el auto, con abono: ${money(r.totalCar)}.`);
          line(`Tasa efectiva anual estimada: ${number(r.effectiveRate)}% (incluye la comisión de cierre; no los seguros ni la notaría).`);
          const section = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = 'Ver tabla de amortización'; section.append(summary);
          section.append(scroll(table(['Mes', 'Cuota', 'Capital', 'Interés', 'Saldo'], r.schedule.map(row => [`${row.month}`, money(row.payment), money(row.principal), money(row.interest), money(row.balance)]), 'Tabla de amortización sin seguros'))); details.append(section); break;
        }
        case 'fuel-trip': {
          const r = fuelTrip({ distance: num('distance'), roundTrip: value('trip') === 'round', efficiency: num('efficiency'), unit: value('unit') as EfficiencyUnit, price: num('price'), priceUnit: value('priceUnit') as 'liter' | 'gallon', people: num('people') });
          line(`Costo del combustible: ${money(r.cost)}`);
          line(`Combustible necesario: ${number(r.liters)} litros (${number(r.gallons)} galones) para ${number(r.km)} km.`);
          line(`Costo por kilómetro: ${money(r.costPerKm, 3)}. Precio usado: ${money(r.pricePerLiter, 3)} por litro.`);
          if (num('people') > 1) line(`Por persona: ${money(r.costPerPerson)}.`);
          break;
        }
        case 'car-cost': {
          const r = carMonthlyCost({ loanPayment: num('loanPayment'), fuel: num('fuel'), parking: num('parking'), tolls: num('tolls'), other: num('other'), insuranceYear: num('insuranceYear'), maintenanceYear: num('maintenanceYear'), registrationYear: num('registrationYear'), depreciationYear: num('depreciationYear'), kmPerMonth: optional('kmPerMonth') });
          line(`Costo mensual del auto: ${money(r.total)}`);
          line(`Al año: ${money(r.annual)}.${num('depreciationYear') > 0 ? ` Sin la pérdida de valor: ${money(r.withoutDepreciation)} al mes.` : ''}`);
          if (r.perKm !== null) line(`Costo por kilómetro: ${money(r.perKm, 3)}.`);
          details.append(scroll(table(['Concepto', 'Al mes', 'Parte del total'], r.items.map(item => [item.label, money(item.monthly), `${number(item.share, 1)}%`]), 'Desglose mensual (los anuales se dividen entre 12)'))); break;
        }
        case 'minwage': {
          const r = minimumWage(value('activity'), value('region') as WageRegion, isMonthlyRate(value('activity')) ? 48 : num('hours'));
          if (r.hourly === null) {
            line(`Salario mínimo mensual: ${money(r.monthly)}`);
            line(`Por quincena: ${money(r.fortnightly)}. El decreto fija el trabajo doméstico como monto mensual.`);
          } else {
            line(`Salario mínimo por hora: ${money(r.hourly)}`);
            line(`Con ${r.weeklyHours} horas semanales: ${money(r.weekly!)} por semana, unos ${money(r.monthly)} al mes y ${money(r.fortnightly)} por quincena.`);
            line('El equivalente mensual es una estimación con 4⅓ semanas por mes; el decreto solo fija la tasa por hora.');
          }
          break;
        }
        case 'card': {
          const mode = value('mode') as CardMode;
          const r = creditCard({ balance: num('balance'), annualRate: num('rate'), mode, payment: mode === 'fixed' ? num('payment') : num('minFloor'), minPercent: mode === 'minimum' ? num('minPercent') : 0 });
          const years = Math.floor(r.months / 12), rest = r.months % 12;
          line(`La deuda se salda en ${r.months} ${r.months === 1 ? 'mes' : 'meses'}${years ? ` (${years} ${years === 1 ? 'año' : 'años'}${rest ? ` y ${rest} ${rest === 1 ? 'mes' : 'meses'}` : ''})` : ''}`);
          line(`Intereses: ${money(r.interest)}. Total pagado: ${money(r.paid)}.`);
          if (mode === 'minimum') line(`El primer pago mínimo es de ${money(r.firstPayment)} y baja a medida que baja el saldo.`);
          details.append(table(['Para saldarla en', 'Pago fijo mensual'], r.payoff.map(p => [`${p.months} meses`, money(p.payment)]), 'Pago fijo necesario, sin compras nuevas'));
          const section = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = 'Ver el calendario de pagos'; section.append(summary);
          section.append(scroll(table(['Mes', 'Pago', 'Interés', 'Saldo'], r.schedule.map(row => [`${row.month}`, money(row.payment), money(row.interest), money(row.balance)]), 'Calendario de pagos'))); details.append(section);
          break;
        }
        case 'holidays': {
          const r = businessDays(value('start'), value('end'), value('week') as WorkWeek);
          line(`Días hábiles: ${r.business}`);
          line(`Del ${value('start').split('-').reverse().join('/')} al ${value('end').split('-').reverse().join('/')}: ${r.days} días calendario, ${r.weekend} de descanso semanal y ${r.holidaysOnWorkdays} ${r.holidaysOnWorkdays === 1 ? 'feriado' : 'feriados'} en días laborables.`);
          if (r.holidays.length) {
            const section = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = `Ver los ${r.holidays.length} feriados del intervalo`; section.append(summary);
            const names = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
            section.append(scroll(table(['Fecha', 'Día', 'Fiesta o duelo', 'Resta un día hábil'], r.holidays.map(h => [h.date.split('-').reverse().join('/'), names[h.weekday]!, h.name, h.counted ? 'Sí' : 'No: no es laborable']), 'Fiestas y duelos nacionales'))); details.append(section);
          } else line('No hay fiestas ni duelos nacionales en el intervalo.');
          break;
        }
        case 'itbms': {
          const r = itbms(num('amount'), Number(value('rate')), value('mode') as ItbmsMode);
          line(`${value('mode') === 'add' ? 'Total con ITBMS' : 'Precio sin ITBMS'}: ${money(value('mode') === 'add' ? r.total : r.base)}`);
          line(`ITBMS (${r.rate}%): ${money(r.tax)}.`);
          details.append(table(['Concepto', 'Importe'], [['Base sin impuesto', money(r.base)], [`ITBMS ${r.rate}%`, money(r.tax)], ['Total con ITBMS', money(r.total)]], 'Desglose del ITBMS')); break;
        }
        case 'split': {
          const people = num('people');
          const r = splitBill({ total: num('total'), tax: optional('tax'), tipPercent: num('tip'), people, rounding: value('rounding') as SplitRounding });
          line(`Cada persona paga: ${money(r.maxShare)}`);
          if (r.extraPeople) line(`${r.extraPeople} ${r.extraPeople === 1 ? 'persona paga' : 'personas pagan'} ${money(r.maxShare)} y ${people - r.extraPeople} ${people - r.extraPeople === 1 ? 'paga' : 'pagan'} ${money(r.share)}, para sumar exactamente el total.`);
          line(`Propina: ${money(r.tip)} sobre ${money(r.tipBase)}. Total a pagar: ${money(r.grand)}.`);
          if (r.surplus > 0) line(`Con el redondeo se reúnen ${money(r.collected)}: sobran ${money(r.surplus)}, que se suman a la propina.`);
          break;
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
