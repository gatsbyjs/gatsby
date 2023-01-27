---
date: "2022-08-16"
version: "4.21.0"
title: "v4.21 Release Notes"
---

Welcome to `gatsby@4.21.0` release (August 2022 #2)

Key highlights of this release:

- [`gatsby-plugin-mdx` v4](#gatsby-plugin-mdx-v4)
- [Open RFCs](#open-rfcs)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.20)

[Full changelog][full-changelog]

---

## `gatsby-plugin-mdx` v4

We're excited to announce [`gatsby-plugin-mdx`](/plugins/gatsby-plugin-mdx) v4! 🎉 With the help of our contractor [axe312ger](https://github.com/axe312ger) we have rewritten the plugin from scratch to give you these new features:

- Full compatibility with [MDX 2](https://mdxjs.com/blog/v2/)
- Per-file tree shaking and chunking (No more `app.js` bundle bloat or global scope problems)
- Simplified usage in pages
- Simplified plugin options
- You can configure the underyling [`@mdx-js/mdx` compile](https://mdxjs.com/packages/mdx/#compilefile-options), e.g. to add `remark` or `rehype` plugins

Over the last couple of months we've been hard at work building a new version of `gatsby-plugin-mdx`. The PRs [#35650](https://github.com/gatsbyjs/gatsby/pull/35650) and [#35893](https://github.com/gatsbyjs/gatsby/pull/35893) are the culmination of these efforts.

It also can't be overstated that the complete rewrite from scratch allowed us to set up the plugin for easier maintenance in the future. While this isn't a particular exciting user-facing feature, from a maintainer's perspective this will be a huge benefit for any future upgrades we (or you, [the community](https://www.gatsbyjs.com/contributing)) want to make to `gatsby-plugin-mdx`.

`gatsby-plugin-mdx` v4 is ready for primetime and you can start using it now.

### Getting started

There are multiple ways on how you can get started with `gatsby-plugin-mdx` v4:

- Initialize a new project with `npm init gatsby` and choose the **"Add Markdown and MDX support"** option
- Follow the [Adding MDX pages](/docs/how-to/routing/mdx/) guide
- Follow our [beginner friendly tutorial](/docs/tutorial/getting-started/) to learn how to create a blog with MDX
- Try out the [using-mdx example](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-mdx)
- Fork this [CodeSandbox](https://codesandbox.io/s/github/gatsbyjs/gatsby/tree/master/examples/using-mdx)

The updated [`gatsby-plugin-mdx` README](/plugins/gatsby-plugin-mdx/) contains detailed instructions on any new options and APIs.

### Migrating from v3 to v4

If you're already using `gatsby-plugin-mdx` v3 and want to migrate, you can follow the [extensive migration guide](/plugins/gatsby-plugin-mdx#migrating-from-v3-to-v4) to benefit from all new features.

We did our best to strike a balance between introducing meaningful breaking changes and keeping old behaviors. For example, while a lot of people use GraphQL nodes like `timeToRead` or `wordCount`, over the years it has become increasingly hard to fulfill every feature request and behavior that users wanted (e.g. correctly providing `timeToRead`/`wordCount` for every language is hard). One the one hand removing default fields like these means that you have to reimplement them on your own, but on the other hand this also means that you can more granularly customize them to your needs. Read [Extending the GraphQL MDX nodes](/plugins/gatsby-plugin-mdx#extending-the-graphql-mdx-nodes) for guidance on how to migrate.

If you have any questions along the way, post them either into the [umbrella discussion](https://github.com/gatsbyjs/gatsby/discussions/25068) or into the [`mdx-v2` channel on Discord](https://gatsby.dev/discord).

The [using-mdx example](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-mdx) also showcases some of the necessary migration steps.

## Open RFCs

### Slices API

We are adding a new API that we are calling “Slices”. By using a new `<Slice />` React component in combination with a `src/slices` directory or `createSlice` API for common UI features, Gatsby will be able to build and deploy individual pieces of your site that had content changes, not entire pages.

To create a slice, simply:

1. Create the slice by adding a `slices/footer.js` file, or using the `createPages` API action:

   ```js
   actions.createSlice({
     id: `footer`,
     component: require.resolve(`./src/components/footer.js`),
   })
   ```

2. Add a `<Slice />` component on your site, providing an `alias` string prop, where `alias` is either name of the file (in our case, `footer`). Any additional props passed will be handed down to the underlying component.

   ```jsx
   return (
     <>
       <Header className="my-header" />
       {children}
       <Slice alias="footer" />
     </>
   )
   ```

To read more, head over to [RFC: Slices API](https://github.com/gatsbyjs/gatsby/discussions/36339). We appreciate any feedback there.

### Changes in `sort` and aggregation fields in Gatsby GraphQL Schema

We are proposing Breaking Changes for the next major version of Gatsby to our GraphQL API. The goal of this change is increasing performance and reducing resource usage of builds. Proposed changes impact `sort` and aggregation fields (`group`, `min`, `max`, `sum`, `distinct`).

Basic example of proposed change:

Current:

```graphql
{
  allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
    nodes {
      ...fields
    }
  }
}
```

Proposed:

```jsx
{
  allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
    nodes {
      ...fields
    }
  }
}
```

To read more, head over to [RFC: Change to sort and aggregation fields API](https://github.com/gatsbyjs/gatsby/discussions/36242). We appreciate any feedback there.

## Notable bugfixes & improvements

- `gatsby-plugin-sharp`: `sharp` was updated to `0.30.7` (also in all other related packages). This deprecates the `failOnError` option as it's being replaced by the `failOn` option, via [PR #35539](https://github.com/gatsbyjs/gatsby/pull/35539)
- `gatsby`:
  - Fix `e.remove()` is not a function error when using Gatsby Head API, via [PR #36338](https://github.com/gatsbyjs/gatsby/pull/36338)
  - Make inline scripts run in develop, via [PR #36372](https://github.com/gatsbyjs/gatsby/pull/36372)
  - Make runtime error overlay work in non-v8 browsers, via [PR #36365](https://github.com/gatsbyjs/gatsby/pull/36365)
- `gatsby-source-contentful`: Correctly overwrite field type on Assets, via [PR #36337](https://github.com/gatsbyjs/gatsby/pull/36337)
- `gatsby-plugin-react-helment`: Stop appending empty title tags, via [PR #36303](https://github.com/gatsbyjs/gatsby/pull/36303)
- `gatsby-link`: Correctly export default for CommonJS, via [PR #36312](https://github.com/gatsbyjs/gatsby/pull/36312)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [Bi11](https://github.com/Bi11): fix(gatsby-plugin-image): Add `outputPixelDensities` to `SHARP_ATTRIBUTES` [PR #36203](https://github.com/gatsbyjs/gatsby/pull/36203)
- [Kornil](https://github.com/Kornil): chore(gatsby): convert babel-loader-helpers to typescript [PR #36237](https://github.com/gatsbyjs/gatsby/pull/36237)
- [Auspicus](https://github.com/Auspicus): chore(docs): Pre-encoded unicode characters can't be used in paths [PR #36325](https://github.com/gatsbyjs/gatsby/pull/36325)
- [axe312ger](https://github.com/axe312ger): BREAKING CHANGE(gatsby-plugin-mdx): MDX v2 [PR #35650](https://github.com/gatsbyjs/gatsby/pull/35650)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.21.0-next.0...gatsby@4.21.0
