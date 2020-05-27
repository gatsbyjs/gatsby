---
title: Actions
description: Documentation on actions and how they help you manipulate state within Gatsby
jsdoc:
  - "src/redux/actions/public.js"
  - "src/redux/actions/restricted.ts"
contentsHeading: Functions
---

Gatsby uses [Redux](http://redux.js.org) internally to manage state. When you implement a Gatsby API, you are passed a collection of actions (equivalent to actions bound with [bindActionCreators](https://redux.js.org/api/bindactioncreators/) in Redux) which you can use to manipulate state on your site.

The object `actions` contains the functions and these can be individually extracted by using ES6 object destructuring.

```javascript
// For function createNodeField
exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
}
```
