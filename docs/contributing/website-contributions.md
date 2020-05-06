---
title: Website Contributions
---

If you want to make changes, improvements, or add new functionality to the website, you don't have to set up the full Gatsby repo to contribute. You can spin up your own instance of the Gatsby website with these steps:

- Clone [the Gatsby repo](https://github.com/gatsbyjs/gatsby/) and navigate to `/www`
- Run `yarn` to install all of the website's dependencies.
- Run `npm run develop` to preview the site at `http://localhost:8000/`.

> Note: If you are experiencing issues on a Linux machine, run `sudo apt install libvips-dev`, to install a native dependency. You can also reference [Gatsby guide on Linux](/docs/gatsby-on-linux/) for other Linux-specific requirements.

Now you can make and preview your changes before raising a pull request!

For full repo setup instructions, visit the [code contributions](/contributing/code-contributions/) page.

## Styling components on Gatsbyjs.org with Theme-UI

Styles on the site are applied using [Theme-UI](https://theme-ui.com/), which allows for theming across the site based on design tokens (also called variables).

### Design tokens

Design tokens are used to consolidate the number of colors and style attributes that are applied to components throughout the site. By limiting the styles that can be applied, the site stays consistent with the guidelines for color, typography, spacing, etc.

Tables listing design tokens that are used on the site can be found in the [design guidelines](/guidelines/design-tokens/).

### The `sx` prop

The [`sx` prop](https://theme-ui.com/sx-prop) from Theme-UI allows you to access theme values to style elements and components, it should be used wherever possible. The prop is "enabled" by adding `theme-ui`'s [JSX pragma](https://theme-ui.com/jsx-pragma) at the top of a `js` file.

It is still okay to directly import tokens, e.g. `mediaQueries` or `colors` directly from [`www/src/gatsby-plugin-theme-ui`](https://github.com/gatsbyjs/gatsby/blob/master/www/src/gatsby-plugin-theme-ui/index.js) if it helps your specific use case — for example when global CSS is required, when passing theme values to other libraries or plugins, when authoring complex responsive styles, etc.
