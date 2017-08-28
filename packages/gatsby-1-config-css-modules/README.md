# gatsby-1-config-css-modules
CSS Modules configuration for Gatsby v1 plugins

## Install
`yarn add --dev gatsby-plugin-sass`

## How to use
Example from [`gatsby-plugin-sass`](../gatsby-plugin-sass/):
```javascript
// in gatsby-node.js
import cssModulesConfig from "gatsby-1-config-css-modules"

exports.modifyWebpackConfig = ({ config, stage }, { precision }) => {
  const sassFiles = /\.s[ac]ss$/
  const sassModulesFiles = /\.module\.s[ac]ss$/
  const sassLoader = precision ? `sass?precision=${precision}` : `sass`

  switch (stage) {
    case `develop`: {
      config.loader(`sass`, {
        test: sassFiles,
        exclude: sassModulesFiles,
        loaders: [`style`, `css`, sassLoader],
      })

      config.loader(`sassModules`, {
        test: sassModulesFiles,
        loaders: [`style`, cssModulesConfig(stage), sassLoader],
      })
      return config
    }

    // etc.
  }
}
```
