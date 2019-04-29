---
title: Linking between pages
---

This guide covers how to link between pages in a Gatsby site.

## The Gatsby link component

The Gatsby `<Link />` component is for linking between pages within your site. For external links to pages not handled by your Gatsby site, use the regular HTML `<a>` tag.

## Using the `<Link />` component for internal links

Here's an example of creating a link between two pages in a Gatsby site.

Open a page component (e.g. `src/pages/index.js`) in your Gatsby site. Import the `<Link />` component from Gatsby, which makes it available in the component. Add a `<Link />` component below the header, and give it a `to` property, with the value of `"/contact/"` for the pathname:

```jsx
import React from "react"
import { Link } from "gatsby"

export default () => (
  <div>
    <Link to="/contact/">Contact</Link>
  </div>
)
```

Note that the value `"/"` for the `to` property will take users to the home page.

## Using `<a>` for external links

If you are linking to pages not handled by your Gatsby site and wish to have them open in a new window using the `target` attribute, use it with the `rel` attribute as seen below to avoid a vulnerability in which the referrer page can be replaced dynamically in JavaScript with a different page:

```jsx
import React from "react"

export default () => (
  <div>
    <a href="https://example.com" target="_blank" rel="noopener noreferrer">External link</a>
  </div>
)
```

## Other resources

- For the complete example of how to link between pages, see [Part One](/tutorial/part-one/#linking-between-pages/) in the Tutorial
- Check out more detail on routing in Gatsby in the [API doc for Gatsby Link](/docs/gatsby-link/).
