import { describe, expect, it } from 'vitest';
import { MIGRATION, confirmsTransfer, isImportMessage, receiveImport, sha256Hex, type KeyValueStore } from '../src/lib/finance/migration';
import { isBudgetState } from '../src/lib/finance/pay-period';
import { BUDGET_KEY } from '../src/lib/finance/storage-keys';
import { adsAllowedWith } from '../src/data/ad-policy';
import { APP_ORIGIN, IS_TEST_BUILD, MAIN_ORIGIN, QUINCENA_MOVED } from '../src/data/isolation';
import { OTHER_BUDGET, SAMPLE_BUDGET } from '../e2e/isolation/sample-budget';

const memory = (initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } => {
  const data = { ...initial };
  return { data, getItem: k => (k in data ? data[k]! : null), setItem: (k, v) => { data[k] = v; } };
};
const message = async (payload: string, extra: object = {}) => ({ type: MIGRATION.data, version: 1, id: 'abc', payload, sha256: await sha256Hex(payload), ...extra });

describe('traslado de Mi Quincena (CP-ADS-003)', () => {
  it('el presupuesto de prueba es válido', () => expect(isBudgetState(JSON.parse(SAMPLE_BUDGET))).toBe(true));
  it('guarda exactamente el texto recibido y confirma con su SHA-256', async () => {
    const store = memory();
    const result = await receiveImport(await message(SAMPLE_BUDGET), store, BUDGET_KEY);
    expect(result?.status).toBe('stored'); expect(store.data[BUDGET_KEY]).toBe(SAMPLE_BUDGET);
    expect(confirmsTransfer(result!, await sha256Hex(SAMPLE_BUDGET))).toBe(true);
  });
  it('rechaza sumas que no coinciden, JSON inválido y presupuestos con formato incorrecto', async () => {
    const store = memory();
    expect((await receiveImport({ ...(await message(SAMPLE_BUDGET)), sha256: 'a'.repeat(64) }, store, BUDGET_KEY))?.status).toBe('invalid');
    expect((await receiveImport(await message('{no json'), store, BUDGET_KEY))?.status).toBe('invalid');
    expect((await receiveImport(await message(JSON.stringify({ version: 2 })), store, BUDGET_KEY))?.status).toBe('invalid');
    expect(store.data).toEqual({});
  });
  it('nunca sobrescribe otro presupuesto sin permiso explícito', async () => {
    const store = memory({ [BUDGET_KEY]: OTHER_BUDGET });
    expect((await receiveImport(await message(SAMPLE_BUDGET), store, BUDGET_KEY))?.status).toBe('exists');
    expect(store.data[BUDGET_KEY]).toBe(OTHER_BUDGET);
    expect((await receiveImport(await message(SAMPLE_BUDGET, { overwrite: true }), store, BUDGET_KEY))?.status).toBe('stored');
    expect(store.data[BUDGET_KEY]).toBe(SAMPLE_BUDGET);
  });
  it('es idempotente si el destino ya tiene el mismo presupuesto', async () => {
    const store = memory({ [BUDGET_KEY]: SAMPLE_BUDGET });
    expect((await receiveImport(await message(SAMPLE_BUDGET), store, BUDGET_KEY))?.status).toBe('stored');
  });
  it('responde error si el almacenamiento no está disponible o falla, sin confirmar el traslado', async () => {
    const failing: KeyValueStore = { getItem: () => null, setItem: () => { throw new Error('cuota'); } };
    const r1 = await receiveImport(await message(SAMPLE_BUDGET), failing, BUDGET_KEY);
    const r2 = await receiveImport(await message(SAMPLE_BUDGET), null, BUDGET_KEY);
    expect(r1?.status).toBe('error'); expect(r2?.status).toBe('error');
    expect(confirmsTransfer(r1!, await sha256Hex(SAMPLE_BUDGET))).toBe(false);
  });
  it('ignora mensajes que no son de traslado', async () => {
    for (const m of [null, 'x', { type: 'otro' }, { ...(await message(SAMPLE_BUDGET)), version: 2 }, { ...(await message(SAMPLE_BUDGET)), id: '' }]) {
      expect(isImportMessage(m)).toBe(false); expect(await receiveImport(m, memory(), BUDGET_KEY)).toBeNull();
    }
  });
});

describe('canal de ensayo', () => {
  it('acepta solo el canal de ensayo como valor opcional', async () => {
    expect(isImportMessage(await message(SAMPLE_BUDGET, { channel: 'ensayo' }))).toBe(true);
    expect(isImportMessage(await message(SAMPLE_BUDGET, { channel: 'real' }))).toBe(false);
  });
});

describe('activación de la publicidad', () => {
  const on = { active: true, enabled: true, quincenaMoved: true };
  it('exige el traslado de Mi Quincena además del interruptor', () => {
    expect(adsAllowedWith(on, '/')).toBe(true);
    expect(adsAllowedWith({ ...on, quincenaMoved: false }, '/')).toBe(false);
    expect(adsAllowedWith({ ...on, active: false }, '/')).toBe(false);
  });
  it('nunca en la segunda etapa ni en páginas excluidas, aunque todo esté activo', () => {
    for (const path of ['/calculadoras/salario-neto/', '/finanzas/mi-quincena/', '/privacidad/', '/404/', '/ruta-nueva/']) expect(adsAllowedWith(on, path)).toBe(false);
  });
  it('la compilación real usa los orígenes de producción y no acepta interruptores de prueba', () => {
    if (process.env.MAIN_ORIGIN) return;
    expect(MAIN_ORIGIN).toBe('https://calculapanama.com'); expect(APP_ORIGIN).toBe('https://app.calculapanama.com');
    expect(IS_TEST_BUILD).toBe(false); expect(QUINCENA_MOVED).toBe(false);
  });
});
