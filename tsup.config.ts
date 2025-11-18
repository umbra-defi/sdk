import { defineConfig } from 'tsup';

export default defineConfig({
        entry: ['src/index.ts'],
        format: ['cjs', 'esm'],
        dts: true,
        sourcemap: true,
        clean: true,
        target: 'es2022',
        outDir: 'dist',
        splitting: false,
        treeshake: true,
        outExtension({ format }) {
                return {
                        js: format === 'cjs' ? '.cjs' : '.mjs',
                };
        },
});
