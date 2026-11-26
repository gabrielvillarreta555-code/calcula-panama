// Fotografías de la Midnight Edition (CP-DESIGN-005).
// Lee la selección (docs/cp-design-005/seleccion-fotos.json), vuelve a comprobar en Wikimedia Commons
// la licencia (solo CC0, dominio público, CC BY o CC BY-SA: uso comercial permitido) y el EXIF de
// cámara (fotografía real), descarga el original y genera AVIF y WebP en 800 y 1600 px en public/fotos/.
// Escribe src/data/photos.json con autoría, licencia y procedencia para los créditos.
// Uso: NODE_USE_ENV_PROXY=1 node scripts/fotos.mjs   (requiere la dependencia de desarrollo sharp)
import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const selection = JSON.parse(readFileSync('docs/cp-design-005/seleccion-fotos.json', 'utf8'));
const UA = { 'User-Agent': 'photo-license-review/1.0 (low volume)' };
const LICENSES = /^(CC0|Public domain|CC BY(-SA)? [0-9.]+)$/i;
const WIDTHS = [800, 1600];
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url, json = true) {
  for (let i = 0; i < 10; i++) {
    const r = await fetch(url, { headers: UA });
    if (r.status === 429 || r.status >= 500) { await sleep(8000 * (i + 1)); continue; }
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return json ? r.json() : Buffer.from(await r.arrayBuffer());
  }
  throw new Error(`Sin respuesta: ${url}`);
}
const strip = html => String(html ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

mkdirSync('public/fotos', { recursive: true });
const out = existsSync('src/data/photos.json') ? JSON.parse(readFileSync('src/data/photos.json', 'utf8')) : {};
for (const item of selection) {
  const api = new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({ action: 'query', format: 'json', titles: item.title, prop: 'imageinfo', iiprop: 'url|size|extmetadata|metadata|mime|sha1', iiurlwidth: '1920' }).forEach(([k, v]) => api.searchParams.set(k, v));
  const page = Object.values((await get(api)).query.pages)[0];
  const info = page.imageinfo[0], m = info.extmetadata, exif = Object.fromEntries((info.metadata ?? []).map(x => [x.name, x.value]));
  const license = strip(m.LicenseShortName?.value);
  if (!LICENSES.test(license)) throw new Error(`Licencia no permitida para ${item.title}: ${license}`);
  if (!exif.Make) throw new Error(`Sin EXIF de cámara: ${item.title}`);
  if (/AI-generated|AI generated/i.test(m.Categories?.value ?? '')) throw new Error(`Marcada como IA: ${item.title}`);
  // Miniatura oficial de 1920 px (suficiente para 1600 px) en vez del original: menos carga para Commons.
  const done = WIDTHS.every(w => existsSync(`public/fotos/${item.key}-${w}.avif`) && existsSync(`public/fotos/${item.key}-${w}.webp`));
  const source = info.thumburl ? info.thumburl.replace('https://thumb.wikimedia.org/', 'https://upload.wikimedia.org/').split('?')[0] : info.url;
  const original = done ? null : await get(source, false);
  await sleep(3000);
  const ratio = info.height / info.width;
  for (const width of done ? [] : WIDTHS) {
    const image = sharp(original).rotate();
    const resized = image.resize({ width, withoutEnlargement: true });
    await resized.clone().avif({ quality: 52, effort: 6 }).toFile(`public/fotos/${item.key}-${width}.avif`);
    await resized.clone().webp({ quality: 74 }).toFile(`public/fotos/${item.key}-${width}.webp`);
  }
  out[item.key] = {
    alt: item.alt, width: 1600, height: Math.round(1600 * ratio),
    author: strip(m.Artist?.value) || 'Autor desconocido', license, licenseUrl: m.LicenseUrl?.value ?? '',
    source: info.descriptionurl, title: item.title, camera: `${exif.Make} ${exif.Model ?? ''}`.trim(), sha1: info.sha1,
    attributionRequired: m.AttributionRequired?.value === 'true', modified: 'Redimensionada y convertida a AVIF/WebP'
  };
  writeFileSync('src/data/photos.json', JSON.stringify(out, null, 2) + '\n');
  console.log(item.key, license, out[item.key].camera, out[item.key].author);
}
writeFileSync('src/data/photos.json', JSON.stringify(out, null, 2) + '\n');
