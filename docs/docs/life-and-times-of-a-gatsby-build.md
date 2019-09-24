---
title: Life and times of a Gatsby build
---

When working with Gatsby it has two modes.

1. Develop - run with the `gatsby develop` command
2. Build - run with `gatsby build`

You can start Gatsby in either mode with its respective command: `gatsby develop` or `gatsby build`.

## gatsby develop

Gatsby develop is optimised for rapid feedback and extra debugging information.

Using `gatsby develop` runs a server in the background enabling useful features like hot reloading and Gatsby’s data explorer.

## gatsby build

Gatsby build is made for when you’ve added the finishing touches to your site and everything looks great. `gatsby build` creates a version of your site with optimizations like packaging up your site’s config, data, and code, and creating all the HTML that eventually gets [rehydrated](/docs/glossary#hydration) into a React app.

## What happens when you run `gatsby build`?

This is a high-level overview. For more detailed information, check TODO, TODO, TODO.

A Node process is what is powering things behind the scenes when you run the `gatsby build` command. The process of converting assets and pages into HTML that can be rendered in a browser by a [server-side](docs/glossary#server-side) language like Node.js is referred to as server-side rendering. Since Gatsby is building everything ahead of time, this creates your entire site with all of the data your pages need all at once. Then when the site is deployed, it doesn't need to be running on a server because everything has been gathered up and combined by Gatsby.

**Note**: because Gatsby apps still run React in the browser, you can still fetch data from other sources at [runtime](/docs/glossary#runtime) like you would in a normal React app
