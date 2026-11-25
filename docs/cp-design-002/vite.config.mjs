import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({root:fileURLToPath(new URL('.',import.meta.url)),base:'./',build:{outDir:'/tmp/cp-design-002-preview',emptyOutDir:true,rollupOptions:{input:{home:fileURLToPath(new URL('index.html',import.meta.url)),vehicle:fileURLToPath(new URL('vehiculos.html',import.meta.url))}}}});
