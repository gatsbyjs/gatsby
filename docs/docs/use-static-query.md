---
title: Querying data in components with the useStaticQuery hook
---

Gatsby v2.1.0 introduces `useStaticQuery`, a new Gatsby feature that provides the ability to use a [React Hook](https://reactjs.org/docs/hooks-intro.html) to query with GraphQL at _build time_.

Just like the [StaticQuery](/docs/static-query/) component, it allows your React components to retrieve data via a GraphQL query that will be parsed, evaluated, and injected into the component. However, `useStaticQuery` is a hook rather than a component that takes a render prop!

In this guide, we'll walk through an example using `useStaticQuery`. If you're not familiar with static queries in Gatsby, you might want to check out [the difference between a static query and a page query](/docs/static-query/#how-staticquery-differs-from-page-query).

## How to use useStaticQuery in components

> 💡 You'll need React and ReactDOM 16.8.0 or later to use `useStaticQuery`.
>
> 📦 `npm install react@^16.8.0 react-dom@^16.8.0`

`useStaticQuery` is a React Hook. All the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html) apply.

It takes your GraphQL query and returns the requested data. That's it!

### Basic example

Let's create a `Header` component that queries for the site title from `gatsby-config.js`:

```jsx:title=src/components/header.js
import React from "react"
import { useStaticQuery, graphql } from "gatsby"

export default () => {
  const data = useStaticQuery(graphql`
    query HeaderQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <header>
      <h1>{data.site.siteMetadata.title}</h1>
    </header>
  )
}
```

### Advanced Example

The potential of `useStaticQuery` is to make easier reuse queries across your code.

One of the most used queries is to retrieve your site metadata.

You can create a `useSiteMetadata` for that purpose:

```jsx:title=src/components/hook/site-meta.js
import { useStaticQuery, graphql } from 'gatsby'

export const useSiteMetadata = () => {
  const { site } = useStaticQuery(
    graphql`
      query SiteMetaData {
        site {
          siteMetadata {
            siteUrl
            headline
            description
            image
            video
            twitter
            name
            logo
          }
        }
      }
    `
  )
  return site.siteMetadata
}
```

To use it, instead of require the hook directly, you need to declare a `index.js` for load and export all the all the `useStaticQuery`'s:


```jsx:title=src/components/hook/index.js
export * from './site-meta'
```

That's necessary because you can't have more than one `useStaticQuery` per file; However, you can export all and import into an index file.

Then just require the properly hook in your code:

```jsx:jsx:title=src/pages/index.js
import { useSiteMetadata } from 'components/hook'

export default () => {
  const { title, siteUrl } = useSiteMetadata()
  return (
    <h1>welcome to {title}</h1>
  )
}
```

## Known Limitations

- `useStaticQuery` does not accept variables (hence the name "static"), but can be used in _any_ component, including pages.
- Because of how queries currently work in Gatsby, we support only a single instance of `useStaticQuery` in a file.
