---
title: Introducing Gatsby Themes
date: 2018-11-11
author: Chris Biscardi
excerpt: "Scaling the production of Gatsby sites"
tags: ["themes"]
---

Gatsby is a powerful platform for building marketing sites, blogs,
ecommerce frontends, and more. You can source data from static files
and any number of content management systems. You can process images,
add support for our favorite styling technique, transform markdown,
and just about anything else you can imagine.

At its core, a Gatsby site is a combination of functionality centered
around a single config file, `gatsby-config.js`. This config file
controls an assortment of site metadata, data type mapping, and most
importantly, plugins. Plugins contain large amounts of customizable
functionality for turning markdown into pages, processing components
into documentation, and even processing images.

## Scaling Gatsby

Creating a single Gatsby site works super well. The power of
`gatsby-config.js`, plugins, and more coalesce to make the experience a
breeze. However, what if you want to re-use this configuration on our
next site? Sure, you could clone a boilerplate each time, but that gets
old, quickly. Wouldn't it be great if you could re-use our
gatsby-config.js across projects? That's where starters come in.

### Improving Reusability with Starters

One way to create more sites with similar functionality faster is to
use starters. Starters are basically whole Gatsby sites that can be
scaffolded through the gatsby CLI. This helps you start your project
by cloning the boilerplate, installing dependencies, and clearing Git
history. The community around Gatsby has built a lot of different
starters for various use cases including blogging, working with
material design, and documentation.

The problem with starters is that they're one-offs. Starters are
boilerplate projects that begin to diverge immediately from upstream
and have no easy way of updating when changes are made
upstream. There's another approach to boilerplate that has become
popular in recent years that fixes some problems with the boilerplate
approach such as updating with upstream. One such project is
[`create-react-app`](https://facebook.github.io/create-react-app/). In
the Gatsby world, you can improve on starters similarly with themes.

### Truly Reusable Themes in Gatsby

If a single `gatsby-config.js` encodes the functionality of a whole Gatsby
site, then if you can
[compose](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-function-composition-20dfb109a1a0)
the `gatsby-config.js` data structure together you have the base for
themes. You can encode portions of our gatsby-config as themes and
re-use them across sites. This is a big deal because you can have a
theme config (or multiple configs) that composes together with the
custom config (for the current site). Upgrading the underlying theme
does not undo the customizations, meaning you get upstream
improvements to the theme without a difficult manual upgrade process.

## Why Themes?

Defining themes as the base composition unit of Gatsby sites allows us to start
solving a variety of use cases. For example, when a site gets built as
part of a wider product offering it's often the case that one team
will build out a suite of functionality, including branding elements,
and the other teams will mostly consume this functionality. Themes
allow us to distribute this functionality as an npm package and allow
the customization of various branding elements through our
`gatsby-config.js`.

## Mechanics of Theming

At a base level, theming combines the `gatsby-config.js` of the
theme with the `gatsby-config.js` of your site. Since it's an experimental
feature, you use an experimental namespace to declare themes in
the config.

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-theme-blog",
      options: {},
    },
  ],
}
```

Themes often need to be parameterized for various reasons, such as
changing the base url for subsections of a site or applying branding
variables. You can do this through the theme options if you define our
theme's gatsby-config as a function that returns an object.

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-theme-blog",
      options: {
        some: "value",
      },
    },
  ],
}
```

Themes also function as plugins and any config passed into the theme
in your `gatsby-config.js` will also be passed to your theme's `gatsby-*.js`
files as plugin options. This allows themes to override any settings
inherited from the theme's own plugin declarations or apply gatsby
lifecycle hooks such as [`onCreatePage`](/docs/node-apis/#onCreatePage).

Check out the theme examples in this multi-package repo for more
examples of using and building themes: https://github.com/ChristopherBiscardi/gatsby-theme-examples.

## Next Steps

### Sub Themes and Overriding

This is just the first step and it enables us to experiment with
further improvements in userland before merging them into
core. Sub-theming, for example, is a critical part of a theming
ecosystem that is currently missing from Gatsby. Overriding theme
elements is possible on a coarse level right now in userland. If, for
example, a theme defines a set of pages using
[`createPage`](/docs/actions/#createPage) you can define a helper
function that will look for the page component first in the user's
site and then fall back to the theme's default implementation.

```js
const withThemePath = relativePath => {
  let pathResolvedPath = path.resolve(relativePath)
  let finalPath = pathResolvedPath

  try {
    // check if the user's site has the file
    require.resolve(pathResolvedPath)
  } catch (e) {
    // if the user hasn't implemented the file,
    finalPath = require.resolve(relativePath)
  }

  return finalPath
}
```

Then in our theme's `createPage` call, you simply use the helper to let
the user optionally override the default component.

```title:gatsby-node.js
createPage({
  path: post.node.fields.slug,
  component: withThemePath('./src/templates/blog-post.js')
})
```

This doesn't allow us to make more granular overrides of different
components, but it does allow us to replace the rendering of pages and
other whole elements. Component Shadowing, a more granular method of
overriding, is already in the works.

If you want to be involved in the development of theming for Gatsby,
join the Spectrum community for [Gatsby
themes](https://spectrum.chat/gatsby-themes/general?thread=1e02db45-9f2e-4c0a-b42e-a4d4e4d519a8).

I'll also be talking about theming Gatsby at [Gatsby
Days](https://www.eventbrite.com/e/gatsby-days-tickets-51837151315) on
Dec 7th covering how Gatsby got here and where theming is going next.
