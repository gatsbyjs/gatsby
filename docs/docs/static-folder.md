---
title: Static folder
---

## Adding Assets Outside of the Module System

You can also add other assets to a `static` folder at the root of your project.

Note that we normally encourage you to `import` assets in JavaScript files
instead. This mechanism provides a number of benefits:

- Scripts and stylesheets get minified and bundled together to avoid extra
  network requests.
- Missing files cause compilation errors instead of 404 errors for your users.
- Result filenames include content hashes so you don’t need to worry about
  browsers caching their old versions.

However there is an **escape hatch** that you can use to add an asset outside of
the module system.

If you put a file into the `static` folder, it will **not** be processed by
Webpack. Instead it will be copied into the public folder untouched. E.g. if you
add a file named `sun.jpg` to the static folder, it'll be copied to
`public/sun.jpg`. To reference assets in the `static` folder, you'll need to
[import a helper function from `gatsby` named `withPrefix`](/packages/gatsby/#prefixed-paths-helper).
You will need to make sure
[you set `pathPrefix` in your gatsby-config.js for this to work](/docs/path-prefix/).

```js
import { withPrefix } from 'gatsby'

render() {
  // Note: this is an escape hatch and should be used sparingly!
  // Normally we recommend using `import` for getting asset URLs
  // as described in “Adding Images and Fonts” above this section.
  return <img src={withPrefix('/img/logo.png')} alt="Logo" />;
}
```

Keep in mind the downsides of this approach:

- None of the files in `static` folder get post-processed or minified.
- Missing files will not be called at compilation time, and will cause 404
  errors for your users.
- Result filenames won’t include content hashes so you’ll need to add query
  arguments or rename them every time they change.

## When to Use the `static` Folder

Normally we recommend importing [stylesheets](#adding-a-stylesheet),
[images, and fonts](#adding-images-and-fonts) from JavaScript. The `static`
folder is useful as a workaround for a number of less common cases:

- You need a file with a specific name in the build output, such as
  [`manifest.webmanifest`](https://developer.mozilla.org/en-US/docs/Web/Manifest).
- You have thousands of images and need to dynamically reference their paths.
- You want to include a small script like
  [`pace.js`](http://github.hubspot.com/pace/docs/welcome/) outside of the
  bundled code.
- Some library may be incompatible with Webpack and you have no other option but
  to include it as a `<script>` tag.
