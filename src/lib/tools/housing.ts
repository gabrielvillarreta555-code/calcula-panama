/**
 * Motores de Vivienda (CP-SEO-003, entrega 3). Puros: sin DOM, red ni almacenamiento.
 * Importes en centésimos internamente; tasas nominales anuales con capitalización mensual (tasa ÷ 12).
 */
import { bounded } from './calculations';

const cents = (n: number, name: string) => {
  bounded(n, name, 0, 100_000_000);
  const v = Math.round(n * 100);
  if (Math.abs(n * 100 - v) > 1e-6) throw new Error(`${name}: usa como máximo dos decimales.`);
  return v;
};
/** Cuota del sistema francés en centésimos (sin redondear). */
export const frenchPayment = (principal: number, monthlyRate: number, months: number) =>
  monthlyRate === 0 ? principal / months : principal * monthlyRate / -Math.expm1(-months * Math.log1p(monthlyRate));
/** Valor presente de una cuota mensual: el préstamo máximo que paga esa cuota. */
export const presentValue = (payment: number, monthlyRate: number, months: number) =>
  monthlyRate === 0 ? payment * months : payment * -Math.expm1(-months * Math.log1p(monthlyRate)) / monthlyRate;

/**
 * Interés preferencial verificado (Ley 468 de 2025 modificada por la Ley 481 de 2025, art. 6 y art. 7, literal c;
 * Decreto Ejecutivo 23 de 2026). Solo el tramo 3: los tramos 1 y 2 no se publican hasta verificar el texto oficial de la Ley 468.
 */
export const PREFERENTIAL_TRAMO_3 = { min: 80_000.01, max: 120_000, maxSubsidizedRate: 4, months: 84, bankShareCap: 0.85 } as const;
/** El Estado subsidia el menor entre la tasa del tramo y el 85% de la tasa del banco; el comprador paga la diferencia. */
export function preferentialClientRate(bankRate: number) {
  bounded(bankRate, 'Tasa del banco', 0, 30);
  const subsidy = Math.min(PREFERENTIAL_TRAMO_3.maxSubsidizedRate, bankRate * PREFERENTIAL_TRAMO_3.bankShareCap);
  return { subsidy, clientRate: bankRate - subsidy };
}

export interface MortgageInput {
  price: number; downPayment: number; annualRate: number; years: number;
  /** Seguros mensuales exigidos (vida, incendio): se suman a la letra. */
  insurance: number;
  /** Gastos iniciales que paga el comprador (avalúo, notaría, registro, comisión): los escribe el usuario. */
  closingCosts: number;
  preferential: boolean;
}

