---
date: "2022-07-19"
version: "4.19.0"
title: "v4.19 Release Notes"
---

Welcome to `gatsby@4.19.0` release (July 2022 #2)

Key highlights of this release:

- [Gatsby Head API](#gatsby-head-api) - Better performance & more future-proof than `react-helmet`
- [Release Candidate for gatsby-plugin-mdx v4](#release-candidate-for-gatsby-plugin-mdx-v4) - Support for MDX v2 and more!

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.18)

[Full changelog][full-changelog]

---

## Gatsby Head API

Gatsby now includes a built-in `Head` export that allows you to add elements to the [document head](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head) of your pages.

Compared to [react-helmet](https://github.com/nfl/react-helmet) or other similar solutions, Gatsby Head is easier to use, more performant, has a smaller bundle size, and supports the latest React features. **You no longer need a third-party library to handle meta tags in Gatsby.** Gatsby Head also automatically places your meta tags into the generated HTML so you also no longer need a Gatsby plugin in your `gatsby-config.js`.

```jsx:title=src/pages/index.jsx
import * as React from "react"

const Page = () => <div>Hello World</div>
export default Page

export function Head() {
  return (
    <title>Hello World</title>
  )
}
```

The `Head` function has to return valid JSX which also means that you can use React's composition model and define a reusable React component to more easily handle default values for your pages. You can learn more about this in the [Adding an SEO component guide](/docs/how-to/adding-common-features/adding-seo-component).

One thing to note is that every page that need to add some tags to document head needs to export or re-export a Head function. You may only do a re-export if the new page needs to have same tags as the previous.

One important difference between Gatsby Head API and solutions like `react-helmet` is that (at the moment) you lose the ability to define global defaults (e.g. in a layout component) and have them automatically applied everywhere. With Gatsby Head API your pages have to export a `Head` function to define meta tags for this specific page. To help with that you can use an SEO component or re-export the `Head` function from somewhere else:

```jsx:title=src/pages/index.jsx
import * as React from "react"

const Page = () => <div>Hello World</div>
export default Page

// highlight-next-line
export { Head } from "../another/location"
```

For full details, see the [Gatsby Head API reference guide](/docs/reference/built-in-components/gatsby-head/). To learn how to use Gatsby Head API with TypeScript, head to the [TypeScript and Gatsby guide](/docs/how-to/custom-configuration/typescript/#headprops).

This feature followed our RFC process, you can read [RFC: Gatsby Head API](https://github.com/gatsbyjs/gatsby/discussions/35841) to understand how the API was created.

## Release Candidate for `gatsby-plugin-mdx` v4

In case you missed it: We're working on a new major version of `gatsby-plugin-mdx` to support MDX v2, improve build & frontend performance, and simplify the API.

You can now try out a release candidate version, head to the [MDX v2 RFC](https://github.com/gatsbyjs/gatsby/discussions/25068) to learn more.

## Notable bugfixes & improvements

- Publish `gatsby-script`, `gatsby-link`, and `gatsby-core-utils` both as CJS & ESM, via [PR #36012](https://github.com/gatsbyjs/gatsby/pull/36012) and [PR #36020](https://github.com/gatsbyjs/gatsby/pull/36020)
- `gatsby`
  - Sanitize page state to remove non-serializable elements, via [PR #36074](https://github.com/gatsbyjs/gatsby/pull/36074)
  - Remove the `/___services` endpoint and remove development proxy. Also remove `proxyPort` (aliased to `port` for now). Via [PR #35675](https://github.com/gatsbyjs/gatsby/pull/35675)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [Timxyx](https://github.com/Timxyx): fix(gatsby-source-contentful): Add `proxy.protocol` to Joi schema [PR #36011](https://github.com/gatsbyjs/gatsby/pull/36011)
- [ericapisani](https://github.com/ericapisani): chore(gatsby): upgrade lmdb to 2.5.3 [PR #36087](https://github.com/gatsbyjs/gatsby/pull/36087)
- [openscript](https://github.com/openscript)
  - chore(docs): Add `gatsby-link` to `transformIgnorePatterns` [PR #36076](https://github.com/gatsbyjs/gatsby/pull/36076)
  - chore(docs): update jest.config.js [PR #36049](https://github.com/gatsbyjs/gatsby/pull/36049)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.19.0-next.0...gatsby@4.19.0
