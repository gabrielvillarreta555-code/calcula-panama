/** Utilidades de interfaz compartidas por los scripts de las calculadoras (solo navegador). */

export interface Segment {
  label: string;
  value: number;
  tone: 'net' | 'css' | 'edu' | 'isr' | 'a' | 'b' | 'c' | 'd';
}

export function $<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Falta el elemento ${selector}`);
  return el;
}

/** Escribe texto en todos los elementos `[data-out="key"]` del contenedor. */
export function setOutputs(root: ParentNode, values: Record<string, string>) {
  for (const [key, text] of Object.entries(values)) {
    root.querySelectorAll<HTMLElement>(`[data-out="${key}"]`).forEach(el => { el.textContent = text; });
  }
}

/** Muestra u oculta las filas `[data-row="key"]`. */
export function toggleRows(root: ParentNode, rows: Record<string, boolean>) {
  for (const [key, visible] of Object.entries(rows)) {
    root.querySelectorAll<HTMLElement>(`[data-row="${key}"]`).forEach(el => { el.hidden = !visible; });
  }
}

/** Lee un número del formulario. Devuelve `undefined` si el campo está vacío. */
export function readNumber(data: FormData, name: string): number | undefined {
  const raw = String(data.get(name) ?? '').trim();
  if (raw === '') return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : Number.NaN;
}

export function readText(data: FormData, name: string): string {
  return String(data.get(name) ?? '').trim();
}

/** Barra apilada con leyenda; los segmentos con valor 0 se omiten. */
export function renderBar(container: HTMLElement, segments: Segment[], format: (n: number) => string) {
  const visible = segments.filter(s => s.value > 0);
  const total = visible.reduce((sum, s) => sum + s.value, 0);
  const bar = document.createElement('div');
  bar.className = 'stack-bar';
  bar.setAttribute('role', 'img');
  const legend = document.createElement('ul');
  legend.className = 'stack-legend';
  const description: string[] = [];
  for (const segment of visible) {
    const share = total > 0 ? segment.value / total : 0;
    const part = document.createElement('span');
    part.className = `tone-${segment.tone}`;
    part.style.width = `${Math.max(share * 100, 1.5)}%`;
    bar.append(part);
    const item = document.createElement('li');
    const dot = document.createElement('i');
    dot.className = `tone-${segment.tone}`;
    const label = document.createElement('span');
    label.textContent = segment.label;
    const value = document.createElement('strong');
    value.textContent = `${Math.round(share * 100)}%`;
    item.append(dot, label, value);
    legend.append(item);
    description.push(`${segment.label}: ${format(segment.value)} (${Math.round(share * 100)}%)`);
  }
  bar.setAttribute('aria-label', description.join('; '));
  container.replaceChildren(bar, legend);
}

/**
 * Conecta un formulario con su función de cálculo: valida al enviar, muestra el panel de
 * resultado, recalcula al editar después del primer cálculo y lleva el resultado a la vista en móviles.
 */
export function bindCalculator(options: {
  form: HTMLFormElement;
  error: HTMLElement;
  empty: HTMLElement;
  result: HTMLElement;
  run: (data: FormData) => string | void;
}) {
  const { form, error, empty, result, run } = options;
  let calculated = false;
  const calculate = (reveal: boolean) => {
    let message: string | void;
    try {
      message = run(new FormData(form));
    } catch (ex) {
      message = ex instanceof Error ? ex.message : 'No fue posible calcular.';
    }
    if (message) {
      error.textContent = message;
      if (!calculated) return;
      result.classList.add('is-stale');
      return;
    }
    error.textContent = '';
    result.classList.remove('is-stale');
    empty.hidden = true;
    result.hidden = false;
    if (reveal && window.matchMedia('(max-width: 899px)').matches) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      result.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
    calculated = true;
  };
  form.addEventListener('submit', event => {
    event.preventDefault();
    calculate(true);
  });
  form.addEventListener('input', () => { if (calculated) calculate(false); });
  form.addEventListener('change', () => { if (calculated) calculate(false); });
}

/** Botón para compartir o copiar un resumen en texto (sin enviar datos a ningún servidor). */
export function bindShare(button: HTMLButtonElement, getText: () => string) {
  button.addEventListener('click', async () => {
    const text = getText();
    const original = button.textContent;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, text, url: location.origin + location.pathname });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${location.origin}${location.pathname}`);
      button.textContent = 'Copiado ✓';
    } catch (ex) {
      if (ex instanceof DOMException && ex.name === 'AbortError') return;
      button.textContent = 'No se pudo copiar';
    }
    window.setTimeout(() => { button.textContent = original; }, 2000);
  });
}
