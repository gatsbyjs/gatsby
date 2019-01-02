# gatsby-source-contentful

Source plugin for pulling content types, entries, and assets into Gatsby from
Contentful spaces. It creates links between entry types and asset so they can be
queried in Gatsby using GraphQL.

An example site for using this plugin is at
https://using-contentful.gatsbyjs.org/

## Install

`npm install --save gatsby-source-contentful`

## How to use

First, you need a way to pass environment variables to the build process, so secrets and other secured data aren't committed to source control. We recommend using [`dotenv`][dotenv] which will then expose environment variables. [Read more about dotenv and using environment variables here][envvars]. Then we can _use_ these environment variables and configure our plugin.

### Using Delivery API

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: `your_space_id`,
        // Learn about environment variables: https://gatsby.app/env-vars
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
      },
    },
  ],
}
```

### Using Preview API

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: `your_space_id`,
        // Learn about environment variables: https://gatsby.app/env-vars
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
        host: `preview.contentful.com`,
      },
    },
  ],
}
```

### Offline

If you don't have internet connection you can add `export GATSBY_CONTENTFUL_OFFLINE=true` to tell the plugin to fallback to the cached data, if there is any.

### Configuration options

**`spaceId`** [string][required]

Contentful spaceId

**`accessToken`** [string][required]

Contentful delivery api key, when using the Preview API use your Preview API key

**`host`** [string][optional] [default: `'cdn.contentful.com'`]

The base host for all the API requests, by default it's 'cdn.contentful.com', if you want to use the Preview API set it to `'preview.contentful.com'`. You can use your own host for debugging/testing purposes as long as you respect the same Contentful JSON structure.

**`environment`** [string][optional] [default: 'master']

The environment to pull the content from, for more info on environments check out this [Guide](https://www.contentful.com/developers/docs/concepts/multiple-environments/).

You can pass in any other options available in the [contentful.js SDK](https://github.com/contentful/contentful.js#configuration).

## Notes on Contentful Content Models

There are currently some things to keep in mind when building your content models at Contentful.

1.  At the moment, fields that do not have at least one populated instance will not be created in the GraphQL schema.

2.  When using reference fields, be aware that this source plugin will automatically create the reverse reference. You do not need to create references on both content types. For simplicity, it is easier to put the reference field on the child in child/parent relationships.

## How to query for nodes

Two standard node types are available from Contentful: `Asset` and `ContentType`.

`Asset` nodes will be created in your site's GraphQL schema under `contentfulAsset` and `allContentfulAsset`.

`ContentType` nodes are a little different - their exact name depends on what you called them in your Contentful data models. The nodes will be created in your site's GraphQL schema under `contentful${entryTypeName}` and `allContentful${entryTypeName}`.

In all cases querying for nodes like `contentfulX` will return a single node, and nodes like `allContentfulX` will return all nodes of that type.

### Query for all nodes

You might query for **all** of a type of node:

```graphql
{
  allContentfulAsset {
    edges {
      node {
        id
        file {
          url
        }
      }
    }
  }
}
```

You might do this in your `gatsby-node.js` using Gatsby's [`createPages`](https://next.gatsbyjs.org/docs/node-apis/#createPages) Node API.

### Query for a single node

To query for a single `image` asset with the title 'foo' and a width of 1600px:

```
export const assetQuery = graphql`
  {
    contentfulAsset(filter: { title: { eq: 'foo' } }) {
      image {
        resolutions(width: 1600) {
          width
          height
          src
          srcSet
        }
      }
    }
  }
`
```

To query for a single `CaseStudy` node with the short text properties `title` and `subtitle`:

```graphql
  {
    contentfulCaseStudy(filter: { title: { eq: 'bar' } })  {
      title
      subtitle
    }
  }
```

> Note the use of [GraphQL arguments](https://graphql.org/learn/queries/#arguments) on the `contentfulAsset` and `resolutions` fields. See [Gatsby's GraphQL reference docs for more info](https://www.gatsbyjs.org/docs/graphql-reference/).

You might query for a **single** node inside a component in your `src/components` folder, using [Gatsby's `StaticQuery` component](https://www.gatsbyjs.org/docs/static-query/).

#### A note about LongText fields

If you include fields with a `LongText` type in your Contentful `ContentType`, their returned value will be **an object not a string**. This is because Contentful LongText fields are Markdown by default. In order to handle the Markdown content properly, this field type is created as a child node so Gatsby can transform it to HTML.

`ShortText` type fields will be returned as strings.

Querying a **single** `CaseStudy` node with the ShortText properties `title` and `subtitle` and LongText property `body` requires formatting the LongText fields as an object with the _child node containing the exact same field name as the parent_:

```graphql
{
  contentfulCaseStudy {
    title
    subtitle
    body {
      body
    }
  }
}
```

### Query for Assets in ContentType nodes

More typically your `Asset` nodes will be mixed inside of your `ContentType` nodes, so you'll query them together. All the same formatting rules for `Asset` and `ContentType` nodes apply.

To get **all** the `CaseStudy` nodes with ShortText fields `id`, `slug`, `title`, `subtitle`, LongText field `body` and heroImage `Asset` field, we use `allContentful${entryTypeName}` to return all instances of that `ContentType`:

```graphql
{
  allContentfulCaseStudy {
    edges {
      node {
        id
        slug
        title
        subtitle
        body {
          body
        }
        heroImage {
          resolutions(width: 1600) {
            width
            height
            src
            srcSet
          }
        }
      }
    }
  }
}
```

## More on Queries with Contentful and Gatsby

It is strongly recommended that you take a look at how data flows in a real Contentful and Gatsby application to fully understand how the queries, Node.js functions and React components all come together. Check out the example site at
[using-contentful.gatsbyjs.org](https://using-contentful.gatsbyjs.org/).

## **Beta** [Contentful Rich Text](https://www.contentful.com/developers/docs/concepts/rich-text/)

Rich text feature is supported in this source plugin, if you want to serialize the field content to html you can add the plugin `@contentful/gatsby-transformer-contentful-richtext`.

After adding the transformer plugin you can use the following query to get the html output:

```
{
  allContentfulBlogPost {
    bodyRichText {
      childContentfulRichText {
        html
      }
    }
  }
}
```

[dotenv]: https://github.com/motdotla/dotenv
[envvars]: https://gatsby.app/env-vars
