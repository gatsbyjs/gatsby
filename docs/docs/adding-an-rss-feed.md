---
title: Adding an RSS Feed
---

## What is an RSS feed?

An [RSS Feed](https://en.wikipedia.org/wiki/RSS) is a standard XML file listing a website’s content in a subscribable format, allowing readers to consume your content in news aggregators, also called feed reader apps.

Think of it as a syndicated distribution channel for your site's content.

## Install

To generate an RSS feed, you can use the [`gatsby-plugin-feed`](/packages/gatsby-plugin-feed/) package. To install this package, run the following command:

```sh
npm install --save gatsby-plugin-feed
```

## How to use [gatsby-plugin-feed](/packages/gatsby-plugin-feed/)

Once installation is complete, you can now add this plugin to your site's config file, like so:

```json:title=gatsby-config.js
(module.exports = {
  "siteMetadata": {
    "siteUrl": `https://www.example.com`
  },
  "plugins": [`gatsby-plugin-feed`]
})
```

To complete the feed setup, you need to expose a GraphQL entry for our content called `fields.slug` by modifying `gatsby-node.js`. Start with the following code, noting the reference to `MarkdownRemark` content. For content sources other than Markdown, you will want to modify it:

```js:title=gatsby-node.js
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  // highlight-next-line
  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
```

Next run a build (`npm run build`) since the RSS feed generation will only happen for production builds. By default, the generated RSS feed path is `/rss.xml`, but the plugin exposes options to configure this default functionality.

For basic setups with Markdown content like the [gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog), that's all you need! However, you can craft a custom RSS feed schema using custom code in your `gatsby-node.js` and `gatsby-config.js` files.

## Customizing the RSS feed plugin

Your content might not fit neatly into the blog-starter scenario, for various reasons like:

- Your content isn't in Markdown so the plugin doesn't know about it
- Your Markdown files have dates in the filenames, for which the slug URLs cause 404s

The good news is you can accommodate these scenarios and more in `gatsby-config.js` and `gatsby-node.js`.

To customize the default feed schema (a.k.a. structure) output by the plugin to work with your website's content, you can start with the following code:

```json:title=gatsby.config.js
{
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            /* highlight-start */
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map(edge => {
                /* highlight-end */
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  date: edge.node.frontmatter.date,
                  url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  custom_elements: [{ "content:encoded": edge.node.html }],
                })
              })
            },
            query: `
              {
                // highlight-next-line
                allMarkdownRemark(
                  sort: { order: DESC, fields: [frontmatter___date] },
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields { slug }
                      frontmatter {
                        title
                        date
                      }
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: "Your Site's RSS Feed",
          },
        ],
      },
    },
```

This snippet contains a custom `gatsby-plugin-feed` setup in `gatsby-config.js` to query metadata for your site, like its `title` and `siteUrl`. It also includes a `feeds` array with at least one object containing a GraphQL query and `serialize` method, which allows you to output a custom RSS feed structure. In this example, the RSS content comes from Markdown files sourced from your site, and queried with the key `allMarkdownRemark` and its associated filters and fields.

The `output` field in your feed object allows you to customize the filename for your RSS feed, and `title` for the name of your site's RSS feed.

> To see your feed in action, run `gatsby build && gatsby serve` and you can then inspect the content and URLs in your RSS file at `http://localhost:9000/rss.xml`.

## Additional customization for content slugs

To make additional customizations to your RSS feed like removing dates from your content slugs (which are based on filenames), you can modify `gatsby-node.js`:

```javascript:title=gatsby-node.js
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  if (node.internal.type === `MarkdownRemark`) {
    /* highlight-start */
    // filter out dates such as YYYY-MM-DD-
    const dateRegex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-)/
    const value = createFilePath({ node, getNode }).replace(dateRegex, "")
    /* highlight-end */
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
```

In this snippet, the code replaces dates in filename slugs by matching the date format and replacing it with an empty string: `2019-02-15-awesome-post` becomes `awesome-post`. When URLs for your content are published in the feed XML, the plugin will produce a more accurate link: `https://your-gatsby.site/awesome-post/`

## Happy blogging!

With the [Gatsby feed plugin](/packages/gatsby-plugin-feed/), you can share your writing easily with people subscribed through RSS readers like Feedly or RSS Feed Reader. Now that your feed is set up, you won't really have to think about it; publish a new post, and your RSS feed will automatically update with your Gatsby build. Voilà!
