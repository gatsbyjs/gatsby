---
title: Simple GraphQL APIs with Gatsby
date: "2018-07-17"
image: "gatsbymanor.jpg" # change this
author: "Mikhail Novikov"
tags: ["gatsby", "graphql", "plugin", "source"]
---

Gatsby data model is powered by an internal GraphQL API. It is a great abstraction, that allows you to define the data requirements of your app, be it some files in the filesystem or a third-party API. However, including any API required a specialized source plugin. Now, in Gatsby 2.0 you can easily include any GraphQL endpoint into Gatsby GraphQL with one generic `gatsby-source-graphql` plugin.

# The basics

There are so many GraphQL APIs now. Github has one, lots of people use Prisma or GraphQL CMS. It's a pain to write a custom plugin every time you want to use it. Now you don't need to. Add this to your `gatsby-config.js`.

```js
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-graphql",
      options: {
        // This type will contain remote schema Query type
        typeName: "SWAPI",
        // This is field under which it's accessible
        fieldName: "swapi",
        // Url to query from
        url: "https://api.graphcms.com/simple/v1/swapi",
      },
    },
  ],
}
```

After this you will have a field named `swapi` in your Gatsby GraphQL and you can query it.

```graphql
{
  # Field name parameter defines how you can access third party api
  swapi {
    allSpecies {
      name
    }
  }

  # Other gatsby stuff works normally
  site {
    siteMetadata {
      siteName
    }
  }
}
```

# Why is it needed?

To understand why a separate new plugin is needed, let's dive into how Gatsby source plugins work. Gatsby GraphQL schema can be extended with source plugins. Source plugins can extend the schema by adding _Nodes_ - items that have some kind of global id. This way a `gatsby-source-filesystem` plugin can add all the files in some directory as nodes. Gatsby introspects the nodes that it gets and creates a GraphQL schema with which one can fetch all those nodes.

This system works really well for many cases and it's very intuitive, one doesn't need to care about creating a GraphQL schema or types for the nodes, any objects can be used. However, this is a limitation for when using other existing GraphQL APIs. First of all, one won't be able to use the same API as the one provided by the API, because it will replaced by Gatsby's Node API. This might be confusing for many people, because they can't consult the third-party API documentation. Secondly, plugin needs to proactively fetch all the possible data from the API, which can be complicated, because plugin author would have to predict which data might be needed.

When there weren't many existing GraphQL APIs in the wild, that wasn't that much of a problem. For the few available APIs, there was a source plugin. With the rise of both public GraphQL APIs, like Github's or Shopify, and with so many more people having a GraphQL API of their own (or using one of the GraphQL solutions like Prisma, GraphCMS or AppSync), writing a plugin for each one became unfeasible. Meet `gastby-source-graphql`.

# How it works?

Instead of creating Nodes for all potential items in a 3rd-party API, `gatsby-source-graphql` uses schema stitching to combine schema of a 3rd-party API with the Gatsby schema. Schema stitching combines multiple GraphQL schemas into one, you can read more about it [here](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html).

The plugin puts the full third-party GraphQL API under one field in Gatsby API. This way any types or fields of that API can be queried. There is no need to prefetch that data beforehand to create nodes, because the data will be fetched on-demand as required by the page queries.

The actual stitching happens on the Gatsby level. There is now a new action, `addThirdPartySchema`, that can be used to add arbitrary schemas for stitching. It's a deliberately low-level API that we hope other plugin authors can use it future to implement some mind-blowing GraphQL functionality. (**_TODO_** Link to docs)

# Conclusions

`gatsby-source-graphql` is going to part of Gatsby 2.0 release. Try it now with Gatsby beta (**_TODO VERSION WHEN IT WILL BE RELEASED_**.) Check out the docs [here]() (**_TODO link _**). Check out sample project using [Github API](https://github.com/freiksenet/gatsby-github-displayer).
