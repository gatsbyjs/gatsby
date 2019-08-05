---
title: "Client-only routes & user authentication"
---

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

> Tip: For applications with complex routing, you may want to override Gatsby's default scroll behavior with the [shouldUpdateScroll](/docs/browser-apis/#shouldUpdateScroll) Browser API.

Check out the ["simple auth" example site](https://github.com/gatsbyjs/gatsby/blob/master/examples/simple-auth/README.md) for a demo implementing user authentication and restricted client-only routes.
