---
title: Creating global styles
---

In nearly every site, there will be some global styles, such as a reset or typography defaults. This guide will walk through how to add global styles to your site, whether you use standard `.css` files (or with preprocessors like Sass/Less) or a CSS-in-JS solution.

## Table of Contents

- [How to add global styles in Gatsby using CSS-in-JS](#how-to-add-global-styles-in-gatsby-using-css-in-js)
- [Add global styles with CSS files and no layout component](#add-global-styles-with-css-files-and-no-layout-component)

## How to add global styles in Gatsby using CSS-in-JS

> **NOTE:** For this example, we’ll be using [Emotion](https://emotion.sh), but the implementation is similar for other CSS-in-JS solutions as well.

To start, create a new Gatsby site with the [hello world starter](https://github.com/gatsbyjs/gatsby-starter-hello-world) and install [`gatsby-plugin-emotion`](/packages/gatsby-plugin-emotion/) and its dependencies:

```shell
gatsby new global-styles https://github.com/gatsbyjs/gatsby-starter-hello-world
cd global-styles
npm install --save gatsby-plugin-emotion @emotion/core @emotion/styled
```

Create `gatsby-config.js` and add the Emotion plugin:

```js:title=gatsby-config.js
module.exports = {
  plugins: [`gatsby-plugin-emotion`],
}
```

Next, add a layout component at `src/components/layout.js`:

```jsx:title=src/components/layout.js
import React from "react"
import { Global, css } from "@emotion/core"
import styled from "@emotion/styled"

const Wrapper = styled("div")`
  border: 2px solid green;
  padding: 10px;
`

export default ({ children }) => (
  <Wrapper>
    <Global
      styles={css`
        div {
          background: red;
          color: white;
        }
      `}
    />
    {children}
  </Wrapper>
)
```

Then, update `src/pages/index.js` to use the layout:

```jsx:title=src/pages/index.js
import React from "react"
import Layout from "../components/layout"

export default () => <Layout>Hello world!</Layout>
```

Run `npm run build`, and you can see in `public/index.html` that the styles have been inlined globally.
