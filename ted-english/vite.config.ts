import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repository = (
  (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.GITHUB_REPOSITORY ?? ''
);
const [owner = '', repo = ''] = repository.split('/');
const normalizedOwner = owner.toLowerCase();
const normalizedRepo = repo.toLowerCase();
const isUserOrOrgSite =
  normalizedOwner.length > 0 && normalizedRepo === `${normalizedOwner}.github.io`;

const basePath = !repo || isUserOrOrgSite ? '/' : `/${repo}/`;

export default defineConfig({
  plugins: [react()],
  base: basePath,
  server: {
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    css: true,
  },
});
