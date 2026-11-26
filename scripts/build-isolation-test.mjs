// Compila el sitio principal y la app con orígenes de prueba *.localhost (CP-ADS-003).
// Solo en estos orígenes se aceptan CP_TEST_QUINCENA_MOVED y CP_TEST_ADS_ACTIVE.
import { execSync } from 'node:child_process';
export const MAIN = 'http://calculapanama.localhost:4331';
export const APP = 'http://app.calculapanama.localhost:4332';
const common = { ...process.env, MAIN_ORIGIN: MAIN, APP_ORIGIN: APP };
execSync('npx astro build', { stdio: 'inherit', env: { ...common, SITE_URL: `${MAIN}/`, OUT_DIR: 'dist-test-main', CP_TEST_QUINCENA_MOVED: '1', CP_TEST_ADS_ACTIVE: '1' } });
execSync('npx astro build', { stdio: 'inherit', env: { ...common, SITE_TARGET: 'app', OUT_DIR: 'dist-test-app' } });
execSync('node scripts/verify-app.mjs', { stdio: 'inherit', env: { ...common, OUT_DIR: 'dist-test-app' } });
