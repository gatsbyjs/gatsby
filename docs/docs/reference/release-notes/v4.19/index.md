---
date: "2022-07-19"
version: "4.19.0"
title: "v4.19 Release Notes"
---

Welcome to `gatsby@4.19.0` release (July 2022 #2)

Key highlights of this release:

- [Gatsby Head API](#gatsby-head-api)
- [Release Candidate for gatsby-plugin-mdx v4](#todo) - Support for MDX v2 and more!

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.18)

[Full changelog][full-changelog]

---

## Gatsby Head API


The new Head API lets you define your site metadata the Gatsby Way.  Previously, third partly libraries like [react-helmet](https://www.npmjs.com/package/react-helmet) have been the goto for adding `link`, `title`, `meta` and other document head tags. With the new Head API, you can easily add those to pages on your site without needing an external library.  

```js
import * as React from "react"

const Page = () => <div>Hello World</div>
export default Page

export function Head() {
  return (
    <>
      <title>Hello World Page</title>
    </>
  )
}
```
Just like page templates, `Head` also receive some set of props like `location`, `params`, `data` and `pageContext`. Read more about [properties that `Head` export receives](https://www.gatsbyjs.com/docs/how-to/docs/docs/reference/built-in-components/gatsby-head.md#properties) in the [Gatsby Head API reference documentation](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/).

Since `Head` is rendered like traditional react components, you can [create a SEO component](https://www.gatsbyjs.com/docs/how-to/adding-common-features/adding-seo-component.md) that defines defaults and reuse that across pages.

Unlike external libraries like react-helmet, the Gatsby Head API also adds the tags you define to server rendered HTML so you don't need any extra plugins to be SEO ready.

One thing to note is that every page that need to add some tags to document head needs to export or re-export a Head function. You may only do a re-export if the new page needs to have same tags as the previous.

```js
import * as React from "react"

const Page = () => <div>Hello World</div>
export default Page

// highlight-next-line
export { Head } from "../somewhere" 
```

For full details, see the [Gatsby Head API reference documentation](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/).

## Release Candidate for gatsby-plugin-mdx v4

TODO

## Notable bugfixes & improvements

- Publish `gatsby-script`, `gatsby-link`, and `gatsby-core-utils` both as CJS & ESM, via [PR #36012](https://github.com/gatsbyjs/gatsby/pull/36012) and [PR #36020](https://github.com/gatsbyjs/gatsby/pull/36020)
- `gatsby`
  - Sanitize page state to remove non-serializable elements, via [PR #36074](https://github.com/gatsbyjs/gatsby/pull/36074)
  - Remove the `/___services` endpoint and remove development proxy. Also remove `proxyPort` (aliased to `port` for now). Via [PR #35675](https://github.com/gatsbyjs/gatsby/pull/35675)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.19.0-next.0...gatsby@4.19.0
