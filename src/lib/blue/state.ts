/** Solo los estados necesarios para las fases 1 y 2. */
export type BlueState = 'idle' | 'flying' | 'landing' | 'hidden';
const transitions: Record<BlueState, BlueState[]> = {
  idle: ['flying', 'hidden'], flying: ['landing', 'idle', 'hidden'],
  landing: ['idle', 'hidden'], hidden: ['idle']
};
export function createBlueState() {
  let current: BlueState = 'hidden';
  return {
    get value() { return current; },
    transition(next: BlueState) {
      if (current === next) return true;
      if (!transitions[current].includes(next)) return false;
      current = next;
      return true;
    }
  };
}
