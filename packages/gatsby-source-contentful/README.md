# gatsby-source-contentful

Source plugin for pulling content types, entries, and assets into Gatsby from
Contentful spaces. It creates links between entry types and asset so they can be
queried in Gatsby using GraphQL.

An example site for using this plugin is at
https://using-contentful.gatsbyjs.org/

## Install

`npm install --save gatsby-source-contentful`

## How to use with Contentful's Delivery API

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-contentful`,
    options: {
      spaceId: `your_space_id`,
      accessToken: `your_access_token`,
    },
  },
]
```

## How to use with Contentful's Preview API

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-contentful`,
    options: {
      spaceId: `your_space_id`,
      accessToken: `your_access_token`,
      host: `preview.contentful.com`,
    },
  },
]
```

## Offline

If you don't have internet connection you can add `export GATSBY_CONTENTFUL_OFFLINE=true` to tell the plugin to fallback to the cached data, if there is any.

## Configuration options

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

1.  At the moment, fields that do not have at least 1 populated instance will not be created in the graphql schema.

2.  When using reference fields, be aware that this source plugin will automatically create the reverse reference. You do not need to create references on both content types. For simplicity, it is easier to put the reference field on the child in child/parent relationships.

## How to query Asset nodes

Two standard nodes are available from Contentful: `Asset` and `ContentType`. 

`Asset` nodes will be created in your site's GraphQL schema under `contentfulAsset` and `allContentfulAsset`, where `contentfulAsset` returns a single instance of the `Asset` and `allContentfulAsset` returns all instances of the `Asset`. 

#### Query for all Asset nodes

Querying for **all** `Asset` nodes typically takes place in `gatsby-node.js` using Gatsby's [`createPages`](https://next.gatsbyjs.org/docs/node-apis/#createPages) Node API:

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

#### Query for one Asset node

Querying for a **single** `Asset` node typically takes place in the same JS file as a custom component in the `src/components` folder. By including the query inside of a name component, you give the query context automatically. For querying a single `image` asset with a width of 1600px (note the use of [GraphQL arguments](https://graphql.org/learn/queries/#arguments) on the `resolutions` object):

```
export const assetQuery = graphql`
  query myAssetQuery {
    contentfulAsset {
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

## How to query ContentType nodes

Querying `ContentType` nodes depends on what you called them in your Contentful data models. The nodes will be created in your site's GraphQL schema under `contentful${entryTypeName}` and `allContentful${entryTypeName}`, where `contentful${entryTypeName}` returns a single instance of the `ContentType` and `allContentful${entryTypeName}` returns all instances of that `ContentType`. 

#### Query for all ContentType nodes

Similar to `Asset` nodes, querying for **all** `ContentType` nodes typically takes place in `gatsby-node.js` using Gatsby's [`createPages`](https://next.gatsbyjs.org/docs/node-apis/#createPages) Node API. If we named our `ContentType` as `Product`, and included the text field `productName`:


```graphql
{
  allContentfulProduct {
    edges {
      node {
        productName
      }
    }
  }
}
```

#### Query for one ContentType node

Querying for a **single** `ContentType` node also typically takes place in the same JS file as a custom component in the `src/components` folder. By including the query inside of a named component, you give the query context automatically. For querying a single `CaseStudy` node with the short text properties `title` and `subtitle`, we construct a simple query:

```
export const pageQuery = graphql`
  query caseStudyQuery {
    contentfulCaseStudy {
      title
      subtitle
    }
  }
`
```

Note that if you include long text fields in your Contentful `ContentType`, they are **queried as objects not strings**. This is because Contentful long text fields are markdown by default. To be able to easily compile markdown properly, this field type is created as a child node so Gatsby can compile it to HTML. 

Querying a **single** `CaseStudy` node with the short text properties `title` and `subtitle` and long text property `body` requires formating the long-text fields as an object with the *child node containing the exact same field name as the parent*:

```
export const pageQuery = graphql`
  query caseStudyQuery {
    contentfulCaseStudy {
      title
      subtitle
      body {
        body
      }
    }
  }
`
```

## How to query Assets in ContentType nodes

More typically, your `Asset` nodes will be mixed inside of your `ContentType` nodes, so you'll query them together. All the same formatting rules for `Asset` and `ContentType` nodes apply. 

Querying for all `ContentType` + `Asset` nodes will typically take place in `gatsby-node.js` using Gatsby's [`createPages`](https://next.gatsbyjs.org/docs/node-apis/#createPages) Node API. 

To get **all** the `CaseStudy` nodes with short-text fields `id`, `slug`, `title`, `subtitle`, long-text field `body` and image `Asset` field, we use `allContentful${entryTypeName}` to return all instances of that `ContentType`:

```
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

Querying for a **single** `ContentType` + `Asset` node will take place in the same JS file as a custom component in the `src/components` folder. By including the query inside of a named component, you give the query context automatically. 

For querying a single `CaseStudy` node with short-text fields `id`, `slug`, `title`, `subtitle`, long-text field `body` and image `Asset` field, we use `contentful${entryTypeName}` to return a single instance of that `ContentType`: 

```
export const pageQuery = graphql`
  query caseStudyQuery {
    contentfulCaseStudy {
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
`
```


## More on Queries with Contentful + Gatsby

It is strongly recommended that you take a look at how real data flows in a real Contentful + Gatsby application to fully understand how the queries, Node.js functions and React components all come together:
[https://using-contentful.gatsbyjs.org/](https://using-contentful.gatsbyjs.org/)

