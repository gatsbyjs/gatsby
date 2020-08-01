---
title: Using Web Fonts
---

This guide covers how to add web fonts to your Gatsby site.

## Web fonts and Gatsby

Web fonts provide a variety of typography styling options for your site. Hosting your fonts within a Gatsby project increases your site’s speed by up to ~300 milliseconds on desktop and 1+ seconds on 3G connections.

## Prerequisites

This guide uses the Gatsby [default starter](https://github.com/gatsbyjs/gatsby-starter-default).

## Adding web fonts

Some examples of web font services include [Google Fonts](https://fonts.google.com/) and [Typekit Web Fonts](https://fonts.adobe.com/typekit).

### Using Google Fonts

The fastest way to get started using Google Fonts is by choosing a font from [the typefaces project](https://github.com/KyleAMathews/typefaces). This example shows how you can add Open Sans to your project.

First, install the typeface package with npm:

```bash
npm install --save typeface-open-sans
```

Or with yarn:

```bash
yard add typeface-open-sans
```

In your `layout.js` file, import the typeface.

```jsx:title=src/components/layout.js
import "typeface-open-sans"
```

Next, add the typeface name to the appropriate place in your CSS. In this case, you will override the `body` element's `font-family` default values.

```css:title=src/components/layout.css
// highlight-next-line
@import "../css/typography.css";

body {
  color: hsla(0, 0%, 0%, 0.8);
  // highlight-next-line
  font-family: "Open Sans", georgia, serif;
  font-weight: normal;
  word-wrap: break-word;
  font-kerning: normal;
}
```

### Using Typekit Web Fonts

You can add Typekit Web Fonts to your project by using the [gatsby-plugin-web-font-loader](https://www.gatsbyjs.org/packages/gatsby-plugin-web-font-loader/?=font) and your [Adobe Fonts project id](https://fonts.adobe.com/my_fonts#web_projects-section). For example, this is how you can add Futura to your project.

First, install the Gatsby plugin with npm:

```bash
npm install --save gatsby-plugin-web-font-loader
```

Or with yarn:

```bash
yard add gatsby-plugin-web-font-loader
```

Add this plugin to your `gatsby-config.js` file located in your root directory. Set your plugin configuration, passing in your `typekit id` options as an [environment variable](/docs/environment-variables/).

```javascript:title=gatsby-config.js
require("dotenv").config()

module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-web-font-loader",
      options: {
        typekit: {
          id: process.env.TYPEKIT_ID,
        },
      },
    },
  ],
}
```

Next, add the typeface name to the appropriate `font-family` value in your CSS.

```css:title=src/components/layout.css
// highlight-next-line
@import "../css/typography.css";

body {
  color: hsla(0, 0%, 0%, 0.8);
  // highlight-next-line
  font-family: "Futura", georgia, serif;
  font-weight: normal;
  word-wrap: break-word;
  font-kerning: normal;
}
```

## Other resources

- Check out the [Using Google Fonts](/docs/recipes/styling-css/#using-google-fonts) Gatsby recipe.
- Here's a great article on why it's important to [keep your environment variables secret](https://medium.com/codait/environment-variables-or-keeping-your-secrets-secret-in-a-node-js-app-99019dfff716).
