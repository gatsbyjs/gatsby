---
title: GraphQL API
tableOfContentsDepth: 2
---

import { GraphqlApiQuery } from "../../www/src/components/api-reference/doc-static-queries"
import APIReference from "../../www/src/components/api-reference"

A great advantage of Gatsby is a built-in data layer that combines any and all data sources you configure. Data is collected at [build time](/docs/glossary#build) and automatically assembled into a [schema](/docs/glossary#schema) that defines how data can be queried throughout your site.

This doc serves as a reference for GraphQL features built into Gatsby, including methods for querying and sourcing data, and customizing GraphQL for your site's needs.

## Getting Started with GraphQL

GraphQL is available in Gatsby without a special install: a schema is automatically inferred and created when you run `gatsby develop` or `gatsby build`. When the site compiles, the data layer can be [explored](/docs/running-queries-with-graphiql/) at: `http://localhost:8000/___graphql`

## Sourcing Data

Data needs to be [sourced](/docs/content-and-data/) — or added to the GraphQL schema — to be queried and pulled into pages using GraphQL. Gatsby uses [source plugins](/plugins/?=gatsby-source) to pull in data.

**Note**: GraphQL isn't required: you can still [use Gatsby without GraphQL](/docs/using-gatsby-without-graphql/).

Sourcing data with an existing plugin requires installing necessary packages and adding the plugin to the plugins array in the `gatsby-config` with any optional configurations. To source data from the filesystem for use with GraphQL, such as Markdown files, images, and more, refer to the [filesystem data sourcing docs](/docs/sourcing-from-the-filesystem/) and [recipes](/docs/recipes/#5-sourcing-data).

For instructions on installing plugins from npm, refer to the instructions in the docs on [using a plugin](/docs/using-a-plugin-in-your-site/).

You can also [create custom plugins](/docs/creating-plugins/) to fit your own use cases and pull in data however you want.

## Query components and hooks

Data can be queried inside pages, components, or the `gatsby-node.js` file, using one of these options:

- The `pageQuery` component
- The `StaticQuery` component
- The `useStaticQuery` hook

**Note**: Because of how Gatsby processes GraphQL queries, you can't mix page queries and static queries in the same file. You also can't have multiple page queries or static queries in one file.

For information on page and non-page components as they relate to queries, check out the docs guide on [building with components](/docs/building-with-components/#how-does-gatsby-use-react-components)

### `pageQuery`

`pageQuery` is a built-in component that retrieves information from the data layer in Gatsby pages. You can have one page query per page. It can take GraphQL arguments for variables in your queries.

A [page is made in Gatsby](/docs/page-creation/) by any React component in the `src/pages` folder, or by calling the `createPage` action and using a component in the `createPage` options -- meaning a `pageQuery` won't work in any component, only components that meet this criteria.

Also, refer to the [guide on querying data in pages with page query](/docs/page-query/).

#### Params

A page query isn't a method, but rather an exported variable that's assigned a `graphql` string and a valid query block as its value:

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

**Note**: the query exported in a `const` doesn't need to be named `pageQuery`. More importantly, Gatsby looks for an exported `graphql` string from the file.

#### Returns

When included in a page component file, a page query returns a data object that is passed automatically to the component as a prop.

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

StaticQuery is a built-in component for retrieving data from Gatsby’s data layer in non-page components, such as a header, navigation, or any other child component.

You can only have one `StaticQuery` per page: in order to include the data you need from multiple sources, you can use one query with multiple [root fields](/docs/graphql-concepts/#query-fields). It cannot take variables as arguments.

Also, refer to the [guide on querying data in components with static query](/docs/static-query/).

#### Params

The `StaticQuery` component takes two values as props in JSX:

- `query`: a `graphql` query string
- `render`: a component with access to the data returned

```jsx
<StaticQuery
  query={graphql` //highlight-line
    query HeadingQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `}
  render={(
    data //highlight-line
  ) => (
    <header>
      <h1>{data.site.siteMetadata.title}</h1>
    </header>
  )}
/>
```

#### Returns

The StaticQuery component returns `data` in a `render` prop:

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

Because it is a React hook, the [rules of hooks](https://reactjs.org/docs/hooks-rules.html) apply and you'll need to use it with React and ReactDOM version 16.8.0 or later. Because of how queries currently work in Gatsby, only one instance of `useStaticQuery` is supported in each file.

Also, refer to the [guide on querying data in components with useStaticQuery](/docs/use-static-query/).

#### Params

The `useStaticQuery` hook takes one argument:

- `query`: a `graphql` query string

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

## Query structure

Queries are written in the same shape you want data returned in. How you source data will determine the names of fields that you can query on, based on the nodes they add to the GraphQL schema.

For understanding the parts of a query refer to the [conceptual guide](/docs/graphql-concepts/#understanding-the-parts-of-a-query).

### GraphQL query arguments

GraphQL queries can take arguments to alter how the data is returned. The logic for these arguments is handled internally by Gatsby. Arguments can be passed in to fields at any level of the query.

Different nodes can take different arguments based off of the nature of the node.

The arguments you can pass to collections (like arrays or long lists of data - ex. `allFile`, or `allMdx`) are:

- [`filter`](/docs/graphql-reference#filter)
- [`limit`](/docs/graphql-reference#limit)
- [`sort`](/docs/graphql-reference#sort)
- [`skip`](/docs/graphql-reference#skip)

The arguments you can pass to a `date` field are:

- [`formatString`](/docs/graphql-reference#dates)
- [`locale`](/docs/graphql-reference#dates)

The arguments you can pass to an `excerpt` field are:

- [`pruneLength`](/docs/graphql-reference#excerpt)
- [`truncate`](/docs/graphql-reference#excerpt)

### Graphql query operations

Other built-in configurations can be used in queries

- [`Alias`](/docs/graphql-reference#alias)
- [`Group`](/docs/graphql-reference#group)

For examples, refer to the [Query recipes](/docs/recipes/#6-querying-data) and [GraphQL Query Options Reference Guide](/docs/graphql-reference/).

## Query fragments

Fragments allow you to reuse parts of GraphQL queries. They also allow you to split up complex queries into smaller, easier to understand components.

For more information, check out the docs guide on [using fragments in Gatsby](/docs/using-fragments/).

### List of Gatsby fragments

Some fragments come included in Gatsby plugins, such as fragments for returning optimized image data in various formats with `gatsby-image` and `gatsby-transformer-sharp`, or data fragments with `gatsby-source-contentful`.

#### Image Sharp fragments

The following fragments are available in any site with `gatsby-transformer-sharp` installed and included in your `gatsby-config.js`.

Information on querying with these fragments is also listed in-depth in the [Gatsby Image API docs](/docs/gatsby-image/), including options like resizing and recoloring.

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

_**Note**: the above fragments are from officially maintained Gatsby starters; other plugins like `gatsby-source-datocms` and `gatsby-source-sanity` ship with fragments of their own. A list of those fragments can be found in the [`gatsby-image` README](/packages/gatsby-image#fragments)._

## Advanced Customizations

It's possible to customize sourced data in the GraphQL layer and create relationships between nodes with the [Gatsby Node APIs](/docs/node-apis/).

The GraphQL schema can be customized for more advanced use cases: read more about it in the [schema customization API docs](/docs/schema-customization/).
