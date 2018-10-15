---
title: Changing the Output Location of Build Assets
---

By default, static assets are created at root of the `public` folder and at `public/static/d`. Sometimes you may not want to serve these files from this location. You can use the `assetPath` configuration to tell Gatsby where to output these files.

First define the path in your site's `gatsby-config.js`.

```javascript
module.exports = {
  // Note: it must *not* have a trailing slash.
  assetPath: `/assets`,
}
```

All built JS, CSS, JSON, and source maps will now live in `public/assets` and follow the same hierachy that they would have followed if living in the `public` folder.

In your website, assets will be served from `/assets`.

## Using a Path Prefix with an Asset Path

You can use a path prefix and an asset path at the same time.

```javascript
module.exports = {
  pathPrefix: `/blog`,
  assetPath: `/assets`,
}
```

Asset files will continue to be served from `/assets` and your pages will be prefixed with `/blog`.