---
title: Sourcing from GraphCMS
---

## Headless the GraphCMS way

[GraphCMS](https://graphcms.com?ref="gatsby-headless-docs-top") is a headless CMS that is optimized for working with GraphQL. Content structures like posts, authors, products and more are broken down into content types called "models." These models can then be queried with the familiar GraphQL syntax.

One of the benefits of GraphCMS when working with Gatsby is that it supports GraphQL natively which allows you to test your content queries before even starting your Gatsby project.

## Getting started

In this guide you'll create a complete project capable of querying data from GraphCMS.

### Install the boilerplate

To begin, let's create a Gatsby starter site.

```shell
gatsby new gatsby-site https://github.com/gatsbyjs/gatsby-starter-default
```

Navigate inside of the project with `cd gatsby-site`.

### Add the source plugin

Additionally, you need the the `gatsby-source-graphql` library. Because GraphCMS uses GraphQL natively, you will take advantage of Gatsby's ability to simply stitch two GraphQL APIs together, reducing the time required to transform content. There is no need to use a special gatsby-source-x-cms plugin, the GraphQL source plugin is all you need.

You can install this component with:

```shell
  # Optionally with `npm install`
  npm install --save gatsby-source-graphql
```

### Configure the plugin

The last step required before you can query your data is to configure the `gatsby-source-graphql` plugin. Open `gatsby-config.js` and add the following object to the plugins array. This example uses an open API from GraphCMS but you will most likely want to replace this with your own API and provide a fieldName that makes the most sense to your project. [Here's more information on working with GraphCMS APIs.](https://docs.graphcms.com/developers/api)

```js
{
    resolve: "gatsby-source-graphql",
        options: {
        // The top level query type, can be anything you want!
        typeName: "GCMS",
        // The field you'll query against, can also be anything you want.
        fieldName: "gcms",
        // Your API endpoint, available from the dashboard and settings window.
        // You can use this endpoint that features US mountains for now.
        url: "https://api-euwest.graphcms.com/v1/cjm7tab4c04ro019omujh708u/master",
    },
},
```

If everything works correctly, you should now have your GraphCMS data added to the Gatsby source API!

### Querying for content

From the root of your project, run the development environment with `gatsby develop`. Once the server has started and is error free, you should be able to open the following URL in your browser:

<http://localhost:8000/___graphql>

This will show you an interface where you can test your new content API.

Try running this query:

```js
query {
    gcms {
        mountains {
            title
            elevation
            image {
                url
            }
        }
    }
}
```

Again, if everything is working properly, you should see a successful response in the shape of:

```json
{
  "data": {
    "gcms": {
      "mountains": [
        {
          "title": "Denali",
          "elevation": 6190,
          "image": {
            "url": "https://media.graphcms.com//J0rGKdjuSwCk7QrFxVDQ"
          }
        },
        {
          "title": "Mount Elbert",
          "elevation": 4401,
          "image": {
            "url": "https://media.graphcms.com//JNonajrqT6SOyUKgC4L2"
          }
        }
        // ...more results
      ]
    }
  }
}
```

### Getting content on the page

For the purpose of this tutorial I've removed all the layout, SEO, link or other components that comprise a page in the Gatsby starter. The components are still there and 99% of users will likely want to put them back in once they understand what's happening in the code. You are just looking at the nails for right now, but the hammers, saws and other tools are still in the toolbox. Open the index file located at `src/pages/index.js` and replace the content with this code:

```js
import React from "react"
import { StaticQuery } from "gatsby"

const IndexPage = () => (
  <StaticQuery
    query={graphql`
      query {
        gcms {
          mountains {
            title
            elevation
          }
        }
      }
    `}
    render={data => (
      <div>
        <h1>USA Mountains</h1>
        <ul>
          {data.gcms.mountains.map(mountain => {
            const { title, elevation } = mountain
            return (
              <li>
                <strong>{title}:</strong>
                {elevation}
              </li>
            )
          })}
        </ul>
      </div>
    )}
  />
)

export default IndexPage
```

With this code, you have:

1. Added the `StaticQuery` component to a page that allows you to fetch content from the GraphQL API.
2. Fetched some simplified data from the Mountain API, namely the title and elevation.
3. Rendered the list in the StaticQuery's RenderProp called "render".

## Summary

Hopefully you've seen how easy it is to start working with GraphCMS and Gatsby. With projects of all sizes gravitating towards the benefits of the JAM stack, the time has never been better to learn how to work with Gatsby. Adding a content API in the backend with GraphCMS provides a scalable CMS that you can start using within minutes and keep using for the life of your project.

[Check out GraphCMS today and build "fast websites", fast!](https://graphcms.com?ref="gatsby-headless-docs-bottom")
