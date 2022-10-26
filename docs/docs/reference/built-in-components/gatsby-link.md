---
title: Gatsby Link API
---

For internal navigation, Gatsby includes a built-in `<Link>` component for creating links between internal pages and a `navigate` function for programmatic navigation.

## `<Link>` drives Gatsby's fast page navigation

The `<Link>` component drives a powerful performance feature called preloading. Preloading is used to prefetch page resources so that the resources are available by the time the user navigates to the page. We use the browser's [`Intersection Observer API`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to observe when a `<Link>` component enters the user viewport and then start a low-priority request for the linked page's resources. Then when a user moves their mouse over a link and the `onMouseOver` event is triggered, we upgrade the fetches to high-priority.

This two stage preloading helps ensure the page is ready to be rendered as soon as the user clicks to navigate.

Intelligent preloading like this eliminates the latency users experience when clicking on links in sites built in most other frameworks.

## How to use Gatsby Link

In any situation where you want to link between pages on the same site, use the `Link` component instead of an `a` tag. The two elements work much the same except `href` is now `to`.

```diff
-<a href="/blog">Blog</a>
+<Link to="/blog">Blog</Link>
```

A full example:

```jsx
import React from "react"
// highlight-next-line
import { Link } from "gatsby"

const Page = () => (
  <div>
    <p>
      {/* highlight-next-line */}
      Check out my <Link to="/blog">blog</Link>!
    </p>
    <p>
      {/* Note that external links still use `a` tags. */}
      Follow me on <a href="https://twitter.com/gatsbyjs">Twitter</a>!
    </p>
  </div>
)
```

### `Link` API surface area

Gatsby's `Link` component extends the `Link` component from [Reach Router](https://reach.tech/router/) to add useful enhancements specific to Gatsby.

The `to`, `replace`, `ref`, `innerRef`, `getProps` and `state` properties originate from Reach Router's `Link` component, so you should refer to the [Reach Router `Link` API reference documentation](https://reach.tech/router/api/Link) as the source of truth for those properties.

In addition, Gatsby adds the following properties:

| Argument          | Type    | Required | Description                                                                                                                     |
| ----------------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `activeStyle`     | Object  | No       | A style object that will be applied when the current item is active.                                                            |
| `activeClassName` | String  | No       | A class name that will be applied the current item is active.                                                                   |
| `partiallyActive` | Boolean | No       | Whether partial URLs are considered active (e.g. `/blog#hello-world` matches `<Link to="/blog">` if `partiallyActive` is true). |

Here's an example of how to use these additional properties:

```jsx
import React from "react"
import { Link } from "gatsby"

const IndexPage = () => (
  <Link
    to="/about"
    {/* highlight-start */}
    {/* You must define the `active` class in your CSS */}
    activeClassName="active"
    {/* highlight-end */}
  >
    About
  </Link>
  <Link
    to="/company"
    {/* highlight-next-line */}
    activeStyle={{ color: "blue" }}
  >
    Company
  </Link>
  <Link
    to="/blog"
    activeStyle={{ color: "green" }}
    {/* highlight-next-line */}
    partiallyActive={true} // `/blog#hello-world` matches now
  >
    Blog
  </Link>
)
```

## How to use the `navigate` helper function

Sometimes you need to navigate to pages programmatically, such as during form submissions. In these cases, `Link` won’t work. By default, `navigate` operates the same way as a clicked `Link` component.

```jsx
import React from "react"
import { navigate } from "gatsby" // highlight-line

const Form = () => (
  <form
    onSubmit={event => {
      event.preventDefault()

      // TODO: do something with form values
      // highlight-next-line
      navigate("/form-submitted/")
    }}
  >
    {/* (skip form inputs for brevity) */}
  </form>
)
```

### `navigate` API surface area

Gatsby re-exports the `navigate` helper function from [Reach Router](https://reach.tech/router/) for convenience.

Gatsby does not add extra surface area to this API, so you should refer to [Reach Router's `navigate` API reference documentation](https://reach.tech/router/api/navigate) as the source of truth.

### Navigate to the previous page

You can use `navigate(-1)` to go to a previously visited route. This is [Reach Router's](https://reach.tech/router/api/navigate) way of using `history.back()`. You can use any number as it uses [`history.go()`](https://developer.mozilla.org/en-US/docs/Web/API/History/go) under the hood. The `delta` parameter will be the number you pass in to `navigate()`.

## Add the path prefix to paths using `withPrefix`

It is common to host sites in a sub-directory of a site. Gatsby lets you [set
the path prefix for your site](/docs/how-to/previews-deploys-hosting/path-prefix/). After doing so, Gatsby's `<Link>` component will automatically handle constructing the correct URL in development and production.

For pathnames you construct manually, there's a helper function, `withPrefix` that prepends your path prefix in production (but doesn't during development where paths don't need to be prefixed).

```jsx
import { withPrefix } from "gatsby"

