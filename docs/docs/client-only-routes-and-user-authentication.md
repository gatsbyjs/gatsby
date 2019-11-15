---
title: Client-only Routes & User Authentication
---

Often you want to create a site with client-only portions that are gated by authentication.

A classic example would be a site that has a landing page, various marketing pages, a login page, and then an app section for logged-in users. The logged-in section doesn't need to be server rendered as all data will be loaded live from your API after the user logs in. So it makes sense to make this portion of your site client-only.

Gatsby uses [@reach/router](https://reach.tech/router/) under the hood. You should use @reach/router to create client-only routes.

These routes will exist on the client only and will not correspond to index.html files in an app's built assets. If you'd like site users to be able to visit client routes directly, you'll need to set up your server to handle those routes appropriately.
> see explanation below

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

Check out the ["simple auth" example site](https://github.com/gatsbyjs/gatsby/blob/master/examples/simple-auth/) for a demo implementing user authentication and restricted client-only routes.

### Configuring A Server To Handle Client Side Routes
As explained earlier, in order to access client side routes directly (on a page refresh or accessing a bookmarked page) your static site server will need to be configuired. 

While there are many different static servers you can work with, a typical way to handle accessing client side routes directly is to watch for requests that match the client side routes and return the appropriate file that is responsible for rendering that page. 

For example the client side route `/app/:id` could make a server request to `/app/why-gatsby-is-awesome` during a page refresh. The server would not be able to respond correctly since there is no document in its file system for `/app/why-gatsby-is-awesome.html` or `/app/why-gatsby-is-awesome/index.html`. 

The server should be configured to respond with `/app/index.html` which has all the react code to subsequently render the client sided routes correctly. Keep in mind this __translation__ or ___path rewrite___ should return http __200__ and not a __301__

