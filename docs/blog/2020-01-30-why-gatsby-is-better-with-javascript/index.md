---
title: "Why Gatsby is better with JavaScript"
date: 2020-01-30
author: Mikhail Novikov
excerpt: "Gatsby sites can work without JavaScript, however they will often be faster when JavaScript is enabled. In addition, adding interactive elements is much easier."
tags:
  - Gatsby
  - JavaScript
  - Performance
  - Accessibility
---

Gatsby sites can work without JavaScript. Because Gatsby renders all the pages as plain HTML files, users can use the majority of a website's functionality without it. JavaScript is required only for additional interactive elements of an app.

We're often asked to add an option to not build or include JavaScript bundles in a site. However we believe that this will make Gatsby performance worse, not better, and this blog post aims to explain why we think this is the case. We will also cover how some future React features, like partial hydration, will improve Gatsby performance.

## What is JavaScript used for in Gatsby sites?

In a nutshell, a Gatsby site is the result of React [Server-Side Rendering](/docs/glossary#server-side) each page to an HTML file. We prepare JavaScript bundles that include React and the components used on your pages, so after the user loads the HTML page, it loads the minimal bundle so React can [hydrate the HTML](/docs/react-hydration) and become a Single-Page App. That means that adding interactivity to a Gatsby site is very easy and requires no additional steps - React just works as usual.

In order to add interactivity to a page Gatsby has to ship JavaScript. Doing this in a traditional server-oriented framework or CMS like WordPress is more awkward - it becomes a separate part of the application that isn’t connected to the main rendering code. To make it worse, this often requires shipping libraries like jQuery (or it’s plugins). That makes even the initial bundle bigger than what Gatsby ships by default.

But what about sites or pages where there is no client-side interactivity? Even for those pages, Gatsby offers performance benefits by including JavaScript. A Gatsby site is structured around the concept of “pages”. A page is an entry point in a Gatsby application, one can think of it as a single URL on the website. It's quite rare for a site to only have one page. More often, users visit multiple pages on a website. On a regular website a page transition would mean that the browser has to download a new HTML page and then all of the corresponding assets. A Gatsby site, however, will download a JSON file (called “page-data”) for the new page instead. Inside that file, Gatsby stores all the data that is needed to render the page. When JavaScript is enabled, after Gatsby downloads that file (and the component bundle needed to render this page, if it’s a new route), it will do a client-side transition to that page. Gatsby can preload those files based on the links that are visible in the viewport. In many cases that means the transition will feel snappier for the user, as there is no need to do a full page reload and preloaded files would already be available.

It's also important to put the JavaScript bundle size in perspective. While it definitely can have a detrimental effect on performance, especially when it grows uncontrollably, it's worth judging the website as a whole, not only how much JavaScript it ships. While not as detrimental for performance as JavaScript (which has additional impact because it needs to be parsed and executed), a single image can be bigger in size than a full JavaScript bundle. Gatsby resizes images to optimal sizes during compilation and sends images of the optimal size to the user’s device, meaning the overall bandwidth burden of the website might be lower at the end.

This all means that using JavaScript not only lets people develop interactive websites easier, it has real performance benefits for many websites. In this sense, Gatsby combines the best parts of traditional websites (pre-rendered HTML that loads super fast for the visitor) and Single-Page Apps (fast transitions and rich functionality).

## Current issues and future plans

### Accessibility

One big concern with client-side routing and Single-Page Apps in general is accessibility. Without proper care to manage focus and expose accessibility information through transitions, tools like VoiceOver will fail to announce page changes. That can potentially lead to the user being unaware that page content has changed. Gatsby uses [ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) and a hidden element on a page to announce page changes, so all page transitions in Gatsby should be announced (see [Add accessible routing PR](https://github.com/gatsbyjs/gatsby/pull/19290), which was recently merged and released).

Accessibility is very important to Gatsby and we don’t want it to be an option someone has to enable for Gatsby websites. We want all Gatsby sites to be accessible and for that we need to make sure that our client-side routing is as accessible as possible (see our [accessibility statement](/blog/2019-04-18-gatsby-commitment-to-accessibility/) and our [client-side-routing study](/blog/2019-07-11-user-testing-accessible-client-routing/)). Unfortunately, not all accessibility features are available for Single-Page Apps. For example, screen readers can produce a summary of a new page when it’s loaded, however it’s not possible to trigger that with JavaScript.

Gatsby isn’t the only framework that produces a Single-Page App. This is a problem for a big part of the web at the moment. We can’t solve it alone or on a user level - there should be more focused efforts to establish accessibility standards and initiatives that address issues that are unique to web apps. Without those efforts a big part of the web will always be less accessible.

### Performance

While using JavaScript in Gatsby can offer performance benefits, it comes with the usual caveat — if you use too much, performance will suffer. It's possible to have too much JavaScript, both in page data files and actual code bundles. The former can happen if too much data is requested for the page or put in the page context (some bad pagination patterns can cause that). With JavaScript, adding too many third-party libraries can easily cause that. It's important to monitor how much data you include on the page and in the future we plan to warn about large bundles during Gatsby compilation. It’s also possible to change the React runtime to alternative smaller runtimes like Preact by using a [Preact plugin](/packages/gatsby-plugin-preact/).

Another approach to make JavaScript bundles more optimal is [“differential building”](https://github.com/gatsbyjs/gatsby/issues/2114). Future Gatsby updates will produce multiple bundles, based on different versions of the platform that browsers support. Modern ones support more APIs and thus they don’t require as many shims or polyfills. A CDN can detect which browser a visitor is using and select an appropriate bundle to send.

### Partial Hydration

In general, downloading and parsing JavaScript, and doing [hydration](/docs/glossary/#hydration) is still a cost that every Gatsby website has to pay. In particular, the rehydration for big pages can be lengthy, while not being strictly required for the interactivity. Ideally, Gatsby would make only critical parts interactive first and then rehydrate the rest of the page asynchronously. In the future, that should be possible because React will have [partial hydration](https://github.com/facebook/react/issues/13206). Gatsby will let developers specify critical parts of their application that need to be hydrated. It should also be possible to use analytics to learn which components on a page are critical based on user interactions and automatically hydrate critical elements first.

In addition to partial hydration, it could be beneficial to only render some parts of the page first, especially during Single-Page App route transitions. This would lead to a smaller page-data file. It could be made possible with, for example, the `@defer` directive in GraphQL. Parts of the data that would be deferred wouldn't be included in the main page data bundle, but would instead be loaded after the initial, critical page data bundle.

## Conclusion

We are committed to always delivering the best performance and user experience to all Gatsby site users. We don't think the solution is to exclude JavaScript, but to use the best parts of all technology available.

We are very excited about new developments in the React and JavaScript world that we will bring to Gatsby, and we need great engineers and managers to help us make the best use of them. [Check out our open positions, including the Dream Job role](https://www.gatsbyjs.com/careers/).

Further reading:

[Adding App and Website Functionality](/docs/adding-app-and-website-functionality/)
[Understanding React Hydration](/docs/react-hydration/)

_This article was edited to remove an implication that images are as impactful on performance as JavaScript_
