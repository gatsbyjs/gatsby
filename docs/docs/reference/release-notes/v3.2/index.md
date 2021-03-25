---
date: "2021-03-30"
version: "3.2.0"
---

# [v3.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.2.0-next.0...gatsby@3.2.0) (March 2021 #3)

Welcome to `gatsby@3.2.0` release (March 2021 #3)

Key highlights of this release:

- [Better `StaticImage` errors](#better-staticimage-errors)
- [Adjustable ES Modules option for CSS Modules](#adjustable-es-modules-option-for-css-modules)

Also check out [notable bugfixes](#notable-bugfixes).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.1)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.2.0-next.0...gatsby@3.2.0)

## Better `StaticImage` errors

For our new `gatsby-plugin-image` we also introduced `StaticImage` to allow quick usage of the image pipeline for images that are the same every time. But it comes [with some restrictions](/docs/reference/built-in-components/gatsby-plugin-image/#restrictions-on-using-staticimage) that you need to think of.

To make using `StaticImage` easier the previous error message was adjusted to now also show the offending code and link to the relevant documentation.

![CLI showing an error with a description, a codeframe with the relevant code, and link to documentation](https://user-images.githubusercontent.com/213306/111302367-3a142500-864b-11eb-8768-d46e452e70f1.png)

**Bonus:** If you want to use `StaticImage` as a background image, read our [newly added docs](/docs/how-to/images-and-media/using-gatsby-plugin-image#background-images).

## Adjustable ES Modules option for CSS Modules

With the release of Gatsby v3 we made the choice to [import CSS modules as ES Modules](/docs/reference/release-notes/migrating-from-v2-to-v3/#css-modules-are-imported-as-es-modules) by default. This allows better treeshaking and smaller files as a result -- however, when using third-party packages that still expect CommonJS you'll need to work around this behavior to be able to migrate to Gatsby v3.

Together with v3.2 also new minors of `gatsby-plugin-sass`, `gatsby-plugin-less`, `gatsby-plugin-postcss`, and `gatsby-plugin-stylus` were released. You're now able to override the [`esModule`](https://github.com/webpack-contrib/css-loader#esmodule) and [`namedExport`](https://github.com/webpack-contrib/css-loader#namedexport) option of [`css-loader`](https://github.com/webpack-contrib/css-loader) inside each plugin.

Please see the [migration guide](/docs/reference/release-notes/migrating-from-v2-to-v3/#css-modules-are-imported-as-es-modules) for an example.

---

## Notable bugfixes

- TODO

## Contributors

TODO
