---
title: Progressive Enhancement
disableTableOfContents: true
---

Learn what _progressive enhancement_ is and how Gatsby builds sites using progressive enhancement principles by default.

## What is progressive enhancement?

_Progressive enhancement_ is a strategy for building websites in which core functionality is available to all browsers, while non-critical enhancements are available to capable browsers. For example, a progressively-enhanced form submission might trigger a `fetch` network request in browsers that support the Fetch API, and a traditional form submission with a full page reload in browsers that do not.

Progressive enhancement can also ensure that your site is usable even if JavaScript fails to load. Poor network conditions, firewalls, and some browser settings can prevent JavaScript from executing. If your site relies entirely on JavaScript and client-side rendering, visitors may see a blank screen while waiting for JavaScript to load.

You'll sometimes see progressive enhancement discussed alongside _graceful degradation_. Sites built to degrade gracefully are optimized for the latest browsers, but ensure that core functions are still available to older browsers.

### How Gatsby enables progressive enhancement

Gatsby uses [server-side rendering](/docs/glossary/server-side-rendering/) and a React feature known as [hydration](/docs/conceptual/react-hydration/) to create progressively-enhanced sites. During the build process, Gatsby creates both an HTML document and a JavaScript component for each URL of your site.

When a site visitor requests their first URL from your site, the initial response will be server-rendered HTML, along with linked JavaScript, CSS, and images. If their browser is capable, React will hydrate the DOM, adding event listeners and state. Subsequent URL requests become DOM updates managed by React. If hydration fails, however, your site still works. Subsequent URL requests will instead trigger a network request and a full-page load.

Gatsby helps you build blazing-fast websites and applications that work with the latest browsers, without excluding older ones.

### Learn more

- [Behind the Scenes: What makes Gatsby Great](/blog/2019-04-02-behind-the-scenes-what-makes-gatsby-great/) from the Gatsby blog

- [Progressive enhancement](https://en.wikipedia.org/wiki/Progressive_enhancement) from Wikipedia
