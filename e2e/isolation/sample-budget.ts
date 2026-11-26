/** Presupuesto v1 sintético (sin datos reales) para las pruebas de traslado. */
export const SAMPLE_BUDGET = JSON.stringify({
  version: 1, start: '2026-11-15', payday: '2026-11-30', openingCents: 84250, savingsCents: 5000,
  movements: [
    { id: 'm1', name: 'Internet', cents: 3999, category: 'servicios', date: '', kind: 'gasto', status: 'pendiente', recurring: true },
    { id: 'm2', name: 'Préstamo personal', cents: 21075, category: 'deudas', date: '2026-11-20', kind: 'deuda', status: 'pagado', recurring: false }
  ]
});
export const OTHER_BUDGET = JSON.stringify({ version: 1, start: '2026-11-01', payday: '2026-11-15', openingCents: 1000, savingsCents: 0, movements: [] });
