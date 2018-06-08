---
title: Migrating from v1 to v2
---

## Install React, ReactDOM, and each plugins’ peer dependencies manually
In v1, React and ReactDOM were magically resolved. This “feature” has been removed and you are now required to install them manually.

```bash
npm i react react-dom
```

or

```bash
yarn add react react-dom
```

Depending on the plugins you use, there may be more dependencies you need to install. For example: if you use typography.js, you now also need to install its dependencies.

```bash
npm i typography react-typography
```

or

```bash
yarn add typography react-typography
```

Search for the plugins that you use in [Gatsby’s plugins page](/plugins) and check their installation instructions.

## Layout component
The special layout component (`src/layouts/index.js`) that Gatsby v1 used to wrap every page has been removed. If the layout of your site appears to be broken, this is most likely the reason why.

To learn more about the considerations behind this removal, read the [Gatsby RFC](https://github.com/gatsbyjs/rfcs/blob/master/text/0002-remove-special-layout-components.md).

The following is the recommended migration path:

### 1. Convert children from function to normal prop (required)
In v1, the `children` prop passed to layout was a function and needed to be executed. In v2, this is no longer the case.

`layout in v1`

```jsx
import React from "react"

export default ({ children }) => (
  <div>
    {children()}
  </div>
)
```

`layout in v2`

```jsx{5}
import React from "react"

export default ({ children }) => (
  <div>
    {children}
  </div>
)
```

### 2. Move `layout/index.js` to `src/components/layout.js` (optional, but recommended)
```bash
git mv src/layouts/index.js src/components/layout.js
```

### 3. Import and wrap pages with layout component
Adhering to normal React composition model, you import the layout component and use it to wrap the content of the page.

`src/pages/index.js`

```jsx
import React from "react"
import Layout from "../components/layout"

export default () => (
  <Layout>
    <div>Hello World</div>
  </Layout>
)
```

Repeat for every page and template that needs this layout.

### 4. Change query to use `StaticQuery`
<!-- TODO: link StaticQuery text to StaticQuery doc page (if one will be made) -->
Since layout is no longer special, you now need to make use of v2’s StaticQuery feature.

`Query with layout in v1`

```jsx
import React, { Fragment } from "react"
import Helmet from "react-helmet"

export default ({ children, data }) => (
  <Fragment>
    <Helmet titleTemplate={`%s | ${data.site.siteMetadata.title}`} defaultTitle={data.site.siteMetadata.title} />
    <div>
      {children()}
    </div>
  </Fragment>
)

export const query = graphql`
  query LayoutQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
```

`StaticQuery with layout in v2`

```jsx
import React, { Fragment } from "react"
import { StaticQuery } from "gatsby"

export default ({ children }) => (
  <StaticQuery
    query={graphql`
      query LayoutQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <Fragment>
        <Helmet titleTemplate={`%s | ${data.site.siteMetadata.title}`} defaultTitle={data.site.siteMetadata.title} />
        <div>
          {children}
        </div>
      </Fragment>
    )}
  />
)
```

### 5. Pass `history`, `location`, and `match` props to layout
In v1, layout component had access to `history`, `location`, and `match` props. In v2, only pages have access to these props; pass them to your layout component as needed.

`layout`

```jsx
import React from "react"

export default ({ children, location }) => (
  <div>
    <p>Path is {location.pathname}</p>
    {children}
  </div>
)
```

`src/pages/index.js`

```jsx
import React from "react"
import Layout from "../components/layout.js"

export default props => (
  <Layout location={props.location}>
    <div>Hello World</div>
  </Layout>
)
```

## Rename `boundActionCreators` to `actions`
`boundActionCreators` is deprecated in v2. You can continue using it, but it’s recommended that you rename it to `actions`.

## Rename `pathContext` to `pageContext`
Similar to `boundActionCreators` above, `pathContext` is deprecated in favor of `pageContext`.

<!--
Taken from: https://github.com/gatsbyjs/gatsby/blob/v2/Breaking%20Changes.md
* [] Remove postcss plugins (cssnext, cssimport) from default css loader config
* [x] boundActionCreators => actions
* [x] pathContext => pageContext
* [] Source & transformer plugins now use UUIDs for ids. If you used glob or regex to query nodes by id then you'll need to query something else.
* [] Mixed commonjs/es6 modules fail
* [] Remove explicit polyfill and use the new builtins: usage support in babel 7.
* [] Changed modifyBabelrc to onCreateBabelConfig
* [] Changed modifyWebpackConfig to onCreateWebpackConfig
* [] Inlining CSS changed — remove it from any custom html.js as done automatically by core now.
* [x] Manually install react and react-dom, along with any dependencies required by your plugins.
* [x] Layouts have been removed. To achieve the same behavior as v1, you have to wrap your pages and page templates with your own Layout component. Since Layout is a non-page component, making query has to be done with StaticQuery.
-->
