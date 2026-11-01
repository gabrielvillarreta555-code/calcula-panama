/** Límite técnico por campo, no una disposición legal ni un salario máximo. */
export const MAX_LABOR_INPUT = 10_000_000;

/** Valida solo las entradas; no altera fórmulas ni redondeos. */
export function assertLaborInput(value: number | undefined): void {
  if (value === undefined) return;
  if (!Number.isFinite(value) || Math.abs(value) > MAX_LABOR_INPUT) {
    throw new Error('Introduce un número finito que no supere 10,000,000 en valor absoluto (límite técnico).');
  }
}
