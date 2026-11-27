/**
 * Interés preferencial (Ley 468 de 2025 modificada por la Ley 481 de 2025, art. 6 y art. 7, literal c; Decreto Ejecutivo 23
 * de 2026). DESACTIVADO EN EL SITIO (corrección de CP-SEO-003, entrega 3): ninguna página importa este módulo. Se conserva
 * con sus pruebas para reactivarlo cuando los tres tramos estén verificados en el texto oficial y el CEO lo autorice.
 */
import { bounded } from './calculations';
import { amortize, type MortgageInput } from './housing';

/** Interruptor público. En false, ninguna página ofrece el modo preferencial. */
export const PREFERENTIAL_MODE_PUBLIC = false;
/** Solo el tramo 3 está verificado; los tramos 1 y 2 están pendientes del texto oficial de la Ley 468. */
export const PREFERENTIAL_TRAMO_3 = { min: 80_000.01, max: 120_000, maxSubsidizedRate: 4, months: 84, bankShareCap: 0.85 } as const;
/** El Estado subsidia el menor entre la tasa del tramo y el 85% de la tasa del banco; el comprador paga la diferencia. */
export function preferentialClientRate(bankRate: number) {
  bounded(bankRate, 'Tasa del banco', 0, 30);
  const subsidy = Math.min(PREFERENTIAL_TRAMO_3.maxSubsidizedRate, bankRate * PREFERENTIAL_TRAMO_3.bankShareCap);
  return { subsidy, clientRate: bankRate - subsidy };
}


/** Hipoteca con subsidio del tramo 3: 84 meses a la tasa del comprador y el resto a la tasa del banco. */
export function mortgagePreferential(input: MortgageInput) {
  if (input.price < PREFERENTIAL_TRAMO_3.min || input.price > PREFERENTIAL_TRAMO_3.max) throw new Error('El modo preferencial solo cubre viviendas nuevas de B/.80,000.01 a B/.120,000.00 (tramo 3).');
  if (input.years * 12 <= PREFERENTIAL_TRAMO_3.months) throw new Error('Con interés preferencial, usa un plazo mayor de 7 años.');
  const { clientRate } = preferentialClientRate(input.annualRate);
  return amortize(input, [{ months: PREFERENTIAL_TRAMO_3.months, rate: clientRate }, { months: input.years * 12 - PREFERENTIAL_TRAMO_3.months, rate: input.annualRate }]);
}
