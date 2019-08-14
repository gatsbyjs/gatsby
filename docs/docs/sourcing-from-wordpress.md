---
title: Sourcing from WordPress
---

This guide will walk you through the process of using [Gatsby](/) with [WordPress Rest Api](https://developer.wordpress.org/rest-api/reference/).

WordPress is a free and open-source content management system (CMS). Let's say you have a site built with WordPress and you want to pull the existing data into your static Gatsby site. You can do that with [gatsby-source-wordpress](/packages/gatsby-source-wordpress/?=wordpress). Let's begin!

_Note: this guide uses the `gatsby-starter-default` to provide you with the knowledge necessary to start working with WordPress but if you get stuck at some point of the guide feel free to use
[this example](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-wordpress) to gain extra insights._

## Setup

### Quick start

This guide assumes that you have a Gatsby project set up. If you need to set up a project, head to the [Quick Start guide](/docs/quick-start), then come back.

### gatsby-config.js

Essentially the Gatsby home base. The two things defined here initially (in the starter) are `siteMetadata` and `plugins` you can add to enable new functionalities on your site.

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: "Gatsby Default Starter",
  },
  plugins: ["gatsby-plugin-react-helmet"],
  ...
}
```

### Plugin: gatsby-source-wordpress

Now that you have some understanding of project structure lets add fetching WordPress data functionality. There's a plugin for that. [`gatsby-source-wordpress`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-wordpress) is Gatsby's plugin for sourcing data from WordPress sites using the WordPress JSON REST API. You can install it by running the following command:

```shell
npm install gatsby-source-wordpress
```

### Configuring the plugin

In `gatsby-config.js`, add your configuration options, including your WordPress site's baseUrl, protocol, whether it's hosted on [wordpress.com](http://wordpress.com/) or self-hosted, and whether it makes use of the Advanced Custom Fields (ACF) plugin.

```javascript:title=gatsby-config.js
module.exports = {
  ...
  plugins: [
    ...,
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        // your wordpress source
        baseUrl: `wpexample.com`,
        protocol: `https`,
        // is it hosted on wordpress.com, or self-hosted?
        hostingWPCOM: false,
        // does your site use the Advanced Custom Fields Plugin?
        useACF: false
      }
    },
  ]
}
```

**Note**: if you're config varies from what it shown above, like if you are hosting on WordPress.com, refer to the [plugin docs](/packages/gatsby-source-wordpress/?=wordpre#how-to-use) for more information on how to setup different option fields need to pull in your data.

## Using WordPress data

Once your source plugin is pulling data, you can construct your site pages by implementing the `createPages` API in `gatsby-node.js`. When this is called, your data has already been fetched and is available to query with GraphQL. Gatsby uses [GraphQL at build time](/docs/querying-with-graphql/#how-does-graphql-and-gatsby-work-together); Your source plugin (in this case, `gatsby-source-wordpress`) fetches your data, and Gatsby uses that data to "[automatically _infer_ a GraphQL schema](/docs/querying-with-graphql/#how-does-graphql-and-gatsby-work-together)" that you can query against.

The `createPages` API exposes the `graphql` function:

> The GraphQL function allows us to run arbitrary queries against the local WordPress GraphQL schema... like the site has a built-in database constructed from the fetched data that you can run queries against. ([Source](https://github.com/gatsbyjs/gatsby/blob/master/examples/using-wordpress/gatsby-node.js#L15))

You can use the [`gatsby-node.js` file](https://github.com/gatsbyjs/gatsby/blob/master/examples/using-wordpress/gatsby-node.js) from the plugin demo to get started. For the purpose of this guide the code to construct posts does what it needs to do out of the box (at least for the moment). It queries your local WordPress GraphQL schema for post data, then [iterates through each post node](/docs/programmatically-create-pages-from-data/) to construct a static page for each, [based on whatever template you define](/docs/layout-components/) and feed it.

For example, below is a simplified version of the demo `gatsby-node.js` file that iterates over all the WordPress post data.

```javascript:title=gatsby-node.js
const path = require(`path`)
const slash = require(`slash`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  // query content for WordPress posts
  const result = await graphql(`
    query {
      allWordpressPost {
        edges {
          node {
            id
            slug
          }
        }
      }
    }
  `)

  const postTemplate = path.resolve(`./src/templates/post.js`)
  result.data.allWordpressPost.edges.forEach(edge => {
    createPage({
      // will be the url for the page
      path: edge.node.slug,
      // specify the component template of your choice
      component: slash(postTemplate),
      // In the ^template's GraphQL query, 'id' will be available
      // as a GraphQL variable to query for this posts's data.
      context: {
        id: edge.node.id,
      },
    })
  })
}
```

After pulling data from WordPress with the query, all the posts are iterated over, calling the `createPage` action on each one.

A [Gatsby page is defined](/docs/api-specification/#concepts) as "a site page with a pathname, a template component, and optional graphql query and layout component."

When you restart your server with the `gatsby develop` command, you'll be able to navigate to the new pages created for each of your posts at their respective slugs. In the GraphiQL IDE at [localhost:8000](http://localhost:8000) you should now see queryable fields in the docs or the explorer sidebar for `allWordpressPosts`.

## Wrapping Up

This was a very basic example meant to help you understand how you can fetch data from WordPress and use it with Gatsby. As
the guide mentioned already, if you got stuck, you can have a look at
[example repo](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-wordpress), which is a working example
created to support this guide.

## Other resources

- [Blog post on which this guide is based on](/blog/2018-01-22-getting-started-gatsby-and-wordpress/)
- [Watch + Learn video tutorials](http://watch-learn.com/series/gatsbyjs-wordpress)
- [Another blog post on using Gatsby with WordPress](https://indigotree.co.uk/how-use-wordpress-headless-cms/)
- More [Gatsby blog posts about using Gatsby + Wordpress](/blog/tags/wordpress/)
