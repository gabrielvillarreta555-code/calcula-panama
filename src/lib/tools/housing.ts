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

export interface MortgageInput {
  price: number; downPayment: number; annualRate: number; years: number;
  /** Seguros mensuales exigidos (vida, incendio): se suman a la letra. */
  insurance: number;
  /** Gastos iniciales que paga el comprador (avalúo, notaría, registro, comisión): los escribe el usuario. */
  closingCosts: number;
}
export interface MortgagePhase { months: number; rate: number }

/** Valida la entrada común de la hipoteca y devuelve los importes en centésimos. */
export function mortgageBase(input: MortgageInput) {
  const price = cents(input.price, 'Precio de la vivienda'), down = cents(input.downPayment, 'Abono inicial');
  const insurance = cents(input.insurance, 'Seguros mensuales'), closing = cents(input.closingCosts, 'Gastos iniciales');
  if (price === 0) throw new Error('Precio de la vivienda: debe ser mayor que cero.');
  if (down >= price) throw new Error('El abono debe ser menor que el precio de la vivienda.');
  bounded(input.annualRate, 'Tasa de interés anual', 0, 30);
  bounded(input.years, 'Plazo', 1, 40);
  if (!Number.isInteger(input.years)) throw new Error('Plazo: usa años enteros.');
  return { price, down, insurance, closing, months: input.years * 12, financed: price - down };
}

/**
 * Amortiza por fases consecutivas. En cada fase la letra se recalcula con el saldo pendiente y los meses restantes.
 * La última cuota del préstamo ajusta los centésimos para dejar el saldo en cero.
 */
export function amortize(input: MortgageInput, phases: MortgagePhase[]) {
  const { price, down, insurance, closing, months, financed } = mortgageBase(input);
  let balance = financed, interest = 0, elapsed = 0;
  const out = phases.map((ph, k) => {
    const r = ph.rate / 1200;
    const payment = Math.round(frenchPayment(balance, r, months - elapsed));
    for (let m = 0; m < ph.months && balance > 0; m++) {
      const i = Math.round(balance * r);
      const last = k === phases.length - 1 && m === ph.months - 1;
      const p = last ? balance + i : Math.min(payment, balance + i);
      interest += i; balance = balance + i - p;
    }
    elapsed += ph.months;
    return { months: ph.months, rate: ph.rate, payment: payment / 100, withInsurance: (payment + insurance) / 100 };
  });
  return {
    financed: financed / 100, downShare: down / price * 100, phases: out,
    interest: interest / 100, insuranceTotal: insurance * months / 100,
    cashAtStart: (down + closing) / 100,
    totalCost: (down + closing + financed + interest + insurance * months) / 100,
  };
}

/** Hipoteca convencional: una sola fase a la tasa del banco durante todo el plazo. */
export function mortgage(input: MortgageInput) {
  return amortize(input, [{ months: input.years * 12, rate: input.annualRate }]);
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
