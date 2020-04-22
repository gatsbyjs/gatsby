---
title: Add Authentication to Your Gatsby Apps With Auth0 (Livestream)
date: 2019-03-21
author: Jason Lengstorf
excerpt: >
  A common challenge while building apps is setting up authentication. In this video, Jason Lengstorf and Ado Kukic build a Gatsby app using Auth0 to create a login-protected dashboard.
tags:
  - authentication
  - livestream
  - getting-started
  - apps
---

A common challenge when building apps is setting up authentication. If our apps have user-specific data, we need a way to secure that data and identify our users so they can access their own information.

## Authentication in Gatsby

We regularly get questions about how to add authentication to Gatsby, and while we have [simple examples](https://github.com/gatsbyjs/gatsby/blob/master/examples/simple-auth/) that wouldn’t help in a production app and [the more complex logic of our store](https://github.com/gatsbyjs/store.gatsbyjs.org), we don’t have a straightforward, “here’s how to add authentication for a user account page in Gatsby” example.

On a recent livestream, [Ado Kukic](https://twitter.com/KukicAdo) helped me create an example for setting up auth for a Gatsby account page.

https://youtu.be/j-vuF2PYHmU?list=PLz8Iz-Fnk_eTpvd49Sa77NiF8Uqq5Iykx

**This is part of the [Learn With Jason series](https://www.youtube.com/playlist?list=PLz8Iz-Fnk_eTpvd49Sa77NiF8Uqq5Iykx), which [streams live on Twitch][twitch] every Thursday at 9 am Pacific.**

On the stream, we covered:

1. How to create dynamic routes in Gatsby
2. How to use [Auth0](https://auth0.com) to require a user login to view certain areas of a Gatsby site
3. How to store user tokens in a secure way
4. How to keep users logged in between page loads securely

The code we built is [available on GitHub](https://github.com/jlengstorf/gatsby-auth0-app) and will serve as a great starting point if you need to create a Gatsby app with user accounts.

## Additional links and resources

- [Adding App Functionality with Gatsby](/docs/adding-app-and-website-functionality/)
- [Auth0](https://auth0.com/)
- [Simple auth example in Gatsby](https://github.com/gatsbyjs/gatsby/blob/master/examples/simple-auth/)
- [Source code for the Gatsby store](https://github.com/gatsbyjs/store.gatsbyjs.org), which uses Auth0 to authenticate users
- [Source code for the Gatsby store API](https://github.com/gatsbyjs/api.gatsbyjs.org), which uses Auth0 to authenticate requests
- [Docs for the `wrapRootElement` API](/docs/browser-apis/#wrapRootElement)
- [Ado Kukic on Twitter](https://twitter.com/KukicAdo)
- [Jason Lengstorf on Twitter](https://twitter.com/jlengstorf)

## Watch future livestreams

There’s a **new livestream every Thursday at 9 am Pacific.** The streams are even more fun live with the chat, so join in and let’s learn together!

- Click the “follow” button on [my Twitch account][twitch] to get notified when streams start
- Check the “Upcoming Streams” section to learn who’ll be joining me to teach us
- [Send me ideas on Twitter](https://twitter.com/jlengstorf) for who you’d like to see on the stream

See you on the next stream!

[twitch]: https://twitch.tv/jlengstorf
