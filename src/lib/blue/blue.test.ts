import { afterEach, describe, expect, it, vi } from 'vitest';
import { at, candidates, fits, interpolate, pathIsSafe } from './geometry';
import { createMotion } from './motion';
import { createBlueState } from './state';

const bounds = { left: 0, top: 0, right: 400, bottom: 300 };
const size = { width: 50, height: 50 };
describe('posiciones seguras de Blue', () => {
  it('excluye zonas ocupadas y se adapta al tamaño visible', () => {
    const obstacles = [{ left: 300, top: 200, right: 400, bottom: 300 }];
    const points = candidates(size, bounds, obstacles);
    expect(points.length).toBeGreaterThan(0);
    expect(points.every(p => fits(p, size, bounds, obstacles))).toBe(true);
    expect(points).not.toContainEqual({ x: 350, y: 250 });
    expect(candidates(size, { left: 0, top: 0, right: 40, bottom: 40 }, [])).toEqual([]);
  });
  it('rechaza una trayectoria que cruza un control aunque los extremos sean seguros', () => {
    const start = { x: 0, y: 0 }, end = { x: 300, y: 0 };
    const obstacle = [{ left: 150, top: 0, right: 200, bottom: 100 }];
    expect(fits(start, size, bounds, obstacle)).toBe(true);
    expect(fits(end, size, bounds, obstacle)).toBe(true);
    expect(pathIsSafe(start, end, size, bounds, obstacle)).toBe(false);
    expect(pathIsSafe(start, end, size, bounds, [])).toBe(true);
    expect(at(start, size).right).toBe(50);
  });
  it('interpola sin sobrepasar los extremos', () => {
    const a = { x: 0, y: 0 }, b = { x: 100, y: 80 };
    expect(interpolate(a, b, -1)).toEqual(a);
    expect(interpolate(a, b, .5)).toEqual({ x: 50, y: 40 });
    expect(interpolate(a, b, 2)).toEqual(b);
  });
});
describe('estados y cancelación', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('rechaza transiciones imposibles y permite el recorrido normal', () => {
    const state = createBlueState();
    expect(state.transition('flying')).toBe(false);
    expect(state.value).toBe('hidden');
    expect(state.transition('idle')).toBe(true);
    expect(state.transition('flying')).toBe(true);
    expect(state.transition('landing')).toBe(true);
    expect(state.transition('idle')).toBe(true);
    expect(state.transition('hidden')).toBe(true);
  });
  it('no ejecuta fotogramas ni finalización después de cancelar', () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { callbacks.push(cb); return callbacks.length; });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const render = vi.fn(), finish = vi.fn();
    const motion = createMotion(render, finish);
    motion.fly({ x: 0, y: 0 }, { x: 50, y: 0 });
    motion.cancel();
    callbacks[0]?.(2000);
    expect(render).not.toHaveBeenCalled();
    expect(finish).not.toHaveBeenCalled();
  });
});
