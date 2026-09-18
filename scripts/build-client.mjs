import { build } from 'esbuild';

await build({
  entryPoints: ['src/client.ts'],
  outfile: 'lib/client.js',
  bundle: true,
  platform: 'browser',
  format: 'cjs',
  external: ['@deepseek-ai/dsh-client-ui-primitives'],
  target: 'es2022',
  minify: true,
  sourcemap: true,
  banner: { js: 'window.__ModuleLoader__.load({id:"@michengai/dsh-simplify",factory:(require)=>{var module={exports:{}};var exports=module.exports;' },
  footer: { js: 'return module.exports;}});' },
  define: { 'process.env.NODE_ENV': '"production"' },
});
