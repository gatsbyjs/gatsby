---
title: Linking between pages
---

This guide covers how to link between pages in a Gatsby site.

## The Gatsby link component

The Gatsby `<Link />` component, [`gatsby-link`](/packages/) is for linking between pages within your site. For external links to pages not handled by your Gatsby site, use the regular HTML `<a>` tag.

> Check out more detail on routing in Gatsby in the [API doc for Gatsby Link](/docs/gatsby-link/).

## Using the `<Link />` component

Here's an example of creating a link between two pages in a Gatsby site. For the complete example of how to link between pages, see [Part One](/tutorial/part-one/#linking-between-pages/) in the Tutorial.

1.  Open a page component (e.g. `src/pages/index.js`) in your Gatsby site. Import the `<Link />` component from Gatsby. Add a `<Link />` component below the header, and give it a `to` property, with the value of `"/contact/"` for the pathname:

```jsx
import React from "react"
import { Link } from "gatsby"

export default () => (
  <div>
    <Link to="/contact/">Contact</Link>
  </div>
)
```

When you click the new "Contact" link on the homepage, you should see...

![Gatsby dev 404 page](09-dev-404.png)

...the Gatsby development 404 page. Why? Because we're attempting to link to a page that doesn't exist yet.

> Want to know more about 404 pages in Gatsby? Check out [the docs](/docs/add-404-page/).

2.  Let's create a page component for our new " Contact" page at `src/pages/contact.js`, and have it link back to the homepage:

```jsx:title=src/pages/contact.js
import React from "react"
import { Link } from "gatsby"
import Header from "../components/header"

export default () => (
  <div style={{ color: `teal` }}>
    <Link to="/">Home</Link>
    <Header headerText="Contact" />
    <p>Send us a message!</p>
  </div>
)
```

After you save the file, you should be see the contact page, and be able to link between it and the homepage.

## Other resources

- Check out more detail on routing in Gatsby in the [API doc for Gatsby Link](/docs/gatsby-link/).
