---
title: Tailwind CSS
---

Tailwind is a utility-first CSS framework for rapidly building custom user interfaces. This guide will show you how to get started with Gatsby and [Tailwind CSS](https://tailwindcss.com/).

## Overview

There are two ways you can use Tailwind with Gatsby:

1. Standard: Use PostCSS to generate Tailwind classes, then you can apply those classes using `className`.
2. CSS-in-JS: Integrate Tailwind classes into Styled Components.

You have to install and configure Tailwind for both of these methods, so this guide will walk through that step first, then you can follow the instructions for either PostCSS or CSS-in-JS.

## Installing and Configuring Tailwind

This guide assumes that you have a Gatsby project set up. If you need to set up a project, head to the [**Quick Start guide**](/docs/quick-start), then come back.

1. Install Tailwind

```shell
npm install tailwindcss --save-dev
```

2. Generate Tailwind config file (optional)

**Note**: A config file isn't required for Tailwind 1.0.0+

To configure Tailwind, we'll need to add a Tailwind configuration file. Luckily, Tailwind has a built-in script to do this. Just run the following command:

```shell
./node_modules/.bin/tailwind init
```

### Option #1: PostCSS

1.  Install the Gatsby PostCSS plugin [**gatsby-plugin-postcss**](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-postcss).

```shell
npm install --save gatsby-plugin-postcss
```

2.  Include the plugin in your `gatsby-config.js` file.

```javascript:title=gatsby-config.js
plugins: [`gatsby-plugin-postcss`],
```

3. Configure PostCSS to use Tailwind

Create a postcss.config.js in your project's root folder with the following contents.

```javascript:title=postcss.config.js
module.exports = () => ({
  plugins: [require("tailwindcss")],
})
```

4. Use the Tailwind Directives in your CSS

You can now use the `@tailwind` directives to add Tailwind's utilites, preflight, and components into your CSS. You can also use `@apply` and all of Tailwind's other directives and functions!

To learn more about how to use Tailwind in your CSS, visit the [Tailwind Documentation](https://tailwindcss.com/docs/installation#3-use-tailwind-in-your-css)

### Option #2: CSS-in-JS

These steps assume you have a CSS-in-JS library already installed, and the examples are based on Styled Components.

1. Install Tailwind Babel Macro

**Note**: `tailwind.macro` isn't currently compatible with Tailwind 1.0.0+. However, a compatible beta is available at `tailwind.macro@next`. Feel free to either use the beta or revert to TailwindCSS 0.7.4.

**Option 1**: Install `tailwind.macro@next` and use Tailwind 1.0.0+

```shell
npm install --save tailwind.macro@next
```

**Option 2**: Install stable `tailwind.macro` and use Tailwind 0.7.4

```bash
// Remove tailwind 1.0.0+ if you've already installed it
npm uninstall tailwindcss

// Install tailwind 0.7.4 and stable tailwind.macro
npm install tailwindcss@0.7.4
npm install tailwind.macro
```

2. Use the Babel Macro (tailwind.macro) in your styled component

```javascript
import styled from "styled-components"
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

## Other resources

- [Introduction to PostCSS](https://www.smashingmagazine.com/2015/12/introduction-to-postcss/)
- [Tailwind Documentation](https://tailwindcss.com/)
- [Gatsby starters that use Tailwind](/starters/?c=Styling%3ATailwind&v=2)
