* Remove postcss plugins (cssnext, cssimport) from default css loader config
* boundActionCreators => actions
* Source & transformer plugins now use UUIDs for ids. If you used glob or regex to query nodes by id then you'll need to query something else.
* Mixed commonjs/es6 modules fail
* Remove explicit polyfill and use the new builtins: usage support in babel 7.
* Changed `modifyBabelrc` to `onCreateBabelConfig`
* Changed `modifyWebpackConfig` to `onCreateWebpackConfig`
* Inlining CSS changed — remove it from any custom html.js as done automatically by core now.
* Manually install `react` and `react-dom`, along with any dependencies required by your plugins.
