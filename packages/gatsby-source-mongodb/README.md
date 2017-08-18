# gatsby-source-mongodb

Source plugin for pulling data into [Gatsby](https://github.com/gatsbyjs) from MongoDB collections.

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
  ],
```

## Plugin options

* **dbName**: indicates the database name that you want to use
* **collection**: the collection name within Mongodb
* **server**: contains the server info, with sub properties address and port
        ex. server: { address: `ds143532.mlab.com`, port: 43532 },
* **auth**: the authentication data to login a Mongodb collection, with sub properties user and password.
      ex. auth: { user: `admin`, password: `12345` } 

### Advanced feature

In gatsby you have transformers, that transforms your data for example markdown into html.
Let's say we have a markdown field in our mongoDB collection. Would it not be wonderfull to use these plugins to render out our content properly.

Well in the gatsby-config.js file you can add the option **map**. 
With as a key the fieldname and as a value the mediatype of that field, in our case here `text\x-markdown`.

Gatsby will create child nodes for you that will do the magic.

The graphql query would look something like this.

```graphql
query ItemQuery($id: String!) {
    mongodbCloudDocuments(id: { eq: $id }) {
      id
      name
      url
      children {
          ... on mongodbCloudDocumentsDescriptionMappingNode {
            id
            children {
              ... on MarkdownRemark {
                id
                html
              }
            }
          }
      }
    }
  }
```    

## How to query : GraphQL

Find below a global pageQuery to query all MongoDB document nodes of our db named **'Cloud'** and our collection named **'documents'**. 

## How to query : GraphQL

Find below a global pageQuery to query all MongoDB document nodes. 

All the documents in Mongodb of a certain collection will be pulled into Gatsby.

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
