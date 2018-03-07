* Remove postcss plugins (cssnext, cssimport) from default css loader config
* change webpack api
* Source & transformer plugins now use UUIDs for ids. If you used glob or regex to query nodes by id then you'll need to query something else.
* Mixed commonjs/es6 modules fail
* Remove explicit polyfill and use the new builtins: usage support in babel 7.
* Changed `modifyBabelrc` to `onCreateBabelConfig`
* Changed `modifyWebpackConfig` to `onCreateWebpackConfig`
