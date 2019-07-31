---
title: How we improved Gatsby's accessibility in v2 by switching to @reach/router
date: 2018-09-27
author: Amberley Romo
tags: ["v2", "accessibility", "client-side-routing"]
---

We recently announced the [second major release of Gatsby](/blog/2018-09-17-gatsby-v2/) 🚀. One change we want to highlight is the switch to using [@reach/router](https://reach.tech/router) to improve the accessibility of routing in Gatsby sites. What is @reach/router, and what are the benefits of undertaking the switch?

## What is @reach/router?

@reach/router is a routing library for React written and maintained by one of the original creators of [react-router](https://github.com/ReactTraining/react-router), [Ryan Florence](https://twitter.com/ryanflorence). After [investigating the tradeoffs](https://github.com/gatsbyjs/gatsby/issues/5656), we made the leap to depending on @reach/router:

- [Accessibility](https://reach.tech/router/accessibility) is a first-class concern
- Smaller bundle size (~70% decrease, 18.4kb to 6kb gzipped)
- Simplified API

## How does it support accessibility?

When you visit a Gatsby site, a static, server-rendered HTML page is loaded first, and then the JavaScript to hydrate the site into a web app is loaded. From there, internal routing is handled with the [Gatsby Link component](/docs/gatsby-link/), which wraps [@reach/router’s Link component](https://reach.tech/router/api/Link).

Web apps rerender in the client -- without making a request to the server to fetch new HTML -- resulting in a faster, more seamless user experience. These performance benefits, however, can create a broken experience for users who rely on assistive technology like screen readers.

When a user navigates between traditional server-rendered pages, the page is fully reloaded; In response, screen readers can announce the new content. When using most client-side routing solutions (out of the box), without the page reload, screen readers don’t know new content has been loaded to focus or announce.

The video below demonstrates this challenge (Video by [Rob DeLuca](https://twitter.com/robdel12), which accompanied his related article, “[Single page app routers are broken](https://medium.com/@robdel12/single-page-apps-routers-are-broken-255daa310cf)”)

<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/NKTdNv8JpuM?rel=0"
  frameborder="0"
  allow="autoplay; encrypted-media"
  allowfullscreen
  title="YouTube: (React) Disqus router">
/>

A primary focus (no pun intended) of @reach/router is to manage focus in client-side routing, out of the box, lifting the onus from devs to manage it from scratch. From the @reach/router documentation:

<Pullquote>
  Whenever the content of a page changes in response to a user interaction, the
  focus should be moved to that content; otherwise, users on assistive devices
  have to search around the page to find what changed–yuck! Without the help of
  a router, managing focus on route transitions requires a lot effort and
  knowledge on your part.
</Pullquote>

<Pullquote>
  Reach Router provides out-of-the-box focus management so your apps are
  significantly more accessible without you breaking a sweat.
</Pullquote>

<Pullquote>
  When the location changes, the top-most part of your application that changed
  is identified and focus is moved to it. Assistive devices then announce to the
  user the group of elements they are now focused on, similarly to how it works
  when they load up a page for the first time.
</Pullquote>

The video below demonstrates this focus management:

<blockquote class="twitter-tweet" data-conversation="none" data-lang="en">
  <p lang="en" dir="ltr">
    Check out that focus management 😍
    <br />
    <br />
    The same code that makes this possible is what makes relative links and embedded
    routers possible too. <a href="https://t.co/DjqveMfspA">
      pic.twitter.com/DjqveMfspA
    </a>
  </p>
  &mdash; Ryan Florence (@ryanflorence) <a href="https://twitter.com/ryanflorence/status/1002219535921889281?ref_src=twsrc%5Etfw">May 31, 2018</a>
</blockquote>

In terms of the development experience with Gatsby, this change is mostly under the hood, folded into the implementation of the Gatsby Link component. In terms of usability, accessibility by default is a win for everyone 🙌🏻.

## Migrating from v1 ➡️ v2

For most sites, migrating from v1 to v2 shouldn’t be too painful, but there are a few instances you might want to be aware of. Check out the [v2 migration guide](/docs/migrating-from-v1-to-v2/#migrate-from-react-router-to-reachrouter) for details.

## TLDR;

[Smaller package + better accessibility + simplified APIs](https://github.com/gatsbyjs/gatsby/pull/6918) 👍

We look forward to continuing to work actively with Ryan!

<blockquote class="twitter-tweet" data-lang="en">
  <p lang="en" dir="ltr">
    Reach Router is hitting the big time with{" "}
    <a href="https://twitter.com/gatsbyjs?ref_src=twsrc%5Etfw">@gatsbyjs</a>{" "}
    adopting it and Nike shipping a site with it{" "}
    <a href="https://t.co/fthOUQ1lJh">https://t.co/fthOUQ1lJh</a> :D
    <br />
    <br />
    I&#39;ll be spending all day Thursday fixing/adding stuff Gatsby needs. AND!
    Gatsby is sponsoring my time.
    <br />
    <br />
    Thanks{" "}
    <a href="https://twitter.com/kylemathews?ref_src=twsrc%5Etfw">
      @kylemathews
    </a>{" "}
    and the rest of the team 🙏🏽
  </p>
  &mdash; Ryan Florence (@ryanflorence) <a href="https://twitter.com/ryanflorence/status/1042117992140554241?ref_src=twsrc%5Etfw">September 18, 2018</a>
</blockquote>

Related Gatsby docs:

- [V2 Migration Guide](/docs/migrating-from-v1-to-v2/#migrate-from-react-router-to-reachrouter)
- [Gatsby Link API reference](/docs/gatsby-link/)
- [V2 announcement blog post](/blog/2018-09-17-gatsby-v2/)
- [Making your site accessible](/docs/making-your-site-accessible)

External references:

- [Single page app routers are broken](https://medium.com/@robdel12/single-page-apps-routers-are-broken-255daa310cf) by Rob DeLuca
- [@reach/router docs](https://reach.tech/router)
