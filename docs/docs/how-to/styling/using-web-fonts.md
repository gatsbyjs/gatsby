---
title: Using Web Fonts
---

This guide covers how to add fonts from web services to your Gatsby site.

## Prerequisites

- A Gatsby project set up. (Need help creating one? Follow the [Quick Start](https://www.gatsbyjs.com/docs/quick-start/))

## Using Google Fonts

There are different ways of adding web fonts like Google Fonts to Gatsby, in this guide you'll use the recommended [`gatsby-omni-font-loader`](https://github.com/codeAdrian/gatsby-omni-font-loader). As in the self-hosting example below you'll add the [Open Sans](https://fonts.google.com/specimen/Open+Sans) font.

1. Install the plugin and its peerDependencies:

```shell
npm install gatsby-omni-font-loader react-helmet
```

2. Add the plugin to your `gatsby-config.js`:

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-omni-font-loader`,
      options: {
        enableListener: true,
        preconnect: [`https://fonts.googleapis.com`, `https://fonts.gstatic.com`],
        web: [
          {
            name: `Open Sans`,
            file: `https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap`,
          },
        ],
      },
    },
  ]
}
```

3. You can now reference the font in your CSS:

```css:title=your-styles.css
body {
  font-family: "Open Sans";
}
```

## Self-host Google Fonts with Fontsource

[Fontsource](https://github.com/fontsource/fontsource) is a project to provide open source fonts from Google Fonts as NPM Packages.

You can decrease your site’s loading time by self-hosting fonts, saving ~300 milliseconds on desktop to 1+ seconds on 3G connections.

This example shows how to install the [Open Sans](https://fonts.google.com/specimen/Open+Sans) font. If you have a different Google Font you want to use, you can find the corresponding package in [NPM](https://www.npmjs.com/search?q=fontsource) or the [Fontsource Font Preview Website](https://fontsource.org/fonts).

1. Run `npm install @fontsource/open-sans` to install the necessary package files.

2. Then within your app entry file or site component, import the font package. It is recommended you import in your site's gatsby-browser.js file.

```jsx:title=gatsby-browser.js
import "@fontsource/open-sans" // Defaults to weight 400 with normal variant.
```

If you wish to select a particular weight or style, you may specify it by changing the import path.

```jsx:title=gatsby-browser.js
import "@fontsource/open-sans/500.css" // Weight 500.
import "@fontsource/open-sans/900-normal.css" // Select either normal or italic.
```

**Please note**: The weights and styles a font includes is shown in each package's `README` file.

3. Once it's imported, you can reference the font name in a CSS stylesheet, CSS Module, or CSS-in-JS.

```css:title=your-styles.css
body {
  font-family: "Open Sans";
}
```
