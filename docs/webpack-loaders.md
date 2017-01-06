# How to use your own webpack loaders

Gatsby uses [webpack-configurator](https://github.com/lewie9021/webpack-configurator)
to make changing the webpack loaders easy. The default set of loaders is organized by [key](lib/utils/webpack.config.js#L125).

To modify the Webpack configuration, create a `gatsby-node.js` in the root of your project
and export there a `modifyWebpackConfig` function.

```javascript
exports.modifyWebpackConfig = function(config, stage) {
  // edit loaders here
  return config
}
```

Gatsby calls this function with the webpack-configurator object and
"stage" string when it creates a Webpack config. It first
loads the defaults and then allows you to modify it.

The `stage` can be

1) develop: for `gatsby develop` command, hot reload and CSS injection into page
2) develop-html: same as develop without react-hmre in the babel config for html renderer
3) build-css: build styles.css file
4) build-html: build all HTML files
5) build-javascript: Build bundle.js for Single Page App in production

Consider the following example which removes the default css loader
and replaces it with a loader that uses css-modules.

```javascript
exports.modifyWebpackConfig = function(config, stage) {
  config.removeLoader('css')
  config.loader('css', function(cfg) {
    cfg.test = /\.css$/
    cfg.loader = 'style!css?modules'
    return cfg
  })
  return config
}
```

Each loader (`cfg` in the above example) can be a valid
[webpack loader](https://webpack.github.io/docs/configuration.html#module-loaders)
and there are a host of
[preexisting loaders](https://webpack.github.io/docs/list-of-loaders.html)
which you can use to enhance Gatsby.

It is also possible to [write your own loaders](https://webpack.github.io/docs/how-to-write-a-loader.html).

Gatsby includes [some default loaders](https://github.com/gatsbyjs/gatsby/tree/master/lib/loaders) that you can also override.

To write your own loader or override a Gatsby loader, make a `loaders` directory at the root of your site that contains directories for custom loaders.

e.g. `loaders/markdown-loader/index.js` [will take precedence](https://github.com/gatsbyjs/gatsby/blob/master/lib/utils/webpack.config.js#L325)
over the markdown-loader that Gatsby includes.

[See an example of a custom loader in the default starter](https://github.com/gatsbyjs/gatsby-starter-default/blob/master/loaders/markdown-loader/index.js).
