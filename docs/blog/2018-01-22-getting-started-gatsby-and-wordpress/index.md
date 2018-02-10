---
title: Getting Started with Gatsby and WordPress
date: "2018-01-22"
author: "Amberley Romo"
---

_This post was originally published on
[my blog](https://amberley.blog/getting-started-with-gatsbyjs-and-wordpress)
on January 18, 2018._

Earlier this week I began rebuilding my blog using GatsbyJS + WordPress. As I familiarized with Gatsby, I found myself flipping through a million tabs, and I thought it might be useful to summarize concepts and to aggregate links I found helpful.

I recently decided to tackle a redo of my blog. I wanted to do something different and I've been hearing a lot about GatsbyJS. A static site generator for React that I can easily pull my existing WordPress data for? Sold. I'll try it.

I generated a new site using the [default starter](https://github.com/gatsbyjs/gatsby-starter-default) and read through what it gave me. Assuming you have the [Gatsby CLI](/docs/) installed, run:

`gatsby new gatsby-example-site`

That gets us a new site directory with a couple (mostly) empty "gatsby"-prefixed files and a src directory with some basic scaffolding. The configuration and lifecycle hooks for Gatsby get put in those "gatsby"-prefixed files, `gatsby-config.js`, `gatsby-node.js` and `gatsby-browser.js`.

##gatsby-config.js

Essentially the Gatsby home base. The two things defined here initially (in the starter) are `siteMetadata` and `plugins`.

```javascript
module.exports = {
  siteMetadata: {
    title: "Gatsby Default Starter",
  },
  plugins: ["gatsby-plugin-react-helmet"],
};
```

See the [docs page on gatsby-config.js](/docs/gatsby-config/) for more.

For the curious:

* `gatsby-plugin-react-helmet` is a plugin the starter includes. It's a [document head manager for React](/packages/gatsby-plugin-react-helmet/).

##gatsby-node.js

We can make use of any of [Gatsby's node APIs](/docs/node-apis/) by exporting a function with the name of that API from this file.

For my purposes, the only one I have interacted with so far to get up and running is the [`createPages`](/docs/node-apis/#createPages) API. This gets called after our data has been fetched and is available to use to dynamically build out our static pages. More on this later.

##gatsby-browser.js

Same as above, we can make use of any of [Gatsby's browser APIs](/docs/browser-apis/) by exporting them from this file.

I haven't needed to make use of any of these yet, but they provide a hook into [client runtime operations](/docs/gatsby-lifecycle-apis/) — for example, replacing the router component, as seen in [this example](https://github.com/gatsbyjs/gatsby/blob/master/examples/using-redux/gatsby-browser.js#L7).

##Plugin: gatsby-source-wordpress

Having familiarized with the basic structure, my next step was getting my data successfully pulling from WordPress. There's a plugin for that. [`gatsby-source-wordpress`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-wordpress) is Gatsby's plugin for sourcing data from WordPress sites using the WordPress JSON REST API.

(Fun fact: the WordPress REST API is already [included starting with WordPress 4.7](http://v2.wp-api.org/) — no longer requires installing a WordPress plugin. I didn't actually know that, not having used the WordPress REST API for anything before).

I started by reviewing the [code for the plugin's demo site](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-wordpress).

##Configure the plugin to pull your data

In `gatsby-config.js`, add your configuration options, including your WordPress site's baseUrl, protocol, whether it's hosted on [wordpress.com](http://wordpress.com/) or self-hosted, and whether it makes use of the Advanced Custom Fields (ACF) plugin.

```javascript
module.exports = {
  ...
  plugins: [
    ...,
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        // your wordpress source
        baseUrl: `amberley.me`,
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

##Use the data to dynamically construct pages.
Once your source plugin is pulling data, you can construct your site pages by implementing the `createPages` API in `gatsby-node.js`. When this is called, your data has already been fetched and is available to query with GraphQL. Gatsby uses [GraphQL at build time](/docs/querying-with-graphql/#how-does-graphql-and-gatsby-work-together); Your source plugin (in this case, `gatsby-source-wordpress`) fetches your data, and Gatsby uses that data to "[automatically _infer_ a GraphQL schema](/docs/querying-with-graphql/#how-does-graphql-and-gatsby-work-together)" that you can query against.

The `createPages` API exposes the `graphql` function:

> The GraphQL function allows us to run arbitrary queries against the local WordPress GraphQL schema... like the site has a built-in database constructed from the fetched data that you can run queries against. ([Source](https://github.com/gatsbyjs/gatsby/blob/master/examples/using-wordpress/gatsby-node.js#L15))

I used the `gatsby-node.js` file from the plugin demo to get started. For my purposes the code to [construct 'posts'](https://github.com/gatsbyjs/gatsby/blob/master/examples/using-wordpress/gatsby-node.js#L12) does what I need it to do out of the box (at least for the moment). It queries our local WordPress GraphQL schema for post data, then [iterates through each post node](https://github.com/gatsbyjs/gatsby/blob/master/examples/using-wordpress/gatsby-node.js#L94) to construct a static page for each, [based on whatever template we define](https://github.com/gatsbyjs/gatsby/blob/master/examples/using-wordpress/gatsby-node.js#L97) and feed it.

For example, below is the part of the demo `gatsby-node.js` file that iterates over all the WordPress post data.

```javascript
const postTemplate = path.resolve(`./src/templates/post.js`);

_.each(result.data.allWordpressPost.edges, edge => {
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
  });
});
```

The [docs define a Gatsby page](/docs/api-specification/#concepts) as "a site page with a pathname, a template component, and optional graphql query and layout component." See the docs on the [createPage bound action creator](/docs/bound-action-creators/#createPage) and [guide on creating and modifying pages for more detail](/docs/creating-and-modifying-pages/).

##... Take a step back to "templates"

In the step above we dynamically create pages based on our data by passing the absolute path to a defined template to "component". So what's a template?

A template is a page component we can loop over to dynamically create pages based on the content we've pulled in (described above). We pass the post id to "context" to make it available as a GraphQL variable in the template file. The [GraphQL query defined for the template](https://github.com/gatsbyjs/gatsby/blob/master/examples/using-wordpress/src/templates/post.js#L66) then uses that id to query for data specific to that post.

##... Take another step back to "pages"

So a template is a page component that we can use to programmatically create pages. Then what's a page component?

> Page Component — React.js component that renders a page and can optionally specify a layout component and a graphql query. ([Source](https://www.gatsbyjs.org/docs/api-specification/#concepts)).

React components living in `src/pages` automatically become pages. The file name of a page maps to its site path. My site in its current state only has one good example of this — `src/pages/index.js` maps to [amberley.blog](https://amberley.blog/). If I had an 'about' page, it would live at `src/pages/about.js`, and map to [amberley.blog/about](https://amberley.blog/about). (Since that doesn't exist, it will actually end up hitting the only other page currently defined in my site, which is `src/pages/404.js` — ([read about 404 pages](/docs/add-404-page/)).

If you include the "optional GraphQL query" noted above, the result of that query is automatically passed to the component on a `data` prop (`this.props.data`). ([Read more on GraphQL queries](/docs/querying-with-graphql/#what-does-a-graphql-query-look-like)).

##Onward

While this isn't a tutorial -- more a guided walkthrough of me familiarizing and stepping through an initial Gatsby setup -- if you're following along with the [demo code](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-wordpress) you're probably close to (or already!) seeing your WordPress data populate your Gatsby dev site if you run `gatsby develop`!

##Sidenotes

1. You [don't need to know GraphQL](https://github.com/gatsbyjs/gatsby/issues/1172#issuecomment-308634739) to get started with Gatsby. I didn't. It's been a good introduction.
2. Gatsby makes heavy use of [plugins](/docs/plugins/) — both official and community — for a lot of things, from one that implements [Google Analytics](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-google-analytics), to one that adds [GitHub's accessibility error scanner](https://github.com/alampros/gatsby-plugin-accessibilityjs) to all pages.
3. Read through some of the source code. I particularly enjoyed reading through [the bootstrap process](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/bootstrap/index.js). (It's beautifully commented).
4. Gatsby.js is a static Progressive Web App (PWA) generator, but to be PWA friendly (at least according to the [Lighthouse PWA audit](https://developers.google.com/web/tools/lighthouse/)), look into two plugins: `gatsby-plugin-manifest` and `gatsby-plugin-offline`.
5. I did end up [deploying with Netlify](/docs/deploy-gatsby/#netlify), and I'm super happy with it. (A [previous post](https://www.gatsbyjs.org/blog/2017-12-06-gatsby-plus-contentful-plus-netlify/#solution-netlify--gatsby) discussed Netlify a bit more, if you're interested).
