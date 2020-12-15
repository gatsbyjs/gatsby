---
title: Gatsby Browser APIs
description: Documentation about leveraging standard browser APIs within Gatsby
jsdoc: ["src/utils/api-browser-docs.ts"]
apiCalls: BrowserAPI
showTopLevelSignatures: true
---

## Introduction

The file `gatsby-browser.js` lets you respond to actions within the browser, and wrap your site in additional components. The Gatsby Browser API gives you many options for interacting with the [client-side](/docs/glossary#client-side) of Gatsby.

## Usage

To use Browser APIs, create a file in the root of your site at `gatsby-browser.js`. Export each API you want to use from this file.

```jsx:title=gatsby-browser.js
const React = require("react")
const Layout = require("./src/components/layout")

// Logs when the client route changes
exports.onRouteUpdate = ({ location, prevLocation }) => {
  console.log("new pathname", location.pathname)
  console.log("old pathname", prevLocation ? prevLocation.pathname : null)
}

// Wraps every page in a component
exports.wrapPageElement = ({ element, props }) => {
  return <Layout {...props}>{element}</Layout>
}
```

> Note: The APIs `wrapPageElement` and `wrapRootElement` exist in both the browser and [Server-Side Rendering (SSR) APIs](/docs/reference/config-files/gatsby-ssr). If you use one of them, consider if you should implement it in both `gatsby-ssr.js` and `gatsby-browser.js` so that pages generated through SSR with Node.js are the same after being [hydrated](/docs/glossary#hydration) with browser JavaScript.
