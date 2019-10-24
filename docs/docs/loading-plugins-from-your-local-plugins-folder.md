---
title: Loading Plugins from Your Local Plugins Folder
---

Gatsby can also load plugins from your website's local plugins folder which is a folder named `plugins` in the website's root directory.

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [`gatsby-local-plugin`],
}
```

If you want to reference a plugin that is not in the plugins folder then you could use something like the following:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    // Shortcut for adding plugins without options.
    "gatsby-plugin-react-helmet",
    {
      // Standard plugin with options example
      resolve: require.resolve(`/path/to/gatsby-local-plugin`),
    },
  ],
}
```
