---
title: Improvements to GraphiQL IDE - adding GraphiQL Explorer
date: 2019-06-03
author: Michal Piechowiak
tags:
  - graphql
  - building-sites-faster
  - developer-experience
---

Gatsby's data layer is powered by [GraphQL](https://graphql.org/). This means that if you are building a Gatsby site, you will almost certainly use GraphQL to take advantage of Gatsby's rich plugin ecosystem that extends this schema with data from _anywhere_. A popular tool for exploring your GraphQL schema is [GraphiQL](https://github.com/graphql/graphiql) — which is a graphical, interactive, in-browser GraphQL development environment. It serves as an interactive playground where you can compose, test, and see the live results of your queries. If you haven't seen or used GraphiQL, it looks something like this:

<figure>
  <video controls="controls" autoplay="false">
    <source type="video/mp4" src="/graphiql-explore.mp4" />
    <p>Your browser does not support the video element.</p>
  </video>
  <figcaption>GraphiQL demo</figcaption>
</figure>

## What is GraphiQL Explorer?

[`graphiql-explorer`](https://github.com/OneGraph/graphiql-explorer) is a plugin for GraphiQL that adds a new technique to explore and build GraphQL queries. It adds a graphical representation of available fields and inputs that can be used in queries. It also allows constructing full queries by clicking through available fields and inputs without the repetitive process of typing these queries out by hand!

GraphiQL Explorer was built by the team at [OneGraph](https://www.onegraph.com/) (OneGraph is a single GraphQL endpoint through which you can bring in data from dozens of services like Salesforce, Stripe, Spotify, GitHub, and more). Check out the ["Build a Podcast Mashup App Using OneGraph and Gatsby — Learn With Jason](https://www.youtube.com/watch?v=10jeoEWy-8g&list=PLz8Iz-Fnk_eTpvd49Sa77NiF8Uqq5Iykx&index=25&t=0s) recording to learn more about OneGraph and how to use it with Gatsby.

## Why use GraphiQL Explorer?

We often hear that many developers' first usage of GraphQL is through Gatsby. GraphQL, like any technology, has a learning curve. We can't eliminate this learning curve completely but we can try to make it smoother. As mentioned previously, GraphiQL Explorer allows users to build full GraphQL queries without typing a single line of code. This enables users that don't yet fully understand the GraphQL query syntax to _learn_ GraphQL much more easily:

<figure>
  <video controls="controls" autoplay="false">
    <source type="video/mp4" src="./graphiql-explorer-demo.mp4" />
    <p>Your browser does not support the video element.</p>
  </video>
  <figcaption>GraphiQL Explorer introduction demo</figcaption>
</figure>

Check out ["How OneGraph onboards users who are new to GraphQL"](https://www.onegraph.com/blog/2019/01/24/How_OneGraph_onboards_users_new_to_GraphQL.html) blog post for more details.

## Advanced usecases

Improvements to on-boarding users new to GraphQL isn't the only goal of integrating GraphiQL Explorer into Gatsby. There are other pain points that are getting addressed with this addition. Specifically [union types and inline fragments](https://graphql.org/learn/queries/#inline-fragments). If the user is not aware of this syntax to query this type of fields it can be a fairly frustrating experience! GraphiQL Explorer helps solve this problem by listing available union types:

<figure>
  <video controls="controls" autoplay="false">
    <source type="video/mp4" src="./graphiql-explorer-union-demo.mp4" />
    <p>Your browser does not support the video element.</p>
  </video>
  <figcaption>GraphiQL Explorer union types support</figcaption>
</figure>

## Try it now

We recently [added](https://github.com/gatsbyjs/gatsby/pull/14280) GraphiQL Explorer to Gatsby. It's available starting with `gatsby@2.7.3`.

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

There are opportunities for further improvements for Gatsby users. Few things we will be working on are:

- evaluating accessibility of GraphiQL interface and addressing found issues,
- adding [support for using GraphQL fragments provided by Gatsby plugins](https://github.com/gatsbyjs/gatsby/issues/14371),
- adding [code snippet generation for common workflows](https://github.com/gatsbyjs/gatsby/issues/14476) (using another awesome OneGraph's GraphiQL addon - [`graphiql-code-exporter`](https://github.com/OneGraph/graphiql-code-exporter)).
