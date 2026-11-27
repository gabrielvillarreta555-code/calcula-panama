/**
 * Iconos lineales de Midnight Functional (CP-DESIGN-007): SVG de 24×24, trazo de 1.75 px.
 * Los usan FxIcon.astro (servidor) y fxIcon() (navegador), así que el dibujo vive en un solo lugar.
 */
export const FX_ICONS = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  menu: '<path d="M4 7h16M4 12h10M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="4" y="8" width="16" height="11" rx="2"/><path d="M16 13.5h.01"/>',
  shield: '<path d="M12 3 5 6v5.5c0 4.3 2.9 7.9 7 9.5 4.1-1.6 7-5.2 7-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
  graduation: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>',
  bank: '<path d="M3 9 12 4l9 5"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4v4h4"/>',
  book: '<path d="M12 6.5C10.5 5 8 4.5 4 4.5v13c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-13c-4 0-6.5.5-8 2z"/><path d="M12 6.5v13"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  cart: '<path d="M3 4h2l2.2 10.5h10.6L20 7.5H6.2"/><circle cx="9" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/>',
  box: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
  arrowDownLeft: '<path d="M17 7 7 17M16 17H7V8"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  home: '<path d="m4 11 8-7 8 7"/><path d="M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
  bus: '<rect x="4" y="4" width="16" height="13" rx="2"/><path d="M4 11h16M8 17v2M16 17v2M8 14h.01M16 14h.01"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M8 12h2l1-2 2 4 1-2h2"/>',
  banknote: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
  alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.01"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
  card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h3"/>',
  tag: '<path d="M3 12V4h8l9 9-8 8z"/><path d="M7.5 7.5h.01"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.01"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  sun: '<circle cx="12" cy="12" r="3.75"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14"/>',
  duplicate: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2M14 11v6M11 14h6"/>',
  piggy: '<path d="M5 11a6 5 0 0 1 11.5-1.8H19l1 3-1.5 1v3H16l-1 2h-2l-.5-1.5h-3L9 18.5H7l-.5-2.5A5 5 0 0 1 5 11z"/><path d="M15 11.5h.01"/>'
} as const;

export type FxIconName = keyof typeof FX_ICONS;

/** Crea el icono en el navegador (para listas que se dibujan con JavaScript). */
export function fxIcon(name: FxIconName, size = 18): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.75');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('fx-icon');
  svg.innerHTML = FX_ICONS[name];
  return svg;
}

/** Marco cuadrado de 40 px para iconos de funciones importantes. */
export function fxIconFrame(name: FxIconName, size = 18): HTMLSpanElement {
  const frame = document.createElement('span');
  frame.className = 'fx-iconframe';
  frame.append(fxIcon(name, size));
  return frame;
}

/** Copia texto al portapapeles con alternativa para navegadores sin la API moderna. */
export async function fxCopy(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('No disponible');
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0';
    document.body.append(area); area.select();
    try { return document.execCommand('copy'); } catch { return false; } finally { area.remove(); }
  }
}

/** Animación breve al actualizar un resultado; se omite con movimiento reducido. */
export function fxPulse(element: Element | null) {
  if (!element || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  element.classList.remove('fx-updated');
  void (element as HTMLElement).offsetWidth;
  element.classList.add('fx-updated');
}
