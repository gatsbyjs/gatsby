# gatsby-link

All components and utility functions from this package are now exported from [`gatsby`](/packages/gatsby) package. You should not import anything from this package directly.

### How to use gatsby-link

In any situation where you want to link between pages on the same site, use the `Link` component instead of an `a` tag.

```jsx
import React from "react"
// highlight-next-line
import { Link } from "gatsby"

const Page = () => (
  <div>
    <p>
      {/* highlight-next-line */}
      Check out my <Link to="/blog">blog</Link>!
    </p>
    <p>
      {/* Note that external links still use `a` tags. */}
      Follow me on <a href="https://twitter.com/gatsbyjs">Twitter</a>!
    </p>
  </div>
)
```

The [API reference](/docs/docs/gatsby-link/) has more documentation.
