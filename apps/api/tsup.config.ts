import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/services/spellService.mts',
    'src/services/creatureService.mts'
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  external: ['node-fetch'],
  noExternal: ['@demesne/types'],
  esbuildOptions(options) {
    options.allowOverwrite = true;
  }
}); 