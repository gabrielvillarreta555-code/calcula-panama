/** Modelo francés con pagos mensuales. Los importes de entrada y salida son centésimos enteros. */
export interface LoanInput { principal: number; annualRate: number; rateType: 'nominal' | 'effective'; months: number; insurance: number; monthlyCharges: number; upfrontFee: number }
export interface Installment { month: number; payment: number; principal: number; interest: number; balance: number }
export interface LoanResult { monthlyRate: number; regularPayment: number; regularTotal: number; finalPayment: number; interestTotal: number; totalPaid: number; netReceived: number; cost: number; installments: Installment[] }

export function monthlyInterest(annualRate: number, type: LoanInput['rateType']): number {
  if (!Number.isFinite(annualRate) || annualRate < 0 || annualRate > 1000) throw new Error('La tasa anual debe estar entre 0 y 1000 %.');
  if (Math.abs(annualRate * 1_000_000 - Math.round(annualRate * 1_000_000)) > 1e-6) throw new Error('La tasa admite hasta seis decimales.');
  if (type !== 'nominal' && type !== 'effective') throw new Error('Selecciona un tipo de tasa válido.');
  const annual = annualRate / 100;
  return type === 'nominal' ? annual / 12 : Math.expm1(Math.log1p(annual) / 12);
}

export function calculateLoan(input: LoanInput): LoanResult {
  const { principal, months, insurance, monthlyCharges, upfrontFee } = input;
  for (const amount of [principal, insurance, monthlyCharges, upfrontFee]) if (!Number.isSafeInteger(amount) || amount < 0 || amount > 1_000_000_000) throw new Error('Revisa los importes: deben estar entre B/.0 y B/.10,000,000.');
  if (principal === 0) throw new Error('El monto del préstamo debe ser mayor que cero.');
  if (upfrontFee > principal) throw new Error('La comisión inicial no puede superar el monto solicitado.');
  if (!Number.isInteger(months) || months < 1 || months > 600) throw new Error('El plazo debe ser de 1 a 600 meses enteros.');
  const rate = monthlyInterest(input.annualRate, input.rateType);
  // Nominal: aritmética entera exacta, inclusive en empates de medio centésimo.
  // Efectiva: la raíz duodécima requiere aproximación de punto flotante.
  const interestFor = (cents: number) => input.rateType === 'nominal'
    ? Number((BigInt(cents) * BigInt(Math.round(input.annualRate * 1_000_000)) + 600_000_000n) / 1_200_000_000n)
    : Math.round(cents * rate);
  // log1p/expm1 evitan la cancelación numérica para tasas próximas a cero.
  const theoretical = rate === 0 ? principal / months : principal * rate / -Math.expm1(-months * Math.log1p(rate));
  const regularPayment = Math.round(theoretical);
  if (regularPayment < 1 || (months > 1 && regularPayment <= interestFor(principal))) throw new Error('Con estos datos la cuota redondeada no amortiza el préstamo. Prueba un monto mayor o un plazo menor.');
  let balance = principal, interestTotal = 0;
  const installments: Installment[] = [];
  for (let month = 1; month <= months && balance > 0; month++) {
    // El interés de cada período se redondea al centésimo más cercano; el saldo nunca es negativo.
    const interest = interestFor(balance);
    const payment = month === months ? balance + interest : Math.min(regularPayment, balance + interest);
    const amortized = payment - interest;
    if (amortized <= 0) throw new Error('La cuota redondeada no amortiza el préstamo con estos datos.');
    balance -= amortized; interestTotal += interest;
    installments.push({ month, payment, principal: amortized, interest, balance });
  }
  const payments = installments.reduce((sum, item) => sum + item.payment, 0);
  const totalPaid = payments + installments.length * (insurance + monthlyCharges) + upfrontFee;
  return { monthlyRate: rate, regularPayment, regularTotal: regularPayment + insurance + monthlyCharges, finalPayment: installments[installments.length - 1]!.payment + insurance + monthlyCharges, interestTotal, totalPaid, netReceived: principal - upfrontFee, cost: totalPaid - principal, installments };
}
