---
title: Gatsby for Apps
date: 2018-11-07
author: Dustin Schau
tags:
  - apps
excerpt: Gatsby is great for not only static sites but also traditional web applications. Using Gatsby enables the benefits of both static and web applications so you don't have to sacrifice the advantages of one approach to reap the benefits of the other.
cover: images/what-if-i-told-you.jpg
---

Gatsby is great for static sites. You probably know this! It’s equally great for web applications. You may not know this. Gatsby is great for building web experiences that leverage the benefits of both so called static sites and web applications -- simultaneously. You don't have to sacrifice the advantages of one approach to reap the benefits of the other.

<!-- ☝️ Shout out to Amberley for the assist with this intro 🔥 -->

In this post, we'll go into some of the use cases that make for a compelling web application, such as dynamic data fetching, user authentication, and detail _why_ Gatsby is an excellent choice for building web applications.

We'll take a look at a classic web application -- Gmail -- which we rebuilt in Gatsby as a demo of how Gatsby can create engaging, modern web applications.

To begin, what even _is_ an application, anyways?

> Note:
>
> If you haven't already, consider checking out ["Beyond Static: Building Dynamic Apps with Gatsby"][beyond-static] where many ideas in this blog post are presented in a video/webinar format.

## What is an application?

I've previously attempted the [surprisingly difficult task][whats-an-app] of defining what constitutes a traditional web application. In an effort to not re-hash all the work there, I think there are several, key features that indicate a more app-like experience:

- dynamic data fetching
- user authentication and authenticated client-only routes
- client-side JS interactions

Of course, a web app isn't some checklist wherein _each_ of these functionalities are required to indicate an app-like experience. Rather, I think it's easier to _see_ an example of a web application -- one that encapsulates several of these functionalities -- to form a mental model of the type of web app that Gatsby can build.

For me there are two key examples that are at the forefront of my mental model of what constitutes a modern web application... Gmail and Twitter.

### Gmail

[![Gmail interface](./images/gmail.png)][gmail]

Gmail served as an early proof of concept that proved out two, key functional wins:

1. Client-side JavaScript can power an app-like experience, and
1. a JavaScript application (running in your browser) can compare favorably to traditional, native applications for desktop and mobile

The impact of these wins can’t be understated. Gmail _proved_ that a native, app-like experience is not only possible for end users, but that it can even be preferable and more convenient than the native experience. We'll revisit this trusty Gmail web application example in due time.

Next up, is Twitter, for slightly different reasons.

### Twitter (Progressive Web Application)

[![Twitter interface](./images/twitter.png)][twitter-lite]

Twitter is another key example of my mental model for what an application _is_ (and can be!) because it both:

- illustrates some of the power of the modern web experience, and
- uses some great performance optimizations and smart engineering practices to serve up an engaging, fast, app-like experience

In particular, I find the following functionalities of Twitter as key markers for a separate kind of application:

- Aggressive data caching and fast page navigation with service workers
- Integration of the [PRPL pattern][prpl] (**P**ush, **R**ender, **P**re-cache, and **L**azy load)
- The illustration of the [App Shell][app-shell] pattern to speed up repeat visits and show a maximally visually complete page

These _modern_ concepts, coupled together, are key for the value of Twitter's approach to an app-like experience. Twitter engineers were able to strip down the core Twitter experience and deliver a blazing-fast modern web application utilizing some great engineering techniques and patterns, that many users like even more than the full experience. To learn more about these techniques, check out this great [case study][case-study] from Google and Addy Osmani.

These two web applications will serve as key foundational pieces to keep in mind as the discussion shifts to Gatsby for web applications.

## Gatsby is for Applications

![Morpheus Matrix What if I told you](./images/what-if-i-told-you.jpg)

What if I told you... that building a Gatsby website enables all of these traditional web-app like functionalities because a Gatsby "static site" is an application?

Every Gatsby application isn't merely static. It's _as much_ static HTML rendered up-front, as possible. Client-side JavaScript (via React!) takes over as the engine for dynamic application functionality. A quick overview of Gatsby's general build process is effective to illustrate the concept.

1. Inject pages with data (from [GraphQL][gatsby-graphql] or even [without using GraphQL][gatsby-without-graphql])
1. Use the [ReactDOMServer.renderToString][react-dom-render-to-string] API to invoke server-side APIs to render React components to _HTML_ files
1. Inject a runtime and helpers (like a router!) to enable app functionality
   - Gatsby _produces_ a [create-react-app][create-react-app] like experience once this runtime takes over

To illustrate the concept, let's start with a classic example... we need to fetch some data at _run-time_ rather than build-time.

```jsx:title=src/pages/messages.js
import React from "react"

import Layout from "../components/layout"

class Messages extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      messages: [],
    }
  }

  // note: this is a simplified example without error handling, authentication, etc.
  async componentDidMount() {
    const messages = await fetch(`/api/some-url-to-get-messages`).then(
      response => response.json()
    )

    this.setState({
      messages,
    })
  }

  render() {
    const { messages } = this.state
    return (
      <Layout>
        {messages.length === 0 ? (
          <p>Loading messages&hellip;</p>
        ) : (
          <ul>
            {messages.map(message => (
              <li key={message.id}>{message.text}</li>
            ))}
          </ul>
        )}
      </Layout>
    )
  }
}

export default Messages
```

