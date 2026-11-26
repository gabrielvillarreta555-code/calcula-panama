import policy from './ad-policy.json';
import { isAdsenseEnabled } from './site';

export type AdTier = 'stage1' | 'stage2' | 'never';
export interface AdPolicyEntry { tier: AdTier; reason: string }

export const AD_POLICY = policy.pages as Record<string, AdPolicyEntry>;
/** Interruptor global. Mientras sea false, ninguna página carga AdSense. */
export const ADS_ACTIVE: boolean = policy.active;
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
 * ¿Puede esta página cargar el script de AdSense?
 * Solo las páginas de la primera etapa, y solo con el interruptor global activo.
 * La segunda etapa necesita la arquitectura aislada y nunca carga anuncios desde aquí.
 */
export const adsAllowed = (path: string) => ADS_ACTIVE && isAdsenseEnabled() && adPolicyFor(path).tier === 'stage1';

export const pagesByTier = (tier: AdTier) => Object.keys(AD_POLICY).filter(path => AD_POLICY[path]?.tier === tier);

/** CSP de las páginas sin publicidad: solo scripts y conexiones propias. No se debe relajar. */
export const STRICT_CSP = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; form-action 'none'; object-src 'none'; base-uri 'self'";
/**
 * CSP mínima de las páginas con publicidad (solo con ADS_ACTIVE). AdSense carga recursos de dominios
 * de Google que cambian, así que no se limita script-src; se bloquean plugins, envío de formularios y
 * cambios de <base>. Estas páginas no tienen campos con datos personales.
 */
export const ADS_CSP = "object-src 'none'; base-uri 'self'; form-action 'none'";
