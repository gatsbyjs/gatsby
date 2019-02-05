---
title: Linking between pages
---

This guide covers how to link between pages in a Gatsby site.

## The Gatsby link component

The Gatsby `<Link />` component is for linking between pages within your site. For external links to pages not handled by your Gatsby site, use the regular HTML `<a>` tag.

## Using the `<Link />` component

Here's an example of creating a link between two pages in a Gatsby site.

Open a page component (e.g. `src/pages/index.js`) in your Gatsby site. Import the `<Link />` component from Gatsby. Add a `<Link />` component below the header, and give it a `to` property, with the value of `"/contact/"` for the pathname:

```jsx
import React from "react"
import { Link } from "gatsby"

export default () => (
  <div>
    <Link to="/page-2/">Page 2</Link>
  </div>
)
```

## Other resources

- For the complete example of how to link between pages, see [Part One](/tutorial/part-one/#linking-between-pages/) in the Tutorial
- Check out more detail on routing in Gatsby in the [API doc for Gatsby Link](/docs/gatsby-link/).
