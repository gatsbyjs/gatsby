# gatsby-source-graphcms

Source plugin for pulling data into [Gatsby](https://github.com/gatsbyjs) from a [GraphCMS](https://graphcms.com) endpoint.

You can find an example in the Gatsby codebase in 'examples/using-graphcms'.

## Install

`npm install --save gatsby-source-graphcms`

## How to use
*In your gatsby config...*
```javascript
plugins: [
  /*
   * Gatsby's data processing layer begins with “source”
   * plugins. Here the site sources its data from the GraphCMS endpoint
   */
  {
    resolve: `gatsby-source-graphcms`,
    options: {
      endpoint: `graphql_endpoint`,
      token: `graphql_token`,
      query: `{
          allArtists {
            id
            name
          }
      }`,
    },
  }
],
```
Use a `.env` file or set environment variables directly to access the GraphCMS endpoint and token. This avoids committing potentially sensitive data.

## Plugin options
|              |                                                          |
|-------------:|:---------------------------------------------------------|
| **endpoint** | indicates the endpoint to use for the graphql connection |
| **token**    | The API access token. Optional if the endpoint is public |
| **query**    | The GraphQL query to execute against the endpoint        |

## How to query : GraphQL

Let's say you have a GraphQL type called `Post`. You would query it like so:

```graphql
{
  allArtists {
    id
    name
  }
}
```
