/**
 * Traslado de Mi Quincena entre orígenes propios (CP-ADS-003):
 * https://calculapanama.com (antiguo) → https://app.calculapanama.com (sin publicidad).
 *
 * El texto guardado se envía tal cual por postMessage, con su SHA-256, a un iframe del origen
 * de la app. El receptor valida el origen, la suma y el esquema; nunca sobrescribe otro
 * presupuesto sin permiso explícito, y responde con la suma de lo que releyó. El origen antiguo
 * solo borra sus datos si esa suma coincide. Ningún dato sale hacia terceros.
 */
import { isBudgetState } from './pay-period';

export const MIGRATION = {
  ready: 'cp-quincena-import-ready',
  data: 'cp-quincena-import',
  result: 'cp-quincena-import-result',
  version: 1,
  /** Tiempo máximo de espera de cada paso, en milisegundos. */
  timeoutMs: 15000
} as const;

/** channel 'ensayo': presupuestos ficticios para validar producción; se guardan en una clave aparte. */
export interface ImportMessage { type: typeof MIGRATION.data; version: 1; id: string; payload: string; sha256: string; overwrite?: boolean; channel?: 'ensayo' }
export type ImportStatus = 'stored' | 'exists' | 'invalid' | 'error';
export interface ImportResult { type: typeof MIGRATION.result; id: string; status: ImportStatus; sha256?: string }
export interface KeyValueStore { getItem(key: string): string | null; setItem(key: string, value: string): void }

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/** Límite de tamaño del mensaje: un presupuesto de 200 movimientos ocupa mucho menos. */
const MAX_PAYLOAD = 512 * 1024;

export function isImportMessage(value: unknown): value is ImportMessage {
  if (!value || typeof value !== 'object') return false;
  const m = value as Record<string, unknown>;
  return m.type === MIGRATION.data && m.version === MIGRATION.version && typeof m.id === 'string' && m.id.length > 0 && m.id.length <= 64
    && typeof m.payload === 'string' && m.payload.length <= MAX_PAYLOAD && typeof m.sha256 === 'string' && /^[0-9a-f]{64}$/.test(m.sha256)
    && (m.overwrite === undefined || typeof m.overwrite === 'boolean') && (m.channel === undefined || m.channel === 'ensayo');
}

export function isImportResult(value: unknown, id: string): value is ImportResult {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return r.type === MIGRATION.result && r.id === id && ['stored', 'exists', 'invalid', 'error'].includes(String(r.status));
}

/**
 * Lógica del receptor (origen de la app). Devuelve null si el mensaje no es de traslado.
 * Quien la llame debe comprobar antes event.origin y event.source.
 */
export async function receiveImport(message: unknown, store: KeyValueStore | null, key: string): Promise<ImportResult | null> {
  if (!isImportMessage(message)) return null;
  const reply = (status: ImportStatus, sha256?: string): ImportResult => ({ type: MIGRATION.result, id: message.id, status, ...(sha256 ? { sha256 } : {}) });
  try {
    if ((await sha256Hex(message.payload)) !== message.sha256) return reply('invalid');
    let parsed: unknown;
    try { parsed = JSON.parse(message.payload); } catch { return reply('invalid'); }
    if (!isBudgetState(parsed)) return reply('invalid');
    if (!store) return reply('error');
    const existing = store.getItem(key);
    if (existing !== null && existing !== message.payload && !message.overwrite) return reply('exists');
    store.setItem(key, message.payload);
    const stored = store.getItem(key);
    return stored === null ? reply('error') : reply('stored', await sha256Hex(stored));
  } catch {
    return reply('error');
  }
}

/** ¿Confirma el resultado que el destino guardó exactamente lo enviado? */
export const confirmsTransfer = (result: ImportResult, sentSha256: string) => result.status === 'stored' && result.sha256 === sentSha256;
