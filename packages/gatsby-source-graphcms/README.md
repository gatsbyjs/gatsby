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
      slug
      picture { 
        id
        url
        height
        width
      }
      records {
        id
        title
      }
    }
}
```

## Current limitations

### Embedded fields aren't found by GraphQL
 
```
Example:

query getAllArtists {
  allArtists {
    name
    id
    records {
      id
      title
      tracks {
        id
        title
        length
      }
    }
  }
}
```
This query fed into the graphcms source plugin produces artists. name, id, records, id, and titles - but no "tracks", or the subfields within. They exist in the redux store json, but graphql can't seem to identify them. More investigation is needed.
 
### Fields which have sub selections do not work
    
This one pertains to the introspection metaquery method.
    
Example:
```
    Artist {
      picture {
        url
    ...
```

The metaQuery currently used is not capable of finding url from the above query, which will cause the query that fetches all data to fail. It will have to be modified. It looks like it will be a bit more difficult to find that url and add it to the query, as it might require making a __type query for each field of a Type that has subfields and then modifying the final query before firing it.
    
Errors can be seen here: https://github.com/Redmega/example_05_static_site_generation_with_gatsby
        
# TODOs

1. Implement support for relationships/embedded fields
1. Implement mapping feature for transformation plugins, like the MongoDB plugin
