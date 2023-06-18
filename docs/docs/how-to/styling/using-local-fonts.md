---
title: Using Local Fonts
---

This guide covers how to add local fonts to your Gatsby site.

## Prerequisites

- A Gatsby project set up. (Need help creating one? Follow the [Quick Start](https://www.gatsbyjs.com/docs/quick-start/))
- Font file(s), e.g. from [Inter](https://rsms.me/inter/). Common font file extensions are `.woff2` and `.woff`

## Directions

### Place the font files into your project

When you downloaded your font file(s), e.g. from [Inter](https://rsms.me/inter/) you will most likely have a bunch of different files available (this can differ a lot between fonts). You'll want to use the "Web" versions or [Variable Fonts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Fonts/Variable_Fonts_Guide) versions of your font. They are optimized for the usage on the web.

Furthermore, in this next step you should only choose the font styles and weights you absolutely must, as it's benefitial for performance to limit the number of fonts.

Place your font(s) into a `static/fonts` directory. For the sake of this guide the `Inter/Inter Web/Inter-roman.var.woff2` file is used. It's a web optimized, variable, subset font file of Inter.

The `static` folder (see the [Using the Static Folder](/docs/how-to/images-and-media/static-folder/) guide) contents will be copied over to the `public` folder so you can reference the files in your other files.

### Preload your fonts

For the best performance possible it's recommended to [preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preload) your font files. Create a `gatsby-ssr.js` file in the root of the project (if not already there), and add the following:

```js:title=gatsby-ssr.js
import * as React from "react"

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <link
      rel="preload"
      href="/fonts/Inter-roman.var.woff2"
      as="font"
      type="font/woff2"
      crossOrigin="anonymous"
      key="interFont"
    />,
  ])
}
```

### Use the fonts in your CSS

This section depends on the styling option you chose and the fonts you chose. Refer to the respective documentation for details. In this guide a `global.css` file is added to the root, imported into a `gatsby-browser.js` file and has the following contents:

```css:title=global.css
@font-face {
  font-family: 'Inter var';
  font-weight: 100 900;
  font-display: swap;
  font-style: normal;
  font-named-instance: 'Regular';
  src: url(/fonts/Inter-roman.var.woff2) format("woff2");
}
```

The important piece is the `src`. Point the `url` to your `fonts` directory.
