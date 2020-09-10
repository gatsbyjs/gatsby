# gatsby-a11y-helpers

Helper components that make Gatsby more accessible, specifically in respect to client-side routing.

**NOTE: ** All components from this package are exported from [`gatsby`](/packages/gatsby) package. You should not import anything from this package directly.

**[Demo](https://using-gatsby-a11y-helpers.gatsbyjs.org)**

## Table of Contents

- [RouteAnnouncement](#routeannouncement)
- [RouteFocus](#routefocus)

## `RouteAnnouncement`

In January 2020, Gatsby released [improvements to the way it implements client side routing](https://www.gatsbyjs.com/blog/2020-02-10-accessible-client-side-routing-improvements) based on [research](https://www.gatsbyjs.com/blog/2019-07-11-user-testing-accessible-client-routing/) conducted with [Fable Labs](https://www.makeitfable.com/). These changes alert assitive technologies to route changes by inferring relevant information from the new page (either the page `<h1>`, `<title>`, or url).

### Problem

These improvements were always intended to be a starting point. In [#19290](https://github.com/gatsbyjs/gatsby/pull/19290), Announcements are all prepended with the words "Navigated to ", which [isn't localized](https://github.com/gatsbyjs/gatsby/issues/20801). Additionally, this doesn't follow the established screen reader pattern of announcing the page title alone on page change.

Developers should [have control over the information sent to assistive technologies](https://github.com/gatsbyjs/gatsby/issues/21059) instead of Gatsby guessing at which information is unique to the current page and therefore most illustrative of the user's current location.

### Solution

With the `RouteAnnouncement` component, developers can wrap content and tell Gatsby exactly what should be sent to assistive technologies on client-side route changes. Gatsby looks for this element when it navigates to a new page and outputs its contents to Gatsby's built-in Route Announcer.

This component can be used multiple times in a site (e.g. implemented to always use page title in a general Layout.js file and then overridden in specific pages or posts for custom announcements) and Gatsby will use the last-rendered instance. If the announcement should be different from the page's `<title>`, Gatsby makes it easy to change without visually displaying that custom text with a visuallyHidden flag. If the announcement should _always_ use the page's `<title>`, RouteAnnouncement's `useTitle` attribute allows developers to explicitly say so.

#### Usage

This is what a general Layout component using `RouteAnnouncer` could look like:

```jsx
import React from "react"
import { RouteAnnouncer } from "gatsby"
import Header from "./header"
import Footer from "./footer"

export default ({ children }) => (
  <div>
    <Header />
    <RouteAnnouncement useTitle={true} />
    <main>{children}</main>
    <Footer />
  </div>
)
```

If you wanted to override this behavior and announce something else in other cases (e.g. in blog posts), you can add another instance nested inside of the more general instance. So in our blog post example below, there is a `RouteAnnouncer` in the `Layout` component and then another inside of the `BlogPost` component.

```jsx
import React from "react"
import { RouteAnnouncer } from "gatsby"
import Layout from "./layout"
import PostContent from "./post-content"

const blogPost = ({ data }) => {
  { title, html } = data.post
  return (
    <Layout>
      <RouteAnnouncement><h1>{title}</h1></RouteAnnouncement>
      <PostContent content={html} />
    </Layout>
  )
}
```

If you want to further customize this and announce something specifically just for assistive technology users without displaying it on the page, you can use the `visuallyHidden` flag:

```jsx
import React from "react"
import { RouteAnnouncer } from "gatsby"
import Layout from "./layout"
import GenericContent from "./generic-content"

const specialPage = ({ data }) => {
  { title, html } = data.post
  return (
    <Layout>
      <RouteAnnouncement visuallyHidden={true}>welcome to the special page!</RouteAnnouncement>
      <h1>Hello!</h1>
      <GenericContent />
    </Layout>
  )
}
```

#### `RouteAnnouncement` props

| Name             | Type   | Description                                                                                |
| ---------------- | ------ | ------------------------------------------------------------------------------------------ |
| `useTitle`       | `bool` | tells Gatsby's internal Route Announcer to announce page `<title>` content on route change |
| `visuallyHidden` | `bool` | visually hides content wrapped inside of the `RouteAnnouncement`                           |

## `RouteFocus`

Client-side routing is a two-part problem for accessibility. One half of that problem is solved by [announcing route changes](https://github.com/gatsbyjs/gatsby/pull/19290). The other half requires developers to manage focus to ensure that all users are provided enough context about their current position within the new page.

When Gatsby implemented `@reach/router`, the research at the time recommended setting user focus on a wrapping div. This is the behavior that was [implemented](https://github.com/gatsbyjs/gatsby/pull/13197).

### Problem

Further research was conducted athte Inclusive Design 24 virtual conference in October 2019 and, new [techniques were developed](https://www.youtube.com/watch?v=Tr21FqQQv-U) to support a wider variety of workflows and disabilities.

The new recommendation for focus is to "Provide a skip link that takes focus on a route change within the site, with a label that indicates what the link will do when activated: e.g. "skip to main navigation"."

### Solution

In Gatsby's [updates to its client-side routing recommendations blog post](https://www.gatsbyjs.com/blog/2019-07-11-user-testing-accessible-client-routing/#updating-our-approach-in-gatsby-and-react), it says:

> The most accessible and best performing pattern will likely be an opt-in component where the developer can specify where the control should go in the DOM and how it should be labeled.

The `RouteFocus` component gives developers control over where focus should be sent when a new client-side route is hit. We recommend wrapping a small, actionable element, ideally a skip link component, to give users the best experience. Gatsby detects `RouteFocus` on page change and sends focus there, unless focus is already managed by the developer (e.g. in [Gatsby's `@reach/skip-nav` example we send focus to the skip link in `gatsby-browser.js`](https://github.com/gatsbyjs/gatsby/blob/master/examples/using-reach-skip-nav/gatsby-browser.js#L2)).

#### Usage

```jsx
import React from "react"
import { RouteFocus } from "gatsby"
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav"
import Header from "./header"
import Footer from "./footer"

const Layout = ({ children }) => (
  <div>
    <RouteFocus>
      <SkipNavLink />
    </RouteFocus>
    <Header /> //main navigation lives here
    <SkipNavContent />
    <main>{children}</main>
    <Footer />
  </div>
)
```
