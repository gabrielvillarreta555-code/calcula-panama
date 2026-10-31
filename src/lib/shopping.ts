export const MAX_PRICE_CENTS = 100_000_000; // B/.1,000,000 por unidad
export const MAX_QUANTITY_MILLI = 100_000_000; // 100,000 unidades, hasta 3 decimales
export const MAX_ITEMS = 500;

export interface ShoppingItem {
  id: string;
  name: string;
  priceCents: number;
  /** Cantidad en milésimas para evitar aritmética binaria con decimales. */
  quantityMilli: number;
}

export interface ShoppingSummary {
  subtotalCents: number;
  lineCount: number;
  quantityMilli: number;
  budgetCents: number | null;
  balanceCents: number | null;
  overBudget: boolean;
  /** Punto de extensión: en esta versión no se aplican impuestos ni descuentos. */
  adjustments: readonly [];
}

function normalizedDecimal(value: string): string {
  return value.trim().replace(',', '.');
}

export function parseMoneyToCents(value: string): number {
  const normalized = normalizedDecimal(value);
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error('Escribe un precio válido con hasta 2 decimales.');
  }
  const [whole, decimal = ''] = normalized.split('.');
  const cents = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents < 0 || cents > MAX_PRICE_CENTS) {
    throw new Error('El precio debe estar entre B/.0.00 y B/.1,000,000.00.');
  }
  return cents;
}

export function parseQuantityToMilli(value: string): number {
  const normalized = normalizedDecimal(value);
  if (!/^\d+(?:\.\d{1,3})?$/.test(normalized)) {
    throw new Error('Escribe una cantidad válida con hasta 3 decimales.');
  }
  const [whole, decimal = ''] = normalized.split('.');
  const milli = Number(whole) * 1000 + Number(decimal.padEnd(3, '0'));
  if (!Number.isSafeInteger(milli) || milli <= 0 || milli > MAX_QUANTITY_MILLI) {
    throw new Error('La cantidad debe ser mayor que 0 y no superar 100,000.');
  }
  return milli;
}

/** Redondeo comercial a centésimos por línea, usando enteros. */
export function lineSubtotalCents(priceCents: number, quantityMilli: number): number {
  if (!Number.isSafeInteger(priceCents) || priceCents < 0 || priceCents > MAX_PRICE_CENTS) {
    throw new Error('El precio no es válido.');
  }
  if (!Number.isSafeInteger(quantityMilli) || quantityMilli <= 0 || quantityMilli > MAX_QUANTITY_MILLI) {
    throw new Error('La cantidad no es válida.');
  }
  const subtotal = (BigInt(priceCents) * BigInt(quantityMilli) + 500n) / 1000n;
  const value = Number(subtotal);
  if (!Number.isSafeInteger(value)) throw new Error('El subtotal supera el límite permitido.');
  return value;
}

export function normalizeItemName(value: string): string {
  const name = value.trim().replace(/\s+/g, ' ');
  if (name.length > 80) throw new Error('El nombre no puede superar 80 caracteres.');
  return name;
}

export function summarizeShopping(items: readonly ShoppingItem[], budgetCents: number | null): ShoppingSummary {
  if (items.length > MAX_ITEMS) throw new Error(`La lista no puede superar ${MAX_ITEMS} productos.`);
  if (budgetCents !== null && (!Number.isSafeInteger(budgetCents) || budgetCents < 0 || budgetCents > MAX_PRICE_CENTS)) {
    throw new Error('El presupuesto no es válido.');
  }
  let subtotal = 0;
  let quantityMilli = 0;
  for (const item of items) {
    subtotal += lineSubtotalCents(item.priceCents, item.quantityMilli);
    quantityMilli += item.quantityMilli;
    if (!Number.isSafeInteger(subtotal) || !Number.isSafeInteger(quantityMilli)) {
      throw new Error('La lista supera el límite permitido.');
    }
  }
  const balance = budgetCents === null ? null : budgetCents - subtotal;
  return {
    subtotalCents: subtotal,
    lineCount: items.length,
    quantityMilli,
    budgetCents,
    balanceCents: balance,
    overBudget: balance !== null && balance < 0,
    adjustments: []
  };
}
