# MOBX
[Using mobx with gatsby](https://jonniebigodes.github.io/gatsby-example-mobx/)


Gatsby example site that shows use of mobx.

# Overview

To use mobx in a Gatsby site you'll need to hook in to two of Gatsby's extension points.

Once in wrapRootElement which runs during Gatsby's server rendering process, and once in wrapRootElement which is part of Gatsby's browser APIs.
Check out [./gatsby-ssr.js](./gatsby-ssr.js) and [./gatsby-browser.js](./gatsby-browser.js) to see how this is implemented in this example

Also check the [./babelrc](./babelrc) to check how to enable the decorators to work


