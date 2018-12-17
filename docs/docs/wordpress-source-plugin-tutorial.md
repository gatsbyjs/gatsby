---
title: "WordPress Source Plugin Tutorial"
---

## How to create a site with data pulled from WordPress

### What this tutorial covers:

In this tutorial, you will install the `gatsby-source-wordpress` plugin in order to pull blog and image data from a WordPress install into your Gatsby site and render that data. This [Gatsby + WordPress demo site](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-wordpress) shows you the source code for an example site similar to what you’re going to be building in this tutorial, although it’s missing the cool images you’ll be adding in the next part of this tutorial, [Adding Images to a WordPress Site](/docs/image-tutorial/). :D

#### But do you prefer GraphQL?

If you prefer using GraphQL, there's a [wp-graphql](https://github.com/wp-graphql/wp-graphql) plugin to easily expose both default and custom data in WordPress.

The same authentication schemes supported by the WP-API are supported in wp-graphql, which can be used with the [gatsby-source-graphql](/packages/gatsby-source-graphql/) plugin.

## Why go through this tutorial?

While each source plugin may operate differently from others, it’s worth going through this tutorial because you will almost definitely be using a source plugin in most Gatsby sites you build. This tutorial will walk you through the basics of connecting your Gatsby site to a CMS, pulling in data, and using React to render that data in beautiful ways on your site.

If you’d like to look at the growing number source plugins available to you, search for “source” in the [Gatsby plugin library](/plugins/?=source).

### Creating a site with the `gatsby-source-wordpress` plugin

Create a new Gatsby project and change directories into the new project you just created:

```shell
gatsby new wordpress-tutorial-site
cd wordpress-tutorial-site
```

Install the `gatsby-source-wordpress` plugin. For extra reading on the plugin’s features and examples of GraphQL queries not included in this tutorial, see the [`gatsby-source-wordpress` plugin’s READme file](/packages/gatsby-source-wordpress/?=wordpress).

```shell
npm install --save gatsby-source-wordpress
```

Add the `gatsby-source-wordpress` plugin to `gatsby-config.js` using the following code, which you can also find in the [demo site’s source code](https://github.com/gatsbyjs/gatsby/blob/master/examples/using-wordpress/gatsby-config.js).

```js:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: "Gatsby WordPress Tutorial",
  },
  plugins: [
    // https://public-api.wordpress.com/wp/v2/sites/gatsbyjsexamplewordpress.wordpress.com/pages/
    /*
     * Gatsby's data processing layer begins with “source”
     * plugins. Here the site sources its data from WordPress.
     */
    // highlight-start
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        /*
        * The base URL of the WordPress site without the trailingslash and the protocol. This is required.
        * Example : 'gatsbyjswpexample.wordpress.com' or 'www.example-site.com'
        */
        baseUrl: `dev-gatbsyjswp.pantheonsite.io`,
        // The protocol. This can be http or https.
        protocol: `http`,
        // Indicates whether the site is hosted on wordpress.com.
        // If false, then the asumption is made that the site is self hosted.
        // If true, then the plugin will source its content on wordpress.com using the JSON REST API V2.
        // If your site is hosted on wordpress.org, then set this to false.
        hostingWPCOM: false,
        // If useACF is true, then the source plugin will try to import the WordPress ACF Plugin contents.
        // This feature is untested for sites hosted on WordPress.com
        useACF: true,
      },
    },
    // highlight-end
  ],
}
```

### Creating GraphQL queries that pull data from WordPress

Now you are ready to create a GraphQL query to pull in some data from the WordPress site. You will create a query that pulls in the title of the blog posts, date they were posted, and blogpost content.

Run:

```shell
gatsby develop
```

In your browser, open localhost:8000 to see your site, and open localhost:8000/\_\_\_graphql so that you can create your GraphQL queries.

As an exercise, try re-creating the following queries in your GraphiQL explorer. This first query will pull in the blogpost content from WordPress:

```graphql
query {
  allWordpressPage {
    edges {
      node {
        id
        title
        excerpt
        slug
        date(formatString: "MMMM DD, YYYY")
      }
    }
  }
}
```

This next query will pull in a sorted list of the blog posts:

```graphql
{
  allWordpressPost(sort: { fields: [date] }) {
    edges {
      node {
        title
        excerpt
        slug
      }
    }
  }
}
```

## Rendering the blog posts to `index.js`

Now that you've created GraphQL queries that pull in the data you want, we'll use that second query to create a list of sorted blogpost titles on your site's homepage. Here is what your `index.js` should look like:

```jsx:title=src/pages/index.js
import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => {
  console.log(data)
  return (
    <div>
      <h1>My WordPress Blog</h1>
      <h4>Posts</h4>
      {data.allWordpressPost.edges.map(({ node }) => (
        <div>
          <p>{node.title}</p>
          <div dangerouslySetInnerHTML={{ __html: node.excerpt }} />
        </div>
      ))}
    </div>
  )
}

export const pageQuery = graphql`
  query {
    allWordpressPost(sort: { fields: [date] }) {
      edges {
        node {
          title
          excerpt
          slug
        }
      }
    }
  }
`
```

Save these changes and look at localhost:8000 to see your new homepage with list of sorted blog posts!

> **NOTE:** to future editors: it would be useful to also have examples of how to load blog posts to their own individual pages. And helpful to insert a screenshot of the final result here

### Create slugs for each blogpost

[Part 7](/tutorial/part-seven/) of the foundational tutorial goes through this process.
