---
title: API files
---

Gatsby uses four files to configure your site and control its behavior. One file, `gatsby-config.js` is required, while the other three are optional.

- [gatsby-config.js](/docs/api-files-gatsby-config) - Enables plugins, defines site metadata, and contains other site configuration.
- [gatsby-browser.js](/docs/api-files-gatsby-browser) - Gives you control over Gatsby's behavior in the browser. For example, responding to a user changing routes, or calling a function when the user first opens any page.
- [gatsby-node.js](/docs/api-files-gatsby-node) - Allows you to respond to events in the Gatsby build cycle. For example, adding pages dynamically, editing GraphQL nodes as they are created, or performing an action after a build is complete.
- [gatsby-ssr.js](/docs/api-files-gatsby-ssr) - Exposes Gatsby's server-side rendering process so you can control how it renders your pages to HTML.