All we've done here is implement the [`componentDidMount`][cdm] lifecycle method, which will fire off a request to some REST API to retrieve some data (messages!) from a remote API. At _runtime_ our application is now fetching data, dynamically. This illustrates the effectiveness of the Gatsby + React _runtime_ and how a Gatsby application is essentially a hydrated create-react-app like experience. [React lifecycle methods][react-lifecycle-methods] are fully supported to implement whatever dynamic interaction is required, like data fetching in this example!

Consider the following animation, which mimics the end user experience. In effect, we've statically generated non-dynamic pieces (e.g. header, sidebar, etc.) and we then request additional data, on demand!

![Loading dynamic data animation](./images/dynamic-data-fetching.gif)

However--this is a fairly contrived, perhaps not completely real-world example. What if that REST API [requires authentication][authentication-tutorial]? What if we want [client-only routes][client-only-routes], e.g. deep linking to a specific message? You better believe it's possible! GraphQL at build time and run time? Yup!

The central idea I want to clarify is that typically app-like features are not only _possible_ with Gatsby, but intuitive and easy to implement due to the dynamic runtime enabled in every Gatsby application. It's _just_ React.

Gatsby is for building dynamic, web applications, just as it is for building static sites. At this point, this has become clear. Gatsby can be used for many of the traditional cases for web applications, including authentication, client-only routes, dynamic data fetching, and more.

However, what hasn't been made clear is _why_ you'd reach for Gatsby as opposed to other solutions.

## _Why_ Gatsby for Apps?

### Built-in Performance Optimizations

If we revisit some of the benefits that Gatsby provides, minimally:

- Static rendering of React components and co-located data to static HTML
- Optimizing data, images, etc. for blazing-fast performance
- Internalizing performance patterns and best practices like [PRPL][prpl], route-based code splitting, etc.

Each of these are worthy of far more detail, but suffice to say these are _great_ functionalities that you want not only in your _static_ site, but also in your application.

These performance optimizations aren't opt-in; they're enabled, by default. As new performance techniques and optimizations gain popularity, we can internalize these just as we have for these others optimizations. These optimizations can then be made available to your end users merely by upgrading your version of Gatsby, in much the same way tooling improvements are available by upgrading [create-react-app][create-react-app].

### Plugins and the Gatsby Ecosystem

One of the key benefits of Gatsby is its highly modular architecture. Need a plugin for [sourcing data from Wordpress][gatsby-source-wordpress]? Sure, seems reasonable. Need to [transform yaml data][gatsby-transformer-yaml] into a usable, JavaScript object? Yeah, why not! Want to [stitch in a remote GraphQL API][gatsby-source-graphql] and inject the data at _build_ time? Oh, you're fancy! Want to load optimized, responsive, blur-in images? Yep.

Let's take a look at that image functionality provided by one of our components, `gatsby-image`, in slightly more detail.

#### `gatsby-image`

Certainly one of my favorite components that Gatsby provides and maintains is `gatsby-image`. This component gives excellent image rendering capabilities, along with image optimizations enabled by plugins like [`gatsby-plugin-sharp`][gatsby-plugin-sharp]. These two techniques, along with the GraphQL API made available to any Gatsby application, vastly simplifies the developer experience of serving optimized images, providing a number of features, including:

- Resizing large images to an optimized size for your design
  - aka banish the practice of 5Mb above-the-fold hero images to the shadow realm
- Generate multiple, mobile-friendly images using `srcset` to serve _just_ what your user's device needs
- Lazy load images with a blur-up technique--even using [traced SVGs][traced-svg]

`gatsby-image` is incredible. If you haven't yet integrated its capabilities into your application, I'd highly recommend taking a look! Check out our recently redesigned [Using Gatsby Image][using-gatsby-image] example to learn more and see some live examples. Use `gatsby-image`, your users will thank you.

The power of these components and plugins is immense. In a similar way that reusable components have been incredibly valuable and successful for the growth of the React ecosystem, so to are plugins and ecosystem valuable for Gatsby applications. Why waste cycles reinventing these plugins and components when you can re-use and leverage the power of our open-source ecosystem? Using these plugins and components means more time to spend on building out your Gatsby application. Check out [our vast plugin library][gatsby-plugins] if you haven't already!

Next: let's compare and contrast the end user experience of fetching authenticated data between Gatsby and a server-rendered application.

### The App Shell

In merely adding the [`gatsby-plugin-offline`][gatsby-plugin-offline] plugin, we enable a fully-featured, progressive web application that works offline and creates an app shell by registering a service worker. An app shell is essentially separate components of your application (e.g. header, footer, sidebar, etc.) that are instantly available from a service worker while dynamic content is fetched in the background. This creates a great end-user experience, as the application is able to visually populate instantly as data loads into place in the background.

