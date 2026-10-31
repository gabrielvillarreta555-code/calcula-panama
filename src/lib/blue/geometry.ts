/** Geometría independiente del DOM, en píxeles del viewport. */
export interface Rect { left: number; top: number; right: number; bottom: number }
export interface Point { x: number; y: number }
export interface Size { width: number; height: number }

export function overlaps(a: Rect, b: Rect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
export function at(point: Point, size: Size): Rect {
  return { left: point.x, top: point.y, right: point.x + size.width, bottom: point.y + size.height };
}
export function fits(point: Point, size: Size, bounds: Rect, obstacles: Rect[]): boolean {
  const r = at(point, size);
  return r.left >= bounds.left && r.top >= bounds.top && r.right <= bounds.right && r.bottom <= bounds.bottom && !obstacles.some(o => overlaps(r, o));
}
/** Caja barrida conservadora: descarta trayectos que podrían cruzar una zona ocupada. */
export function pathIsSafe(from: Point, to: Point, size: Size, bounds: Rect, obstacles: Rect[]): boolean {
  if (!fits(from, size, bounds, obstacles) || !fits(to, size, bounds, obstacles)) return false;
  const sweep = { left: Math.min(from.x, to.x), top: Math.min(from.y, to.y), right: Math.max(from.x, to.x) + size.width, bottom: Math.max(from.y, to.y) + size.height };
  return !obstacles.some(o => overlaps(sweep, o));
}
/** Orden estable, con preferencia por los márgenes derecho e izquierdo. */
export function candidates(size: Size, bounds: Rect, obstacles: Rect[]): Point[] {
  const maxX = bounds.right - size.width, maxY = bounds.bottom - size.height;
  if (maxX < bounds.left || maxY < bounds.top) return [];
  const xs = [maxX, bounds.left, (bounds.left + maxX) / 2];
  const ys = [maxY, bounds.top, (bounds.top + maxY) / 2];
  return ys.flatMap(y => xs.map(x => ({ x, y }))).filter(p => fits(p, size, bounds, obstacles));
}
export function ease(progress: number): number {
  const t = Math.max(0, Math.min(1, progress));
  return t * t * (3 - 2 * t);
}
export function interpolate(from: Point, to: Point, progress: number): Point {
  const t = ease(progress);
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}
