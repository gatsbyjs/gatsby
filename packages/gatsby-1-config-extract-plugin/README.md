# gatsby-1-config-extract-plugin

extract-text-webpack-plugin instance getter for Gatsby v1 plugins. Allows all plugins to share the
same instance. Should only be used by plugins that output styles for the main entry point and
bundle (which is the vast majority of style plugins).

## Install

`npm install gatsby-1-config-extract-plugin --save-dev`

## How to use

This module exports two named functions, `extractTextPlugin` and `extractTextFilename`. Note that
Gatsby's webpack config includes the extract plugin instances in the `plugins` array, so plugins
that use this module don't need to - just use it's `extract` method in your loaders.

**`extractTextPlugin(stage)`**

Accepts the current stage name and returns the appropriate extract-text-webpack-plugin instance.
Anywhere you would normally use `new ExtractTextPlugin()`, use this instead.

**`extractTextFilename(stage)`**

Accepts the current stage name and returns the name of the extracted text output file. Not required
for most use cases.

```javascript
// in gatsby-node.js
const { extractTextPlugin } = require(`gatsby-1-config-extract-plugin`);

exports.modifyWebpackConfig = ({ config, stage }) => {
  switch (stage) {
    case `build-css`: {
      loader: extractTextPlugin(stage).extract(`style`, `css`);
    }
  }
};
```