If we consider this approach, the technique looks like the following:

1. Render as much content, as possible, up front (e.g. the app shell)
1. Make async data requests to load disparate pieces, e.g. load page content from an API, particularly an API with authentication

Let’s compare this approach with the server-rendered approach. Consider an authenticated API call for this example. This API call is used to populate page data before it's sent (as HTML) to the end user. We're forced to defer loading for the entire page and the bottleneck of the API response, rather than serving the app shell as dynamic data loads in the background.

Consider the following animation to clarify this example. On the left, an application using a service worker and an app shell, e.g. a Gatsby application. On the right, a server-rendered application that waits until the API call has resolved to serve the _entire_ page all at once.

![App shell vs. server side rendered](./images/app-shell-web-apps.gif)

The benefits of this approach are clear. Loading an application shell gives end users the impression that the page is loading more quickly, even if in comparing the two approaches, both effectively load _all_ the data after the same amount of time. This gives your users the best of both worlds... the appearance and feeling of being blazing fast and _actually_ being blazing fast with the optimizations you get with Gatsby out of the box.

To unify all these concepts, I've assembled a demo application revisiting our old friend Gmail. This demo illustrates that rich web applications are not only _possible_ in Gatsby, but that Gatsby is a great choice to build these types of applications.

## Introducing... Gatsby Mail! (For demo purposes only!)

[![Gatsby Mail - an example app demoing web app functionality](./images/gatsby-mail.png)][gatsby-mail-app]

[Gatsby Mail][gatsby-mail-app] encapsulates some of the concepts and themes I've been hitting upon, particularly:

1. Gmail, Twitter, et al, are key exemplars of rich, web app experiences
1. Gatsby provides components, plugins, etc. for delivering great experiences; use them!
1. Gatsby is an excellent choice for building web applications

Additionally, Gatsby Mail shows some specific web application functionality, such as:

- Static rendering coupled with fetching dynamic data with the client runtime
- Authentication and client-only routes
- Non-authenticated routes, e.g. a landing page (using the [React Context][react-context] API)
- GraphQL at build time and _run time_ utilizing a remote GraphQL API and [apollo-boost][apollo-boost], and
- loading an app shell with `gatsby-plugin-offline` (check out the "Fast 3G" example below!)

and even a light/dark theme, because why not! You can see all of these concepts unify to form this great end-user experience in the below example with a simulated fast 3G connection. The app shell (header, footer, etc.) loads into place _instantly_ as the dynamic content is fetched (from the remote GraphQL API!) in the background.

![App Shell with Gatsby Mail](./images/gatsby-mail-app-shell.gif)

Check out the [GitHub repo][gatsby-mail-repo] to learn more about how it was built and adopt some of the techniques as you build your next great Gatsby web **application**.

We can't wait to see what you build.

[beyond-static]: https://www.gatsbyjs.com/build-web-apps-webinar
[whats-an-app]: /blog/2018-10-15-beyond-static-intro/#what-is-an-app
[gmail]: https://gmail.com
[twitter-lite]: https://m.twitter.com
[prpl]: https://developers.google.com/web/fundamentals/performance/prpl-pattern/
[app-shell]: https://developers.google.com/web/fundamentals/architecture/app-shell
[case-study]: https://developers.google.com/web/showcase/2017/twitter
[gatsby-graphql]: /docs/querying-with-graphql/
[gatsby-without-graphql]: /docs/using-gatsby-without-graphql/
[authentication-data]: /tutorial/authentication-tutorial/
[client-only-routes]: /docs/building-apps-with-gatsby/#client-only-routes--user-authentication
[create-react-app]: https://facebook.github.io/create-react-app/
[react-dom-render-to-string]: https://reactjs.org/docs/react-dom-server.html#rendertostring
[cdm]: https://reactjs.org/docs/react-component.html#componentdidmount
[prpl]: https://developers.google.com/web/fundamentals/performance/prpl-pattern/
[react-context]: https://reactjs.org/docs/context.html
[react-lifecycle-methods]: https://reactjs.org/docs/state-and-lifecycle.html
[gatsby-unstructured]: /blog/2018-10-25-unstructured-data/
[authentication-tutorial]: /tutorial/authentication-tutorial/
[using-gatsby-image]: https://using-gatsby-image.gatsbyjs.org/
[traced-svg]: https://using-gatsby-image.gatsbyjs.org/traced-svg/
[gatsby-plugin-offline]: /packages/gatsby-plugin-offline/
[gatsby-plugin-sharp]: /packages/gatsby-plugin-sharp/
[gatsby-source-graphql]: /packages/gatsby-source-graphql/
[gatsby-source-wordpress]: /packages/gatsby-source-wordpress/
[gatsby-transformer-yaml]: /packages/gatsby-transformer-yaml/
[gatsby-plugins]: /plugins
[gatsby-mail-app]: https://gatsby-mail.netlify.com
[gatsby-mail-repo]: https://github.com/dschau/gatsby-mail
[apollo-boost]: https://github.com/apollographql/apollo-client/tree/master/packages/apollo-boost
