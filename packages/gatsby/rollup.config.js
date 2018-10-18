import babel from 'rollup-plugin-babel';
import autoExternal from 'rollup-plugin-auto-external';

export default {
  input: 'cache-dir/gatsby-browser-entry.js',
  plugins: [
    autoExternal(),
    babel({
      presets: [[require(`path`).join(__dirname, `..`, `..`, `.babel-preset.js`), {modules: false}]],
      runtimeHelpers: true,
      exclude: ['./node_modules/**']
    })
  ],
  output: [
    {file: 'lib/index.cjs.js', format: 'cjs', sourcemap: true},
    {file: 'lib/index.es.js', format: 'es', sourcemap: true}
  ]
};
