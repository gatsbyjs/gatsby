# gatsby-link

A `<Link>` component for Gatsby.

It's a wrapper around
[React Router's Link component](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/Link.md)
that adds enhancements specific to Gatsby. All props are passed through to React
Router's Link.

You can set the `activeStyle` or `activeClassName` prop to add styling
attributes to the rendered element when it matches the current URL, and Gatsby
also supports React Router's props `exact`, `strict`, `isActive`, and
`location`. If any of these props are set, then
[React Router's NavLink component](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/NavLink.md)
will be used instead of the default `Link`.

Gatsby does per-route code splitting. This means that when navigating to a new
page, the code chunks necessary for that page might not be loaded. This is bad.
Any unnecessary latency when changing pages should be avoided. So to avoid that
Gatsby preloads code chunks and page data.

Preloading is triggered by a link entering the viewport; Gatsby uses
`Link`/`NavLink`'s `innerRef` property to create a new InteractionObserver (on
supported browsers) to monitor visible links. This way, Gatsby only prefetches
code/data chunks for pages the user is likely to navigate to. You can also get
access to the link element by passing in a `innerRef` prop.

## Install

`npm install --save gatsby-link`

## How to use

In JavaScript:

```jsx
import Link from "gatsby-link"

render () {
  <div>
    <Link
      to="/another-page/"
      activeStyle={{
        color: 'red'
      }}
      innerRef={(el) => { this.myLink = el }}
    >
    Another page
    </Link>
  </div>
}
```

## Programmatic navigation

For cases when you can only use event handlers for navigation, you can use
`navigateTo`:

```jsx
import { navigateTo } from "gatsby-link"

render () {
  <div onClick={ () => navigateTo('/example')}>
    <p>Example</p>
  </div>
}
```

## Prefixed paths helper

Gatsby allows you to [automatically prefix links](/docs/path-prefix/) for sites
hosted on GitHub Pages or other places where your site isn't at the root of the
domain.

This can create problems during development as pathnames won't be prefixed. To
handle both, gatsby-link exports a helper function `withPrefix` that prepends
the prefix during production but doesn't in development.

This is only for pathnames you're constructing manually. The `<Link>` component
handles prefixing automatically.

```jsx
import { withPrefix } from "gatsby-link";

const IndexLayout = ({ children, location }) => {
  const isHomepage = location.pathname === withPrefix("/");

  return (
    <div>
      <h1>Welcome {isHomepage ? "home" : "aboard"}!</h1>
      {children()}
    </div>
  );
};
```

## For internal links only!

Note that this component is intended only for links to pages handled by Gatsby.

If the `to` prop is on a different domain (such as a full off-site URL) the
behavior is undefined, and the user will likely not be taken to the expected
location.
Links will fail similarly if the `to` prop points somewhere on the same domain
but handled by something other than Gatsby (which may be the case if your server
proxies requests for certain paths to a different application).

Sometimes you won't know ahead of time whether a link will be internal or not,
such as when the data is coming from a CMS.
In these cases you may find it useful to make a component which inspects the
link and renders either with `gatsby-link` or with a regular `<a>` tag
accordingly.
Since deciding whether a link is internal or not depends on the site in
question, you may need to customize the heuristic to your environment, but the
following may be a good starting point:

```jsx
import GatsbyLink from "gatsby-link";

const Link = ({ children, to, ...other }) => {
  // Tailor the following test to your environment.
  // This example assumes that any internal link (intended for Gatsby)
  // will start with exactly one slash, and that anything else is external.
  const internal = /^\/(?!\/)/.test(to);

  // Use gatsby-link for internal links, and <a> for others
  if (internal) {
    return <GatsbyLink to={to} {...other}>{children}</GatsbyLink>;
  }
  return <a href={to} {...other}>{children}</a>;
};

export default Link;
```
