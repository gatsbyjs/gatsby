# gatsby-transformer-documentationjs

Uses [Documentation.js](https://documentation.js.org) to extract
code metadata (JSDocs is supported currently though Flow is also supported
by Documentation.js and can be added to this plugin as well).

It's used on gatsbyjs.org and can be seen in use on several pages
there e.g. https://www.gatsbyjs.org/docs/node-apis/

## Install

`npm install --save gatsby-transformer-documentationjs`

## How to use

Add the plugin to your `gatsby-config.js`.

```javascript
plugins: [
  `gatsby-transformer-documentationjs`,
]
```

Ensure that there's an instance of `gatsby-source-filesystem` that's
pointed at your source code e.g.

```javascript
plugins: [
  `gatsby-transformer-documentationjs`,
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `source`,
      path: `${__dirname}/../src/`,
    },
  },
]
```

Then you can write GraphQL queries pulling out JSDoc comments like:

```graphql
{
  allDocumentationJs {
    edges {
      node {
        name
        description {
          childMarkdownRemark {
            html
          }
        }
        returns {
          title
        }
        examples {
          raw
          highlighted
        }
        params {
          name
          type {
            name
          }
          description {
            childMarkdownRemark {
              html
            }
          }
        }
      }
    }
  }
}
```
