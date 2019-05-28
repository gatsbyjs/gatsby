---
title: Improvements to GraphiQL IDE - adding GraphiQL Explorer
date: 2019-05-28
author: Michal Piechowiak
excerpt: TO-DO
tags:
  - graphql
  - graphiql-explorer
  - developer experience
---

## What is GraphiQL Explorer?

[`graphiql-explorer`](https://github.com/OneGraph/graphiql-explorer) is plugin for GraphiQL IDE that adds new way to explore and build GraphQL queries. It adds graphical representation of available fields and inputs that can be used in queries. It also allow to construct full queries by clicking through available fields and inputs without the having to write GraphQL queries by hand.

## Why is GraphiQL Explorer?

We often hear that first contact with GraphQL is through Gatsby. GraphQL, like any technology, has a learning curve. We can't elimnate learning curve completely but we can try to make it smoother. As mentioned in previous section, Explorer allow users to build full GraphQL queries with just mouse clicks. This enables users that don't yet know query syntax to use GraphQL:

-insert gif of selecting few fields-

Check ["How OneGraph onboards users who are new to GraphQL"](https://www.onegraph.com/blog/2019/01/24/How_OneGraph_onboards_users_new_to_GraphQL.html) blog post for more details about it from [OneGraph](https://www.onegraph.com/) (creators of GraphiQL Explorer).

## Advenced usecases

Improvements to onboarding users new to GraphQL isn't only goal of integrating GraphiQL Explorer into Gatsby. There are other pain points that are getting addressed with this addtion. Example of this would be [union types and inline fragments](https://graphql.org/learn/queries/#inline-fragments). If user is not aware of syntax used to query this type of fields it can be pretty frustrating experience. Explorer helps here too by listing available types in union:

-insert gif with union field-

## Try it now

We recently [added](https://github.com/gatsbyjs/gatsby/pull/14280) GraphiQL Explorer to Gatsby. It's available in `gatsby@2.7.3` and newer.

Create new Gatsby project:

```shell
gatsby new gatsby-with-explorer
```

or update Gatsby in your existing project:

```shell
npm install gatsby
```

or dry-run GraphiQL Explorer in [GraphQL Reference](/docs/graphql-reference/) documentation page.

## Future work

There is opportunity for further improvements for Gatsby users. One that we will be tackling next is [support for using GraphQL fragments provided by Gatsby plugins](https://github.com/gatsbyjs/gatsby/issues/14371).

<span style="color: red;">(?) Should we have call to action for additional feature request?</span>
