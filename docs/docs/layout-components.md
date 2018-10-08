---
title: Layout components
---

In this guide, you'll learn Gatsby's approach to layouts and how to create and use layout components.

### Gatsby's approach to layouts

Gatsby does not automatically apply layouts to pages. Instead, Gatsby follows React's compositional model of importing and using components. This makes it possible to create multiple levels of layouts, e.g. a global header and footer, and then on some pages, a sidebar menu. It also makes it easy to pass data between layout and page components.

### What are layout components?

Layout components are for sections of your site that you want to share across multiple pages. For example, Gatsby sites will commonly have a layout component with a shared header and footer. Other common things to add to layouts are a sidebar and/or navigation menu. On this page for example, the header at the top is part of gatsbyjs.org’s layout component.

### How to create layout components

It is recommended to create your layout components alongside the rest of your components (e.g. into `src/components/`).

Here is an example of a very basic layout component at `src/components/layout.js`:

```jsx:title=src/components/layout.js
import React from "react"

export default ({ children }) => (
  <div style={{ margin: `0 auto`, maxWidth: 650, padding: `0 1rem` }}>
    {children}
  </div>
)
```

### How to import and add layout components to pages

If you want to apply a layout to a page, you will need to include the `Layout` component and wrap your page in it. For example, here is how you would apply your layout to the front page:

```jsx{2,5,7}:title=src/pages/index.js
import React from "react"
import Layout from "../components/layout"

export default () => (
  <Layout>
    <h1>I’m in a layout!</h1>
  </Layout>
)
```

Repeat for every page and template that needs this layout.

### Other resources

- [Creating nested layout components in Gatsby](https://www.gatsbyjs.org/tutorial/part-three/)
- [Life After Layouts in Gatsby V2](https://www.gatsbyjs.org/blog/2018-06-08-life-after-layouts/)
- [Migrating from v1 to v2](https://www.gatsbyjs.org/docs/migrating-from-v1-to-v2/#remove-or-refactor-layout-components)
