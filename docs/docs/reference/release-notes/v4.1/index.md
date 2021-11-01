---
date: "2021-11-02"
version: "4.1.0"
title: "v4.1 Release Notes"
---

Welcome to `gatsby@4.1.0` release (November 2021 #1)

Key highlights of this release:

- [Support for Deferred Static Generation in File System Route API](#support-for-deferred-static-generation-in-file-system-route-api)
- [JSX Runtime Options in `gatsby-config.js`](#jsx-runtime-options-in-gatsby-config-js)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.0)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@4.1.0-next.0...gatsby@4.1.0)

---

## Support for Deferred Static Generation in File System Route API

With the introduction of Deferred Static Generation (DSG) ([What is DSG?](/blog/deferred-static-generation-guide)) you can defer non-critical page generation to the first user request. Currently, you can only achieve this by setting `defer: true` in the `createPage` action.

You're now also able to use DSG with [File System Route API](/docs/reference/routing/file-system-route-api/). For this we're introducing a new API inside File System Route templates that we'll continue to improve: A `config()` function. You'll be able to use it like this:

```jsx:title=src/pages/{MarkdownRemark.fields__slug}.jsx
import React from "react"
import { graphql } from "gatsby"

export default function Component(props) {
  return <pre>{JSON.stringify(props, null, 2)}</pre>
}

export async function config() {
  // Get all posts that were created before 2020-10-31
  const { data } = graphql`
    {
      oldPosts: allMarkdownRemark(
        filter: { frontmatter: { date: { lt: "2020-10-31" } } }
      ) {
        nodes {
          fields {
            slug
          }
        }
      }
    }
  `
  // Create a Set for easier comparison/lookup
  const oldPosts = new Set(data.oldPosts.nodes.map(n => n.fields.slug))

  // Return a function that when called will return a config for FS route pages
  // (right now only `defer` is supported)
  return ({ params }) => {
    return {
      // Defer pages older than 2020-10-31
      defer: oldPosts.has(params.fields__slug),
    }
  }
}

export const pageQuery = graphql`
  query BlogPost($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`
```

In the async function `config()` you can use GraphQL to query the data layer you're used to. But you don't have to -- you can also use regular JavaScript or skip the outer function completely. `config()` must return a function itself in which you get `params` as an argument. `params` is the same object you also get as `props.params` in the page component (see [File System Route API documentation](/docs/reference/routing/file-system-route-api/#collection-route-components)), e.g. `src/pages/{Product.name}.js` has `params.name`.

Here's a minimal version of `config()` that defers every page of the current File System Route template:

```js
export async function config() {
  return ({ params }) => {
    return {
      defer: true,
    }
  }
}
```

You can read the [API reference](TODO) or the [DSG guide](/docs/how-to/rendering-options/using-deferred-static-generation/) to learn more.

**Please note:** As DSG has no effect in `gatsby develop` at the moment you can only test `config()` in `gatsby build` right now. As this is the first iteration of the `config()` API we're [looking for feedback](https://github.com/gatsbyjs/gatsby/discussions/33789)!

## JSX Runtime Options in `gatsby-config.js`

You now can configure the `jsxRuntime` and `jsxImportSource` inside `gatsby-config.js`:

```js:title=gatsby-config.js
module.exports = {
  jsxRuntime: "automatic",
  jsxImportSource: "@emotion/react",
}
```

Setting `jsxRuntime` to `automatic` allows the use of JSX without having to import React (learn more in the [official blog post](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)). You can use the `jsxImportSource` option to set which package React should use as underlying JSX transformer.

## Notable bugfixes & improvements

- We've improved our [Creating a Source Plugin](/docs/how-to/plugins-and-themes/creating-a-source-plugin/) guide to account for changes made in v4
- `gatsby-source-contentful`: The `downloadLocal` option is working correctly again, via [PR #33715](https://github.com/gatsbyjs/gatsby/pull/33715)
- `gatsby-plugin-image`:
  - Remove flickering and blinking on re-renders, via [PR #33732](https://github.com/gatsbyjs/gatsby/pull/33732)
  - Fix `GatsbyImage` not displaying image in IE11, via [PR #33416](https://github.com/gatsbyjs/gatsby/pull/33416)
- `gatsby`:
  - Cache Query Engine & SSR engine (when you use DSG) to improve build times, via [PR #33665](https://github.com/gatsbyjs/gatsby/pull/33665)
  - Pass `pageContext` to `getServerData()`, via [PR #33626](https://github.com/gatsbyjs/gatsby/pull/33626)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@4.1.0-next.0...gatsby@4.1.0) to this release 💜

TODO
