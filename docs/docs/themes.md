---
title: Themes
---

Rough outline

Themes are collections of plugins with optional additional assets such
as react components, css, and binary files e.g. images.

Themes are NPM packages.

A site can have multiple themes.

Themes can compose other themes.

User can override theme's default options for plugins.

All theme assets are "ejectable" e.g. will be copied into the site's
source so you can modify the file directory.

You'll type something like `gatsby eject gatsby-core-theme` and then be
presented with a list of assets from which you could choose which assets
to eject. A common use case will be, install Gatsby blog theme, decide
to override the blog index page, eject it, tweak the react component.
