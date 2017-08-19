# gatsby-source-mongodb

Source plugin for pulling data into Gatsby from MongoDB collections.

## How to use
```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    /*
     * Gatsby's data processing layer begins with “source” plugins. Here we
     * setup the site to pull data from the "documents" collection in a local
     * MongoDB instance
     */
    {
      resolve: `gatsby-source-mongodb`,
      options: { dbName: `local`, collection: `documents` },
    }
  ],
}
```

## Plugin options

* **dbName**: indicates the database name that you want to use
* **collection**: the collection name within Mongodb
* **server**: contains the server info, with sub properties address and port
        ex. server: { address: `ds143532.mlab.com`, port: 43532 }. Defaults to a server running locally on the default port.
* **auth**: the authentication data to login a Mongodb collection, with sub properties user and password.
      ex. auth: { user: `admin`, password: `12345` } 

### Mapping mediatype feature

Gatsby supports transformer plugins that know how to transform one data type to another e.g. markdown to html. In the plugin options you can setup
"mappings" for fields in your collections. You can tell Gatsby that a certain field is a given media type and with the correct transformer plugins installed, your data will be transformed automatically.

Let's say we have a markdown field named `body` in our mongoDB collection. We want to author our content in markdown but want to transform the markdown to HTML for including in our React components.

To do this, we modify the plugin configuration in `gatsby-config.js` like follows:

```javascript{8-10}
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-mongodb`,
      options: {
        dbName: `local`,
        collection: `documents`
        map: {
          body: `text/x-markdown`,
        },
      },
    }
  ],
}
```

The GraphQL query to get the transformed markdown would look something like this.

```graphql
query ItemQuery($id: String!) {
    mongodbCloudDocuments(id: { eq: $id }) {
      id
      name
      url
      body {
          childMarkdownRemark {
              id
              html
          }
      }
    }
  }
```    

## How to query your MongoDB data using GraphQL

Below is a sample query for fetching all MongoDB document nodes from a db named **'Cloud'** and a collection named **'documents'**. 

```graphql
query PageQuery {
    allMongodbCloudDocuments {
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
