import { interpolate, type Point } from './geometry';

/** Un solo ciclo activo; cancelar impide también la finalización anterior. */
export function createMotion(render: (point: Point, progress: number) => void, onFinish: () => void) {
  let frame = 0;
  let generation = 0;
  function cancel() { generation++; if (frame) cancelAnimationFrame(frame); frame = 0; }
  function fly(from: Point, to: Point, duration = 1800) {
    cancel();
    const own = generation;
    let start: number | undefined;
    const step = (now: number) => {
      if (own !== generation) return;
      start ??= now;
      const progress = Math.min(1, (now - start) / duration);
      render(interpolate(from, to, progress), progress);
      if (progress < 1) frame = requestAnimationFrame(step);
      else { frame = 0; onFinish(); }
    };
    frame = requestAnimationFrame(step);
  }
  return { fly, cancel };
}
