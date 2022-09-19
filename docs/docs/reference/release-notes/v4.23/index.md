---
date: "2022-09-13"
version: "4.23.0"
title: "v4.23 Release Notes"
---

Welcome to `gatsby@4.23.0` release (September 2022 #1)

Key highlights of this release:

- [Open RFCs](#open-rfcs)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.22)

[Full changelog][full-changelog]

---

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

- `gatsby`:
  - Improve webpack tree shaking of `gatsby-browser-entry` imports, via [#36484](https://github.com/gatsbyjs/gatsby/pull/36484)
  - Support `node:` protocol in engine bundling, via [#36506](https://github.com/gatsbyjs/gatsby/pull/36506)
  - Improve error handling during React 18's `renderToPipeableStream`, via [#36555](https://github.com/gatsbyjs/gatsby/pull/36555)
  - Inject context passed by `createResolverContext` action when materializing fields, via [#36552](https://github.com/gatsbyjs/gatsby/pull/36552)
- `gatsby-source-wordpress`:
  - Match full urls when replacing media item links, via [#36447](https://github.com/gatsbyjs/gatsby/pull/36447)
  - Ensure node data replacements for post updates, via [#36474](https://github.com/gatsbyjs/gatsby/pull/36474)
- `gatsby-plugin-sharp`:
  - Upgrade `svgo` dependency to fix vulnerability, via [#36445](https://github.com/gatsbyjs/gatsby/pull/36445)
- `gatsby-dev-cli`:
  - Make package work with npm 8.5, via [#36498](https://github.com/gatsbyjs/gatsby/pull/36498)
- `create-gatsby`:
  - Ensure plugins are installed correctly, via [#36566](https://github.com/gatsbyjs/gatsby/pull/36566)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [nnmax](https://github.com/nnmax)
  - chore(docs): update url of `deleteNode` [PR #36502](https://github.com/gatsbyjs/gatsby/pull/36502)
  - chore(gatsby): perfect `GatsbyConfig.proxy` type [PR #36548](https://github.com/gatsbyjs/gatsby/pull/36548)
- [CobyPear](https://github.com/CobyPear): chore(gatsby): Update `react-refresh` to `^0.14.0` [PR #36553](https://github.com/gatsbyjs/gatsby/pull/36553)
- [IObert](https://github.com/IObert): chore(docs): Fix path to components in part 6 [PR #36463](https://github.com/gatsbyjs/gatsby/pull/36463)
- [subhoghoshX](https://github.com/subhoghoshX): fix(docs): fix creating routes code snippet [PR #36479](https://github.com/gatsbyjs/gatsby/pull/36479)
- [dreibona](https://github.com/dreibona): chore(docs): Fix `gatsby-source-filesystem` typo [PR #36471](https://github.com/gatsbyjs/gatsby/pull/36471)
- [MarcusCole518](https://github.com/MarcusCole518)
  - chore(docs): migrate cloud docs to .com [PR #36389](https://github.com/gatsbyjs/gatsby/pull/36389)
  - chore(docs): migrate cloud docs to dotcom(1) [PR #36452](https://github.com/gatsbyjs/gatsby/pull/36452)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.23.0-next.0...gatsby@4.23.0
