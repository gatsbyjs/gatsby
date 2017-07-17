---
title: Querying with GraphQL
---

Rough outline

* What is GraphQL
* Why GraphQL? As Gatsby runs on both server (at build time) & client,
need way to specify which data is needed.
* Emphasize this is a *build-time only* use of GraphQL. You don't need to run a
GraphQL server in production. Convenient way to describe data
requirements of component.
* Why query colocation rocks.
* Some basic terminology
  * Types based on file type + way data can be transformed
  * Connections
  * Shallow intro to how data layer works e.g. source and transformer plugins.
  * Compare to Webpack loaders — like loaders except create schema that
  can then be queried.
* Example queries showing off sorting, filtering, picking fields,
programmatic transformations
* Link to some doc pages on advanced usages of GraphQL.
* iFrame of graphiql instance for this site running on Heroku so people
can run live queries.
