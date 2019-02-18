---
title: "Building Apps with Gatsby"
---

Gatsby is an excellent framework for building web apps. You can use Gatsby to create personalized, logged-in experiences with two different approaches.

1.  "hybrid" app pages, and
2.  client-only routes & user authentication

## Hybrid app pages

When a visitor lands on a Gatsby page, the page's HTML file is loaded first, then the JavaScript bundle; When your React components load in the browser, they can fetch and render data from APIs.

> 💡 The [React docs](https://reactjs.org/docs/faq-ajax.html) have a great, straightforward example demonstrating this approach.

Some examples of how you could apply this:

- A news site with live data like sports scores or the weather
- An e-commerce site with universal product pages and category pages, but also personalized recommendation sections

You can also use your React components to create interactive widgets e.g. allow a user to do searches or submit forms. Because Gatsby is just React, it's easy to blend static and interactive/dynamic models of building web sites.

## Client-only routes & user authentication

Often you want to create a site with client-only portions that are gated by authentication.

A classic example would be a site that has a landing page, various marketing pages, a login page, and then an app section for logged-in users. The logged-in section doesn't need to be server rendered as all data will be loaded live from your API after the user logs in. So it makes sense to make this portion of your site client-only.

Gatsby uses [@reach/router](https://reach.tech/router/) under the hood. You should use @reach/router to create client-only routes.

These routes will exist on the client only and will not correspond to index.html files in an app's built assets. If you'd like site users to be able to visit client routes directly, you'll need to set up your server to handle those routes appropriately.

To create client-only routes, add the following code to your site’s `gatsby-node.js` file:

```javascript:title=gatsby-node.js
// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions

  // page.matchPath is a special key that's used for matching pages
  // only on the client.
  if (page.path.match(/^\/app/)) {
    page.matchPath = "/app/*"

    // Update the page.
    createPage(page)
  }
}
```

> 💡 Note: There's also a plugin to simplify the creation of client-only routes in your site:
> [gatsby-plugin-create-client-paths](/packages/gatsby-plugin-create-client-paths/).

Check out the ["simple auth" example site](https://github.com/gatsbyjs/gatsby/blob/master/examples/simple-auth/README.md) for a demo implementing user authentication and restricted client-only routes.
