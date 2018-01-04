# gatsby-1-config-css-modules

CSS Modules configuration for Gatsby v1 plugins.

## Install

`yarn add --dev gatsby-plugin-sass`

## How to use

Node environment variables:
- `CSS_MODULES_LOCAL_IDENT_NAME` - identify pattern for css modules classes generation (uses webpack syntax)
  - default is `[path]---[name]---[local]---[hash:base64:5]`
  - shorter alternative `[local]--[hash:base64:5]`

Example from [`gatsby-plugin-sass`](../gatsby-plugin-sass/):

```javascript
// in gatsby-node.js
const { cssModulesConfig } = require("gatsby-1-config-css-modules");

exports.modifyWebpackConfig = ({ config, stage }, { precision }) => {
  const sassFiles = /\.s[ac]ss$/;
  const sassModulesFiles = /\.module\.s[ac]ss$/;
  const sassLoader = precision ? `sass?precision=${precision}` : `sass`;

  switch (stage) {
    case `develop`: {
      config.loader(`sass`, {
        test: sassFiles,
        exclude: sassModulesFiles,
        loaders: [`style`, `css`, sassLoader],
      });

      config.loader(`sassModules`, {
        test: sassModulesFiles,
        loaders: [`style`, cssModulesConfig(stage), sassLoader],
      });
      return config;
    }

    // etc.
  }
};
```
