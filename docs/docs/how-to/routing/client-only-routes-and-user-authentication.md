---
title: Client-only Routes & User Authentication
---

Often you want to create a site with client-only portions, which allows you to gate them by authentication or load different content based on URL parameters.

## Understanding client-only routes

A classic example would be a site that has a landing page, various marketing pages, a login page, and then an app section for logged-in users. The logged-in section doesn't need to be server rendered as all data will be loaded live from your API after the user logs in. So it makes sense to make this portion of your site client-only.

Client-only routes will exist on the client only and will not correspond to `index.html` files in an app's built assets. If you'd like site users to be able to visit client routes directly, you need to [set up your site to handle those routes](#handling-client-only-routes-with-gatsby) appropriately. Or, if you have control over the configuration of the file server yourself (instead of using another static file host like Netlify), you can [set up the server](#configuring-and-handling-client-only-routes-on-a-server) to handle these routes.

A sample site might be set up like this:

![Site with a static homepage and client-only routes](../../images/client-only-routes.png)

Gatsby converts components in the `pages` folder into static HTML files for the Home page and the App page. A `<Router />` is added to the App page so that the profile and details components can be rendered from the App page; they don't have static assets built for them because they exist only on the client. The profile page can `POST` data about a user back to an API, and the details page can dynamically load data about a user with a specific id from an API.

## Handling client-only routes with Gatsby

Gatsby uses [@reach/router](https://reach.tech/router/) under the hood. This means you don't need to install it separately and it is the recommended approach to create client-only routes.

You first need to set up routes on a page that is built by Gatsby. You can see the routes added to `src/pages/app.js` in the code example below:

```jsx:title=src/pages/app.js
import React from "react"
import { Router } from "@reach/router" // highlight-line
import Layout from "../components/Layout"
import Profile from "../components/Profile"
import Details from "../components/Details"
import Login from "../components/Login"
import Default from "../components/Default"

const App = () => {
  return (
    <Layout>
      // highlight-start
      <Router basepath="/app">
        <Profile path="/profile" />
        <Details path="/details" />
        <Login path="/login" />
        <Default path="/" />
      </Router>
      // highlight-end
    </Layout>
  )
}

export default App
```

Briefly, when a page loads, Reach Router looks at the `path` prop of each component nested under `<Router />`, and chooses _one_ to render that best matches `window.location` (you can learn more about how routing works from the [@reach/router documentation](https://reach.tech/router/api/Router)). In the case of the `/app/profile` path, the `Profile` component will be rendered, as its prefix matches the base path of `/app`, and the remaining part is identical to the child's path.

### Adjusting routes to account for authenticated users

With [authentication set up](/docs/how-to/adding-common-features/building-a-site-with-authentication) on your site, you can create a component like a `<PrivateRoute/>` to extend the example above and gate content:

```jsx:title=src/pages/app.js
import React from "react"
import { Router } from "@reach/router"
import Layout from "../components/Layout"
import Profile from "../components/Profile"
import Details from "../components/Details"
import Login from "../components/Login"
import Default from "../components/Default"
import PrivateRoute from "../components/PrivateRoute" // highlight-line

const App = () => {
  return (
    <Layout>
      <Router basepath="/app">
        // highlight-start
        <PrivateRoute path="/profile" component={Profile} />
        <PrivateRoute path="/details" component={Details} />
        // highlight-end
        <Login path="/login" />
        <Default path="/" />
      </Router>
    </Layout>
  )
}

export default App
```

The `<PrivateRoute />` component would look something like this one (taken from the [Authentication Tutorial](/tutorial/authentication-tutorial/#controlling-private-routes), which implements this behavior):

```jsx:title=src/components/PrivateRoute.js
// import ...
import React from "react"
import { navigate } from "gatsby"
import { isLoggedIn } from "../services/auth"

const PrivateRoute = ({ component: Component, location, ...rest }) => {
  if (!isLoggedIn() && location.pathname !== `/app/login`) {
    navigate("/app/login")
    return null
  }

  return <Component {...rest} />
}

export default PrivateRoute
```

### Configuring pages with `matchPath`

To ensure that users can navigate to client-only routes directly, pages in your site need to have the [`matchPath` parameter](/docs/gatsby-internals-terminology/#matchpath) set. Add the following code to your site’s `gatsby-node.js` file:

```javascript:title=gatsby-node.js
// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions

  // Only update the `/app` page.
  if (page.path.match(/^\/app/)) {
    // page.matchPath is a special key that's used for matching pages
    // with corresponding routes only on the client.
    page.matchPath = "/app/*"

    // Update the page.
    createPage(page)
  }
}
```

> 💡 Note: There's also a plugin to simplify the creation of client-only routes in your site:
> [gatsby-plugin-create-client-paths](/plugins/gatsby-plugin-create-client-paths/).

The above code (as well as the `gatsby-plugin-create-client-paths` plugin) updates the `/app` page at build time to add the `matchPath` parameter in the page object to make it so that the configured pages (in this case, everything after `/app`, like `/app/dashboard` or `/app/user`) can be navigated to by Reach Router.

_Without_ this configuration set up, a user that clicks on a link to `<yoursite.com>/app/user` will instead be routed to the static `/app` page instead of the component or page you have set up at `/app/user`.

> Tip: For applications with complex routing, you may want to override Gatsby's default scroll behavior with the [shouldUpdateScroll](/docs/reference/config-files/gatsby-browser/#shouldUpdateScroll) Browser API.

## Configuring and handling client-only routes on a server

If you are hosting on your own server, you can opt to configure the server to handle client-only routes instead of using the `matchPath` method explained above.

Consider the following router and route to serve as an example:

```jsx:title=src/pages/app.js
<Router basepath="/app">
  <Route path="/why-gatsby-is-awesome" />
</Router>
```

In this example with a router and a single route for `/app/why-gatsby-is-awesome/`, the server would not be able to complete this request as `why-gatsby-is-awesome` is a client-side route. It does not have a corresponding HTML file on the server. The file found at `/app/index.html` on the server contains all the code to handle the page paths after `/app`.

A pattern to follow, agnostic of server technology, is to watch for these specific routes and return the appropriate HTML file.

In this example, when making a `GET` request to `/app/why-gatsby-is-awesome`, the server should respond with `/app/index.html` and let the client handle the rendering of the route with the matching path. It is important to note that the response code should be a **200** (an OK) and not a **301** (a redirect). This can be done with NGINX using [`try_files`](https://docs.nginx.com/nginx/admin-guide/web-server/serving-static-content/#trying-several-options), or an [equivalent directive](https://serverfault.com/questions/290784/what-is-apaches-equivalent-of-nginxs-try-files) if using Apache.

One result of this method is that the client is completely unaware of the logic on the server, decoupling it from Gatsby.

## Additional resources

- [Gatsby repo "simple auth" example](https://github.com/gatsbyjs/gatsby/blob/master/examples/simple-auth/) - a demo implementing user authentication and restricted client-only routes
- [Live version of the "simple auth" example](https://simple-auth.netlify.app/)
- [The Gatsby store](https://github.com/gatsbyjs/store.gatsbyjs.org) which also implements an authenticated flow
