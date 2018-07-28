# Redux

https://using-unstated.gatsbyjs.org/

Gatsby example site that shows use of unstated.

# Overview

To use unstated in a Gatsby site you'll need to hook in to two of Gatsby's
extension points.

Once in `replaceRenderer` which runs during Gatsby's server rendering process,
and once in `replaceRouterComponent` which is part of Gatsby's browser APIs.

Check out [`./gatsby-ssr.js`](./gatsby-ssr.js) and
[`./gatsby-browser.js`](./gatsby-browser.js) to see how this is implemented in this example.
