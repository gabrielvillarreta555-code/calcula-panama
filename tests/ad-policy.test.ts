import { describe, expect, it } from 'vitest';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { AD_POLICY, ADS_ACTIVE, ADS_CSP, STRICT_CSP, adPolicyFor, adsAllowed, pagesByTier, policyKey } from '../src/data/ad-policy';
import { SITEMAP_EXCLUDED, sitemapPaths } from '../src/lib/sitemap';

const pageFiles = (dir: string): string[] => readdirSync(dir).flatMap(name => {
  const file = join(dir, name);
  return statSync(file).isDirectory() ? pageFiles(file) : file.endsWith('.astro') ? [`./${relative('src/pages', file).replaceAll('\\', '/')}`] : [];
});

describe('política de publicidad por página (CP-ADS-002)', () => {
  it('cada página pública tiene una política explícita', () => {
    const paths = sitemapPaths(pageFiles('src/pages'));
    expect(paths.filter(path => !(path in AD_POLICY))).toEqual([]);
    expect(Object.keys(AD_POLICY).filter(path => !SITEMAP_EXCLUDED.has(path) && !paths.includes(path))).toEqual([]);
  });
  it('la publicidad está pausada y ninguna página la carga', () => {
    expect(ADS_ACTIVE).toBe(false);
    expect(Object.keys(AD_POLICY).filter(adsAllowed)).toEqual([]);
  });
  it('Mi Quincena, páginas legales, institucionales y de error nunca llevan publicidad', () => {
    for (const path of ['/finanzas/mi-quincena/', '/privacidad/', '/terminos/', '/contacto/', '/sobre-nosotros/', '/404/']) expect(adPolicyFor(path).tier).toBe('never');
  });
  it('las herramientas con datos personales quedan en la segunda etapa', () => {
    expect(pagesByTier('stage2').sort()).toEqual([
      '/calculadoras/decimo-tercer-mes/', '/calculadoras/horas-extras/', '/calculadoras/liquidacion-laboral/', '/calculadoras/salario-neto/', '/calculadoras/vacaciones/',
      '/compras/modo-pasillo/', '/educacion/promedio-de-notas/', '/finanzas/calculadora-prestamos/', '/finanzas/meta-de-ahorro/',
      '/vehiculos/costo-mensual-de-un-auto/', '/vehiculos/financiamiento-de-auto/'
    ]);
  });
  it('la primera etapa contiene solo guías, directorios y herramientas sin datos personales', () => {
    expect(pagesByTier('stage1').sort()).toEqual([
      '/', '/compras/', '/compras/descuentos-y-promociones/', '/compras/precio-por-unidad/', '/guias/',
      '/guias/descuentos-del-salario-en-panama/', '/guias/fechas-de-pago-del-decimo-tercer-mes/', '/guias/prima-de-antiguedad-e-indemnizacion/',
      '/herramientas/', '/vehiculos/combustible-por-viaje/', '/vida-cotidiana/consumo-electrico/'
    ]);
  });
  it('una ruta desconocida no admite publicidad y las rutas se normalizan', () => {
    expect(adPolicyFor('/nueva-pagina/').tier).toBe('never');
    expect(policyKey('/404.html')).toBe('/404/'); expect(policyKey('/guias')).toBe('/guias/'); expect(policyKey('/?a=1')).toBe('/');
  });
  it('la CSP estricta conserva todas sus protecciones', () => {
    for (const rule of ["default-src 'self'", "script-src 'self' 'unsafe-inline'", "connect-src 'none'", "form-action 'none'", "object-src 'none'", "base-uri 'self'", "img-src 'self' data:"]) expect(STRICT_CSP).toContain(rule);
    for (const rule of ["object-src 'none'", "base-uri 'self'", "form-action 'none'"]) expect(ADS_CSP).toContain(rule);
  });
});
