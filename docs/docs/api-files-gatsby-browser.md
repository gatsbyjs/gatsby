---
title: The gatsby-browser.js API file
---

The file `gatsby-browser.js` helps you respond to actions within the browser, and wrapping the page component for the client. The [Gatsby Browser API](/docs/browser-apis) gives you many options for interacting witht the client side of Gatsby. All of these APIs follow the same layout.

To use Browser APIs, first create a file in the root of your site at `gatsby-browser.js`. All APIs should be defined as exports on the file. For example, to use the API `onRouteUpdate`, add it to the global `exports` object:

```javascript:title=gatsby-browser.js
exports.onRouteUpdate = ({ location, prevLocation }) => {
  console.log("new pathname", location.pathname)
  console.log("old pathname", prevLocation ? prevLocation.pathname : null)
}
```
