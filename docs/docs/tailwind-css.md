---
title: Tailwind CSS
---

Tailwind is a utility-first CSS framework for rapidly building custom user interfaces. This guide will show you how to get started with Gatsby and Tailwind CSS.

This guide assumes that you have a Gatsby project set up. If you need to set up a project, head to the [**Quick Start guide**](https://www.gatsbyjs.org/docs), then come back.

### Installation and Configuration

Tailwind uses PostCSS under the hood, so you will need PostCSS set up before we install Tailwind.

1.  Install the Gatsby plugin [**gatsby-plugin-postcss**](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-postcss).

`npm install --save gatsby-plugin-postcss`

2.  Include the plugin in your `gatsby-config.js` file.

```javascript:title=gatsby-config.js
plugins: [`gatsby-plugin-postcss`],
```

3. Add a PostCSS Config File

Create an empty postcss.config.js file in your project's root folder.

4. Install Tailwind

`npm install tailwindcss --save-dev`

5. Generate Tailwind Config File

To configure Tailwind, we'll need to add a Tailwind configuration file. Luckily, Tailwind has a built-in script to do this. Just run the following command:

`
./node_modules/.bin/tailwind init
`

6. Configure PostCSS to Use Tailwind

```javascript:title=postcss.config.js
module.exports = () => ({
    plugins: [require('tailwindcss')('./tailwind.js')],
})
```

7. Use the Tailwind Directives in Your CSS

You can now use the `@tailwind` directives to add Tailwind's utilites, preflight, and components into your CSS. You can also use `@apply` and all of Tailwind's other directives and functions!

To learn more about how to use Tailwind in your CSS, visit the [Tailwind Documentation](https://tailwindcss.com/docs/installation#3-use-tailwind-in-your-css)


### Other resources

- [Introduction to postcss](https://www.smashingmagazine.com/2015/12/introduction-to-postcss/)
- [Tailwind Documentation](https://tailwindcss.com/)
