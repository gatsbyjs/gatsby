# How to use your own webpack plugins

Similar to the loaders, plugins are handled via
[webpack-configurator](https://github.com/lewie9021/webpack-configurator)
and `gatsby-node.js`.

_Note: the following example is now redundant since
ExtractTextWebpackPlugin is now setup by default but you can still use
it as an example of how to modify the Webpack plugins._

If we wanted to extract all of the css in our project into a single
`styles.css` file for production, we could add the
`ExtractTextWebpackPlugin`. To do this, we need to modify the loader
and add the plugin when generating the static HTML for our site.

```javascript
var ExtractTextPlugin = require("extract-text-webpack-plugin")

exports.modifyWebpackConfig = function(config, stage) {
  if(stage === 'build-html') {
    config.removeLoader('css')
    config.loader('css', function(cfg) {
      cfg.test = /\.css$/
      cfg.loader = ExtractTextPlugin.extract('css?minimize')
      return cfg
    })
    config.plugin('extract-css',
                  ExtractTextPlugin,
                  ["styles.css", { allChunks: true }])
  }
  return config
}
```

Each plugin (`extract-css` in the above example) can be a valid
[webpack plugin](https://webpack.github.io/docs/using-plugins.html)
and there are a host of
[preexisting plugins](https://webpack.github.io/docs/list-of-plugins.html)
which you can use to enhance Gatsby.

It is also possible to
[write your own plugins](https://webpack.github.io/docs/how-to-write-a-plugin.html).