export function mortgage(input: MortgageInput) {
  const price = cents(input.price, 'Precio de la vivienda'), down = cents(input.downPayment, 'Abono inicial');
  const insurance = cents(input.insurance, 'Seguros mensuales'), closing = cents(input.closingCosts, 'Gastos iniciales');
  if (price === 0) throw new Error('Precio de la vivienda: debe ser mayor que cero.');
  if (down >= price) throw new Error('El abono debe ser menor que el precio de la vivienda.');
  bounded(input.annualRate, 'Tasa de interés anual', 0, 30);
  bounded(input.years, 'Plazo', 1, 40);
  if (!Number.isInteger(input.years)) throw new Error('Plazo: usa años enteros.');
  const months = input.years * 12, financed = price - down;
  let phases: { months: number; rate: number; payment: number }[];
  let interest = 0, balance = financed;
  const run = (rate: number, count: number, payment: number, closes = false) => {
    const r = rate / 1200;
    for (let m = 0; m < count && balance > 0; m++) {
      const i = Math.round(balance * r);
      // La última cuota del préstamo ajusta los centésimos para dejar el saldo en cero.
      const p = closes && m === count - 1 ? balance + i : Math.min(payment, balance + i);
      interest += i; balance = balance + i - p;
    }
  };
  if (input.preferential) {
    const p = input.price;
    if (p < PREFERENTIAL_TRAMO_3.min || p > PREFERENTIAL_TRAMO_3.max) throw new Error('El modo preferencial de esta calculadora solo cubre viviendas nuevas de B/.80,000.01 a B/.120,000.00 (tramo 3). Para precios menores, consulta los tramos con tu banco.');
    if (months <= PREFERENTIAL_TRAMO_3.months) throw new Error('Con interés preferencial, usa un plazo mayor de 7 años.');
    const { clientRate } = preferentialClientRate(input.annualRate);
    const first = Math.round(frenchPayment(financed, clientRate / 1200, months));
    run(clientRate, PREFERENTIAL_TRAMO_3.months, first);
    const afterBalance = balance;
    const second = Math.round(frenchPayment(afterBalance, input.annualRate / 1200, months - PREFERENTIAL_TRAMO_3.months));
    run(input.annualRate, months - PREFERENTIAL_TRAMO_3.months, second, true);
    phases = [{ months: PREFERENTIAL_TRAMO_3.months, rate: clientRate, payment: first }, { months: months - PREFERENTIAL_TRAMO_3.months, rate: input.annualRate, payment: second }];
  } else {
    const pay = Math.round(frenchPayment(financed, input.annualRate / 1200, months));
    run(input.annualRate, months, pay, true);
    phases = [{ months, rate: input.annualRate, payment: pay }];
  }
  // El último pago absorbe el redondeo: el saldo final se suma a los intereses pagados para cuadrar el total.
  const paidLoan = financed + interest;
  return {
    financed: financed / 100, downShare: down / price * 100,
    phases: phases.map(ph => ({ months: ph.months, rate: ph.rate, payment: ph.payment / 100, withInsurance: (ph.payment + insurance) / 100 })),
    interest: interest / 100, insuranceTotal: insurance * months / 100,
    cashAtStart: (down + closing) / 100,
    totalCost: (down + closing + paidLoan + insurance * months) / 100,
  };
}

export interface AffordabilityInput { netIncome: number; otherDebts: number; maxShare: number; annualRate: number; years: number; downPayment: number; insurance: number }
/** Capacidad de compra: la cuota máxima la fija el porcentaje del ingreso que indique el usuario (cada banco aplica su criterio). */
export function affordability(input: AffordabilityInput) {
  const income = cents(input.netIncome, 'Ingreso neto mensual'), debts = cents(input.otherDebts, 'Otras deudas mensuales');
  const down = cents(input.downPayment, 'Abono disponible'), insurance = cents(input.insurance, 'Seguros mensuales');
  if (income === 0) throw new Error('Ingreso neto mensual: debe ser mayor que cero.');
  bounded(input.maxShare, 'Porcentaje máximo del ingreso', 1, 100);
  bounded(input.annualRate, 'Tasa de interés anual', 0, 30);
  bounded(input.years, 'Plazo', 1, 40);
  if (!Number.isInteger(input.years)) throw new Error('Plazo: usa años enteros.');
  const maxTotal = Math.floor(income * input.maxShare / 100);
  const maxPayment = maxTotal - debts - insurance;
  if (maxPayment <= 0) throw new Error('Con ese porcentaje, tus otras deudas y los seguros ya ocupan toda la cuota posible.');
  const loan = Math.floor(presentValue(maxPayment, input.annualRate / 1200, input.years * 12));
  return { maxTotal: maxTotal / 100, maxPayment: maxPayment / 100, maxLoan: loan / 100, maxPrice: (loan + down) / 100, downShare: loan + down > 0 ? down / (loan + down) * 100 : 0 };
}

export interface RentBuyInput {
  rent: number; rentIncrease: number; price: number; downPayment: number; closingCosts: number; annualRate: number; years: number;
  /** Gastos mensuales del propietario: seguros, cuota de mantenimiento, impuesto de inmueble, reparaciones. */
  ownerCosts: number; appreciation: number; savingsReturn: number; horizon: number;
}
/**
 * Alquilar o comprar a un horizonte dado. Compara el patrimonio final de dos personas con el mismo dinero inicial:
 * quien compra tiene el valor de la vivienda menos el saldo de la hipoteca; quien alquila invierte el abono y los gastos
 * iniciales, y cada mes invierte la diferencia si alquilar le cuesta menos (y viceversa). Todas las tasas las fija el usuario.
 */
