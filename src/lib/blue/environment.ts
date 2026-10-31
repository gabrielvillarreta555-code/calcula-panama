import type { Rect, Size } from './geometry';

const selector = '.site-header, .tabbar, .site-footer, .nav-links.open, dialog[open], [role="dialog"], .ad-slot, form, .results, .aisle-cart, .aisle-panel, .page-head, .article, .related, main a, main button, main input, main select, main textarea, main summary, main h1, main h2, main h3, main p, main li';
const margin = 10;
export function measureEnvironment(guide: HTMLElement, size: Size): { bounds: Rect; obstacles: Rect[] } {
  const v = window.visualViewport;
  const left = v?.offsetLeft ?? 0, top = v?.offsetTop ?? 0;
  const bounds = { left: left + margin, top: top + margin, right: left + (v?.width ?? innerWidth) - margin, bottom: top + (v?.height ?? innerHeight) - margin };
  const obstacles: Rect[] = [];
  document.querySelectorAll<HTMLElement>(selector).forEach(el => {
    if (guide.contains(el) || el.contains(guide) || el.getClientRects().length === 0) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.right < bounds.left || r.left > bounds.right || r.bottom < bounds.top || r.top > bounds.bottom) return;
    obstacles.push({ left: r.left - margin, top: r.top - margin, right: r.right + margin, bottom: r.bottom + margin });
  });
  // La medición de Blue no se consulta aquí para no forzar layout durante la animación.
  void size;
  return { bounds, obstacles };
}
