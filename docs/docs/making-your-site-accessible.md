---
title: "Making your site accessible"
---

## What is accessibility?

Back in the early days of the Web, Tim Berners-Lee, inventor of the World Wide Web, [said](https://www.w3.org/Press/IPO-announce):

> "The power of the Web is in its universality.
> Access by everyone regardless of disability is an essential aspect."

The web of today is an important resource in many aspects of life such as health care, education, or commerce. Accessibility is an important consideration when building for the web.

[Web accessibility](https://www.w3.org/WAI/fundamentals/accessibility-intro/#what) means that websites, tools, and technologies are designed and developed so that people with disabilities can use them. But not only people with permanent disabilities benefit from it. Accessibility also benefits people with temporary disabilities. For example imagine being in a environment where you cannot listen to audio or if you had a broken arm.

Accessibility [supports](https://www.w3.org/standards/webdesign/accessibility#case) social inclusion for everyone, and has a strong business case.

## Gatsby helps build in accessibility

While ultimately it's up to you to develop your site with accessibility in mind, Gatsby aims to provide as much out-of-the-box support as possible.

### Accessible routing

One of the most common features of every site is navigation. People should be able to navigate across your pages and content in an intuitive and accessible way.

That's why every Gatsby site has an accessible navigation experience by default.

It is possible thanks to [@reach/router](https://reach.tech/router), a routing library for React, that provides focus management on page change. It also has a ~70% smaller bundle size than the famous [react-router](https://github.com/ReactTraining/react-router).

Since the [second major release](https://www.gatsbyjs.org/blog/2018-09-17-gatsby-v2/), your Gatsby sites use `@reach/router` under the hood. The [Gatsby Link Component](https://www.gatsbyjs.org/docs/gatsby-link/) wraps [@reach/router's Link component](https://reach.tech/router/api/Link), so you don't need to think about it.

## How to improve accessibility?

Accessibility by default is a win for everyone. Learn more about web accessibility in general:

- [Free course](https://www.udacity.com/course/web-accessibility--ud891) by Google and Udacity.
- [WebAIM introduction](https://webaim.org/intro/) to web accessibility.
