---
title: Gatsbygram Case Study
date: "2017-03-08"
author: "Kyle Mathews"
image: 'ui-and-code.png'
---

![Gatsbygram](ui-and-code.png)

[Gatsbygram](https://gatsbygram.gatsbyjs.org) is a clone of Instagram
built with Gatsby v1.

## What is Gatsby

Gatsby is a JavaScript web framework that let's you build fast, very
dynamic, mobile-ready websites *without* a complicated backend. It
combines the fast performance of static websites with the powerful
abstractions, tools, and client capabilities of the React.js
world.

### Gatsby is fast

Gatsby automatically optimizes your site for the modern web. You
provide pages and Gatsby stiches them together so they load as fast as
possible.

As proof of this, Gatsbygram loads *2-3x faster* than the real Instagram site.

I tested Gatsbygram and Instagram on
[webpagetest.org](https://www.webpagetest.org/) using a simulated 3G
network and a Moto G smartphone—a budget Android released 3.5
years ago—so typical of many lower-end phones used still today.  The
median [speed
index](https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics/speed-index)
score for
[Gatsbygram](http://www.webpagetest.org/result/170307_10_17H0/) was 3128
vs. 8145 for
[Instagram](http://www.webpagetest.org/result/170307_VS_16JZ/).

![gatsbygram vs. instagram filmstrip](gatsbygram-instagram.png)*Filmstrip of Gatsbygram (top)
and Instagram (bottom) loading on webpagetest.org*

The second view is even faster for Gatsbygram as it now loads from its
service worker. It has pixels on the screen in *under a second* on a
budget Android device! And it *finishes* loading a full 1.5 seconds
before Instagram gets started.

![gatsbygram vs. instagram filmstrip repeat
load](gatsbygram-instagram-repeat-load.png)*Filmstrip of a repeat view
of Gatsbygram (top) and Instagram (bottom) loading on webpagetest.org*

### Gasby is built for the next billion internet users

As [Benedict Evans has
noted](http://ben-evans.com/benedictevans/2015/5/13/the-smartphone-and-the-sun),
the next billion people who are poised to come online will be using the
internet almost exclusively through smartphones.

Smartphones with decent specs (as good or better than the Moto G), a
great browser, but *without* a reliable internet connection.

Gatsby uses [modern web performance
ideas](https://developers.google.com/web/fundamentals/performance/prpl-pattern/)
developed by the Google Chrome Developer Relations team designed to help
websites work well on modern browers on unreliable networks.

Sites built with Gatsby run as much as possible on the client so
regardless of the network conditions—good, bad, or
nonexistant—things will keep working.

Many of the top e-commerce websites in areas where people are coming
online for the first time are developing their websites using these
techniques.

Read Google's case studies on:

* [Flipkart
(India)](https://developers.google.com/web/showcase/2016/flipkart)
* [Konga
(Nigeria)](https://developers.google.com/web/showcase/2016/konga)
* [Housing.com
(India)[https://developers.google.com/web/showcase/2016/housing]

<div>
<video controls="controls" autoplay="true" loop="true">
  <source type="video/mp4" src="/gatsbygram.mp4"></source>
  <p>Your browser does not support the video element.</p>
</video>
</div>

### Gatsby is simple

Modern JavaScript websites are too complex to rely on developers always
configuring things correctly. Gatsby simplifies website development by
extracting configuration out of your site moving it into the framework
and community plugins.

You give Gatsby React.js components, data, and styles and Gatsby gives you
back an optimized website.

Gatsby includes a full modern JavaScript toolchain
(Babel/webpack/uglifyjs) with optimized production builds and
an innovative declarative asset pipeline.

For Gatsbygram, Gatsby generates over *1000* image thumbnails for
responsive images without *any* custom scripting.

Stop wasting time and build something.

## App structure

Gatsby uses standard React.js components for building websites.

There are three types of components.

* *layout components* for general site structure and headers and
footers
* *template components* for page types like blog posts or
documentation pages
* *React.js pages* for single-file React.js pages

![gatsbygram component layout](gatsbygram-layout.png)*Gatsbygram's site
structure with its three page components*

### Layout components

Each Gatsby site has a top-level layout component at
`layouts/default.js`. This layout component is used on every page of
your site so can contain things like your header, footer, and default
page structure. It is also used as the "[app
shell](https://developers.google.com/web/updates/2015/11/app-shell)"
when loading your site from a service worker.

The simplest possible layout component would look something like this.

```jsx
import React from "react"
import Link from "gatsby-link"

class Layout extends React.Component {
  render () {
    return (
      <div>
        <Link
          to="/"
        >
          Home
        </Link>
        <br />
        {this.props.children}
      </div>
    )
  }
}

export default Layout
```

Gatsbygram's layout component is somewhat more complicated than most
sites as it has logic to switch between showing images when clicked in
either a modal on larger screens or on their own page on smaller
screens.

[Read Gatsbygram's Layout component on
Github](https://github.com/gatsbyjs/gatsby/blob/1.0/examples/gatsbygram/layouts/default.js).

### Template components

![Gatsbygram detailed post page created using a template
component](template-page-screenshot.png)*Gatsbygram post detail page
created using a template component*

Gatsby 1.0 allows you to create pages programatically with an object that
looks like this:

```javascript
{
  path: slugify(node.id),
  component: postTemplate, // Absolute path to the template component.
  context: {
    id: node.id,
  },
}
```

These page objects are created in the site's `gatsby-node.js` using
Gatsby's lifecycle API `createPages`.

```javascript
const _ = require("lodash")
const Promise = require("bluebird")
const path = require("path")
const slug = require("slug")

// Implement the Gatsby API “createPages”. This is
// called after the Gatsby bootstrap is finished so you have
// access to any information necessary to programatically
// create pages.
exports.createPages = ({ args }) => (
  new Promise((resolve, reject) => {
    // The “graphql” function allows us to run arbitrary
    // queries against this Gatsbygram's graphql schema. Think of
    // it like Gatsbygram has a built-in database constructed
    // from static data that you can run queries against.
    const { graphql } = args
    const pages = []
    // Post is a data node type derived from data/posts.json
    // which is created when scrapping Instagram. “allPosts”
    // is a "connection" (a GraphQL convention for accessing
    // a list of nodes) gives us an easy way to query all
    // Post nodes.
    graphql(`
      {
        allPosts(limit: 1000) {
          edges {
            node {
              id
            }
          }
        }
      }
    `)
    .then(result => {
      if (result.errors) {
        console.log(result.errors)
        reject(result.errors)
      }

      // Create image post pages.
      const postPage = path.resolve(`pages/template-post-page.js`)
      // We want to create a detailed page for each
      // Instagram post. Since the scrapped Instagram data
      // already includes an ID field, we just use that for
      // each page's path.
      _.each(result.data.allPosts.edges, (edge) => {
        pages.push({
          // Each page is required to have a `path` as well
          // as a template component. The `context` is
          // optional but is often necessary so the template
          // can query data specific to each page.
          path: slug(edge.node.id),
          component: postPage,
          context: {
            id: edge.node.id,
          },
        })
      })

      resolve(pages)
    })
  })
)
```

Template components themselves are again just plain React.js components.
The optional context data you specify when creating pages is
automatically passed in as a prop to the component. They're also passed
as [GraphQL variables](http://graphql.org/learn/queries/#variables) so
you can easily write dynamic queries for additional information.

This is what Gatsbygram's post template component looks like:

```jsx
import React from 'react'
import PostDetail from '../components/post-detail'

class PostTemplate extends React.Component {
  render () {
    return (
      // PostDetail is used for this detail page and
      // also in the modal.
      <PostDetail post={this.props.data.posts} />
    )
  }
}

export default PostTemplate

// The post template's GraphQL query. Notice the “id”
// variable which is passed in. We set this on the page
// context in gatsby-node.js.
//
// All GraphQL queries in Gatsby are run at build-time and
// loaded as plain JSON files so have zero client cost.
export const pageQuery = `
  query PostPage($id: String!) {
    # Select the post which equals this id.
    posts(id: { eq: $id }) {
      # Specify the fields from the post we need.
      username
      likes
      id
      text
      # Date fields have special arguments. This one computes
      # how many weeks have passed since the post was created.
      # All calculations like this (like all GraphQL query
      # activity) happens at build-time! So has zero cost
      # for the client.
      weeksAgo: time(difference: "weeks")
      image {
        children {
          ... on ImageSharp {
            # Here we query for *multiple* image thumbnails to be
            # created. So with no effort on our part, 100s of
            # thumbnails are created. This makes iterating on
            # designs effortless as we simply change the args
            # for the query and we get new thumbnails.
            big: responsiveSizes(maxWidth: 640) {
              src
              srcSet
            }
          }
        }
      }
    }
  }
`
```

### React.js pages

Gatsby lets you build pages from individual React.js components. Like
template components, you can add GraphQL queries to query for data.

Gatsbygram has two React.js pages, `pages/index.js` and
`pages/about.js`. `about.js` is a simple React component with no query.
`index.js` is more complex as the frontpage of Gatsby queries for
thumbnails for all images and has an infinite scroll implementation to
lazy load in image thumbnails.

[Read pages/index.js on
Github](https://github.com/gatsbyjs/gatsby/blob/1.0/examples/gatsbygram/pages/index.js)  
[Read pages/about.js on
Github](https://github.com/gatsbyjs/gatsby/blob/1.0/examples/gatsbygram/pages/about.js)

## Client routing and pre-caching

Gatsby loads first a static server-rendered HTML page and then the
JavasScript to convert the site into a web application. Which means that
clicking around the site doesn't require a page reload.  Gatsby
*pre-caches* code and data needed for other pages so that clicking on a
link loads the next page near instantly.

All the setup for this is handled behind the scenes. Gatsby uses [React
Router](https://github.com/ReactTraining/react-router) under the hood
but generates all the configuration for you.

Normally page resources are pre-cached with a service worker. But as several
browsers (Safari/Microsoft Edge) still don't support Service Workers,
the Gatsby `<Link>` component (NPM package `gatsby-link`) pre-caches
resources for pages it links to.

## Plugins

Gatsby has always had a rich set of lifecycle APIs to allow you to hook
into various events during development, building, and in the client.

Gatsby 1.0 adds new APIs and also adds a [new plugin
architecture](/docs/plugins/). So functionality can now be extracted from sites
and made reusable. Most of the new functionality in Gatsby 1.0 is
powered by plugins.

Plugins are added to a site in its `gatsby-config.js`. Here's what
Gatsbygram's config file looks like:

```javascript
module.exports = {
  siteMetadata: {
    title: `Gatsbygram`,
  },
  plugins: [
    /*
     * Gatsby's data processing layer begins with “source”
     * plugins.  You can source data nodes from anywhere but
     * most sites, like Gatsbygram, will include data from
     * the filesystem so we start here with
     * “gatsby-source-filesystem”.
     *
     * A site can have as many instances of
     * gatsby-source-filesystem as you need.  Each plugin
     * instance is configured with a root path where it then
     * recursively reads in files and adds them to the data
     * tree.
     */
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/data`,
      },
    },
    // This plugin exposes helper functions for processing
    // images with the NPM package “sharp”. It's used by
    // several other plugins.
    `gatsby-plugin-sharp`,
    // This plugin identifies file nodes that are images and
    // extends these to create new "ImageSharp" nodes.
    `gatsby-parser-sharp`,
    // This plugin parses JSON file nodes.
    `gatsby-parser-json`,
    `gatsby-typegen-filesystem`,
    // This plugin adds GraphQL fields to the ImageSharp
    // GraphQL type. With them you can resize images and
    // generate sets of responsive images.
    `gatsby-typegen-sharp`,
    // This plugin sets up the popular css-in-js library
    // Glamor. It handles adding a Babel plugin and webpack
    // configuration as well as setting up optimized server
    // rendering and client rehydration.
    `gatsby-plugin-glamor`,
    // This plugin takes your configuration and generates a
    // web manifest file so Gatsbygram can be added to your
    // homescreen on Android.
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Gatsbygram`,
        short_name: `Gatsbygram`,
        start_url: `/`,
        background_color: `#f7f7f7`,
        theme_color: `#191919`,
        display: `minimal-ui`,
      },
    },
    // This plugin generates a service worker and AppShell
    // html file so the site works offline and is otherwise
    // resistent to bad networks. Works with almost any
    // site!
    `gatsby-plugin-offline`,
    // This plugin sets up Google Analytics for you.
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-91652198-1`,
      },
    },
  ],
}
```

## Styles

Gatsbygram uses two popular and complementary css-in-js libraries,
[Typography.js](https://github.com/KyleAMathews/typography.js) and
[Glamor](https://github.com/threepointone/glamor).

Typography.js is a powerful toolkit for building websites with beautiful
design.

Gatsbygram uses Typography.js to generate the *global* styles for the
site helping set the overall feel of the design.

Glamor is used for *component* styles. It lets you write *real CSS* in
JavaScript inside your React.js components.

Typography.js exposes two helper javascript functions, `rhythm` and
`scale` to help keep your design in sync as you make changes. Instead of
using hard-coded spacing values (which break as soon as you change your
global theme), you use the Typography.js helper functions e.g.

```jsx
import React from "react";
import { rhythm, scale } from "../utils/typography";

class SampleComponent extends React {
  render () {
    return (
      <div
        css={{
          // Use the css prop similar to the built-in “style” prop.
          padding: rhythm(1),
        }}
      >
        <h1
          css={{
            // Make this h1 slightly larger than normal. By default, h1
            // is set to a scale value of 1.
            ...scale(6/5),
          }}
        >
          My sweet title
        </h1>
        <p>Hello friends</p>
      </div>
    )
  }
}
```

Together they allow you to very quickly iterate on designs.

They also contribute to Gatsbygram's excellent loading speed. The holy
grail of CSS performance is *inlined critical CSS*. Meaning a) only ship
a page with the CSS necessary to render that page and b) inline it in
the `<head>` instead of putting it in a seperate file. There are various
tools to make this happen but they tend to involve extensive
configuration and heavy post-processing.

But with Typography.js and Glamor you get optimized CSS by default.
Typography.js (by definition) generates only global styles so its styles
are included on every page. Glamor includes some [very clever
server-rendering
optimizations](https://github.com/threepointone/glamor/blob/master/docs/server.md)
which I've implemented in the [Gatsby Glamor
plugin](/docs/packages/gatsby-plugin-glamor/) where it automatically
extracts out the CSS used *on the page being server rendered* and
automatically inlines those styles in the generated HTML page.

Super fast CSS for free.

## Creating your own Gatsbygram

It's easy to create your own "Gatsbygram" site from an Instagram
account.

### Instructions on setting up your own Gatsbygram site.

```bash
# Clone the Gatsby repo.
git clone -b 1.0 git@github.com:gatsbyjs/gatsby.git
cd gatsby/examples/gatsbygram
npm install

# Remove the committed scrapped Instagram data
rm -r data

# Scrape a new account
node scrape.js INSTAGRAM_USERNAME

# Wait for pictures to download...

# Start the Gatsby development server. The initial run will take extra
time as it processes images the first time.
gatsby develop
```

While writing this post I scrapped a few accounts and published their
resulting "gatsbygram" sites:

* https://iceland-gatsbygram.netlify.com
* https://tinyhouses-gatsbygram.netlify.com

**Help wanted:** scrape the user's profile picture and use that instead of my Gravitar
image which is hard-coded atm.
