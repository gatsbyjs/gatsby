# MOBX

[Using mobx with gatsby](https://dazzling-meninsky-6f4ac3.netlify.com/)

Gatsby example site that shows use of mobx.

# Overview

To use mobx in a Gatsby site you'll need to hook in to two of Gatsby's extension points.

Once in wrapRootElement which runs during Gatsby's server rendering process, and once in wrapRootElement which is part of Gatsby's browser APIs.
Check out [./gatsby-ssr.js](./gatsby-ssr.js) and [./gatsby-browser.js](./gatsby-browser.js) to see how this is implemented in this example

## More Information on MobX

[Docs](https://mobx.js.org/)

[Examples](https://github.com/mobxjs/mobx-examples)
