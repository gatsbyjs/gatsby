---
title: Built-in CSS Support
---

Gatsby extends `import` so you can import CSS files directly into your components.

```js:title=src/pages/index.js
import * as React from "react"
// Import from a CSS file in your src
import "../styles/index.css"
// Import from an installed package
import "bootstrap/dist/css/bootstrap.min.css"

export default function HomePage() {
  return <div>I'm styled by bootstrap & src/styles/index.css</div>
}
```

Gatsby automatically concatenates and minifies CSS and inlines them into the `<head>` of your HTML files for the fastest possible page load time.

## Global CSS

CSS files with global styles like typography and colors are typically imported into the site's [`gatsby-browser.js`](/docs/reference/config-files/gatsby-browser) file.

## Component-level CSS

We recommend using CSS Modules for component-level CSS. Gatsby has built-in support for CSS Modules.

CSS Modules let you write CSS normally but with more safety. The tool automatically generates unique class and animation names, so you don’t have to worry about selector name collisions.

An example of a component CSS Module file imported into its corresponding React component.

```css:title=src/components/container.module.css
.container {
  margin: 3rem auto;
  max-width: 600px;
}
```

```js:title=src/components/container.js
import React from "react"
import * as containerStyles from "./container.module.css"

export default function Container({ children }) {
  return <div className={containerStyles.container}>{children}</div>
}
```

[Learn more about CSS Modules](/docs/how-to/styling/css-modules)

## Other CSS Options

|                   | Example                                                                                    | Plugin                                              | Tutorial                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------- |
| Sass              | [example](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-sass)              | [plugin](/plugins/gatsby-plugin-sass/)              | [tutorial](/docs/how-to/styling/sass/)                                      |
| Tailwind          |                                                                                            |                                                     | [tutorial](/docs/how-to/styling/tailwind-css/)                              |
| Postcss           |                                                                                            | [plugin](/plugins/gatsby-plugin-postcss/)           | [tutorial](/docs/how-to/styling/post-css/)                                  |
| Emotion           | [example](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-emotion)           | [plugin](/plugins/gatsby-plugin-emotion/)           | [tutorial](/docs/how-to/styling/emotion/)                                   |
| Styled Components | [example](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-styled-components) | [plugin](/plugins/gatsby-plugin-styled-components/) | [tutorial](https://www.gatsbyjs.com/docs/how-to/styling/styled-components/) |
| Less              |                                                                                            | [plugin](/plugins/gatsby-plugin-less/)              |                                                                             |
| Styled JSX        | [example](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-styled-jsx)        | [plugin](/plugins/gatsby-plugin-styled-jsx/)        |                                                                             |
| Stylus            | [example](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-stylus)            | [plugin](/plugins/gatsby-plugin-stylus/)            |                                                                             |
