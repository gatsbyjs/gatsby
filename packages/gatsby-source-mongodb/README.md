# gatsby-source-mongodb

Source plugin for pulling data into [Gatsby](https://github.com/gatsbyjs) from Wordpress sites using the [Wordpress JSON REST API](https://developer.wordpress.org/rest-api/reference/).

## how to use
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
  ],
```
## How to query : GraphQL

Find below a global pageQuery to query all mongoDB document nodes. 
All the documents in mongodb of a certain collection will be pulled into gatsby.

```    graphql
query PageQuery {
    allMongoDbDocField {
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