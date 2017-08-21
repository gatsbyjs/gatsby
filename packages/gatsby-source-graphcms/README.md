# gatsby-source-graphql

Source plugin for pulling data into [Gatsby](https://github.com/gatsbyjs) from a GraphQL endpoint.

## How to use
*In your gatsby config...*
```javascript
plugins: [
  /*
   * Gatsby's data processing layer begins with “source”
   * plugins. Here the site sources its data from a graphql endpoint
   */
  {
    resolve: `gatsby-source-graphql`,
    options: {
      endpoint: `graphql_endpoint`,
      token: `graphql_token`,
    },
  }
],
```
I suggest either using a `.env` file or setting environment variables to access ala `process.env.GATSBY_GRAPHQL_ENDPOINT`, `process.env.GATSBY_GRAPHQL_TOKEN` so theres no endpoint and token on git ;)

## Plugin options
|              |                                                          |
|-------------:|:---------------------------------------------------------|
| **endpoint** | indicates the endpoint to use for the graphql connection |
| **token**    | The API access token.                                    |

## How to query : GraphQL

Let's say you have a GraphQL type called `Post`. You would query it like so:

```graphql
{
  allPosts {
    edges {
      node {
        # fields
        id
        title
        body
        createdAt
      }
    }
  }
}
```