export function rentOrBuy(input: RentBuyInput) {
  for (const [v, n] of [[input.rent, 'Alquiler mensual'], [input.price, 'Precio de la vivienda'], [input.downPayment, 'Abono'], [input.closingCosts, 'Gastos iniciales'], [input.ownerCosts, 'Gastos mensuales del propietario']] as const) cents(v, n);
  if (input.rent <= 0 || input.price <= 0) throw new Error('El alquiler y el precio deben ser mayores que cero.');
  if (input.downPayment >= input.price) throw new Error('El abono debe ser menor que el precio de la vivienda.');
  for (const [v, n] of [[input.rentIncrease, 'Aumento anual del alquiler'], [input.appreciation, 'Valorización anual'], [input.savingsReturn, 'Rendimiento del ahorro']] as const) bounded(v, n, -20, 30);
  bounded(input.annualRate, 'Tasa de interés anual', 0, 30); bounded(input.years, 'Plazo', 1, 40); bounded(input.horizon, 'Horizonte', 1, 40);
  if (!Number.isInteger(input.years) || !Number.isInteger(input.horizon)) throw new Error('Plazo y horizonte: usa años enteros.');
  const n = input.years * 12, r = input.annualRate / 1200, s = input.savingsReturn / 1200;
  const payment = frenchPayment(input.price - input.downPayment, r, n);
  let balance = input.price - input.downPayment, rent = input.rent, portfolio = input.downPayment + input.closingCosts;
  let paidBuy = input.downPayment + input.closingCosts, paidRent = 0;
  const years: { year: number; buyerWealth: number; renterWealth: number }[] = [];
  for (let m = 1; m <= input.horizon * 12; m++) {
    const loanPay = m <= n ? Math.min(payment, balance * (1 + r)) : 0;
    if (m <= n) balance = Math.max(0, balance * (1 + r) - loanPay);
    const buyMonthly = loanPay + input.ownerCosts;
    portfolio = portfolio * (1 + s) + (buyMonthly - rent);
    paidBuy += buyMonthly; paidRent += rent;
    if (m % 12 === 0) {
      const value = input.price * Math.pow(1 + input.appreciation / 100, m / 12);
      years.push({ year: m / 12, buyerWealth: value - balance, renterWealth: portfolio });
      rent *= 1 + input.rentIncrease / 100;
    }
  }
  const last = years.at(-1)!;
  return { payment, buyMonthlyStart: payment + input.ownerCosts, paidBuy, paidRent, buyerWealth: last.buyerWealth, renterWealth: last.renterWealth, difference: last.buyerWealth - last.renterWealth, years, breakEven: years.find(y => y.buyerWealth >= y.renterWealth)?.year ?? null };
}

/**
 * ITBI de la primera venta de vivienda nueva (Ley 106 de 1974, art. 4, según la Ley 546 de 2026). Lo paga el vendedor:
 * es nula la cláusula que lo traslade al comprador. Solo informativo para la guía; no cubre bases mayores de B/.200,000.
 */
export const ITBI_NEW_HOME_SCALE = [
  { upTo: 130_000, rate: 0.5 }, { upTo: 150_000, rate: 1.0 }, { upTo: 170_000, rate: 1.4 }, { upTo: 190_000, rate: 1.6 }, { upTo: 200_000, rate: 1.8 },
] as const;
export function itbiNewHome(base: number) {
  bounded(base, 'Base imponible', 0, 200_000);
  if (base <= 120_000) return { rate: 0, tax: 0 };
  const rate = ITBI_NEW_HOME_SCALE.find(t => base <= t.upTo)!.rate;
  return { rate, tax: Math.round((base - 120_000) * rate) / 100 };
}
