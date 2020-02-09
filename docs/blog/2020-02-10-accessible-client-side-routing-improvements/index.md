---
title: "Accessibility Improvements to Client Side Routing in Gatsby - Available in 2.19.8"
date: 2020-02-10
author: "Madalyn Parker"
excerpt: "We recently released accessibility improvements to client side routing, enabling screen reader users to successfully navigate sites built with Gatsby."
tags: ["accessibility, client-side-routing, diversity-and-inclusion"]
---

We recently released accessibility improvements to client side routing in Gatsby core, building on previous focus management improvements [released in version 2.13.2](https://github.com/gatsbyjs/gatsby/pull/13197). These improvements enable people relying on screen readers to successfully navigate sites built with Gatsby. If you'd like an in-depth look at how we made incremental changes to get to this release, have a look at the conversation in this [issue about assistive technology and navigation](https://github.com/gatsbyjs/gatsby/issues/5581). It was opened way back in May 2018.

In July of 2019, Marcy Sutton teamed up with [Fable Tech Labs](https://www.makeitfable.com/) to conduct user testing to determine the best user experience for navigating JavaScript applications. Marcy wrote a thorough [blog post](/blog/2019-07-11-user-testing-accessible-client-routing/) about that research. This left us with some concrete recommendations to execute on:

- Provide a skip link that takes focus on a route change within the site, with a label that indicates what the link will do when activated: e.g. “skip to main navigation”.
- Include an [ARIA Live Region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) on page load. On a route change, append text to it indicating the current page, e.g. “Portfolio page”.

## Some Background

Our first step to addressing focus management (the first recommendation, above) was [switching](/blog/2018-09-27-reach-router/) to [`@reach/router`](https://reach.tech/router). This got us part of the way there out-of-the-box. However, Gatsby’s implementation of `@reach/router` isn’t idiomatic in that Gatsby puts everything on a single, catch-all route. This means that every page is technically on the same route and route changes weren’t getting picked up by `@reach/router`. Our improvements in [2.13.2](https://github.com/gatsbyjs/gatsby/pull/13197) made sure that every time a route changed, we reset focus on a wrapping `div`. These changes also ensure that our single, catch-all route is dynamic so we can register changes and take advantage of `@reach/router’s` strengths. Both of these changes were a major improvement for most users, but because some assistive technologies (NVDA and VoiceOver in particular) were still not working, we kept [issue 5581](https://github.com/gatsbyjs/gatsby/issues/5581) open and continued to make incremental changes over time.

While this work prioritizes screen reader users, we are still far from the most accessible solution for other disabilities. For example, users who rely on magnification, voice navigation users, and users relying on switches (devices that replace the need to use a keyboard or a mouse) have a hard time orienting themselves on a new page if focus is set on too large of an element or an inoperable element (like our wrapper `div`). Sending focus directly to a smaller, interactive control like a skip link is ideal. Unfortunately, we're limited with what we can programmatically achieve at the framework level (we have no way of knowing if a skip link exists on site pages from our `Router`).

For this reason, we recommend that developers take control of focus themselves and assert the functionality in [automated tests](/docs/end-to-end-testing/#writing-tests). We encourage you to take advantage of `@reach/router’s` [skip nav functionality](https://reacttraining.com/reach-ui/skip-nav/) (or implement a skip link yourself) on your site.

```javascript:title=layout.js
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav"
import "@reach/skip-nav/styles.css" //this will auto show and hide the link on focus

const Layout = ({ children }) => {
  return (
    <>
        <SkipNavLink />
        <header>
          <h3>Welcome to my site</h3>
        </header>
        <SkipNavContent/>
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </div>
    </>
  )
}
```

Then you can make sure focus is directed there in your `gatsby-browser.js` file:

```javascript:title=gatsby-browser.js
exports.onRouteUpdate = ({ location, prevLocation }) => {
  if (prevLocation !== null) {
    const skipLink = document.querySelector("#reach-skip-nav")
    if (skipLink) {
      skipLink.focus()
    }
  }
}
```

**Note:** After noticing that Gatsby's .org site was missing this, I whipped up a [Pull Request](https://github.com/gatsbyjs/gatsby/pull/21108) to facilitate a design discussion and work through real-world feedback. Incremental improvements are so important!

## New Improvements

The changes that were shipped in [PR #19290](https://github.com/gatsbyjs/gatsby/pull/19290) address the recommendation to add an ARIA live region that announces route changes. Using `@reach-router` alone got us most of the way there depending on which browser and screen reader combination someone is using; for most combinations, page content would be communicated when changing routes. However, we found that two of the [most popular](https://webaim.org/projects/screenreadersurvey8/#browsercombos) combinations (NVDA with FireFox and VoiceOver with Safari) weren’t announcing anything at all on client-side route changes. This leads to a confusing experience where users are unsure which page they are on and unsure if links are working. Implementing our ARIA live region ensures that there is consistent and reliable behavior regardless of the technologies used.

Our solution appends a `RouteAnnouncer` component as a sibling of our main focus wrapper.

```jsx
<React.Fragment>
  {this.props.children} //gatsby-focus-wrapper
  <RouteAnnouncer location={location} />
</React.Fragment>
```

The `RouteAnnouncer` is a component that renders an ARIA live region. This region has `aria-live` set to `assertive` because we want route changes to always interrupt whatever the screen reader is currently doing. We’ve also set `aria-atomic` to true because we want every change to the content of this `div` to be announced. Our ARIA live region has inline styles to hide it visually, as recommended by [WebAIM](https://webaim.org/techniques/css/invisiblecontent/#offscreen).

```jsx
<div
  id="gatsby-announcer"
  style={{
    position: `absolute`,
    top: 0,
    width: 1,
    height: 1,
    padding: 0,
    overflow: `hidden`,
    clip: `rect(0, 0, 0, 0)`,
    whiteSpace: `nowrap`,
    border: 0,
  }}
  aria-live="assertive"
  aria-atomic="true"
  ref={this.announcementRef}
></div>
```

This component sets the content to be announced (e.g. "Navigated to Gatsby Blog") by targeting the `innerText` on the `gatsby-announcer` div, selected by `ref`. Using a React `ref` and only updating the announcement text if it is different from the current announcement text prevents screen readers from repeating announcements if the page renders multiple times.

One limitation of implementing this at the framework level is that we don't have access to what ultimately ends up on the pages, as they can be sourced from anywhere. For this reason, the announcement will always start with "Navigated to", followed by either the content of the first `h1` on the page, the `title` of the page, or `location.path` depending on what is present. Additionally, the differences between framework level and "userland" changes were evident when testing behavior compared to sites implementing similar changes themselves (e.g. Marcy Sutton's [example solution](https://github.com/marcysutton/gatsby-a11y-workshop/blob/master/examples/client-side-routing/gatsby-browser.js) as part of her [gatsby-a11y-workshop](https://github.com/marcysutton/gatsby-a11y-workshop)) and finding that the framework-level implementation had less consistent behavior and bugs with repetition.

## What’s Next

Now that this large improvement is shipped, we'll continue building on our progress. Right now the English words "Navigated to" appear in every announcement. Because accessible solutions are meant to be [understandable](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_WCAG/Understandable), we aim to localize this string based on the language in which a user is navigating the web in (see [issue 20801](https://github.com/gatsbyjs/gatsby/issues/20801)). Additionally, we would like to offer additional customization for users, offering the option to specify an element to grab announcement text from instead of the `h1` or `title` on the page (see [issue 21059](https://github.com/gatsbyjs/gatsby/issues/21059)).

As always, we'd love to hear ideas and suggestions from the community on existing and/or new issues in the [Gatsby GitHub repo](https://github.com/gatsbyjs/gatsby).
