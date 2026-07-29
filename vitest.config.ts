import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default defineConfig(async (configEnv) => {
  const resolvedViteConfig =
    typeof viteConfig === 'function' ? await viteConfig(configEnv) : await viteConfig;

  return mergeConfig(resolvedViteConfig, {
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'test/e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      server: {
        deps: {
          inline: [/^@v-c\//, 'antdv-next'],
        },
      },
    },
  });
});
