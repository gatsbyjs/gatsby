---
title: Improvements to GraphiQL IDE - adding GraphiQL Explorer
date: 2019-05-29
author: Michal Piechowiak
excerpt: Overview of recently added GraphiQL Explorer integration.
tags:
  - graphql
  - graphiql-explorer
  - developer experience
---

Gatsby's data layer is powered by [GraphQL](https://graphql.org/). This means that if you are building Gatsby site, you will most likely use GraphQL to take advantage of Gatsby rich source and transformer plugins ecosystem. GraphQL is very often paired with [GraphiQL](https://github.com/graphql/graphiql) (A graphical interactive in-browser GraphQL integrated development environment), which serves as interactive playground where you can compose and test your queries. You might be familiar with with GraphiQL interface:

<video controls="controls" autoplay="true" loop="true">
  <source type="video/mp4" src="/graphiql-explore.mp4"></source>
  <p>Your browser does not support the video element.</p>
</video>

## What is GraphiQL Explorer?

[`graphiql-explorer`](https://github.com/OneGraph/graphiql-explorer) is plugin for GraphiQL IDE that adds new way to explore and build GraphQL queries. It adds graphical representation of available fields and inputs that can be used in queries. It also allow to construct full queries by clicking through available fields and inputs without the having to write GraphQL queries by hand.

## Why is GraphiQL Explorer?

We often hear that first contact with GraphQL is through Gatsby. GraphQL, like any technology, has a learning curve. We can't elimnate learning curve completely but we can try to make it smoother. As mentioned in previous section, Explorer allow users to build full GraphQL queries with just mouse clicks. This enables users that don't yet know query syntax to use GraphQL:

<video controls="controls" autoplay="true" loop="true">
  <source type="video/mp4" src="./graphiql-explorer-demo.mp4"></source>
  <p>Your browser does not support the video element.</p>
</video>

Check ["How OneGraph onboards users who are new to GraphQL"](https://www.onegraph.com/blog/2019/01/24/How_OneGraph_onboards_users_new_to_GraphQL.html) blog post for more details about it from [OneGraph](https://www.onegraph.com/) (creators of GraphiQL Explorer).

## Advanced usecases

Improvements to onboarding users new to GraphQL isn't only goal of integrating GraphiQL Explorer into Gatsby. There are other pain points that are getting addressed with this addition. Example of this would be [union types and inline fragments](https://graphql.org/learn/queries/#inline-fragments). If user is not aware of syntax used to query this type of fields it can be pretty frustrating experience. Explorer helps here too by listing available types in union:

<video controls="controls" autoplay="true" loop="true">
  <source type="video/mp4" src="./graphiql-explorer-union-demo.mp4"></source>
  <p>Your browser does not support the video element.</p>
</video>

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

or try it [live](https://gatsby-1774317511.gtsb.io/___graphql?explorerIsOpen=true).

## Future work

There is opportunity for further improvements for Gatsby users. One that we will be tackling next is [support for using GraphQL fragments provided by Gatsby plugins](https://github.com/gatsbyjs/gatsby/issues/14371).
