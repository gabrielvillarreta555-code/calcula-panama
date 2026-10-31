import { describe, expect, it } from 'vitest';
import { directionTo, moodForEvent, nearestToRect } from './interaction';
describe('interacciones visuales de Blue', () => {
  it('asigna estados predecibles sin procesar valores', () => {
    expect(['field', 'button', 'success', 'invalid', 'idle'].map(e => moodForEvent(e as Parameters<typeof moodForEvent>[0])))
      .toEqual(['focused', 'curious', 'happy', 'surprised', 'rest']);
  });
  it('orienta la mirada mediante posiciones', () => {
    const origin = {left: 0, top: 0, right: 20, bottom: 20};
    expect(directionTo(origin, {left: 100, top: 0, right: 120, bottom: 20})).toBe('right');
    expect(directionTo(origin, {left: 0, top: -100, right: 20, bottom: -80})).toBe('up');
  });
  it('elige el candidato seguro más cercano sin inventar posiciones', () => {
    const options = [{x: 0, y: 0}, {x: 200, y: 0}];
    expect(nearestToRect(options, {width: 10, height: 10}, {left: 220, right: 240, top: 0, bottom: 20})).toEqual(options[1]);
    expect(nearestToRect([], {width: 10, height: 10}, {left: 0, right: 10, top: 0, bottom: 10})).toBeUndefined();
  });
});
