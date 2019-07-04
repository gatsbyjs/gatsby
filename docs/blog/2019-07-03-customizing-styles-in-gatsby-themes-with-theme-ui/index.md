---
title: "Customizing Styles in Gatsby Themes with Theme UI"
date: 2019-07-03
author: Brent Jackson
tags:
  - themes
  - css
  - styles
  - theme-ui
---

With Gatsby themes we want to make the experience of building a site as flexible and extensible as possible.
Themes allow you to reuse site configurations, sets of plugins, and components across multiple Gatsby sites.
We've tried to design the API of themes to [_progressively disclose complexity_][progressive disclosure],
where smart defaults are wrapped into abstractions, but customization and configuration are always available to you.
The styles used in our official themes are no exception.

## Say hello to our official Gatsby themes

Today, we're releasing two official themes: a blog theme inspired by Dan Abromov's [overreacted.io][], and our notes theme,
which is intended for freeform, non-linear content and inspired by Tom Critchlow's concept of a _[Digital Garden][]_.
Both themes include their own styles so that you can build and publish a blog without starting from scratch.
In order to make these themes truly _themeable_, the values used for typography, color, layout, and other design tokens
can be customized by editing part or all of a `theme` configuration object.
This also means you can create and publish your own theme based on the official one,
with custom typography and colors, by editing an object instead of recreating entire components.

For sites that have multiple themes installed,
and to help ensure a consistent look and feel,
you can choose which theme's styles take precedence based on their order in your Gatsby configuration.
The styles provided by each theme are only applied to the pages it generates,
giving you complete control of your site's styles.

Huge thanks to our own [Amberley Romo][] & [John Otander][] for their incredible work on these themes.

[amberley romo]: https://mobile.twitter.com/amber1ey
[john otander]: https://mobile.twitter.com/4lpine

## Theme UI

To enable this level of style customization,
we've been working on a new open source library called _[Theme UI][]_.
For authors of Gatsby themes, this library is entirely optional and in no way coupled to Gatsby themes,
but we encourage you to check it out.
Gatsby themes can be built without Theme UI, and Theme UI can be used without Gatsby.

Theme UI is loosely based on the [Styled System][] library and a work-in-progress [Theme Specification][].
If you haven't used Styled System before, it's a framework-agnostic library for building custom UI component libraries and design systems with constraint-based design principles at its core.
Styled System is great for creating a custom design system in React,
but it falls short when it comes to styling content-heavy sites and doesn't provide much guidance for creating truly themeable UI.
Styled System also takes some effort to set up and generally requires creating custom components to get started.

Theme UI is intended to address some of these issues by:

- Providing guidelines for how to create themeable UI and making configuration more portable
- Allowing developers to use consistent styles anywhere in React with minimum effort
- Enabling a simple way to style [MDX][] content, while keeping styles isolated
- Abstracting some of the implementation details so you don't need to start from scratch

Theme UI currently includes optional packages for integrating with other libraries like [Typography.js][],
and we plan to build more tools and integrations around the core foundation of Theme UI to make styling Gatsby sites even better in the future.

## Customizing the blog theme

To quickly demonstrate how this works,
we'll walk through customizing the colors and typography used in the blog theme.
Use the Gatsby CLI to create a new site with the blog theme starter.

```shell
gatsby new my-blog https://github.com/gatsbyjs/gatsby-starter-blog-theme
```

Once the site has been created, change to the new `my-blog` directory and
add a `src/gatsby-plugin-theme-ui` directory to your site.

```shell
cd my-blog
mkdir src/gatsby-plugin-theme-ui
```

Create an `index.js` file in this new directory to export the theme configuration object.

```js:title=src/gatsby-plugin-theme-ui/index.js
export default {
  colors: {
    text: "#333",
    background: "#fff",
    primary: "tomato",
  },
  fonts: {
    body: "Georgia, serif",
    heading: "system-ui, sans-serif",
  },
}
```

By adding this file, the theme's default styles will be completely reset and overridden by the values defined here.

Under the hood, this uses the new [shadowing][] feature introduced with Gatsby themes,
which means that the blog theme's default configuration can be imported and used as a base for customization.

To extend the blog's existing styles, import the configuration object
and use object spread syntax to merge your own custom styles.

```js:title=src/gatsby-plugin-theme-ui/index.js
import baseTheme from "gatsby-theme-blog/src/gatsby-plugin-theme-ui"

export default {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    text: "#333",
    background: "#fff",
    primary: "tomato",
  },
  fonts: {
    body: "Georgia, serif",
    heading: "system-ui, sans-serif",
  },
}
```

With the configuration above, your site should include the same base styles as the official theme
but with a few custom colors and fonts.

To learn more about how theming works with Theme UI, head over to the [Theme UI docs site][theme ui],
and to learn more about using the official Gatsby themes, see our [documentation on themes][theme-docs].

[progressive disclosure]: /docs/gatsby-core-philosophy/#progressively-disclose-complexity
[mdx]: /docs/mdx/
[theme-docs]: /docs/themes/
[shadowing]: /blog/2019-04-29-component-shadowing/
[typography.js]: /docs/typography-js/
[theme ui]: https://theme-ui.com
[overreacted.io]: https://overreacted.io
[digital garden]: https://tomcritchlow.com/2019/02/17/building-digital-garden/
[styled system]: https://styled-system.com
[theme specification]: https://github.com/system-ui/theme-specification
[emotion]: https://emotion.sh/
