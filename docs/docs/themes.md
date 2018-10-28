---
title: Themes
---

Brief overview

Themes are collections of plugins with optional additional assets such as react
components, css, and binary files e.g. images.

- Themes are NPM packages.

- A site can have multiple themes.

- Themes can compose other themes.

- User can override theme's default options for plugins.

- All theme assets are "ejectable" e.g. will be copied into the site's source so
you can modify the file directory.


On running  `gatsby eject gatsby-core-theme` and then a list of assets will be shown, from which you could choose which assets to
eject. 
A common use case would be, install Gatsby blog theme. 
In order to override the blog's index page, eject it and tweak the react component.
