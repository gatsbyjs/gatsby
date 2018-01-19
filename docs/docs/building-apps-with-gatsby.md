---
title: "Building apps with Gatsby"
---

Gatsby can be used to create fully dynamic apps. The default Gatsby app is made up of statically rendered pages. On this foundation, you can build what we call "hybrid" sites which adds dynamically rendered sections of pages and if needed, client-only routes. 

## Statically rendered pages

This is what Gatsby does by default. You create [components (layouts/pages/templates)](/docs/building-with-components/) that render [data you ask for in your GraphQL queries](/docs/querying-with-graphql/). Each page component is rendered to HTML when you build your Gatsby site as well as in the client as people click around the site.

Content and behaviors on the page will look and act the same for every visitor until the next time you build the site.

## Dynamic sections of pages

When your React components load in the browser, they can fetch and render data from APIs. The [React docs have a simple example of how to do this.](https://reactjs.org/docs/faq-ajax.html)

Some examples of how you could use this:

* Load live data e.g. sports scores or the weather
* Load data personalized to the user
* Create interactive widgets e.g. allow a user to do searches or submit forms

## Client-only routes

Sometimes you want to create client-only portions of a site. A classic example would be a site that has a landing page, a login page, and then an app section for logged-in users. The logged-in section doesn't need to be server rendered as all data will be loaded live from your API after the user logs so it makes sense to make this portion of your site client-only.

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
