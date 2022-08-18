---
title: Server-Side Rendering
disableTableOfContents: true
---

Learn what server side rendering is and why it's preferable to client-side (browser) rendering. You'll also learn how Gatsby uses server-side rendering to create static websites.

## What is Server-Side rendering?

_Server-side rendering_ means using a server to generate HTML from JavaScript modules in response to a URL request. That's in contrast to client-side rendering, which uses the browser to create HTML using the DOM.

Server-side rendering with JavaScript works similarly to other server-side languages such as PHP or .NET, but with [Node.js](/docs/glossary/node/) as the runtime environment. When the server receives a request, it parses the JavaScript modules and data required to generate a response, and returns a rendered HTML page to the browser.

Single-page applications use client-side rendering. All URL requests are redirected to the same bare-bones HTML document, like the example that follows.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,user-scalable=yes" />
    <title>My Single Page App</title>
    <link rel="stylesheet" type="text/css" href="./style.css" />
  </head>
  <body>
    <main id="app"></main>
    <script type="text/javascript" src="./js.js"></script>
  </body>
</html>
```

Client-side rendering fills in the rest. Views for specific URLs are managed by a JavaScript routing mechanism. Each URL request triggers a DOM update instead of a network request. As a result, sites that use client-side rendering can feel "snappier" and more responsive to user actions. However, client-side rendering has two significant drawbacks.

1. Site visitors have to wait for the JavaScript bundle to load and for the browser to build the DOM before any content is visible. They may see a blank page or loading image while JavaScript loads.
2. Your bare bones HTML document lacks the keyword, description, and social media metadata (e.g. [OpenGraph](https://ogp.me/)) necessary for search engine optimization and social media sharing.

Server-side rendering addresses both concerns by creating HTML at _run time_, when the server receives a browser request). Search engines can index your URLs. Visitors can share them on Facebook or Twitter.

Instead of purely server-side rendering, Gatsby uses the same APIs to create static HTML at [build time](/docs/glossary/build/) when you use `gatsby build`. Gatsby-rendered HTML pages give you the SEO and social sharing advantages of server-side rendering with the speed and security of a [static site generator](/docs/glossary/static-site-generator/).

### Learn more

- [Gatsby Server Rendering APIs](/docs/reference/config-files/gatsby-ssr/)

- [Why server-side render?](/blog/2019-04-02-behind-the-scenes-what-makes-gatsby-great/#why-server-side-render) from _Behind the Scenes: What makes Gatsby Great_

- [Adding an SEO Component](/docs/how-to/adding-common-features/adding-seo-component/)

- [What is a Static Site Generator?](/docs/glossary/static-site-generator/#what-is-a-static-site-generator) from the Gatsby docs
