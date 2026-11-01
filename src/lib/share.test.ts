import { describe, expect, it } from 'vitest';
import { buildShareText, SHARE_TOOLS, whatsappShareUrl, type ShareData } from './share';

const sample: ShareData = { tool: 'salary', primary: 'Salario neto estimado: B/.1,234.56', details: ['Seguro Social: B/.100.00'] };
describe('resúmenes compartibles', () => {
  it('no incluye importes, detalles ni productos por defecto', () => {
    const message = buildShareText({ ...sample, products: ['1 × Leche'] });
    expect(message).toContain('Salario neto — Calcula Panamá');
    expect(message).toContain('https://calculapanama.com/calculadoras/salario-neto/');
    expect(message).not.toContain('1,234'); expect(message).not.toContain('100.00'); expect(message).not.toContain('Leche');
  });
  it('incluye solo los datos activados explícitamente', () => {
    expect(buildShareText(sample, { includePrimary: true, includeDetails: false, selectedProducts: [] })).toContain('B/.1,234.56');
    expect(buildShareText(sample, { includePrimary: true, includeDetails: false, selectedProducts: [] })).not.toContain('B/.100.00');
    expect(buildShareText(sample, { includePrimary: false, includeDetails: true, selectedProducts: [] })).toContain('B/.100.00');
  });
  it('solo incorpora los productos seleccionados y sin duplicados', () => {
    const text = buildShareText({ tool: 'aisle', products: ['1 × Café', '2 × Pan'] }, { includePrimary: false, includeDetails: false, selectedProducts: [1,1,99] });
    expect(text).toContain('2 × Pan'); expect(text).not.toContain('Café'); expect(text.match(/2 × Pan/g)).toHaveLength(1);
  });
  it('utiliza rutas reales y nunca añade información a las URLs públicas', () => {
    expect(Object.values(SHARE_TOOLS).map(item => item.path)).toEqual(['/calculadoras/salario-neto/', '/calculadoras/decimo-tercer-mes/', '/calculadoras/vacaciones/', '/calculadoras/liquidacion-laboral/', '/finanzas/mi-quincena/', '/finanzas/calculadora-prestamos/', '/compras/modo-pasillo/']);
    for (const [tool, meta] of Object.entries(SHARE_TOOLS)) {
      const text = buildShareText({ tool: tool as ShareData['tool'], primary: 'B/.123.45' });
      expect(text).toContain(`https://calculapanama.com${meta.path}`); expect(meta.path).not.toMatch(/[?#]/);
    }
  });
  it('codifica el texto completo para WhatsApp', () => {
    const text = 'Décimo: B/.1,234.56\nPiña & café ¿sí?';
    const url = whatsappShareUrl(text); expect(url).toBe(`https://wa.me/?text=${encodeURIComponent(text)}`);
    expect(new URL(url).searchParams.get('text')).toBe(text);
  });
});
