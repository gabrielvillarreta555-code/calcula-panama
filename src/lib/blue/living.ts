import { candidates, fits, pathIsSafe, type Point, type Size } from './geometry';
import { measureEnvironment } from './environment';
import { createBlueState } from './state';
import { createMotion } from './motion';

const preferenceKey = 'cp-blue-visible';
const size: Size = { width: 124, height: 128 };
const pauseMs = 10000;

/** Mejora progresiva: si falta JS, la guía sigue funcionando en el documento. */
export function mountBlue(guide: HTMLDetailsElement): () => void {
  const area = guide.closest<HTMLElement>('.blue-help-area');
  const summary = guide.querySelector<HTMLElement>(':scope > summary');
  const avatar = guide.querySelector<HTMLImageElement>('.blue-help-avatar');
  const panel = guide.querySelector<HTMLElement>('.blue-help-content');
  const toggle = area?.querySelector<HTMLButtonElement>('.blue-visibility');
  if (!area || !summary || !avatar || !panel || !toggle) return () => {};

  const state = createBlueState();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const abort = new AbortController();
  const opts = { signal: abort.signal };
  let visible = true, position: Point | null = null, timer = 0, landingTimer = 0, layoutFrame = 0, candidateIndex = 0;
  let hovered = false, destroyed = false;
  try { visible = localStorage.getItem(preferenceKey) !== 'false'; } catch { /* almacenamiento no disponible */ }

  const motion = createMotion((point, progress) => {
    position = point;
    guide.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
    const lean = Math.sin(Math.PI * progress) * 3;
    avatar.style.transform = `rotate(${lean}deg) scale(${1 + Math.sin(Math.PI * progress) * .015}, ${1 - Math.sin(Math.PI * progress) * .01})`;
  }, () => {
    state.transition('landing');
    avatar.style.transform = '';
    avatar.classList.add('blue-landing');
    landingTimer = window.setTimeout(() => {
      avatar.classList.remove('blue-landing');
      state.transition('idle');
      scheduleFlight();
    }, 300);
  });
  function clearFlight() {
    window.clearTimeout(timer); window.clearTimeout(landingTimer); timer = 0; landingTimer = 0;
    motion.cancel(); avatar!.style.transform = ''; avatar!.classList.remove('blue-landing');
    if (state.value === 'flying' || state.value === 'landing') state.transition('idle');
  }
  function inline() {
    clearFlight(); position = null; state.transition('hidden');
    guide.classList.remove('blue-help-floating');
    guide.style.transform = '';
    panel!.style.cssText = '';
  }
  function showAt(point: Point) {
    guide.classList.add('blue-help-floating');
    guide.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
    position = point;
    state.transition('idle');
  }
  function isBusy() {
    const focused = document.activeElement;
    return guide.open || hovered || document.hidden || (focused instanceof HTMLElement && (focused.closest('form') !== null || guide.contains(focused)));
  }
  function scheduleFlight() {
    window.clearTimeout(timer);
    if (!visible || reduce.matches || isBusy() || !position || destroyed) return;
    timer = window.setTimeout(() => {
      if (!position || isBusy() || !visible || reduce.matches) return;
      const { bounds, obstacles } = measureEnvironment(guide, size);
      const options = candidates(size, bounds, obstacles).filter(p => position && (Math.abs(p.x-position.x) + Math.abs(p.y-position.y) > 24) && pathIsSafe(position, p, size, bounds, obstacles));
      if (options.length === 0) { scheduleFlight(); return; }
      const target = options[candidateIndex++ % options.length];
      if (!target) return;
      const from = position;
      state.transition('flying');
      motion.fly(from, target);
    }, pauseMs);
  }
  function refresh() {
    layoutFrame = 0;
    if (destroyed || !visible || area!.classList.contains('blue-image-error') || document.hidden || guide.open || isBusy()) return;
    const { bounds, obstacles } = measureEnvironment(guide, size);
    if (position && fits(position, size, bounds, obstacles)) { scheduleFlight(); return; }
    inline();
    const point = candidates(size, bounds, obstacles)[0];
    if (point) { showAt(point); scheduleFlight(); }
  }
  function requestRefresh() {
    if (!layoutFrame) layoutFrame = requestAnimationFrame(refresh);
  }
  function layoutChanged() {
    // Retirar inmediatamente evita cruzar controles mientras se desplaza la página.
    inline();
    requestRefresh();
  }
  function applyPreference() {
    area!.classList.toggle('blue-character-hidden', !visible);
    toggle!.textContent = visible ? 'Ocultar a Blue' : 'Mostrar a Blue';
    if (!visible) inline(); else requestRefresh();
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    visible = !visible;
    try { localStorage.setItem(preferenceKey, String(visible)); } catch { /* sigue funcionando en esta página */ }
    applyPreference();
  }, opts);
  avatar.addEventListener('error', () => { area.classList.add('blue-image-error'); inline(); }, opts);
  if (avatar.complete && avatar.naturalWidth === 0) area.classList.add('blue-image-error');
  guide.addEventListener('pointerenter', () => { hovered = true; clearFlight(); if (state.value === 'flying') state.transition('idle'); }, opts);
  guide.addEventListener('pointerleave', () => { hovered = false; requestRefresh(); }, opts);
  guide.addEventListener('toggle', () => {
    clearFlight();
    if (guide.open && position) {
      const v = window.visualViewport;
      const top = v?.offsetTop ?? 0, bottom = top + (v?.height ?? innerHeight);
      const left = v?.offsetLeft ?? 0, width = v?.width ?? innerWidth;
      const panelWidth = Math.min(360, width - 24);
      panel.style.width = `${panelWidth}px`;
      panel.style.left = `${Math.max(left + 12, Math.min(position.x, left + width - panelWidth - 12)) - position.x}px`;
      panel.style.right = 'auto';
      const above = position.y - top - 20, below = bottom - (position.y + size.height) - 20;
      if (Math.max(above, below) < 150) { inline(); guide.scrollIntoView({ block: 'nearest' }); }
      else if (above >= below) { panel.style.bottom = 'calc(100% + 10px)'; panel.style.top = 'auto'; panel.style.maxHeight = `${above}px`; }
      else { panel.style.top = 'calc(100% + 10px)'; panel.style.bottom = 'auto'; panel.style.maxHeight = `${below}px`; }
    } else if (!guide.open) { panel.style.cssText = ''; requestRefresh(); }
  }, opts);
  document.addEventListener('focusin', event => {
    const el = event.target;
    if (el instanceof HTMLElement && el.closest('form')) inline();
    else if (guide.contains(el as Node)) { clearFlight(); if (state.value === 'flying') state.transition('idle'); }
  }, opts);
  document.addEventListener('focusout', () => requestRefresh(), opts);
  document.addEventListener('visibilitychange', () => { if (document.hidden) inline(); else requestRefresh(); }, opts);
  window.addEventListener('scroll', layoutChanged, { ...opts, passive: true });
  window.addEventListener('resize', layoutChanged, opts);
  window.visualViewport?.addEventListener('resize', layoutChanged, opts);
  window.visualViewport?.addEventListener('scroll', layoutChanged, opts);
  reduce.addEventListener('change', () => { clearFlight(); requestRefresh(); }, opts);
  document.querySelector('.menu-button')?.addEventListener('click', layoutChanged, opts);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') requestRefresh(); }, opts);
  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(layoutChanged);
  document.querySelectorAll('.site-header, .tabbar, form, .results').forEach(el => observer?.observe(el));
  const mutations = new MutationObserver(layoutChanged);
  document.querySelectorAll('.calculator-shell, #menu').forEach(el => mutations.observe(el, { subtree: true, attributes: true, attributeFilter: ['hidden', 'open', 'aria-expanded', 'class'] }));
  applyPreference();
  return () => {
    destroyed = true; abort.abort(); observer?.disconnect(); mutations.disconnect();
    if (layoutFrame) cancelAnimationFrame(layoutFrame);
    inline();
  };
}
