---
title: Gatsby for Apps
date: 2018-10-30
author: Dustin Schau
tags: ["apps", "web apps", "authentication"]
---

Gatsby is truly incredible for static sites. In fact, our branding for Gatsby used to be the following:

> a blazing-fast static site generator for React

This is _still_ true, but I'd like to clarify one, simple concept. Gatsby is _still_ great for static sites, but it's also an equally great choice for applications. In this post, I'd like to clarify this central concept, and set the record straight that Gatsby is great for static sites and applications, alike.

To begin... what even is an app, anyways?

## What is an app?

I've gone into the [ins and outs of describing the difficulty][whats-an-app] of defining a traditional web application. In an effort to not re-hash all the work there, I think there are a few simple features that, when present, indicate a more app-like experience. They are:

- dynamic data fetching
- user authentication and authenticated client-only routes
- client-side JS interactions

Of course, a web app isn't some checklist wherein _each_ of these are required to indicate an app-like experience. Rather, I think it's easier to _see_ an example of a web application to form a mental model of the type of web app that Gatsby can build.

For me, there are two, key examples that are at the forefront of my mental model of what constitutes a modern web application... Gmail and Twitter (Lite).

### Gmail

Gmail served as an early proof of concept that proved out two, key functional wins:

1. Client-side JavaScript can power an app-like experience, and
2. a JavaScript application (running in your browser) can compare favorably to traditional, native applications for desktop and mobile

Next up, is Twitter, for slightly different reasons.

### Twitter

Twitter is another key determinant of my mental model for what an application _is_ (and can be!) because it illustrates some of the power of the modern web experience and uses some great performance optimimizations and smart engineering practices to serve up an engaging, fast, app-like experience. In particular, I find the following functionalities of Twitter Lite as key determinants for a separate kind of application:

- Aggressive data caching and fast page navigation with service workers
- Integration of the [PRPL pattern][prpl] (**P**ush, **R**ender, **P**re-cache, and **L**azy load)
- The illustration of the [App Shell][app-shell] pattern to speed up repeat visits and show a maximally visually complete page

These _modern_ concepts, coupled together, serve as a key marker for the value of Twitter Lite's approach to an app-like experience. They were able to strip down the core Twitter experience and deliver a blazing-fast modern web application utilizing some great engineering techniques and patterns. To learn more about these techniques, check out this great [case study][case-study].

These two, great applications will serve as key foundational pieces to keep in mind as the discussion now slightly pivots to Gatsby for web apps.

## Gatsby for Apps

<!-- TODO: insert matrix meme -->

What if I told you... that using a Gatsby application enables all of these traditional web-app like experiences because a Gatsby _site_ is an application?

Every Gatsby application that's deployed isn't merely static. It's _as much_ static HTML rendered up-front, as possible. Then client-side JavaScript (via React!) is enabled to serve as the engine for your next, great web app experience. A quick overview of Gatsby's general build process is effective to illustrate the concept. Consider:

1. Inject pages with data (from [GraphQL][gatsby-graphql] or even [unstructured data outside of GraphQL][gatsby-unstructured])
1. Use the [ReactDOMServer.renderToString][react-dom-render-to-string] to server-side render React pages to _HTML_ files
1. Inject a runtime and helpers (like a router!) to enable app functionality
   - Gatsby _produces_ a [create-react-app][create-react-app] like experience once this runtime takes over, client-side

To illustrate the concept, let's start with a classic example... we need to fetch some data at _run-time_ rather than build-time.

```jsx:title=src/pages/tweets.js
import React from "react"

export default class Tweets extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      tweets: [],
    }
  }

  async componentDidMount() {
    const tweets = await fetch(`/some-url-to-get-tweets`).then(response =>
      response.json()
    )

    this.setState({
      tweets,
    })
  }

  render() {
    const { tweets } = this.state
    if (tweets.length === 0) {
      return <Loading>Fetching tweets</Loading>
    }
    return (
      <ul>
        {tweets.map(tweet => (
          <li key={tweet.id}>{tweet.text}</li>
        ))}
      </ul>
    )
  }
}
```

All we've done here is implement the [`componentDidMount`][cdm] method, which will fire off a request to some REST API to retrieve some data (tweets!) from a remote API. At _runtime_ our application is now fetching data, dynamically. This illustrates the Gatsby + React _runtime_ and how a Gatsby application is essentially a hydrated create-react-app like experience. [React lifecycle methods][react-lifecycle-methods] are fully supported to implement whatever dynamic interaction is required, like data fetching in this example!

However--this is a fairly contrived, perhaps not completely real-world example. What if that REST API [requires authentication][authentication-tutorial]? What if we want [client-only routes][client-only-routes]? You better believe it's possible! The central idea I want to convey is that typically app-like features are not only _possible_ with Gatsby, but intuitive and easy to implement due to this nature of scaffolding out a fully functional React _application_ once mounted client-side!

<!-- TODO: bring it home; WHY gatsby -->

[whats-an-app]: /blog/2018-10-15-beyond-static-intro/#what-is-an-app
[prpl]: https://developers.google.com/web/fundamentals/performance/prpl-pattern/
[app-shell]: https://developers.google.com/web/fundamentals/architecture/app-shell
[case-study]: https://developers.google.com/web/showcase/2017/twitter
[gatsby-graphql]: /docs/querying-with-graphql/
[gatsby-unstructured-data]: /docs/using-unstructured-data/
[authentication-data]: /docs/authentication-tutorial/
[client-only-routes]: /docs/building-apps-with-gatsby/#client-only-routes--user-authentication
[create-react-app]: https://facebook.github.io/create-react-app/
[react-dom-render-to-string]: https://reactjs.org/docs/react-dom-server.html#rendertostring
[cdm]: https://reactjs.org/docs/react-component.html#componentdidmount
