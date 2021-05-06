---
title: Using Web Fonts
---

This guide covers how to add fonts from web services to your Gatsby site.

## Prerequisites

This guide uses the Gatsby [default starter](https://github.com/gatsbyjs/gatsby-starter-default).

## Adding web fonts

Some examples of web font services include [Google Fonts](https://fonts.google.com/) and [Typekit Web Fonts](https://fonts.adobe.com/typekit).

## gatsby-plugin-web-font-loader

`gatsby-plugin-web-font-loader` is a Gatsby plugin which makes it easy to add web fonts using the popular [Web Font Loader](https://github.com/typekit/webfontloader) library. It supports loading fonts from Google Fonts, Typekit, Fonts.com, and Fontdeck, as well as self-hosted web fonts.

### How to use Web Font Loader with Typekit

You can add Typekit Web Fonts to your project by using the [gatsby-plugin-web-font-loader](https://www.gatsbyjs.org/packages/gatsby-plugin-web-font-loader/?=font) and your [Adobe Fonts project id](https://fonts.adobe.com/my_fonts#web_projects-section). For example, this is how you can add Futura to your project.

First, install the Gatsby plugin with npm:

```shell
npm install --save gatsby-plugin-web-font-loader
```

Or with yarn:

```shell
yarn add gatsby-plugin-web-font-loader
```

Then, create an [environment variable](/docs/how-to/local-development/environment-variables/) to store your Adobe Fonts project ID. (Make sure this file is in your `.gitignore` file so your ID doesn't get committed!) For example, if your Adobe Fonts project ID is `abcdefg`, your `.env` file will look like this:

```text:title=.env
TYPEKIT_ID=abcdefg
```

Now you can add the `gatsby-plugin-web-font-loader` plugin to your `gatsby-config.js` file, located in your root directory. In your plugin configuration, pass in the environment variable you created.

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
body {
  color: hsla(0, 0%, 0%, 0.8);
  // highlight-next-line
  font-family: "Futura", georgia, serif;
  font-weight: normal;
  word-wrap: break-word;
  font-kerning: normal;
}
```

### Self-host Google Fonts with Fontsource

[Fontsource](https://github.com/fontsource/fontsource) is a project to provide open source fonts from Google Fonts as NPM Packages.

Self-hosting your fonts can increase your site’s loading speed by up to ~300 milliseconds on desktop and 1+ seconds on 3G connections.

This example shows how to install the [Open Sans](https://fonts.google.com/specimen/Open+Sans) font. If you have a different Google Font you want to use, you can find the corresponding package in [NPM](https://www.npmjs.com/search?q=fontsource) or the [packages directory in the Fontsource repository](https://github.com/fontsource/fontsource/tree/master/packages).

1. Run `npm install @fontsource/open-sans` to install the necessary package files.

2. Then within your app entry file or site component, import the font package. It is recommended you import in your site's gatsby-browser.js file.

```jsx:title=gatsby-browser.js
import "@fontsource/open-sans" // Defaults to weight 400 with all styles included.
```

If you wish to select a particular weight or style, you may specify it by changing the import path.

```jsx:title=gatsby-browser.js
import "@fontsource/open-sans/500.css" // Weight 500 with all styles included.
import "@fontsource/open-sans/900-normal.css" // Select either normal or italic.
```

**Note**: The weights and styles a font includes is shown in each package's README file.

3. Once it's imported, you can reference the font name in a CSS stylesheet, CSS Module, or CSS-in-JS.

```css:title=src/components/layout.css
body {
  font-family: "Open Sans";
}
```

## Other resources

- Check out the [Using Google Fonts](/docs/recipes/styling-css/#using-google-fonts) Gatsby recipe.
- Here's a great article on why it's important to [keep your environment variables secret](https://medium.com/codait/environment-variables-or-keeping-your-secrets-secret-in-a-node-js-app-99019dfff716).
