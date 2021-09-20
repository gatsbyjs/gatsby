---
title: API Files
---

Gatsby uses 4 files in the root of your project to configure your site and control its behavior. Both sites and plugins may implement these files. All of these files are optional.

- [gatsby-config.js](/docs/reference/config-files/gatsby-config/) - Enables plugins, defines common site data, and contains other site configuration that integrates with Gatsby's GraphQL data layer.
- [gatsby-browser.js](/docs/reference/config-files/gatsby-browser/) - Gives you control over Gatsby's behavior in the browser. For example, responding to a user changing routes, or calling a function when the user first opens any page.
- [gatsby-node.js](/docs/reference/config-files/gatsby-node/) - Allows you to respond to events in the Gatsby build cycle. For example, adding pages dynamically, editing GraphQL nodes as they are created, or performing an action after a build is complete.
- [gatsby-ssr.js](/docs/reference/config-files/gatsby-ssr) - Exposes Gatsby's server-side rendering process so you can control how it builds your HTML pages.
