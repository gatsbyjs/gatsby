---
title: GraphQL API
---

import { GraphqlApiQuery } from "../../www/src/components/api-reference/doc-static-queries"
import APIReference from "../../www/src/components/api-reference"

A great advantage of Gatsby is a built-in data layer that combines data from any and all data sources you link into. Data is collected at [build time](/docs/glossary#build) and automatically assembled into a [schema](/docs/glossary#schema) that defines how data can be queried throughout components and pages in your site.

This doc serves as a reference for GraphQL features built into Gatsby, including methods for querying and sourcing data, and customizing GraphQL for your site's needs.

## Getting Started with GraphQL

GraphQL doesn't need to be installed in a new Gatsby site, it is already included. A schema is inferred and created when you run `gatsby develop` or `gatsby build` and can be [explored](/docs/running-queries-with-graphiql/) at `http://localhost:8000/___graphql` when a Gatsby site successfully compiles.

## Sourcing Data

Data needs to be [sourced](/docs/content-and-data/) — or added to the GraphQL schema — to be queried and pulled into pages using GraphQL. Gatsby uses [source plugins](/plugins/?=gatsby-source) to pull in, or source, data.

**Note**: GraphQL isn't necessary, you can still [use Gatsby without GraphQL](/docs/using-gatsby-without-graphql/)

Sourcing data with an existing plugin requires installing necessary packages and adding the plugin to the plugins array in the `gatsby-config` with any necessary configurations. To [source data from the filesystem](/docs/sourcing-from-the-filesystem/):

```shell
npm install --save gatsby-source-filesystem
```

```js:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `Your Site Name`,
  },
  plugins: [
    // highlight-start
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src/`,
      },
    },
    // highlight-end
  ],
}
```

You can also [create custom plugins](/docs/creating-plugins/) to fit your own use cases and pull in data however you want.

## Querying for Data

Data can be queried inside pages, components, or the `gatsby-node.js` file, using one of these options:

- `pageQuery`
- `StaticQuery`
- `useStaticQuery`

### `pageQuery`

You can have one page query per page. A page query can take GraphQL arguments for variables in your queries. A [page is made in Gatsby](/docs/page-creation/) by any React component in the `src/pages` folder, or by calling the `createPage` action and using a component in the `createPage` options -- meaning a `pageQuery` won't work in any component, only components that meet this criteria.

Also, refer to the [guide on querying data in pages with page query](/docs/page-query/).

#### Params

A page query isn't a method, but is assigned a `graphql` string with a valid query inside it as an exported constant:

```javascript
export const pageQuery = graphql`
  query HomePageQuery {
    site {
      siteMetadata {
        description
      }
    }
  }
`
```

**Note**: the `const` that gets exported doesn't need to be called `pageQuery`, it can have anything, Gatsby just looks for an exported `graphql` string from the file.

#### Returns

A page query returns a data object passed into the props of the page component of the file the query is in.

```javascript
// highlight-start
const HomePage = ({ data }) => {
  // highlight-end
  return (
    <div>
      Hello!
      {data.site.siteMetadata.description} // highlight-line
    </div>
  )
}
```

### `StaticQuery`

Gatsby provides a `StaticQuery` component that can be used in any component to get data from GraphQL. It cannot take variables as arguments.

Also, refer to the [guide on querying data in components with static query](/docs/static-query/).

#### Params

The `StaticQuery` component takes two values as props:

- query: a `graphql` query string
- render: a component with access to the data returned

```jsx
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
```

#### Returns

StaticQuery returns data in a render prop:

```jsx
<StaticQuery
  // ...
  // highlight-start
  render={data => (
    <header>
      <h1>{data.site.siteMetadata.title}</h1>
    </header>
  )}
  // highlight-end
/>
```

### `useStaticQuery`

The `useStaticQuery` hook can be used similar to `StaticQuery` in any component or page, but doesn't require the use of a component and render prop.

Because it is a React hook, the [rules of hooks](https://reactjs.org/docs/hooks-rules.html) apply and you'll need to be using React and ReactDOM version 16.8.0 or later. Because of how queries currently work in Gatsby, only one instance of `useStaticQuery` is supported in each file.

Also, refer to the [guide on querying data in components with useStaticQuery](/docs/use-static-query/).

#### Params

The `useStaticQuery` hook takes one argument:

- query: a `graphql` query string

```jsx
const data = useStaticQuery(graphql`
  query HeaderQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`)
```

#### Returns

The `useStaticQuery` hook returns data in an object:

```jsx
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
  // highlight-start
  <header>
    <h1>{data.site.siteMetadata.title}</h1>
  </header>
  // highlight-end
)
```

## GraphQL Fragments

Fragments allow you to reuse parts of GraphQL queries. It also allows you to split up complex queries into smaller, easier to understand components.

The reference guides have a doc on [using fragments in Gatsby](/docs/using-fragments/).

### List of Gatsby fragments

Some fragments come included in Gatsby plugins, like fragments for returning data relevant to optimized images in various formats.

#### Image Sharp fragments

The following fragments are available in any site with `gatsby-transformer-sharp` installed and included in your `gatsby-config.js`.

Information on querying with these fragments is also listed in the [Gatsby Image API](/docs/gatsby-image/), including options like resizing and recoloring.

<GraphqlApiQuery>
  {data => (
    <APIReference
      relativeFilePath={data.transformerSharp.nodes[0].relativePath}
      docs={data.transformerSharp.nodes[0].childrenDocumentationJs}
    />
  )}
</GraphqlApiQuery>

#### Contentful fragments

The following fragments are available in any site with `gatsby-source-contentful` installed and included in your `gatsby-config.js`. These fragments generally mirror the fragments outlined in the `gatsby-transformer-sharp` package.

<GraphqlApiQuery>
  {data => (
    <APIReference
      relativeFilePath={data.contentfulFragments.nodes[0].relativePath}
      docs={data.contentfulFragments.nodes[0].childrenDocumentationJs}
    />
  )}
</GraphqlApiQuery>

_**Note**: the above fragments are from officially maintained Gatsby starters, other plugins like `gatsby-source-datocms` and `gatsby-source-sanity` ship with fragments of their own, a list of those fragments can be found in the [`gatsby-image` README](/packages/gatsby-image#fragments)._

## Advanced Customizations

Configuring data that has been sourced in the GraphQL layer, or pulling in data and creating relationships between nodes yourself is possible with [Gatsby Node APIs](/docs/node-apis/).

The GraphQL schema can be customized for more advanced use cases, you can read more about it in the [schema customization API](/docs/schema-customization/).
