---
title: Life After Layouts
date: 2018-06-08
author: "Jason Lengstorf"
---

So the Gatsby V2 beta is out, and [layouts are going away](#tktk-link-to-migration-guide). What does this mean for your projects?

This article will dive into the Gatsby V2's approach to layouts, talk about what changed and why, and walk through the migration process to get your existing projects updated to V2.

## What changed?

In Gatsby V1, layouts were a special kind of component that automagically wrapped generated templates. They were stored in `src/layouts/`, and received a prop called `children` that needed to be executed as a function.

### How it works in Gatsby V1

A simple layout would live at `src/layouts/index.js` and might contain the following code:

```jsx
import React from "react"

export default ({ children }) => <div className="app-wrapper">{children()}</div>
```

Our app also might have a home page at `src/pages/index.js` that looks like this:

```jsx
import React from "react"

export default () => <h1>I’m in a layout?</h1>
```

Once we start the app, we’ll see the following in the browser console:

![Screenshot of the generated markup with the layout wrapper around the page content.](simple-layout.png)

Like magic, our page is wrapped with the `.app-wrapper` container.

If you'd like to try out this app, check out the [`v1-layout` branch of the demo repo](https://github.com/jlengstorf/life-after-layouts/tree/v1-layout).

### How it works in Gatsby V2

In V2, layouts are no longer automatically applied to our pages (more on _why_ this decision was made in the next section).

This ultimately boils down to two breaking changes and one recommendation:

1.  **BREAKING CHANGE:** Components at `src/layouts/` are no longer automagically wrapped around page templates.
2.  **BREAKING CHANGE:** The `children` prop in our layout components is no longer a function (unless you explicitly provide a function).
3.  We now recommend moving your layout components alongside the rest of your components (e.g. into `src/components/`).

If we upgrade our simplified app by running `yarn add gatsby@next react react-dom` (see [the V1 => V2 migration guide](#tktk-link-to-migration-guide) for more information on why we need to install React here), we need to upgrade our layout by moving `src/layouts/index.js` to `src/components/layout.js` and changing `children` from a function to a regular prop:

```jsx
import React from "react"

export default ({ children }) => <div className="app-wrapper">{children}</div>
```

Next, in `src/pages/index.js` we need to explicitly include the `Layout` component and wrap our page in it:

```jsx
import React from "react"
import Layout from "../components/layout"

export default () => (
  <Layout>
    <h1>I’m in a layout!</h1>
  </Layout>
)
```

Once we've made these changes, we can run `yarn develop` and see the updated layout in our browser:

![Screenshot of the updated layout in the browser.](simple-layout-v2.png)

## Why change the layouts?

TKTK

### Why is this better?

TKTK

## What’s next?

TKTK
