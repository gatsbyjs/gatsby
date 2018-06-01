---
title: Migrating from v1 to v2
---

## Install React, ReactDOM, and each plugins’ peer dependencies manually
In v1, React and ReactDOM were magically resolved. This “feature” has been removed and you are now required to install them manually.

```bash
npm i react react-dom
```

Depending on the plugins you use, there may be more dependencies you need to install. For example: if you use typography.js, you now also need to install its dependencies.

```bash
npm i typography react-typography
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

## Rename responsive image queries

The `sizes` and `resolutions` queries are deprecated in v2. These queries have been renamed to `fluid` and `fixed` to make them easier to understand.

Before:

```jsx
const Example = ({ data }) => {
  <div>
    <Img sizes={data.foo.childImageSharp.sizes} />
    <Img resolutions={data.bar.childImageSharp.resolutions} />
  </div>
}

export default Example

export const pageQuery = graphql`
  query IndexQuery {
    foo: file(relativePath: { regex: "/foo.jpg/" }) {
      childImageSharp {
        sizes(maxWidth: 700) {
          ...GatsbyImageSharpSizes_tracedSVG
        }
      }
    }
    bar: file(relativePath: { regex: "/bar.jpg/" }) {
      childImageSharp {
        resolutions(width: 500) {
          ...GatsbyImageSharpResolutions_withWebp
        }
      }
    }
  }
`
```

After:

```jsx{2-3,13-14,20-21}
const Example = ({ data }) => {
  <div>
    <Img fluid={data.foo.childImageSharp.fluid} />
    <Img fixed={data.bar.childImageSharp.fixed} />
  </div>
}

export default Example

export const pageQuery = graphql`
  query IndexQuery {
    foo: file(relativePath: { regex: "/foo.jpg/" }) {
      childImageSharp {
        fluid(maxWidth: 700) {
          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
    bar: file(relativePath: { regex: "/bar.jpg/" }) {
      childImageSharp {
        fixed(width: 500) {
          ...GatsbyImageSharpFixed_withWebp
        }
      }
    }
  }
`
```

Further examples can be found in the [Gatsby Image docs](https://github.com/gatsbyjs/gatsby/tree/d0e29272ed7b009dae18d35d41a45e700cdcab0d/packages/gatsby-image).

## Manually specify postcss plugins

Gatsby v2 removed `postcss-cssnext` and `postcss-import` from the default postcss setup.

Use [`onCreateWebpackConfig`](/docs/add-custom-webpack-config) to specify your postcss plugins.

Note: there will be a `postcss` plugin that allows you to configure postcss from a standard postcss config file. [Follow this discussion on issue 3284](https://github.com/gatsbyjs/gatsby/issues/3284).

## Files mixing CommonJS with ES6 modules won't compile

Gatsby v2 uses babel 7 which is stricter about parsing files with mixed JS styles.

ES6 Modules are ok:

```js
import foo from "foo"
export default foo
```

CommonJS is ok:

```js
const foo = require('foo');
module.exports = foo;
```

Mixing `requires` and `export` is not ok:
```js
const foo = require('foo');
export default foo
```

Mixing `import` and `module.exports` is not ok:
```js
import foo from "foo"
module.exports = foo;
```

See [Gatsby's babel docs for more details](/docs/babel).

## Don't query nodes by ID

Source and transformer plugins now use UUIDs for IDs. If you used glob or regex to query nodes by id then you'll need to query something else.

[See the Pull Request that implemented this change](https://github.com/gatsbyjs/gatsby/pull/3807/files)

> TODO: add example

## Remove explicit polyfills

If your Gatsby v1 site included any polyfills, you can remove them. Gatsby v2 ships with babel 7 and is configured to automatically include polyfills for your code. See [Gatsby's babel docs for more details](/docs/babel).
