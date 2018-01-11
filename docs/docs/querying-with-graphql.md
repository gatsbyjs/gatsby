---
title: Querying with GraphQL
---

> This page is a work in progress.

# What is GraphQL?

graphql.org describes it as "...a query language for APIs and a runtime for
fulfilling those queries with your existing data".

Gatsby uses GraphQL to create a consistent interface between your static site
and your data sources, where data sources can be anything from local markdown
files to a remote API.

Gatsby describes your data by creating GraphQL _schemas_ from your data sources.

GraphQL _queries_ can then be associated with your Gatsby pages, ensuring each
page receives exactly the data it needs.

# Why GraphQL?

* As Gatsby runs on both server (at build time) & client, need way to specify
  which data is needed.
* This is a _build-time only_ use of GraphQL. You don't need to run a GraphQL
  server in production.
* Convenient way to describe data requirements of component.
* Why query colocation rocks
* Uses the Relay Modern compiler behind the scenes

# Basic Terminology

* Types based on file type + way data can be transformed
* Connections
* Shallow intro to how data layer works e.g. source and transformer plugins.
* Compare to webpack loaders — like loaders except create schema that can then
  be queried.
* Named queries?
* Using query parameters to manipulate results?

# Example queries

Showing off sorting, filtering, picking fields, programmatic transformations

[Some example queries from Gatsby's tests](https://github.com/gatsbyjs/gatsby/blob/52e36b9994a86fc473cd2f966ab6b6f87ee8eedb/packages/gatsby/src/schema/__tests__/infer-graphql-input-type-test.js#L116-L432) -
look for \`template literal blocks\` with `allNode{}` in them.

...

# Further reading

## Getting started with GraphQL

* http://graphql.org/learn/
* https://services.github.com/on-demand/graphql/
* https://apis.guru/graphql-voyager/
* https://www.howtographql.com/
* https://reactjs.org/blog/2015/05/01/graphql-introduction.html
* ...

## Advanced readings on GraphQL

* [GraphQL specification](https://facebook.github.io/graphql/October2016/)
* [Interfaces and Unions](https://medium.com/the-graphqlhub/graphql-tour-interfaces-and-unions-7dd5be35de0d)
* [Gatsby uses the Relay Compiler](https://facebook.github.io/relay/docs/en/compiler-architecture.html)
* ...

## TODO — create live GraphQL explorer for GatsbyJS.org

* iFrame of graphiql instance for this site running on Heroku so people can run
  live queries.
