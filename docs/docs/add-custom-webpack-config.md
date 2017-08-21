---
title: "Add custom webpack config"
---

_Before creating custom webpack configuration, check to see if there's a Gatsby
plugin already built that handles your use case in the [plugins section](/docs/plugins/).
If there's not yet one and your use case is a general one, we highly encourage
you to contribute back your plugin to the Gatsby repo so it's available to
others (including your future self 😀)._

To add custom webpack configurations, create (if there's not one already)
a `gatsby-node.js` file in your root directory.  Inside this file, export a function called `modifyWebpackConfig`.

When Gatsby creates its webpack config, this function will be called allowing you to update the default
webpack config.

Gatsby does multiple webpack builds with somewhat different configuration. We
call each build type a "stage". The following stages exist:

1. develop: when running the `gatsby develop` command. Has configuration for hot reloading and CSS injection into page
2. develop-html: same as develop but without react-hmre in the babel config for rendering the HTML component.
3. build-css: production build of CSS
4. build-html: production build static HTML pages
5. build-javascript: production JavaScript build. Creates route bundles as well as a `commons` and `app bundle`.

Check [webpack.config.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/webpack.config.js) for the source.

There are many plugins in the Gatsby repo using this API to look to for examples e.g. [Sass](/packages/gatsby-plugin-sass/), [Typescript](/packages/gatsby-plugin-typescript/), [Glamor](/packages/gatsby-plugin-glamor/), and many more!


## Example

Here is an example adding an additional global variable via the `DefinePlugin` and
the `less-loader`

```js
exports.modifyWebpackConfig = ({ stage, rules, loaders, plugins, boundActionCreators }) => {

  boundActionCreators.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.less$/,
          // We don't need to add the matching ExtractText plugin
          // because gatsby already includes it and makes sure its only
          // run at the appropriate stages, e.g. not in development
          use: plugins.extractText.extract({
            fallback: loaders.style,
            use: [
              loaders.css({ importLoaders: 1 }),
              // the postcss loader comes with some nice defaults
              // including autoprefixer for our configured browsers
              loaders.postcss(),
              `less-loader`
            ],
          }),
        }
      ]
    },
    plugins: [
      plugins.define({
        __DEVELOPMENT__: stage === `develop` || stage === `develop-html`
      })
    ]
  })

};
```
