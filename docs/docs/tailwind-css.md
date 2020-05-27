---
title: Tailwind CSS
---

Tailwind is a utility-first CSS framework for rapidly building custom user interfaces. This guide will show you how to get started with Gatsby and [Tailwind CSS](https://tailwindcss.com/).

## Overview

There are three ways you can use Tailwind with Gatsby:

1. Standard: Use PostCSS to generate Tailwind classes, then you can apply those classes using `className`.
2. CSS-in-JS: Integrate Tailwind classes into Styled Components.
3. SCSS: Use [gatsby-plugin-sass](/packages/gatsby-plugin-sass) to support Tailwind classes in your SCSS files.

You have to install and configure Tailwind for all of these methods, so this guide will walk through that step first, then you can follow the instructions for PostCSS, CSS-in-JS or SCSS.

## Installing and configuring Tailwind

This guide assumes that you have a Gatsby project set up. If you need to set up a project, head to the [**Quick Start guide**](/docs/quick-start), then come back.

### 1. Install Tailwind

```shell
npm install tailwindcss --save-dev
```

### 2. Generate Tailwind config file (optional)

**Note**: A config file isn't required for Tailwind 1.0.0+

To configure Tailwind, you'll need to add a Tailwind configuration file. Luckily, Tailwind has a built-in script to do this. Just run the following command:

```shell
npx tailwindcss init
```

#### Option #1: PostCSS

1. Install the Gatsby PostCSS plugin [**gatsby-plugin-postcss**](/packages/gatsby-plugin-postcss).

```shell
npm install --save gatsby-plugin-postcss
```

2. Include the plugin in your `gatsby-config.js` file.

```javascript:title=gatsby-config.js
plugins: [`gatsby-plugin-postcss`],
```

3. Configure PostCSS to use Tailwind

Create a `postcss.config.js` in your project's root folder with the following contents.

```javascript:title=postcss.config.js
module.exports = () => ({
  plugins: [require("tailwindcss")],
})
```

4. Use the Tailwind Directives in your CSS

You can now use the `@tailwind` directives to add Tailwind's utilities, preflight, and components into your CSS. You can also use `@apply` and all of Tailwind's other directives and functions!

To learn more about how to use Tailwind in your CSS, visit the [Tailwind Documentation](https://tailwindcss.com/docs/installation#3-use-tailwind-in-your-css)

#### Option #2: CSS-in-JS

These steps assume you have a CSS-in-JS library already installed, and the examples are based on Emotion.

1. Install Tailwind Babel Macro

**Note**: `tailwind.macro` isn't currently compatible with Tailwind 1.0.0+. However, a new forked project can be found at `twin.macro` that supports Tailwind CSS v1.2 classes. It's currently in pre-release so not all plugins are supported at the time of writing. Alternatively, you can revert to Tailwind 0.7.4.

**Option A**: Install `twin.macro` and use Tailwind 1.2.0+

1. Install Twin and Emotion

```shell
npm install -D twin.macro @emotion/core @emotion/styled gatsby-plugin-emotion
```

2. Import the Tailwind base styles

```javascript:title=gatsby-browser.js
import "tailwindcss/dist/base.css"
```

3. Enable the Gatsby emotion plugin

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [`gatsby-plugin-emotion`],
}
```

**Option B**: Install stable `tailwind.macro` and use Tailwind 0.7.4

```bash
// Remove tailwind 1.0.0+ if you've already installed it
npm uninstall tailwindcss

// Install tailwind 0.7.4 and stable tailwind.macro
npm install tailwindcss@0.7.4
npm install tailwind.macro
```

2. Use the Babel Macro (`tailwind.macro`) in your styled component

```javascript
import styled from "@emotion/styled"
import tw from "tailwind.macro"

// All versions
const Button = styled.button`
  ${tw`bg-blue hover:bg-blue-dark text-white p-2 rounded`};
`

// tailwind.macro@next
const Button = tw.button`
  bg-blue hover:bg-blue-dark text-white p-2 rounded
`
```

#### Option #3: SCSS

1. Install the Gatsby SCSS plugin [**gatsby-plugin-sass**](/packages/gatsby-plugin-sass) and `node-sass`.

```shell
npm install --save node-sass gatsby-plugin-sass
```

2. To be able to use Tailwind classes in your SCSS files, add the `tailwindcss` package into the `postCSSPlugins` parameter in your `gatsby-config.js`.

```javascript:title=gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-sass`,
    options: {
      postCssPlugins: [
        require("tailwindcss"),
        require("./tailwind.config.js"), // Optional: Load custom Tailwind CSS configuration
      ],
    },
  },
],
```

**Note:** Optionally you can add a corresponding configuration file (by default it will be `tailwind.config.js`).
If you are adding a custom configuration, you will need to load it after `tailwindcss`.

### 4. Add custom CSS/SCSS files

**Note**: This approach is not needed if you chose CSS-in-JS above, as you can already nest styles and @apply rules directly from your .js files.

In case you need to create custom classes for elements for nested selectors, or for overriding external packages, you can create your own CSS/SCSS files.

1. Create a new file and import your Tailwind directives.

This will be your 'master' CSS file, which you will import all other css within.

```css:title=src/css/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Note**: if using SCSS (or another supported language, rename files/folders appropriately).

2. Import any custom CSS files or add any custom CSS you need (optional)

```css:title=src/css/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import popup.css body {
  @apply bg-purple-200;
}
```

3. Apply these additional styles to the browser

In `gatsby-browser.js` add an import rule for your Tailwind directives and custom CSS so that they are accounted for in build.

```js:title=gatsby-browser.js
import "./src/css/index.css"
```

### 5. Purging your css

Now we've fully configured Tailwind CSS, we want to make sure that only the classes we need are delivered to the browser. By default, Tailwind is a very large library because it includes every combination of every class you might think of. Most of these you won't need, so we use PurgeCSS to remove any unused classes.

**Note**: By default, PurgeCSS only runs on the build command as it is a relatively slow process. The development server will include all Tailwind classes, so it's highly recommended you test on a build server before deploying.

From v1.4.0 onwards PurgeCSS is built into Tailwind CSS, but the approaches needed are very similar.

**1.4.0 and above**

In 1.4.0 you can purge your css directly from your Tailwind config. You simply need to provide an array of strings telling it which files to process.

```js:title=tailwind.config.js
module.exports = {
  purge: ["./src/**/*.js", "./src/**/*.jsx", "./src/**/*.ts", "./src/**/*.tsx"],
  theme: {},
  variants: {},
  plugins: [],
}
```

Full documentation on this can now be found on the Tailwind site - [Tailwind PurgeCSS documentation](https://tailwindcss.com/docs/controlling-file-size/#app)

**Older versions**

It is recommended you install the latest version of Tailwind CSS to get all available features. If you need to use an older version, you can follow the instructions on the PurgeCSS website - [Purge css manually in older Tailwind versions](https://purgecss.com/plugins/gatsby.html#installation)

## Other resources

- [Introduction to PostCSS](https://www.smashingmagazine.com/2015/12/introduction-to-postcss/)
- [Tailwind Documentation](https://tailwindcss.com/)
- [Gatsby starters that use Tailwind](/starters/?c=Styling%3ATailwind&v=2)
