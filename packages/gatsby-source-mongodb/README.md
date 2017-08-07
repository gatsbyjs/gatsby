# gatsby-source-mongodb

Source plugin for pulling data into [Gatsby](https://github.com/gatsbyjs) from mongoDB collections.

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

## Plugin options

dbName: indicates the database name that you want to use
collection: the collection name within mongodb
server: contains the server info, with sub properties address and port
        ex. server: { address: `ds143532.mlab.com`, port: 43532 },

auth: the authentication data to login a mongodb collection, with sub properties user and password.
      ex. auth: { user: `admin`, password: `12345` } 

### experimental

map: with this option you can map a field to a content type, it is an array
     ex. map: {description: `text\x-markdown`}


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