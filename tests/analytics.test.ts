import { describe, expect, it } from 'vitest';
import { CF_ANALYTICS_TOKEN, analyticsAllowedWith, analyticsCsp, analyticsEnabled } from '../src/data/analytics';
import { STRICT_CSP, pagesByTier } from '../src/data/ad-policy';

const token = '0123456789abcdef0123456789abcdef';

describe('Cloudflare Web Analytics (CP-SEO-001)', () => {
  it('sigue inactiva hasta recibir el token autorizado', () => {
    expect(CF_ANALYTICS_TOKEN).toBe('');
    expect(analyticsEnabled()).toBe(false);
    for (const path of pagesByTier('stage1')) expect(analyticsAllowedWith(CF_ANALYTICS_TOKEN, path)).toBe(false);
  });
  it('con token, solo se carga en páginas sin datos personales', () => {
    for (const path of ['/', '/guias/', '/herramientas/', '/impuestos/itbms/', '/compras/dividir-la-cuenta/']) expect(analyticsAllowedWith(token, path)).toBe(true);
    for (const path of [
      '/finanzas/mi-quincena/', '/calculadoras/salario-neto/', '/calculadoras/horas-extras/', '/finanzas/calculadora-prestamos/', '/finanzas/meta-de-ahorro/',
      '/vehiculos/financiamiento-de-auto/', '/compras/modo-pasillo/', '/privacidad/', '/404/', '/ensayo/traslado-quincena/', '/ruta-desconocida/',
    ]) expect(analyticsAllowedWith(token, path)).toBe(false);
    for (const path of pagesByTier('stage2')) expect(analyticsAllowedWith(token, path)).toBe(false);
  });
  it('rechaza tokens mal formados', () => {
    for (const bad of ['x', `${token}0`, token.toUpperCase(), `${token.slice(0, 31)}"`]) expect(analyticsAllowedWith(bad, '/')).toBe(false);
  });
  it('abre la CSP solo a los dos orígenes de la baliza', () => {
    const csp = analyticsCsp(STRICT_CSP);
    expect(csp).toContain("script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com;");
    expect(csp).toContain('connect-src https://cloudflareinsights.com;');
    for (const rule of ["default-src 'self'", "form-action 'none'", "object-src 'none'", "base-uri 'self'", "img-src 'self' data:"]) expect(csp).toContain(rule);
    expect(csp).not.toContain("connect-src 'none'");
    expect(() => analyticsCsp("default-src 'self'")).toThrow();
  });
});
