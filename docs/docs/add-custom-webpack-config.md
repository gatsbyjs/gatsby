---
title: "Add custom webpack config"
---
In order to add some custom webpack configurations you will need to create a `gatsby-node.js` file in your root directory.

Inside of this file you have to export a function  called `modifyWebpackConfig`.
This function will receive a parameter Object that you need to destructure to receive the `config` and `stage`.

The `stage` will tell you at which step in the build process you are. The following stages exist:

1. develop: for `gatsby develop` command, hot reload and CSS injection into page
2. develop-html: same as develop without react-hmre in the babel config for html renderer
3. build-css: build styles.css file
4. build-html: build all HTML files
5. build-javascript: Build js chunks for Single Page App in production

Check [https://github.com/gatsbyjs/gatsby/blob/1.0/packages/gatsby/src/utils/webpack.config.js](https://github.com/gatsbyjs/gatsby/blob/1.0/packages/gatsby/src/utils/webpack.config.js) for the source.


## Example

Here is an example adding **flexboxgrid** when processing css files.

```js
exports.modifyWebpackConfig = ({ config, stage }) => {
  switch (stage) {
    case 'develop':
      config.loader('css', {
        include: /flexboxgrid/,
      });

      break;

    case 'build-css':
      config.loader('css', {
        include: /flexboxgrid/,
      });

      break;

    case 'build-html':
      config.loader('css', {
        include: /flexboxgrid/,
      });

      break;

    case 'build-javascript':
      config.loader('css', {
        include: /flexboxgrid/,
      });

      break;
  }

  return config;
};
```
