/**
 * Cloudflare Web Analytics (CP-SEO-001), sin cookies ni almacenamiento local, según Cloudflare:
 * https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/
 *
 * Inactiva mientras CF_ANALYTICS_TOKEN esté vacío. El token lo crea Blue Lab Studios en el panel de Cloudflare;
 * es público (aparece en el HTML) y no es un secreto. Activarla requiere la autorización del CEO.
 *
 * Solo se carga en páginas de la primera etapa de src/data/ad-policy.json: guías, directorios y herramientas
 * sin datos personales. Nunca en Mi Quincena, la app aislada (usa su propio AppLayout), las calculadoras con
 * salarios, deudas, ahorros o presupuestos (segunda etapa), páginas legales ni rutas sin política.
 */
import { adPolicyFor } from './ad-policy';

export const CF_ANALYTICS_TOKEN = '';
export const CF_BEACON_SRC = 'https://static.cloudflareinsights.com/beacon.min.js';
/** Sitios no servidos a través del proxy de Cloudflare (GitHub Pages): la baliza envía los datos a este origen. */
export const CF_BEACON_ENDPOINT = 'https://cloudflareinsights.com';

const TOKEN = /^[0-9a-f]{32}$/;

/** Regla de decisión, separada para poder probarla con un token ficticio. */
export const analyticsAllowedWith = (token: string, path: string) => TOKEN.test(token) && adPolicyFor(path).tier === 'stage1';
export const analyticsAllowed = (path: string) => analyticsAllowedWith(CF_ANALYTICS_TOKEN, path);
export const analyticsEnabled = () => TOKEN.test(CF_ANALYTICS_TOKEN);

/** Abre la CSP estricta solo a los dos orígenes de la baliza; conserva todas las demás protecciones. */
export function analyticsCsp(csp: string): string {
  const script = "script-src 'self' 'unsafe-inline'", connect = "connect-src 'none'";
  if (!csp.includes(script) || !csp.includes(connect)) throw new Error('CSP inesperada: no se abre para la analítica.');
  return csp.replace(script, `${script} ${new URL(CF_BEACON_SRC).origin}`).replace(connect, `connect-src ${CF_BEACON_ENDPOINT}`);
}
