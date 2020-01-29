---
title: "Accessibility Improvements to Client Side Routing - Available in 2.19.8"
date: 2020-02-05
author: "Madalyn Parker"
excerpt: "We recently released accessibility improvements to client side routing, enabling screen reader users to successfully navigate sites built with Gatsby."
tags: ["accessibility, client-side-routing, diversity-and-inclusion"]
---

We recently released accessibility improvements to client side routing, building on previous focus management [released in version 2.13.2](https://github.com/gatsbyjs/gatsby/pull/13197) improvements released in 2019. These improvements enable people relying on screen readers to successfully navigate sites built with Gatsby. If you'd like an in-depth look at how we made incremental changes to get to this release, have a look at this [issue](https://github.com/gatsbyjs/gatsby/issues/5581) opened way back in May 2018.

In July of 2019 Marcy Sutton teamed up with [Fable Tech Labs](https://www.makeitfable.com/) to conduct user testing to ultimately determine what the best user experience is for navigating JavaScript applications. Marcy wrote a thorough [blog post](https://www.gatsbyjs.org/blog/2019-07-11-user-testing-accessible-client-routing/) about that research. This left us with some concrete recommendations to execute on:

> - Provide a skip link that takes focus on a route change within the site, with a label that indicates what the link will do when activated: e.g. “skip to main navigation”.
>
> - Include an ARIA Live Region on page load. On a route change, append text to it indicating the current page, e.g. “Portfolio page”.

### Some Background

Our first step to addressing focus management (the first recommendation, above) was [switching](https://www.gatsbyjs.org/blog/2018-09-27-reach-router/) to [@reach/router](https://reach.tech/router). This got us part of the way there out-of-the-box. However, Gatsby’s implementation of @reach/router isn’t idiomatic in that Gatsby puts everything on a single, catch-all route. This means that every page is technically on the same route and route changes weren’t getting picked up by @reach/router. Our improvements in [2.13.2](https://github.com/gatsbyjs/gatsby/pull/13197) made sure that every time a route changed, we reset focus on a wrapping div. These changes also ensure that our single, catch-all route is dynamic so we can register changes and take advantage of @reach/router’s strengths.

Gatsby's .org site takes advantage of @reach/router’s [skip nav functionality](https://reacttraining.com/reach-ui/skip-nav/) in its [Layout Component](https://github.com/gatsbyjs/gatsby/blob/master/www/src/components/layout/layout-with-heading.js#L36), making that link the next element a user lands on when they navigate to a new page. We encourage you to implement this on your site to ensure you're also following the recommendations from our research.

### New Improvements

The changes that were just shipped address the second recommendation above, adding a live region that announces route changes. Using @reach-router alone got us most of the way there depending on which browser and screen reader combination someone is using; for most combinations, page content would be communicated when changing routes. However, we found that two of the [most popular](https://webaim.org/projects/screenreadersurvey8/#browsercombos) combinations (NVDA with FireFox and VoiceOver with Safari) weren’t announcing anything on client-side route changes. Implementing our ARIA live region ensures that there is consistent and reliable behavior regardless of technologies used.
Our solution appends a `RouteAnnouncer` component as a sibling of our main focus wrapper.

```jsx
<React.Fragment>
  {this.props.children} //gatsby-focus-wrapper
  <RouteAnnouncer location={location} />
</React.Fragment>
```

The RouteAnnouncer is a component that renders an ARIA live region. This region has `aria-live` set to `assertive` because we want route changes to always interrupt whatever the screen reader is currently doing. We’ve also set `aria-atomic` to true because we want every change to the content of this div to be announced. Our live region has inline styles to position it off of the page, as recommended by [WebAIM](https://webaim.org/techniques/css/invisiblecontent/#offscreen).

`````jsx
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
    ref={this.announcementRef}>
  </div>````

### What’s Next
Localization
Configuration/announcement component/ref
`````
