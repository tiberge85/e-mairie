import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Le frontend appelle l'API dont l'URL est fournie au build par VITE_API_URL
// (défini sur Render pour le site statique). En dev, défaut sur localhost:3000.
//
// On résout `@e-mairie/shared` vers sa SOURCE TypeScript : le bundler la compile
// alors en ESM (exports nommés détectés statiquement), là où la version compilée
// en CommonJS du paquet — pensée pour l'API Node — pose problème à Rollup.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@e-mairie/shared': fileURLToPath(new URL('../../packages/shared/src/index.ts', import.meta.url)),
    },
  },
  server: { port: 5173 },
});
