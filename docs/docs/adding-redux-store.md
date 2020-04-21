---
title: "Adding a Redux Store"
---

[Redux](https://redux.js.org/) helps you write applications that behave consistently, run in different environments (client, server, and native), and are easy to test; that’s why Gatsby uses it as a core technology under the hood. On top of that, Redux provides a great developer experience, such as [live code editing combined with a time-traveling debugger](https://github.com/reduxjs/redux-devtools).

In order to use Redux for **custom** state management in a Gatsby site, you'll need to hook into two of Gatsby's extension points:

- Wrap the root element in your Gatsby markup once using `wrapRootElement`, an API supporting both Gatsby’s server rendering and browser JavaScript processes.
- Create a custom Redux store with reducers and initial state, providing your own state management functionality outside of Gatsby.

Check out the Using Redux example with [./gatsby-ssr.js](https://github.com/gatsbyjs/gatsby/blob/master/examples/using-redux/gatsby-ssr.js) and [./gatsby-browser.js](https://github.com/gatsbyjs/gatsby/blob/master/examples/using-redux/gatsby-browser.js) files to see how this is implemented. You can also check out more information on the official [Redux](https://redux.js.org/introduction/getting-started) docs.
