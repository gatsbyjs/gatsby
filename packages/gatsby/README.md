[![Travis CI Build Status](https://travis-ci.org/gatsbyjs/gatsby.svg?branch=master)](https://travis-ci.org/gatsbyjs/gatsby)
[![npm package](https://img.shields.io/npm/v/gatsby.svg?style=flat-square)](https://www.npmjs.org/package/gatsby)
[![gatsby channel on discord](https://img.shields.io/badge/discord-gatsby%40reactiflux-738bd7.svg?style=flat-square)](https://discord.gg/0ZcbPKXt5bVoxkfV)
[![Twitter Follow](https://img.shields.io/twitter/follow/gatsbyjs.svg?style=social)](https://twitter.com/gatsbyjs)

<img alt="Gatsby" src="https://www.gatsbyjs.org/monogram.svg" width="100">

# Gatsby

⚛️📄🚀 Blazing-fast static site generator for React

## Link

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

`npm install --save gatsby`

## How to use

In JavaScript:

```jsx
import { Link } from "gatsby"

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
import { navigateTo } from "gatsby"

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
import { withPrefix } from "gatsbys";

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

## Docs

**[View the docs on gatsbyjs.org](https://www.gatsbyjs.org/docs/)**

[Migrating from v0 to v1?](https://www.gatsbyjs.org/docs/migrating-from-v0-to-v1/)

[v0 docs](/v0-README.md)

## Packages

This repository is a monorepo managed using
[Lerna](https://github.com/lerna/lerna). This means that we publish
[many packages](/packages) to NPM from the same codebase.

## Thanks

Thanks to our many contributors and sponsors as well as the companies sponsoring
our testing and hosting infrastructure, Travis CI, Appveyor, and Netlify.

## Backers

Support us with a monthly donation and help us continue our activities.
[[Become a backer](https://opencollective.com/gatsby#backer)]

<a href="https://opencollective.com/gatsby/backer/0/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/1/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/2/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/3/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/4/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/5/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/6/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/7/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/8/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/9/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/10/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/10/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/11/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/11/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/12/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/12/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/13/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/13/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/14/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/14/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/15/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/15/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/16/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/16/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/17/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/17/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/18/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/18/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/19/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/19/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/20/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/20/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/21/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/21/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/22/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/22/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/23/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/23/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/24/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/24/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/25/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/25/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/26/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/26/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/27/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/27/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/28/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/28/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/29/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/29/avatar.svg"></a>

## Sponsors

Become a sponsor and get your logo on our README on GitHub with a link to your
site. [[Become a sponsor](https://opencollective.com/gatsby#sponsor)]

<a href="https://opencollective.com/gatsby/sponsor/0/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/1/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/2/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/3/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/4/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/5/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/6/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/7/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/8/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/9/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/10/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/11/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/12/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/12/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/13/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/13/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/14/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/14/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/15/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/15/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/16/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/16/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/17/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/17/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/18/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/18/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/19/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/19/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/20/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/20/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/21/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/21/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/22/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/22/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/23/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/23/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/24/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/24/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/25/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/25/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/26/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/26/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/27/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/27/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/28/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/28/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/29/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/29/avatar.svg"></a>