const IndexLayout = ({ children, location }) => {
  const isHomepage = location.pathname === withPrefix("/")

  return (
    <div>
      <h1>Welcome {isHomepage ? "home" : "aboard"}!</h1>
      {children}
    </div>
  )
}
```

## Reminder: use `<Link>` only for internal links!

This component is intended _only_ for links to pages handled by Gatsby. For links to pages on other domains or pages on the same domain not handled by the current Gatsby site, use the normal `<a>` element.

Sometimes you won't know ahead of time whether a link will be internal or not,
such as when the data is coming from a CMS.
In these cases you may find it useful to make a component which inspects the
link and renders either with Gatsby's `<Link>` or with a regular `<a>` tag
accordingly.

Since deciding whether a link is internal or not depends on the site in
question, you may need to customize the heuristic to your environment, but the
following may be a good starting point:

```jsx
import { Link as GatsbyLink } from "gatsby"

// Since DOM elements <a> cannot receive activeClassName
// and partiallyActive, destructure the prop here and
// pass it only to GatsbyLink
const Link = ({ children, to, activeClassName, partiallyActive, ...other }) => {
  // Tailor the following test to your environment.
  // This example assumes that any internal link (intended for Gatsby)
  // will start with exactly one slash, and that anything else is external.
  const internal = /^\/(?!\/)/.test(to)

  // Use Gatsby Link for internal links, and <a> for others
  if (internal) {
    return (
      <GatsbyLink
        to={to}
        activeClassName={activeClassName}
        partiallyActive={partiallyActive}
        {...other}
      >
        {children}
      </GatsbyLink>
    )
  }
  return (
    <a href={to} {...other}>
      {children}
    </a>
  )
}

export default Link
```

### Relative links

The `<Link />` component follows [the behavior of Reach Router](https://reach.tech/router/nesting) by ignoring trailing slashes and treating each page as if it were a directory when resolving relative links. For example if you are on either `/blog/my-great-page` or `/blog/my-great-page/` (note the trailing slash), a link to `../second-page` will take you to `/blog/second-page`.

### File Downloads

You can similarly check for file downloads:

```jsx
  const file = /\.[0-9a-z]+$/i.test(to)

  ...

  if (internal) {
    if (file) {
        return (
          <a href={to} {...other}>
            {children}
          </a>
      )
    }
    return (
      <GatsbyLink to={to} {...other}>
        {children}
      </GatsbyLink>
    )
  }
```

## Recommendations for programmatic, in-app navigation

If you need this behavior, you should either use an anchor tag or import the `navigate` helper from `gatsby`, like so:

```jsx
import { navigate } from 'gatsby';

...

onClick = () => {
  navigate('#some-link');
  // OR
  navigate('?foo=bar');
}
```

## Handling stale client-side pages

Gatsby's `<Link>` component will only fetch each page's resources once. Updates to pages on the site are not reflected in the browser as they are effectively "locked in time". This can have the undesirable impact of different users having different views of the content.

In order to prevent this staleness, Gatsby requests an additional resource on each new page load: `app-data.json`. This contains a hash generated when the site is built; if anything in the `src` directory changes, the hash will change. During page loads, if Gatsby sees a different hash in the `app-data.json` than the hash it initially retrieved when the site first loaded, the browser will navigate using `window.location`. The browser fetches the new page and starts over again, so any cached resources are lost.

However, if the page has previously loaded, it will not re-request `app-data.json`. In that case, the hash comparison will not occur and the previously loaded content will be used.

> **Note:** Any state will be lost during the `window.location` transition. This can have an impact if there is a reliance on state management, e.g. tracking state in [wrapPageElement](/docs/reference/config-files/gatsby-browser/#wrapPageElement) or via a library like Redux.

## Additional resources

- [Egghead lesson - "Why and How to Use Gatsby’s Link Component"](https://egghead.io/lessons/gatsby-why-and-how-to-use-gatsby-s-link-component)
- [Egghead lesson - "Add Custom Styles for the Active Link Using Gatsby’s Link Component"](https://egghead.io/lessons/gatsby-add-custom-styles-for-the-active-link-using-gatsby-s-link-component)
- [Egghead lesson - "Include Information About State in Navigation With Gatsby’s Link Component"](https://egghead.io/lessons/gatsby-include-information-about-state-in-navigation-with-gatsby-s-link-component)
- [Egghead lesson - "Replace Navigation History Items with Gatsby’s Link Component"](https://egghead.io/lessons/gatsby-replace-navigation-history-items-with-gatsby-s-link-component)
- [Egghead lesson - "Navigate to a New Page Programmatically in Gatsby"](https://egghead.io/lessons/gatsby-navigate-to-a-new-page-programmatically-in-gatsby)
- [Authentication tutorial for client-only routes](/tutorial/authentication-tutorial/)
- [Routing: Getting Location Data from Props](/docs/location-data-from-props/)
- [`gatsby-plugin-catch-links`](https://www.gatsbyjs.com/plugins/gatsby-plugin-catch-links/) to automatically intercept local links in Markdown files for `gatsby-link` like behavior
