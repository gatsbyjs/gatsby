---
title: GraphQL API
tableOfContentsDepth: 2
---

A great advantage of Gatsby is a built-in data layer that combines all data sources you configure. Data is collected at [build time](/docs/glossary#build) and automatically assembled into a [schema](/docs/glossary#schema) that defines how data can be queried throughout your site.

This doc serves as a reference for GraphQL features built into Gatsby, including methods for querying and sourcing data, and customizing GraphQL for your site's needs.

## Getting started with GraphQL

GraphQL is available in Gatsby without a special install: a schema is automatically inferred and created when you run `gatsby develop` or `gatsby build`. When the site compiles, the data layer can be [explored](/docs/how-to/querying-data/running-queries-with-graphiql/) at: `http://localhost:8000/___graphql`

## Sourcing data

Data needs to be [sourced](/docs/content-and-data/) — or added to the GraphQL schema — to be queried and pulled into pages using GraphQL. Gatsby uses [source plugins](/plugins/?=gatsby-source) to pull in data.

**Please note**: GraphQL isn't required, you can still [use Gatsby without GraphQL](/docs/how-to/querying-data/using-gatsby-without-graphql/).

To source data with an existing plugin you have to install all needed packages. Furthermore you have to add the plugin to the plugins array in the `gatsby-config` with any optional configurations. If you want to source data from the filesystem for use with GraphQL, such as Markdown files, images, and more, refer to the [filesystem data sourcing docs](/docs/how-to/sourcing-data/sourcing-from-the-filesystem).

For instructions on installing plugins from npm, take a look at the instructions in the docs on [using a plugin](/docs/how-to/plugins-and-themes/using-a-plugin-in-your-site/).

You can also [create custom plugins](/docs/creating-plugins/) to fit your own use cases and pull in data however you want.

## Query components and hooks

Data can be queried inside pages, components, or the `gatsby-node.js` file, using one of these options:

- The `pageQuery` component
- The `useStaticQuery` hook

**Note**: Because of how Gatsby processes GraphQL queries, you can't mix page queries and static queries in the same file. You also can't have multiple page queries or static queries in one file.

For information on page and non-page components as they relate to queries, check out the docs guide on [building with components](/docs/conceptual/building-with-components/#how-does-gatsby-use-react-components)

### `pageQuery`

`pageQuery` is a built-in component that retrieves information from the data layer in Gatsby pages. You can have one page query per page. It can take GraphQL arguments for variables in your queries.

A [page is made in Gatsby](/docs/page-creation/) by any React component in the `src/pages` folder, or by calling the `createPage` action and using a component in the `createPage` options -- meaning a `pageQuery` won't work in any component, only in components which meet this criteria.

Also, refer to the [guide on querying data in pages with page query](/docs/how-to/querying-data/page-query/).

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

```jsx
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

### `useStaticQuery`

The `useStaticQuery` hook can be used in any component or page.

Because it is a React hook, the [rules of hooks](https://reactjs.org/docs/hooks-rules.html) apply. Because of how queries currently work in Gatsby, only one instance of `useStaticQuery` is supported in each file.

Also, refer to the [guide on querying data in components with useStaticQuery](/docs/how-to/querying-data/use-static-query/).

#### Params

The `useStaticQuery` hook takes one argument:

- `query`: a `graphql` query string

```javascript
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

For understanding the parts of a query refer to the [conceptual guide](/docs/conceptual/graphql-concepts/#understanding-the-parts-of-a-query).

### GraphQL query arguments

GraphQL queries can take arguments to alter how the data is returned. The logic for these arguments is handled internally by Gatsby. Arguments can be passed into fields at any level of the query.

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

### GraphQL query operations

Other built-in configurations can be used in queries

- [`Alias`](/docs/graphql-reference#alias)
- [`Group`](/docs/graphql-reference#group)

For examples, refer to the [GraphQL query options reference guide](/docs/graphql-reference/).

## Query fragments

Fragments allow you to reuse parts of GraphQL queries. They also allow you to split up complex queries into smaller, easier to understand components.

For more information, check out the docs guide on [using fragments in Gatsby](/docs/reference/graphql-data-layer/using-graphql-fragments/).

### Gatsby fragments

Some fragments come included in Gatsby plugins, such as fragments for returning optimized image data in various formats with `gatsby-image` and `gatsby-transformer-sharp`, or data fragments with `gatsby-source-contentful`. For more information on what plugins include fragments, see the [`gatsby-image` README](/plugins/gatsby-image#fragments).

## Advanced customizations

You can customize sourced data in the GraphQL layer and create relationships between nodes with the [Gatsby Node APIs](/docs/reference/config-files/gatsby-node/).

The GraphQL schema can be customized for more advanced use cases: read more about it in the [schema customization API docs](/docs/reference/graphql-data-layer/schema-customization/).
