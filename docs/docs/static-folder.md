---
title: Static folder
---

In general, every website needs assets: images, stylesheets, scripts, etc. When using Gatsby, we recommend
[Adding Images, Fonts, and Files](/docs/adding-images-fonts-files/) in JavaScript files,
because of the benefits it provides:

- Scripts and stylesheets are minified and bundled together to avoid extra
  network requests.
- Missing files cause compilation errors instead of 404 errors for your users.
- Result filenames include content hashes so you don’t need to worry about
  browsers caching their old versions.

However, there is an **escape hatch** that you can use to add an asset outside of
the module system.

## Adding Assets Outside of the Module System

You can create a folder named `static` at the root of your project. Every file
you put into that folder will be copied into the `public` folder. E.g. if you
add a file named `sun.jpg` to the static folder, it'll be copied to
`public/sun.jpg`

### Referencing your static asset

In order to reference assets from the `static` folder in your code, you'll need to
[import the `withPrefix` helper function from `gatsby`](/docs/gatsby-link/#prefixed-paths-helper):

```js
import { withPrefix } from 'gatsby'

render() {
  // Note: this is an escape hatch and should be used sparingly!
  // Normally we recommend using `import` for getting asset URLs
  // as described in the “Adding Images, Fonts, and Files” page.
  return <img src={withPrefix('/img/logo.png')} alt="Logo" />;
}
```

And make sure you
[set `pathPrefix` in your gatsby-config.js](/docs/path-prefix/):

```javascript:title=gatsby-config.js
module.exports = {
  // Note: it must *not* have a trailing slash.
  pathPrefix: `/img`,
}
```

### Downsides

Keep in mind the downsides of this approach:

- None of the files in `static` folder get post-processed or minified.
- Missing files will not be called at compilation time, and will cause 404
  errors for your users.
- Result filenames won’t include content hashes so you’ll need to add query
  arguments or rename them every time they change.

## When to Use the `static` Folder

Normally we recommend importing [stylesheets](/docs/adding-images-fonts-files/#adding-a-stylesheet),
[images, and fonts](/docs/adding-images-fonts-files/#adding-images-and-fonts) from JavaScript. The `static`
folder is useful as a workaround for a number of less common cases:

- You need a file with a specific name in the build output, such as
  [`manifest.webmanifest`](https://developer.mozilla.org/en-US/docs/Web/Manifest).
- You have thousands of images and need to dynamically reference their paths.
- You want to include a small script like
  [`pace.js`](http://github.hubspot.com/pace/docs/welcome/) outside of the
  bundled code.
- Some libraries may be incompatible with Webpack and you have no other option but
  to include it as a `<script>` tag.
