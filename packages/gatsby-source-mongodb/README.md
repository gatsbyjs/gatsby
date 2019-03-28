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
    },
  ],
}
```

### multiple collections

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-mongodb`,
      options: { dbName: `local`, collection: [`documents`, `vehicles`] },
    },
  ],
}
```

## Plugin options

- **connectionString**: if you need to use a connection string compatable with later versions of MongoDB, or for connections to MongoDB Atlas, you can enter the entire string, minus the `dbName` and `extraParams.` Use the In this case, the authentication information should already be embedded in the string ex. `mongodb+srv://<USERNAME>:<PASSWORD>@<SERVERNANE>-fsokc.mongodb.net`. Pass `dbName` and `extraParams` as options per below.
- **dbName**: indicates the database name that you want to use
- **collection**: the collection name within Mongodb, this can also be an array
  for multiple collections
- **server**: contains the server info, with sub properties address and port ex.
  server: { address: `ds143532.mlab.com`, port: 43532 }. Defaults to a server
  running locally on the default port.
- **auth**: the authentication data to login a Mongodb collection, with sub
  properties user and password. ex. auth: { user: `admin`, password: `12345` }
- **extraParams**: useful to set additional parameters for the connection, like authSource, ssl or replicaSet
  (needed for connecting to MongoDB Atlas db as a service), ex: extraParams: { replicaSet: `test-shard-0`, ssl: `true`, authSource: `admin` }. These are the types of options that can be appended as query parameters to the connection URI: https://docs.mongodb.com/manual/reference/connection-string/#connections-connection-options
- **clienOptions**: for setting options on the creation of a `new MongoClient`. By default, to handle the various connection URI's necessary for newer versions of MongoDB Atlas, for instance, we pass { `useNewUrlParser`: `true` }. You can override the default by passing either an empty object literal or filled with other valid connection options These are the subset of connection options that have to be passed as part of an object to the creation of a new `MongoClient` instance: http://mongodb.github.io/node-mongodb-native/3.1/reference/connecting/connection-settings/
- **preserveObjectIds**: if you use `ObjectID`s to store relationships between documents and collections, set this to the Boolean `true`, ex: preserveObjectIds: `true`. Please note, this uses a recursive algorithm to walk through each document tree and replace instances of `ObjectID` with a valid string. For large datasets, this could slow down the build process.

##### How does _preserveObjectIds_ affect peformance?

|  Items |                                                                                Breakdown | Source & Transform (sec) | queries / sec | Bootstrap Finished (sec) |
| -----: | ---------------------------------------------------------------------------------------: | -----------------------: | ------------: | -----------------------: |
|    100 |             Categories (20), Comments (100), Posts (100 w/3 Categories Each), Users (20) |                    3.290 |         72.31 |                   11.887 |
|   1000 |           Categories (50), Comments (1000), Posts (1000 w/3 Categories Each), Users (50) |                    5.114 |         51.19 |                   14.465 |
|   2000 |         Categories (100), Comments (2000), Posts (2000 w/3 Categories Each), Users (100) |                    6.568 |         40.02 |                   16.121 |
|   5000 |         Categories (200), Comments (5000), Posts (5000 w/3 Categories Each), Users (200) |                    8.896 |         28.37 |                   19.635 |
|  10000 |       Categories (500), Comments (10000), Posts (10000 w/3 Categories Each), Users (500) |                   16.258 |         22.36 |                   27.951 |
|  50000 |     Categories (2000), Comments (50000), Posts (50000 w/3 Categories Each), Users (2000) |                  247.940 |          8.13 |                  260.558 |
| 100000 | Categories (20000), Comments (100000), Posts (100000 w/3 Categories Each), Users (20000) |                  815.137 |          3.62 |                  836.335 |

### Mapping mediatype feature

Gatsby supports transformer plugins that know how to transform one data type to
another e.g. markdown to html. In the plugin options you can setup "mappings"
for fields in your collections. You can tell Gatsby that a certain field is a
given media type and with the correct transformer plugins installed, your data
will be transformed automatically.

Let's say we have a markdown field named `body` in our mongoDB collection
`documents`. We want to author our content in markdown but want to transform the
markdown to HTML for including in our React components.

To do this, we modify the plugin configuration in `gatsby-config.js` like
follows:

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-mongodb`,
      options: {
        dbName: `local`,
        collection: `documents`
        // highlight-start
        map: {
          {documents: {body: `text/markdown`}
        },
        // highlight-end
      },
    }
  ],
}
```

The GraphQL query to get the transformed markdown would look something like
this.

```graphql
query($id: String!) {
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

Below is a sample query for fetching all MongoDB document nodes from a db named
**'Cloud'** and a collection named **'documents'**.

```graphql
query {
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
