---
title: "Building apps with Gatsby"
---

Gatsby is an excellent framework for building web apps. You can use Gatsby to create personalized, logged-in experiences with two different methods.

The first approach is to build "hybrid" app pages which are statically rendered with dynamic sections. The second is, if needed, add client-only multi-page sections of the site.

## Hybrid app pages

With this method, Gatsby renders the initial page with shared page content -- then when your React components load in the browser, they can fetch and render data from APIs. The [React docs have a simple example of how to do this.](https://reactjs.org/docs/faq-ajax.html)

Some examples of how you could use this:

* A news site with live data like sports scores or the weather
* An e-commerce site with universal product pages and category pages, but also personalized recommendation sections

You can also use your React components to create interactive widgets e.g. allow a user to do searches or submit forms. Because Gatsby is just React, it's easy to blend static and interactive/dynamic models of building web sites.

## Client-only routes

Often you want to create a site with client-only portions that are gated by authentication.

A classic example would be a site that has a landing page, various marketing pages, a login page, and then an app section for logged-in users. The logged-in section doesn't need to be server rendered as all data will be loaded live from your API after the user logs so it makes sense to make this portion of your site client-only.

These routes will exist on the client only and will not correspond to index.html files in an app's built assets. If you wish people to visit client routes directly, you'll need to setup your server to handle these correctly.

To create client-only routes, you want to add code to your site's `gatsby-node.js` like the following:

_Note: There's also a plugin that can aid in creating client-only routes:
[gatsby-plugin-create-client-paths](/packages/gatsby-plugin-create-client-paths/)_.

```javascript
// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = async ({ page, boundActionCreators }) => {
  const { createPage } = boundActionCreators;

  // page.matchPath is a special key that's used for matching pages
  // only on the client.
  if (page.path.match(/^\/app/)) {
    page.matchPath = "/app/:path";

    // Update the page.
    createPage(page);
  }
};
```
