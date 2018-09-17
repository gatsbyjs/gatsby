# graphql-skip-limit

This library provides helper functions for building Relay-style connections but
with skip/limit style pagination instead of Relay's cursor-based pagination.

It is built and maintained for
[React modern site generator Gatsby](https://github.com/gatsbyjs/gatsby) to
drive its GraphQL-based data layer.

It is a port from [graphql-relay](https://github.com/graphql/graphql-relay-js)
so can be used in a similar fashion. See the tests in `src/connection/__tests__`
for an example of using this library.

Connections built with this library can be queried like the following:

```graphql
{
  allFile(skip: 1, limit: 10) {
    edges {
      node {
        id
      }
    }
  }
}
```

In this query, we skip the first result and limit our results to 10.
