---
title: "Behind the Scenes: What makes Gatsby Great"
date: 2019-03-22
author: Dustin Schau
excerpt: "Gatsby is fast. You know this. This post outlines the numerous performance techniques that Gatsby performs behind the scenes to deliver a ludicriously fast experience that your users expect."
tags:
  - performance
  - apis
  - webpagetest
  - lighthouse
  - ci
---

Gatsby is **great** from a multititude of perspectives. Our community is **great**. The developer experience is **great**. The performance of the resulting application is **great**. Our documentation is **great**. And so on and so forth... if I were to focus on _each_ of these areas, this post would become an overly long love letter that I'm not sure many would want to read.

As such--this post focuses on just a single element of what makes Gatsby so great: performance. To prime the discussion, let's consider this post on the `webdev` subreddit on Reddit.

<pullquote citation="reddit/r/webdev">
Genuine question, every page is loaded immediatley [sic] on click. Seriously never seen such a quick website before. Any insight as to how they're able to achieve this?
</pullquote>

Fun fact--that website in question is [reactjs.org](https://reactjs.org) which is, as you may or may not know, is an application built with and powered by Gatsby 💪

In an effort to answer this initial question, this post outlines several foundational techniques that Gatsby enables _by default_ to deliver this experience. Specifically:

1. Server-side rendering (SSR) at **build time**
1. Route-based code splitting
1. Modern APIs

Finally, this post concludes with tangible, practical advice for measuring and asserting conclusively that your app is _actually_ ludicriously fast.

Let's dive deep.

## Server-side rendering (SSR) at **build time**

The mental model many hold for Gatsby is that of the static-site generator. This is accurate (with a caveat that it's excellent for [web applications, too](/blog/2018-11-07-gatsby-for-apps/)). Gatsby _excels_ at producing optimized static content (HTML, CSS, JavaScript, images, etc.) that can be deployed _anywhere_ for pennies. Gatsby produces optimized static content by invoking server-side APIs at **build time**. But, but... you say--"Gatsby is _just_ a static site generator, it's not server-side rendered!" Let's put down the pitchforks--let me explain!

Server-side rendering at build time merely means that we invoke the same server-side APIs invoked by a traditional server-side rendered application. We render a React component to optimized, pre-rendered HTML. If we first consider a React component, e.g.

```jsx:title=src/pages/index.js
import React from "react"

import { Layout } from "../components/layout"

export default function IndexPage() {
  return (
    <Layout>
      <h1>Hello World</h1>
    </Layout>
  )
}
```

this _page_ will be rendered and optimized by Gatsby's approach of invoking server-side APIs at **build time**. That process looks a little bit like:

```jsx
const path = require(`path`)
const fs = require(`fs`)
const React = require(`react`)
const { renderToStaticMarkup } = require(`react-dom/server`)

const Html = require(`../html`) // the HTML template

module.exports = function renderPage(template, pagePath, props) {
  const htmlContent = renderToStaticMarkup(
    <Html>{React.createElement(require(path.resolve(template)), props)}</Html>
  )

  fs.writeFileSync(path.join(`public`, pagePath), htmlContent, `utf8`)
}
```

_Note: want to see the actual code? [Check it](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/cache-dir/static-entry.js)_

This produces optimized, pre-rendered HTML for _every_ page in your application. It ends up looking something like this:

```html:title=public/index.html
<div id="___gatsby">
  <header><h1>Your header</h1></header>
  <main>
    <p>Some content!</p>
  </main>
</div>
```

Your React components are traced, rendered, and static HTML is produced via server-side APIs. Great. Why?

### Why server-side render?

First: let's consider the scenario in which we are not server-side rendering, e.g. a traditional React application produced by something like [create-react-app](https://github.com/facebook/create-react-app). This application once deployed **requires** JavaScript to parse, render, and eventually produce HTML to the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model). This _eventuality_ means that your users are waiting for JavaScript to be parsed and evaluated before your application is usable by the end user. It also--of course--_requires_ JavaScript to be enabled in your users browser.

Short circuiting this process and turning this _eventuality_ into a certainty is the key win of server-side rendering. This process produces static HTML that does not require JavaScript to run. Your application will load much more quickly and will be interactive more quickly. You will improve [Search Engine Optimization](https://developer.mozilla.org/en-US/docs/Glossary/SEO) because search engines can more quickly, reliably, and accurately parse your content and `meta` tags.

Your user's time isn't wasted to _eventually_ render your application, we render your application at _build time_ (as much as possible!) to maximize performance and deliver the ⚡ fast experience your users expect. Why force the work and time on your user when we can short-circuit this process and render the application _for them_ at build time?

This is the central idea of server-side rendering. Gatsby uses server-side APIs to render your application at **build time** so your users get a usable application much more quickly, even when JavaScript is disabled. Nifty. You're probably jumping ahead of me at this point. Why perform this process at build-time--this is what Gatsby does--when we could perform this work at _request_ time with traditional server-side rendering approaches?

### Zero Node.js servers required ✋

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">I’m watching <a href="https://twitter.com/SchauDustin?ref_src=twsrc%5Etfw">@SchauDustin</a> talk about how <a href="https://twitter.com/gatsbyjs?ref_src=twsrc%5Etfw">@gatsbyjs</a> handles things like static rendering  and all the complex scaling problems using it eliminates.<br><br>He‘s effectively gone full <a href="https://twitter.com/MarieKondo?ref_src=twsrc%5Etfw">@MarieKondo</a> on building apps: “Does horizontally scaling servers spark joy? Why are you still doing it?” <a href="https://t.co/uRFXWLsLvZ">pic.twitter.com/uRFXWLsLvZ</a></p>&mdash; Jason Lengstorf (@jlengstorf) <a href="https://twitter.com/jlengstorf/status/1090659696233463808?ref_src=twsrc%5Etfw">January 30, 2019</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

To begin describing why build-time SSR is so appealing, let's first take a look at what a deploy and release looks like if we don't require a server. What does a typical initial, set-up entail for deploying static content (which Gatsby produces)? It looks something like:

- Creating a [Content Delivery Network](https://developer.mozilla.org/en-US/docs/Glossary/CDN) to route your content _as close as possible_ to where your users are requesting it
  - This is often called "on the edge" and Gatsby can and should be deployed on the edge--[it reduces latency and improves page-load times](https://www.cloudflare.com/learning/cdn/glossary/edge-server/)
- Creating a bucket/location to host static content (like S3, Google Cloud Storage, etc.)
- Setting up a [Domain Name System (DNS)](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_is_a_domain_name) to make your content routable via a pretty URL, e.g. gatsbyjs.org
- Routing the CDN layer in front of your static content

... and, that's it! We're done as far as setup goes! We can use _whatever_ stack you prefer here. Netlify? [You bet.](https://www.gatsbyjs.org/docs/hosting-on-netlify) More a fan of AWS? [Of course.](https://www.gatsbyjs.org/docs/deploying-to-aws-amplify/) Heroku? [Yup.](https://www.gatsbyjs.org/docs/deploying-to-heroku/) You get the idea. Gatsby can be deployed anywhere easily and cheaply.

We now have an infrastructure setup so that we _can_ release our web application. What's a release look like?

```shell
gatsby build
```

and then copying the result of `gatsby build` (the `public` folder) to your static content host of choice.

That's it. What if your site goes viral and receives hundreds of thousands of request? You get charged in **terrabytes** of data with most CDNs, and that cost is quite literally [pennies](https://aws.amazon.com/cloudfront/pricing/). Deploying a new version of your app? Fire off a deploy and your users will have the new version deployed when the build process completes.

Let's contrast this approach with setting up and deploying a purely server-side rendered application.

#### Deploying a server-side rendered application

First: perform the **same** steps in setting up a static content host, excluding the step for configuring a bucket/location for hosting static content. Oh, and we're done yet. Strap in.

Next:

- Set up and provision several [virtual machines (VM)](https://en.wikipedia.org/wiki/Virtual_machine) to run instance(s) of our server-side app
  - Traditional examples are something like [EC2](https://aws.amazon.com/ec2/)
- Configure the VM to be able to run Node.js code
  - Consider using [Docker](https://www.docker.com/) to ensure you have a consistent Node.js environment
- Set up auto-scaling to ensure we can accomodate and fall-over based upon heavy load or error states
  - Consider using [Kubernetes](https://kubernetes.io/), [Rancher](https://rancher.com/), etc.
- Set up a Continuous Integration (CI) environment so we can build and deploy code to production with minimal impact to end-users

Does this sound like something that ✨joy? Oh--let's talk about the deploy process, too.

Releasing a one-line fix to our SSR application requires deploying an entirely new version of our application. This means spinning down existing versions of our service, spinning up new versions of our service, and handling and remediating any errors that may arise.

The benefits of _both_ approaches are the same. Improved performance (which has other, related benefits) by short-circuiting the process of _eventually_ producing HTML by directly producing HTML. However--deploying and hosting static content is objectively **easier**, **cheaper**, and **more reliable** than deploying a server for rendering applications.

Whew - that was a fun one. Let's continue.

## Route-based code splitting

Gatsby--like other tools--uses the filesystem as a convention for mapping to routes (note: we also expose a programattic APIFor instance, given the following directory structure:

```
├── src/
  ├── pages/
    └── about.js
    └── contact.js
    └── index.js
```

The _routes_ (e.g. the URL he user enters or navigates to in the website) `/about`, `/contact`, and `/` will be available in the resulting application. Let's take a look at one of these routes.

```jsx:title=src/pages/contact.js
import React from "react"
import { Formik } from "formik"
import * as yup from "yup"

import { Layout } from "../components/layout"

const handleSubmit = values => {
  // submit the form
}

export default function Contact() {
  return (
    <Layout>
      <Formik
        initialValues={{ email: ``, name: ``, message: `` }}
        onSubmit={handleSubmit}
        validationSchema={yup.object().shape({
          email: yup
            .string()
            .email()
            .required(),
          name: yup.string().required(),
          message: yup.string().required(),
        })}
      >
        {props => (
          <form onSubmit={props.onSubmit}>{/* the rendered form */}</form>
        )}
      </Formik>
    </Layout>
  )
}
```

Pretty vanilla looking component! We are rendering a `form` with some validation and functionality provided by the excellent libraries [`yup`](https://www.npmjs.com/package/yup) and [`Formik`](https://github.com/jaredpalmer/formik). The likelihood that these libraries are used in _all_ routes in our application is unlikely--yet this is traditionally the approach that many take with bundling their client-side JS libraries. This means that even if a particular route (e.g. `/about`) is _not using_ certain libraries that they will likely be included in a monolithic JavaScript bundle containing all dependencies. However--Gatsby, your friendly _web app compiler_, is a little smarter!

We use code-splitting (enabled via our internalized dependency [Webpack](https://webpackjs.org)), and particular, our approach prioritizes app-level dependencies (libraries used by the majority or all routes), and route-based code splitting for dependencies that are likely only used on a particular route. To more fully understand this, let's take a look at a sample structure produced by our build process: `gatsby build`.

```title=public/
├── 404
│   └── index.html
├── 9-f5d9c17474395c2890a3.js # highlight-line
├── about
│   └── index.html
├── app-2abedacd9bf03aaca373.js # highlight-line
├── component---src-pages-404-js-295c3d4f21322761edff.js
├── component---src-pages-about-js-3997b0d76203b183f5b3.js
├── component---src-pages-contact-js-34c976efa1482a119a50.js
├── component---src-pages-index-js-764f0d722c982d3d2789.js
├── contact
│   └── index.html # highlight-line
└── index.html
```

Let's take a deeper look at some of those JavaScript files.

### `app.{unique-hash}.js`

`app-2abedacd9bf03aaca373.js` in the above example is our commons bundle. It contains the shared dependencies for all routes. This can be cached between routes, so that JavaScript libraries like:

- `react`
- `react-dom`
- `@reach/router`
- `react-helmet`

are bundled on _every_ route because they are used on _every_ route.

### `{0-9}-{unique-hash}.js`

`9-f5d9c17474395c2890a3.js` in the above example is our route-based code splitting, in action. This will contain the separate dependencies that are required by our `/contact` route, specifically `Formik`, `yup`, etc. based on the previous example. This means that each route is only downloading the necessary JavaScript to make the page functional. No more and no less.

Consider the output of [`webpack-bundle-analyzer`](https://github.com/webpack-contrib/webpack-bundle-analyzer), which makes this even clearer.

![Webpack Bundle Analyzer](./images/bundle-analyzer.png)

### `component-{route-name}-{unique-hash}.js`

`component---src-pages-contact-js-34c976efa1482a119a50.js` contains metadata that defines the necessary resources for a specific route. We'll come back to this--promise!

To tie it all together, the build process produces a `contact/index.html` file containing something like:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <meta name="generator" content="Gatsby 2.2.5" />
    <title>Contact | Gatsby Code Splitting</title>
    <meta name="theme-color" content="#663399" />
    <link
      as="script"
      rel="preload"
      href="/webpack-runtime-0e11ed03533eb43aa22d.js"
    />
    <!-- highlight-next-line -->
    <link as="script" rel="preload" href="/app-426166597c215dcde739.js" />
    <!-- highlight-next-line -->
    <link as="script" rel="preload" href="/9-f5d9c17474395c2890a3.js" />
    <link
      as="script"
      rel="preload"
      href="/component---src-pages-contact-js-3e821a731407298f1654.js"
    />
    <link
      as="fetch"
      rel="preload"
      href="/static/d/686/path---contact-26-a-cd9-NZuapzHg3X9TaN1iIixfv1W23E.json"
      crossorigin="use-credentials"
    />
  </head>
  <body>
    <div id="___gatsby">
      <div style="outline:none" tabindex="-1" role="group">
        <div style="background:rebeccapurple;margin-bottom:1.45rem">
          <div style="margin:0 auto;max-width:960px;padding:1.45rem 1.0875rem">
            <h1 style="margin:0">
              <a style="color:white;text-decoration:none" href="/"
                >Gatsby Default Starter</a
              >
            </h1>
          </div>
        </div>
        <!-- highlight-start -->
        <div
          style="margin:0 auto;max-width:960px;padding:0px 1.0875rem 1.45rem;padding-top:0"
        >
          <h1>Contact Us</h1>
          <p>Use the form below to get in touch</p>
          <form>
            <label for="email" style="display:block">Email</label
            ><input
              type="text"
              id="email"
              placeholder="Enter your email"
              value=""
              class="text-input"
            />
          </form>
          <footer>
            ©
            <!-- -->2019<!-- -->, Built with<!-- -->
            <a href="https://www.gatsbyjs.org">Gatsby</a>
          </footer>
        </div>
        <!-- highlight-end -->
      </div>
    </div>
  </body>
</html>
```

This is an optimized, HTML representation of the React component at `src/pages/contact.js` containing the **minimal** resources required for the page. Our users only load the resources they need for every single route. No more, no less. 🔥

_Want to dive deeper? Much of this is encapsulated in our internal [Webpack config](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/webpack.config.js)_

## Modern APIs in Gatsby

Gatsby uses modern browser APIs to both maximize performance and user experience--which oftentimes go hand in hand!--only loading assets when they are necessary and likely to be requested. Specifically, the following APIs are crucial to the end-user experience in Gatsby:

1. `IntersectionObserver` - an API to conditionally perform some action when an element enters the viewport/view
1. `link rel="prefetch"` - an API to prefetch resources in the background when the browser is idle
1. `srcset` powering responsive images - a API to load the _smallest possible_ image that matches the viewport of the requesting device

Let's get to it.

### `IntersectionObserver`

### `link rel="prefetch"`

### `srcset` powering Responsive Images

## Techniques for measuring performance

<!-- TODO: Lighthouse -->
<!-- TODO: Webpagetest -->

<!-- TODO: CircleCI + Lighthouse -->

## Wrap-up

## Resources

- [Rendering on the Web - Google Developers](https://developers.google.com/web/updates/2019/02/rendering-on-the-web)
