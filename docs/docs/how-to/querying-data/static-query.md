---
title: Querying Data in Components using StaticQuery
---

**Please note:** As of Gatsby 5 the `<StaticQuery />` component is deprecated. Use the [`useStaticQuery` hook](/docs/how-to/querying-data/use-static-query/) instead. `<StaticQuery />` will be removed in Gatsby 6.

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
