---
title: Introducing Gatsby Themes
date: 2018-10-26
author: Chris Biscardi
excerpt: "Scaling the production of Gatsby sites"
tags: ["themes", "architecture"]
---

Gatsby is a powerful platform for building marketing sites, blogs,
ecommerce frontends, and more. We can source data from static files
and any number of content management systems. We can process images,
add support for our favorite styling technique, transform markdown,
and just about anything else you can imagine.

At its core, a Gatsby site is a combination of functionality centered
around a single config file, `gatsby-config.js`. This config file
controls an assortment of site metadata, data type mapping, and most
importantly, plugins. Plugins contain large amounts of customizable
functionality for turning markdown into pages, processing components
into documentation, and even processing images.

# Scaling Gatsby

Creating one Gatsby site is great but we had to start from scratch and
make all the decisions ourselves. Those decisions are encoded into our
gatsby-config. The next time we have to create a similar site for a
new product we have to start from scratch and remake all of the
decisions we made for our first site. Wouldn't it be great if we could
re-use our gatsby-config across projects? That's where starters come
in.

## Starters

One way to create more sites with similar functionality faster is to
use starters. Starters are basically whole Gatsby sites that can be
scaffolded through the gatsby cli. This helps you start your project
by cloning the boilerplate, installing dependencies, and clearing Git
history. The community around gatsby has built a lot of different
starters for various use cases including blogging, working with
material design, and documentation.

The problem with starters is that they're one-offs. Starters are
boilerplate projects that begin to diverge immediately from upstream
and have no easy way of updating when changes are made
upstream. There's another approach to boilerplate that has become
popular in recent years that fixes some problems with the boilerplate
approach such as updating with upstream. One such project is
create-react-app. In the gatsby world, we can improve on starters
similarly with themes.

## Themes

If a single gatsby-config encodes the functionality of a whole Gatsby
site then if we can compose the gatsby-config data structure together
we have the base for themes. We can encode portions of our
gatsby-config as themes and re-use them across sites.

# Why Themes?

Defining themes as the composition of Gatsby sites allows us to start
solving a variety of use cases. For example, when a site gets built as
part of a wider product offering it's often the case that one team
will build out a set of functionality, including branding elements,
and the other teams will mostly consume this functionality. Themes
allow us to distribute this functionality as an npm package and allow
the customization of various branding elements through our
gatsby-config.

# Mechanics of Theming

At a base level, theming simply combines the gatsby-config of the
theme with the gatsby-config of your site. Since it's an experimental
feature, we use an experimental namespace to declare themes in
gatsby-config.

```js
module.exports = {
  __experimentalThemes: [["gatsby-theme-blog", {}]],
}
```

Themes often need to be parameterized for various reasons, such as
changing the base url for subsections of a site or applying branding
variables. We can do this through the theme options if we define our
theme's gatsby-config as a function that returns an object.

```js
module.exports = {
  __experimentalThemes: [
    [
      "gatsby-theme-blog",
      {
        some: "value",
      },
    ],
  ],
}
```

Themes also function as plugins and any config passed into the theme
in your gatsby-config will also be passed to your theme's gatsby-\*
files as plugin options. This allows themes to override any settings
inherited from the theme's own plugin declarations or apply gatsby
lifecycle hooks such as on-create-page.

# Next Steps

## Sub Themes and Overriding

This is just the first step and it enables us to experiment with
further improvements in userland before merging them into
core. Sub-theming, for example, is a critical part of a theming
ecosystem that is currently missing from core. Overriding theme
elements is possible on a coarse level right now in userland. If, for
example, a theme defines a set of pages using createPage we can define
a helper function that will look for the page component first in the
user's site and then fall back to the theme's default implementation.

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

Then in our theme's createPage call, we simply use the helper to let
the user optionally override the default component.

```
createPage({
  path: post.node.fields.slug,
  component: withThemePath('./src/templates/blog-post.js')
})
```

This doesn't allow us to make more granular overrides of different
components, but it does allow us to replace the rendering of pages and
other whole elements.

---

:conclusion with links to file issues and help out:

https://github.com/ChristopherBiscardi/gatsby-theme-examples
