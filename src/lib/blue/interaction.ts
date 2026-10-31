import type { Point, Rect, Size } from './geometry';

export type BlueMood = 'rest' | 'curious' | 'focused' | 'happy' | 'surprised';
export type InteractionEvent = 'field' | 'button' | 'success' | 'invalid' | 'idle';

/** Solo categorías de eventos: no recibe ni examina valores de formularios. */
export function moodForEvent(event: InteractionEvent): BlueMood {
  return { field: 'focused', button: 'curious', success: 'happy', invalid: 'surprised', idle: 'rest' }[event] as BlueMood;
}

/** Dirección relativa calculada exclusivamente a partir de geometría de pantalla. */
export function directionTo(from: Rect, to: Rect): 'left' | 'right' | 'up' | 'down' {
  const dx = (to.left + to.right - from.left - from.right) / 2;
  const dy = (to.top + to.bottom - from.top - from.bottom) / 2;
  return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
}

/** Elige exclusivamente entre candidatos que ya pasaron la comprobación de colisión y trayectoria. */
export function nearestToRect(points: readonly Point[], size: Size, target: Rect): Point | undefined {
  const x = (target.left + target.right) / 2, y = (target.top + target.bottom) / 2;
  return [...points].sort((a, b) =>
    Math.hypot(a.x + size.width / 2 - x, a.y + size.height / 2 - y) -
    Math.hypot(b.x + size.width / 2 - x, b.y + size.height / 2 - y)
  )[0];
}
