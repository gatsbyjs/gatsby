---
title: Simple GraphQL APIs with Gatsby
date: "2018-08-03"
author: "Mikhail Novikov"
tags: ["gatsby", "graphql", "plugin", "source"]
---

Gatsby 2.0 adds support for schema stitching of its internal schema. Schema stitching allows merging multiple GraphQL schemas together, which greatly simplifies working with third-party GraphQL APIs. Along with low-level support for stitching in general, we are shipping an official [gatsby-source-graphql](https://www.gatsbyjs.org/packages/gatsby-source-graphql/) plugin, which enables connecting to an arbitrary GraphQL API with just a few lines of configuration.

# Getting started

Gatsby's data model is powered by an internal GraphQL API. It is a great abstraction that allows you to define the data requirements of your app, be it some files in the filesystem or a third-party API. However, including any API required a specialized source plugin. Naturally, it's a pain to write a custom plugin every time you want to use a third-party API. Now you don't need to. Add this to your `gatsby-config.js`.

```js
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-graphql",
      options: {
        // This type will contain the remote schema Query type
        typeName: "SWAPI",
        // This is the field under which it's accessible
        fieldName: "swapi",
        // URL to query from
        url: "https://api.graphcms.com/simple/v1/swapi",
      },
    },
  ],
}
```

After this you will have a field named `swapi` in your Gatsby GraphQL and you can query it.

```graphql
{
  # Field name parameter defines how you can access third party API
  swapi {
    allSpecies {
      name
    }
  }

  # Other Gatsby querying works normally
  site {
    siteMetadata {
      siteName
    }
  }
}
```

# Why is it needed?

To understand why a separate new plugin is needed, let's dive into how Gatsby source plugins work. Gatsby's GraphQL schema can be extended with source plugins. Source plugins can extend the schema by adding _nodes_ - items that have some kind of global id. This way a `gatsby-source-filesystem` plugin can add all the files from a directory as nodes. Gatsby introspects the nodes that it gets and creates a GraphQL schema which you can use to fetch all those nodes.

This system works really well for many cases and it's very intuitive, you don't need to care about creating a GraphQL schema or types for the nodes, any objects can be used. However, this is a limitation when using existing GraphQL APIs. First of all, you won't be able to use the same API as the one provided by the third-party API, because it will be replaced by Gatsby's internal node API. This can be confusing, because you can't consult the third-party API's documentation. Secondly, the plugin needs to proactively fetch all the possible data from the API, which can be complicated because the plugin author would have to predict which data might be needed.

When there weren't many existing GraphQL APIs in the wild, that wasn't that much of a problem. For the few available APIs there was a source plugin. With the rise of both public GraphQL APIs, like Github or Shopify, and with so many more people having a GraphQL API of their own (or using one of the GraphQL solutions like Prisma, GraphCMS or AppSync), writing a plugin for each one became unfeasible. Meet `gatsby-source-graphql`.

# How does it work?

Instead of creating nodes for all potential items in a third-party API, `gatsby-source-graphql` uses schema stitching to combine the schema of a third-party API with the Gatsby schema. Schema stitching combines multiple GraphQL schemas into one, [read more about it here](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html).

The plugin puts the full third-party GraphQL API under one field in Gatsby's API. This way any types or fields of that API can be queried. There is no need to prefetch that data beforehand to create nodes, because the data will be fetched on-demand as required by the page queries.

The actual stitching happens on the Gatsby level. There is a new action, `addThirdPartySchema`, that can be used to add arbitrary schemas for stitching. It's a deliberately low-level API that we hope other plugin authors can use in the future to implement some mind-blowing GraphQL functionality. (**_TODO_** Link to docs)

# Conclusions

`gatsby-source-graphql` is going to part of Gatsby's 2.0 release. Try it now with the latest Gatsby beta (**_TODO VERSION WHEN IT WILL BE RELEASED_**). [Check out the docs](/docs/third-party-graphql) or [a sample project using Github's GraphQL API](https://github.com/freiksenet/gatsby-github-displayer).
