---
title: Querying Data in Components with the useStaticQuery Hook
---

`useStaticQuery` provides the ability to use a [React Hook](https://reactjs.org/docs/hooks-intro.html) to query Gatsby's GraphQL data layer at build time. It allows your React components to retrieve data via a GraphQL query that will be parsed, evaluated, and injected into the component.

## Directions

`useStaticQuery` is a React Hook. All the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html) apply.

It takes your GraphQL query and returns the requested data. That's it!

### Basic example

Let's create a `Header` component that queries for the site title from `gatsby-config.js`:

```jsx:title=src/components/header.js
import React from "react"
import { useStaticQuery, graphql } from "gatsby"

export default function Header() {
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

### Composing custom `useStaticQuery` hooks

One of the most compelling features of hooks is the ability to compose and re-use these blocks of functionality. `useStaticQuery` is a hook. Therefore, using `useStaticQuery` allows us to compose and re-use blocks of reusable functionality. Perfect!

A classic example is to create a `useSiteMetadata` hook which will provide the `siteMetadata` to be re-used in any component. It looks something like:

```jsx:title=src/hooks/use-site-metadata.js
import { useStaticQuery, graphql } from "gatsby"

export const useSiteMetadata = () => {
  const { site } = useStaticQuery(
    graphql`
      query SiteMetaData {
        site {
          siteMetadata {
            title
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

Then import your newly created hook, like so:

```jsx:title=src/pages/index.js
import React from "react"
import { useSiteMetadata } from "../hooks/use-site-metadata"

export default function Home() {
  const { title, siteUrl } = useSiteMetadata()
  return <h1>welcome to {title}</h1>
}
```

## Differences between page queries & static queries

Static queries differ from Gatsby page queries in a number of ways. For pages, Gatsby is capable of handling queries with variables because of its awareness of page context. However, page queries can only be made in **top-level page components**.

In contrast, static queries do not take variables. This is because static queries are used inside specific components, and can appear lower in the component tree. Data fetched with a static query won't be dynamic (i.e. **they can't use variables**, hence the name "static" query), but they can be called at any level in the component tree.

Static queries thus have these limitations:

- `useStaticQuery` does not accept variables (hence the name "static"), but can be used in _any_ component, including pages
- Because of how queries currently work in Gatsby, Gatsby supports only a single instance of `useStaticQuery` in a file

## Other limitations

### Must be in `src` directory

`useStaticQuery` must be used in files that are nested below your site's top-level `src` directory. For example:

`useStaticQuery` works in these files:

- `<SITE_ROOT>/src/my-page.js`
- `<SITE_ROOT>/src/components/my-component.js`

`useStaticQuery` **does not** work in these files:

- `<SITE_ROOT>/other-components/other-component.js`
- `<SITE_ROOT>/other-library/other-component.js`
