---
title: Debugging replaceRenderer API
---

## What is the `replaceRenderer` API?

The `replaceRenderer` API is one of [Gatsby's Server Side Rendering (SSR) hooks](https://www.gatsbyjs.org/docs/ssr-apis/#replaceRenderer). It's used to customise how Gatsby renders your static content. It can be implemented by any Gatsby plugin or your `gatsby-ssr.js` file to add support for Redux, CSS-in-JS libraries or any code that needs to change Gatsby's default HTML output.

## Why does it cause build errors?

When using `replaceRenderer` multiple times in your project, only the newest instance will be used - which can cause unexpected problems with your site.

Note that it's only used during `gatsby build` and not `gatsby develop`, so you may not notice any problems while developing your site.

When `gatsby build` detects a project using `replaceRenderer` multiple times, it will show an error like this:

```
The "replaceRenderer" api has been implemented multiple times. Only the last implementation will be used.
This is probably an error, see https://example.com for workarounds.
Check the following files for "replaceRenderer" implementations:
/path/to/my/site/node_modules/gatsby-plugin-styled-components/gatsby-ssr.js
/path/to/my/site/gatsby-ssr.js
```

## Fixing `replaceRenderer` build errors

If you see errors during your build, you can fix them with the following steps.

### 1. Identify the plugins using `replaceRenderer`

Your error message should list the files that use `replaceRenderer`

```shell
Check the following files for "replaceRenderer" implementations:
/path/to/my/site/node_modules/gatsby-plugin-styled-components/gatsby-ssr.js
/path/to/my/site/gatsby-ssr.js
```

In this example, your `gatsby-ssr.js` file and `gatsby-plugin-styled-components` are both using `replaceRenderer`.

### 2. Move their `replaceRenderer` functionality to your `gatsby-ssr.js` file

You'll need to manually combine the `replaceRenderer` functionality from your plugins into your `gatsby-ssr.js` file. This step will be different for each project, keep reading to see an example.

## Example

### Initial setup

In this example project you're using [`redux`](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-redux) and [Gatsby's Styled Components plugin](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-styled-components).

`gatsby-config.js`

```js
module.exports = {
  plugins: [`gatsby-plugin-styled-components`],
}
```

`gatsby-ssr.js` (based on the [using Redux example](https://github.com/gatsbyjs/gatsby/blob/master/examples/using-redux/gatsby-ssr.js))

```js
import React from "react"
import { Provider } from "react-redux"
import { renderToString } from "react-dom/server"

import createStore from "./src/state/createStore"

exports.replaceRenderer = ({ bodyComponent, replaceBodyHTMLString }) => {
  const store = createStore()

  const ConnectedBody = () => <Provider store={store}>{bodyComponent}</Provider>
  replaceBodyHTMLString(renderToString(<ConnectedBody />))
}
```

Note that the Styled Components plugin uses `replaceRenderer`, and the code in `gatsby-ssr.js` also uses `replaceRenderer`.

### Fixing the `replaceRenderer` error

Your `gatsby-config.js` file will remain unchanged, but your `gatsby-ssr.js` file will update to include the [`replaceRenderer` functionality from the Styled Components plugin](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-styled-components/src/gatsby-ssr.js)

`gatsby-ssr.js`

```js
import React from "react"
import { Provider } from "react-redux"
import { renderToString } from "react-dom/server"
import { ServerStyleSheet, StyleSheetManager } from "styled-components"
import createStore from "./src/state/createStore"

exports.replaceRenderer = ({
  bodyComponent,
  replaceBodyHTMLString,
  setHeadComponents,
}) => {
  const sheet = new ServerStyleSheet()
  const store = createStore()

  const app = () => (
    <Provider store={store}>
      <StyleSheetManager sheet={sheet.instance}>
        {bodyComponent}
      </StyleSheetManager>
    </Provider>
  )
  replaceBodyHTMLString(renderToString(<app />))
  setHeadComponents([sheet.getStyleElement()])
}
```

Now `gatsby-ssr.js` implements the Styled Components and Redux functionality using a replaceRenderer instance. Now run `gatsby build` and your site will build without errors.

There's a full repo of this example at: https://github.com/m-allanson/gatsby-replace-renderer-example/commits/master
