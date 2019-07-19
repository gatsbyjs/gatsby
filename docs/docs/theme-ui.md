---
title: Theme UI
---

[Theme UI][] is a library for styling React apps with user-configurable design constraints.
It allows you to style any component in your application with typographic, color, and layout values defined in a shared theme object.
Theme UI is currently used in Gatsby's official themes,
but it can be used in any Gatsby site or React application.
It includes the [Emotion][] CSS-in-JS library along with additional utilities for styling [MDX][] and using configurations and themes from [Typography.js][].

## Using Theme UI in Gatsby

Theme UI includes the `gatsby-plugin-theme-ui` package to better integrate with your Gatsby project.

Install the following packages to add Theme UI.

```shell
npm install theme-ui gatsby-plugin-theme-ui @emotion/core @mdx-js/react
```

After installing the dependencies, add the following to your `gatsby-config.js`.

```js:title=gatsby-config.js
module.exports = {
  plugins: ["gatsby-plugin-theme-ui"],
}
```

Theme UI uses a `theme` configuration object to provide color, typography, layout, and other shared stylistic values through [React context][].
This allows components within your site to add styles based on a predefined set of values.

The Theme UI plugin uses the [component shadowing API][] to add the theme object context to your site.
Create a `src/gatsby-plugin-theme-ui` directory in your project, and add an `index.js` file to export a theme object.

```shell
mkdir src/gatsby-plugin-theme-ui
```

```js:title=src/gatsby-plugin-theme-ui/index.js
export default {}
```

## Creating a theme object

Add a `colors` object to the file created above to store the color palette for your site.

```js:title=src/gatsby-plugin-theme-ui/index.js
export default {
  colors: {
    text: "#333",
    background: "#fff",
    primary: "#639",
    secondary: "#ff6347",
  },
}
```

Next add some base typographic values.

```js:title=src/gatsby-plugin-theme-ui/index.js
export default {
  colors: {
    text: "#333",
    background: "#fff",
    primary: "#639",
    secondary: "#ff6347",
  },
  // highlight-start
  fonts: {
    body: "system-ui, sans-serif",
    heading: "system-ui, sans-serif",
    monospace: "Menlo, monospace",
  },
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 72],
  // highlight-end
}
```

Next add values for use in margin and padding.

```js:title=src/gatsby-plugin-theme-ui/index.js
export default {
  colors: {
    text: "#333",
    background: "#fff",
    primary: "#639",
    secondary: "#ff6347",
  },
  fonts: {
    body: "system-ui, sans-serif",
    heading: "system-ui, sans-serif",
    monospace: "Menlo, monospace",
  },
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 72],
  // highlight-start
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  // highlight-end
}
```

Feel free to include as many additional values as you'd like in your theme.
Read more about theming in the [Theme UI documentation](https://theme-ui.com/theming).

## Adding styles to elements

Theme UI uses a custom [JSX pragma][] comment to add support for Emotion's `css` prop,
which can be used to style elements.
By default JSX compiles to the `React.createElement` function.
When you add the `/** @jsx jsx */` comment to the top of a file, JSX will compile to the function name in the comment instead.
For example, `<button />` would compile to `jsx('button')`.
Theme UI's `jsx` function still renders React elements but lets you use the `css` prop for styling.

[jsx pragma]: https://babeljs.io/docs/en/babel-plugin-transform-react-jsx#pragma

The following example uses the `css` prop to add styles to an element.

```js:title=src/components/header.js
/** @jsx jsx */
import { jsx } from "theme-ui"

export default props => (
  <header
    css={{
      padding: 32,
      color: "#fff",
      backgroundColor: "#639",
    }}
  >
    {props.children}
  </header>
)
```

With Emotion's API, values from the theming context can be referenced by passing a function to the `css` prop.

```js:title=src/components/header.js
/** @jsx jsx */
import { jsx } from "theme-ui"

export default props => (
  <header
    css={theme => ({
      padding: theme.space[4],
      color: theme.colors.background,
      backgroundColor: theme.colors.primary,
    })}
  >
    {props.children}
  </header>
)
```

Theme UI includes the [`sx` prop][], which can be used as a replacement for the `css` prop.
The `sx` prop allows values from the theming context to be referenced with a terser syntax.

[`sx` prop]: https://theme-ui.com/sx-prop

The example from above can be rewritten like this:

```js:title=src/components/header.js
/** @jsx jsx */
import { jsx } from "theme-ui"

export default props => (
  <header
    sx={{
      padding: 4,
      color: "background",
      backgroundColor: "primary",
    }}
  >
    {props.children}
  </header>
)
```

## Using Theme UI in a Gatsby theme

When using Theme UI in a Gatsby theme, it's important to understand how the `gatsby-plugin-theme-ui` package handles theme objects from multiple Gatsby themes and sites.
If a Gatsby theme that uses `gatsby-plugin-theme-ui` is installed in a site,
shadowing the `src/gatsby-plugin-theme-ui/index.js` file will completely override the default styles.
This is intended to give full control to the person using the theme.
If multiple themes are installed in the same site, the one defined last in your `gatsby-config.js` file's `plugins` array will take precedence.

To extend an existing Theme UI configuration from a theme, it can be imported and merged with any other values you would like to customize.
The following is an example of extending the configuration from `gatsby-theme-blog`.

```js:title=src/gatsby-plugin-theme-ui/index.js
import baseTheme from "gatsby-theme-blog/src/gatsby-plugin-theme-ui"
import merge from "lodash.merge"

// lodash.merge will deeply merge custom values with the
// blog theme's defaults
export default merge({}, baseTheme, {
  colors: {
    text: "#222",
    primary: "tomato",
  },
})
```

## Styling MDX content

Theme UI includes a way to style elements in MDX documents without the need to add global CSS to your site.
This is useful for authoring Gatsby themes that can be installed alongside other themes.

In your Theme UI configuration, add a `styles` object to target elements rendered from MDX.

```js:title=src/gatsby-plugin-theme-ui/index.js
export default {
  // base theme values...
  styles: {
    // the keys used here reference elements in MDX
    h1: {
      // the style object for each element
      // can reference other values in the theme
      fontFamily: "heading",
      fontWeight: "heading",
      lineHeight: "heading",
      marginTop: 0,
      marginBottom: 3,
    },
    a: {
      color: "primary",
      ":hover": {
        color: "secondary",
      },
    },
    // more styles can be added as needed
  },
}
```

With the example above, any `<h1>` or `<a>` elements rendered from an MDX file will include these base styles.

To learn more about using Theme UI in your project, see the official [Theme UI][theme ui] website.

[theme ui]: https://theme-ui.com
[emotion]: /docs/emotion
[mdx]: /docs/mdx
[typography.js]: /docs/typography-js
[react context]: https://reactjs.org/docs/context.html

<!-- TODO -->

[component shadowing api]: /docs/themes/api-reference#component-shadowing
