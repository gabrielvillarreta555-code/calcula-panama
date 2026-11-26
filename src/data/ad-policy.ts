import policy from './ad-policy.json';
import { isAdsenseEnabled } from './site';
import { ADS_TEST_ACTIVE, QUINCENA_MOVED } from './isolation';

export type AdTier = 'stage1' | 'stage2' | 'never';
export interface AdPolicyEntry { tier: AdTier; reason: string }

export const AD_POLICY = policy.pages as Record<string, AdPolicyEntry>;
/** Interruptor global. Mientras sea false, ninguna página carga AdSense. (CP_TEST_ADS_ACTIVE solo en compilaciones *.localhost.) */
export const ADS_ACTIVE: boolean = policy.active || ADS_TEST_ACTIVE;
export const ADS_PAUSED_REASON: string = policy.pausedReason;

/** Normaliza una ruta pública a la clave de la política (`/ruta/`). */
export const policyKey = (path: string) => {
  const clean = (path.split(/[?#]/)[0] ?? '').replace(/index\.html$/, '').replace(/\.html$/, '/');
  return clean.endsWith('/') ? clean : `${clean}/`;
};

/** Política de una ruta. Las rutas desconocidas se tratan como 'never' (más seguro). */
export const adPolicyFor = (path: string): AdPolicyEntry =>
  AD_POLICY[policyKey(path)] ?? { tier: 'never', reason: 'Ruta sin política explícita.' };

/**
 * Regla de decisión, separada para poder probarla: solo páginas de la primera etapa, con el
 * interruptor global activo, un ID de AdSense válido y Mi Quincena ya trasladada a su propio origen.
 * La segunda etapa necesita la calculadora aislada y nunca carga anuncios desde aquí.
 */
export const adsAllowedWith = (state: { active: boolean; enabled: boolean; quincenaMoved: boolean }, path: string) =>
  state.active && state.enabled && state.quincenaMoved && adPolicyFor(path).tier === 'stage1';

/** ¿Puede esta página cargar AdSense? (Además, en el navegador actúa la guardia de datos antiguos.) */
export const adsAllowed = (path: string) => adsAllowedWith({ active: ADS_ACTIVE, enabled: isAdsenseEnabled(), quincenaMoved: QUINCENA_MOVED }, path);

export const pagesByTier = (tier: AdTier) => Object.keys(AD_POLICY).filter(path => AD_POLICY[path]?.tier === tier);

/** CSP de las páginas sin publicidad: solo scripts y conexiones propias. No se debe relajar. */
export const STRICT_CSP = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; form-action 'none'; object-src 'none'; base-uri 'self'";
/**
 * CSP mínima de las páginas con publicidad (solo con ADS_ACTIVE). AdSense carga recursos de dominios
 * de Google que cambian, así que no se limita script-src; se bloquean plugins, envío de formularios y
 * cambios de <base>. Estas páginas no tienen campos con datos personales.
 */
export const ADS_CSP = "object-src 'none'; base-uri 'self'; form-action 'none'";
