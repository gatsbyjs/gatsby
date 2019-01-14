# gatsby-source-sql

Plugin for connecting arbitrary SQL databases to Gatsby. Supported SQL databases are MySQL/MariaDB, PostgreSQL, Amazon Redshift, SQLite3, Oracle and MSSQL.

- [Example website][website]
- [Example website source][website-source]
- [Feature request that motivated this plugin][feat-req]

## Table of contents

- [Install](#Install)
- [Configuration](#Configuration)
  - Set `typeName` and `fieldName`
  - Install the appropriate database library
  - Database configuration
  - Build a query
  - gatsby-config.js
- [How to query](#How-to-query)
- [TODO](#TODO)

## Install

`npm install --save git+https://github.com/mrfunnyshoes/gatsby-source-sql.git`

## Configuration

### Set `typeName` and `fieldName`

You need to pass a `typeName` and `fieldName` to the plugin configuration. The `typeName` describes each row in the resulting queried table. For example, if you configure it as `typeName: "User"`, the resulting nodes will be available as:

```graphql
query {
  allUser {
    ...
  }
}
```

### Install the appropriate database library

This plugin uses [`knex`][knex] to build and run SQL queries. Depending on the database(s) you want to use, add one or more of the following:

```console
npm install pg --save
npm install sqlite3 --save
npm install mysql --save
npm install mysql2 --save
npm install oracle --save
npm install mssql --save
```

### Database configuration

You must pass a `knex` configuration object to the `dbEngine` key in the plugin options inside `gatsby-config.js`. For example, if you are using `MySQL`:

```javascript
...
dbEngine: {
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'your_database_user',
    password : 'your_database_password',
    database : 'myapp_test'
}
...
```

Check the `knex` [documentation][knex-config] to see how to configure other databases, as well as optional parameters for specific engines.

#### Environment variables

We recommend you secure any secrets you use to connect to the database using environment variables, so your secrets aren't commited to source control. You can use [`dotenv`][dotenv], which will then expose environment variables. Read more about dotenv and using environment variables [here][env-vars]. Then you can use the environment variables to configure this plugin.

### Build a query

In `knex`, you build queries by chaining methods to a connection object. In your plugin options inside `gatsby-config.js`, you need to pass a function that performs a chain of methods on its sole parameter (which represents the connection object) to the `queryChain` key. For example, if you want to run the query `SELECT username, email FROM users;`, you can pass the following:

```javascript
...
queryChain: function(x) {
  return x.select("username", "email").from("users")
}
...
```

`knex` will take charge of translating this chain of methods to the appropriate SQL statement for the database.

It's important to note that the purpose of this plugin is to only retrieve data, so the resulting query must be a (possibly compound) **SELECT** statement.

We recommend you to take a look at [the knex docs][knex-query] to get familiar with building queries.

### Example gatsby-node.js

```javascript
module.exports = {
  plugins: [
    {
      // Querying to a SQLite database
      resolve: `gatsby-source-sql`,
      options: {
        typeName: 'Nirvana',
        // This is the field under which the data will be accessible in a future version
        fieldName: 'chinook',
        dbEngine: {
          client: 'sqlite3',
          connection: {
            filename: './data/Chinook_Sqlite.sqlite',
          },
          useNullAsDefault: true
        },
        queryChain: function(x) {
          return x
            .select(
              "Track.TrackId as TrackId",
              "Track.Name as Track",
              "Album.Title as Album",
              "Genre.Name as Genre"
            )
            .from("Track")
            .innerJoin("Album", "Album.AlbumId", "Track.AlbumId")
            .innerJoin("Artist", "Artist.ArtistId", "Album.ArtistId")
            .innerJoin("Genre", "Genre.GenreId", "Track.GenreId")
            .where("Artist.Name", "=", "Nirvana")
        }
      }
    },
    {
      // Querying to a PostgreSQL database
      resolve: `gatsby-source-sql`,
      options: {
        typeName: "Employees",
        fieldName: "postgres",
        dbEngine: {
          client: 'pg',
          connection: {
            host: process.env.PG_HOST,
            user: process.env.PG_USERNAME,
            password: process.env.PG_PASSWORD,
            database : process.env.PG_DATABASE
          }
        },
        queryChain: function(x) {
          return x
            .select("last_name", "title")
            .from('employees')
            .limit(15)
        }
      }
    },
  ]
```

As you can see from this example, you can query from multiple databases passing each configuration to the plugin.

## How to Query

```graphql
query {
  allNirvana(filter: { Album: { eq: "Nevermind" } }) {
    edges {
      node {
        id
        TrackId
        Track
        Album
        Genre
      }
    }
  }
  allEmployees {
    edges {
      node {
        id
        last_name
        title
      }
    }
  }
}
```

## TODO

- Add this plugin to the official Gatsby repo.
- Add to npm registry.
- Possibly, nest queries inside `fieldName` namespace.

### Example

```graphql
query {
  chinook {
    allNirvana(filter: { Album: { eq: "Nevermind" } }) {
      edges {
        node {
          id
          TrackId
          Track
          Album
          Genre
        }
      }
    }
  }
  postgres {
    allEmployees {
      edges {
        node {
          id
          last_name
          title
        }
      }
    }
  }
}
```

[website]: https://mrfunnyshoes.github.io/gatsby-source-sql
[website-source]: https://github.com/mrfunnyshoes/gatsby-source-sql/tree/example-site
[feat-req]: https://github.com/gatsbyjs/gatsby/issues/8714
[knex]: https://github.com/tgriesser/knex
[knex-config]: https://knexjs.org/#Installation-client
[knex-query]: https://knexjs.org/#Builder
[dotenv]: https://github.com/motdotla/dotenv
[env-vars]: https://gatsby.app/env-vars
