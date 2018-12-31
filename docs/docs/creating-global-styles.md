---
title: Creating global styles
---

In nearly every site, there will be some global styles, such as a reset or typography defaults. This guide will walk through how to add global styles to your site, whether you use standard `.css` files (or with preprocessors like Sass/Less) or a CSS-in-JS solution.

## Table of Contents

- [How to add global styles in Gatsby with standard CSS files](#how-to-add-global-styles-in-gatsby-with-standard-css-files)
- [How to add global styles in Gatsby using CSS-in-JS](#how-to-add-global-styles-in-gatsby-using-css-in-js)
- [Add global styles with CSS files and no layout component](#add-global-styles-with-css-files-and-no-layout-component)

## How to add global styles in Gatsby with standard CSS files

The best way to add global styles is with a [shared layout component](/tutorial/part-three/#your-first-layout-component). This layout component is used for things that are shared throughout the site, including styles, header components, and other common items.

> **NOTE:** This pattern is implemented by default in [the default starter](https://github.com/gatsbyjs/gatsby-starter-default/blob/02324e5b04ea0a66d91c7fe7408b46d0a7eac868/src/layouts/index.js#L6).

To create a shared layout with global styles, start by creating a new Gatsby site with the [hello world starter](https://github.com/gatsbyjs/gatsby-starter-hello-world).

```shell
gatsby new global-styles https://github.com/gatsbyjs/gatsby-starter-hello-world
```

Open your new site in your code editor and create a new directory at `/src/components`. Inside, create two new files:

```diff
  global-styles/
  └───src/
      └───components/
+     │   │─  layout.js
+     │   └─  layout.css
      │
      └───pages/
          └─  index.js
```

Inside `src/components/layout.css`, add some global styles:

```css:title=src/components/layout.css
div {
  background: red;
  color: white;
}
```

In `src/components/layout.js`, include the stylesheet and export a layout component:

```jsx:title=src/components/layout.js
import React from "react"
import "./layout.css"

export default ({ children }) => <div>{children}</div>
```

Finally, update `src/pages/index.js` to use the new layout component:

```jsx:title=src/pages/index.js
import React from "react"
import Layout from "../components/layout"

export default () => <Layout>Hello world!</Layout>
```

Run `gatsby develop` and you’ll see the global styles applied.

![Global styles](./images/global-styles.png)

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

Run `gatsby build`, and you can see in `public/index.html` that the styles have been inlined globally.

## Add global styles with CSS files and no layout component

In some cases, using a shared layout component is not desirable. In these cases, you can include a global stylesheet using `gatsby-browser.js`.

> **NOTE:** This approach does _not_ work with CSS-in-JS. Use shared components to share styles in CSS-in-JS.

First, open a new terminal window and run the following commands to create a new default Gatsby site and start the development server:

```shell
gatsby new global-style-tutorial https://github.com/gatsbyjs/gatsby-starter-default
cd global-style-tutorial
gatsby develop
```

Second, create a css file and define any styles you wish. An arbitrary example:

```css:title=src/styles/global.css
html {
  background-color: lavenderblush;
}

a {
  color: rebeccapurple;
}
```

Then, include the stylesheet in your site's `gatsby-browser.js` file.

> **NOTE:** This solution works when including css as those styles are extracted when building the JavaScript but not for css-in-js.
> Including styles in a layout component or a global-styles.js is your best bet for that.

```javascript:title=gatsby-browser.js
import "./src/styles/global.css"

// or:
// require('./src/styles/global.css')
```

> _Note: You can use Node.js require or import syntax. Additionally, the placement of the example css file in a `src/styles` folder is arbitrary._

You should see your global styles taking effect across your site:

![Global styles example site](./images/global-styles-example.png)
