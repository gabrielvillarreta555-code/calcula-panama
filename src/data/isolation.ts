import isolation from './isolation.json';
export { BUDGET_KEY, MIGRATED_FLAG_KEY } from '../lib/finance/storage-keys';

const env = (name: string): string | undefined => (typeof process !== 'undefined' ? process.env[name] : undefined);

/** Origen del sitio principal (con publicidad en la primera etapa). */
export const MAIN_ORIGIN = new URL(env('MAIN_ORIGIN') || 'https://calculapanama.com').origin;
/** Origen de la app sin publicidad donde vive Mi Quincena. */
export const APP_ORIGIN = new URL(env('APP_ORIGIN') || 'https://app.calculapanama.com').origin;

/**
 * Las compilaciones de prueba usan orígenes *.localhost. Solo en ellas se aceptan los interruptores
 * CP_TEST_*; una compilación con el dominio real nunca puede activarlos por variable de entorno.
 */
export const IS_TEST_BUILD = /\.localhost$/.test(new URL(MAIN_ORIGIN).hostname) && /\.localhost$/.test(new URL(APP_ORIGIN).hostname);
export const QUINCENA_MOVED: boolean = isolation.quincenaMoved || (IS_TEST_BUILD && env('CP_TEST_QUINCENA_MOVED') === '1');
export const ADS_TEST_ACTIVE: boolean = IS_TEST_BUILD && env('CP_TEST_ADS_ACTIVE') === '1';
