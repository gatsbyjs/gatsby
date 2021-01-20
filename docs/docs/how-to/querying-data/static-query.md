---
title: Querying Data in Components using StaticQuery
---

Gatsby v2 introduces `StaticQuery`, a new API that allows components to retrieve data via a GraphQL query.

In this guide, you'll see an example using `StaticQuery`, and learn about [the difference between a StaticQuery and a page query](#how-staticquery-differs-from-page-query).

## How to use `StaticQuery` in components

<EggheadEmbed
  lessonLink="https://egghead.io/lessons/gatsby-load-data-using-graphql-queries-directly-in-a-gatsby-v2-component-with-staticquery"
  lessonTitle="Load Data using GraphQL Queries Directly in a Gatsby v2 Component with StaticQuery"
/>

### Basic example

Here is an example of a `Header` component using `StaticQuery`:

```jsx:title=src/components/header.js
import React from "react"
import { StaticQuery, graphql } from "gatsby"

export default function Header() {
  return (
    <StaticQuery
      query={graphql`
        query HeadingQuery {
          site {
            siteMetadata {
              title
            }
          }
        }
      `}
      render={data => (
        <header>
          <h1>{data.site.siteMetadata.title}</h1>
        </header>
      )}
    />
  )
}
```

By using `StaticQuery`, you can colocate a component with its data. It is no longer required to, say, pass data down from `Layout` to `Header`.

### useStaticQuery

There's also a React hooks version of StaticQuery: check out the documentation on [`useStaticQuery`](/docs/how-to/querying-data/use-static-query/)

### Typechecking

With the above pattern, you lose the ability to typecheck with PropTypes. To regain typechecking while achieving the same result, you can change the component to:

```jsx:title=src/components/header.js
import React from "react"
import { StaticQuery, graphql } from "gatsby"
import PropTypes from "prop-types"

const Header = ({ data }) => (
  <header>
    <h1>{data.site.siteMetadata.title}</h1>
  </header>
)

export default function MyHeader(props) {
  return (
    <StaticQuery
      query={graphql`
        query {
          site {
            siteMetadata {
              title
            }
          }
        }
      `}
      render={data => <Header data={data} {...props} />}
    />
  )
}

Header.propTypes = {
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        title: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
}
```

## How StaticQuery differs from page query

StaticQuery can do most of the things that page query can, including fragments. The main differences are:

- page queries can accept variables (via `pageContext`) but can only be added to _page_ components
- StaticQuery does not accept variables (hence the name "static"), but can be used in _any_ component, including pages
- StaticQuery does not work with raw React.createElement calls; please use JSX, e.g. `<StaticQuery />`
