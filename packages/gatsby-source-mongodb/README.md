# gatsby-source-mongodb

Source plugin for pulling data into [Gatsby](https://github.com/gatsbyjs) from mongoDB collections.

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  /*
   * Gatsby's data processing layer begins with “source”
   * plugins. Here the site sources its data from mongoDB collection documents.
   */
  {
    resolve: `gatsby-source-mongodb`,
    options: { dbName: `local`, collection: `documents` },
  }
]
```
## How to query

This plugin will pull all documents from all collections on the MongoDB server.

Each collection will be created as a different "node" type. For example
if your db had a collection named "Websites" with documents with url & name fields. You could query it like the following. 

```graphql
query PageQuery {
  allMongoDbWebsites {
    edges {
      node {
         id
         url
         name
      }
    }
  }
}
```
