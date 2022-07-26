---
title: Gatsby Server Rendering APIs
description: Documentation on APIs related to server side rendering during Gatsby's build process
jsdoc: ["cache-dir/api-ssr-docs.js"]
apiCalls: SSRAPI
showTopLevelSignatures: true
---

The file `gatsby-ssr.jsx`/`gatsby-ssr.tsx` lets you alter the content of static HTML files as they are being Server-Side Rendered (SSR) by Gatsby and Node.js. To use the [Gatsby SSR APIs](/docs/reference/config-files/gatsby-ssr/), create a file called `gatsby-ssr.js` in the root of your site. Export any of the APIs you wish to use in this file.

You can author the file in JavaScript or [TypeScript](/docs/how-to/custom-configuration/typescript/#gatsby-browsertsx--gatsby-ssrtsx).

The APIs `wrapPageElement` and `wrapRootElement` exist in both the SSR and [browser APIs](/docs/reference/config-files/gatsby-browser). You generally should implement the same components in both `gatsby-ssr.js` and `gatsby-browser.js` so that pages generated through SSR with Node.js are the same after being [hydrated](/docs/glossary#hydration) in the browser.

```jsx:title=gatsby-ssr.jsx
const React = require("react")
const Layout = require("./src/components/layout")

// Adds a class name to the body element
exports.onRenderBody = ({ setBodyAttributes }, pluginOptions) => {
  setBodyAttributes({
    className: "my-body-class",
  })
}

// Wraps every page in a component
exports.wrapPageElement = ({ element, props }) => {
  return <Layout {...props}>{element}</Layout>
}
```

## Usage

Implement any of these APIs by exporting them from a file named `gatsby-ssr.jsx`/`gatsby-ssr.tsx` in the root of your project.
