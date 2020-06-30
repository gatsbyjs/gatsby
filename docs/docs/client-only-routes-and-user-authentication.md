---
title: Client-only Routes
---

Most Gatsby pages exist as static HTML that is generated during build time. Components on the page are [hydrated](/docs/react-hydration/) at runtime to add interactivity. This makes pages load fast and makes them visible to search engines. There are, however, situations when server-side, static HTML is not needed or possible:

- You may have pages that require the user to log in. These pages should not be visible to search engines. An example might be a list of the user's latest purchases.
- The set of available pages might not be known at build time. For example, your site might be loading a list of newly signed up users on the client side. Offering a profile page for each user on the server side is not possible because the set of users is not known when building.

These use cases are handled by _client-only routes_. Client-only routes do not each have a generated HTML file. They exist only on client side, in the same way that single-page applications (SPAs) work.

Setting up client-only routes involves two steps:

- Creating a router page that routes requests to the right component
- Making sure the router page is invoked when the user visits the address of any of the routes

## Example

Consider the following site. It consists of a home page accessible to all users as well as profile and detail pages that are only accessible to logged in users.

The profile and detail pages are the client-side routes. These are handled by a component called `App`. There is a single `app/index.html` that handles both the profile and detail pages.

![Site with a static homepage and client-only routes](./images/client-only-routes.png)

The profile and detail pages use an API to retrieve and update data about the current user. This API requires authentication.

Since the user needs to log in, there is also a login page (that is not part of the diagram).

## Adding a routing page

First, create `App`, the page that performs routing to `Profile` and `Details`.

The following code sets up the routing:

```jsx:title=src/pages/app.js
import React from "react"
import { Router } from "@reach/router" // highlight-line
import Layout from "../components/Layout"
import Profile from "../components/Profile"
import Details from "../components/Details"
import Login from "../components/Login"

const App = () => (
  <Layout>
    // highlight-start
    <Router basepath="/app">
      <Profile path="/profile" />
      <Details path="/details" />
      <Login path="/login" />
    </Router>
    // highlight-end
  </Layout>
)

export default App
```

Gatsby uses [@reach/router](https://reach.tech/router/) for routing internally. You can use another routing solution but it is sensible to only have a single one throughout the system.

When the page loads, Reach Router looks at the `path` property of each component under `<Router />` and renders the first one to match the current address. You can also use wildcards in the `path`. For details, see [@reach/router documentation](https://reach.tech/router/api/Router).

In the case of the `/app/profile` path, the `Profile` component will be rendered, as it matches the base path (`/app`) followed by the child's path (`/profile`).

Note that the `basepath` must match the URL of the router page. If your site is not hosted on `/` but rather uses a [path prefix](/docs/path-prefix/), you should also include the path prefix, e.g. `` <Router basepath={`${__PATH_PREFIX__}/app`> `` (`__PATH_PREFIX__` is a global variable containing the configured path prefix).

If your client-only routes require authentication, you will also need to redirect unauthenticated users to the login page. [Building a Site with Authentication](/docs/building-a-site-with-authentication) describes how to do this.

## Mapping URLs to the router page

With the above code the user can navigate from `Home` to `Profile`. But if the user manually enters the URL `/app/profile` they get a 404 page. This is because the server does not know how to resolve this URL.

There are two ways of addressing this:

### Configuring pages with `matchPath`

You can use the [`matchPath` parameter](/docs/gatsby-internals-terminology/#matchpath) on the router page to specify a URL pattern it should map to.

This is done using the following code in your site’s `gatsby-node.js` file:

```javascript:title=gatsby-node.js
exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions

  // The page `/app`...
  if (page.path.match(/^\/app/)) {
    // ... should be invoked any time there is a URL starting with `/app/`
    page.matchPath = "/app/*"

    createPage(page)
  }
}
```

This configures the `/app` page, setting `matchPath` to the pattern `/app/*`. Thereby, `/app/profile`, `/app/details` etc will all render using the `/app` page.

When you use `matchPath` the user will reach the 404 page before the client-side router kicks in. This solution therefore requires you to have a working 404 page.

> 💡 Note: You can alternatively use the plugin [gatsby-plugin-create-client-paths](/packages/gatsby-plugin-create-client-paths/) to simplify this configuration.

### Performing address rewrites on the server

An alternative to using `matchPath` is to configure address rewriting on your web server. This is generally only possible if you host the webserver yourself and have complete control over it.

In this case you would set up rewrite rules that make sure that when e.g. `/app/profile` is loaded, the server actually returns `/app/index.html`.

Note that this is not the same as a redirect. If you redirect to `/app/index.html` the user will not see the profile page.
The response code should be a 200 ("OK"), not a 301 ("moved").

Most web servers and reverse proxies offer facilities for such rewrites but the exact configuration depends on the server. If you are using NGINX you can achieve the rewrite using [`try_files`](https://docs.nginx.com/nginx/admin-guide/web-server/serving-static-content/#trying-several-options). On Apache, you would use [mod_rewrite](https://httpd.apache.org/docs/current/mod/mod_rewrite.html).

## Additional resources

- [Gatsby repo "simple auth" example](https://github.com/gatsbyjs/gatsby/blob/master/examples/simple-auth/) - a demo implementing user authentication and restricted client-only routes
- [Live version of the "simple auth" example](https://simple-auth.netlify.app/)
- [The Gatsby store](https://github.com/gatsbyjs/store.gatsbyjs.org) which also implements an authenticated flow
