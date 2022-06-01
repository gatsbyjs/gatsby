---
date: "2022-03-01"
version: "4.9.0"
title: "v4.9 Release Notes"
---

Welcome to `gatsby@4.9.0` release (March 2022 #1)

Key highlights of this release:

- [Support for TypeScript in `gatsby-config` and `gatsby-node`](#support-for-typescript-in-gatsby-config-and-gatsby-node)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.8)

[Full changelog][full-changelog]

---

## Support for TypeScript in `gatsby-config` and `gatsby-node`

In the last release we added [support for TypeScript in `gatsby-browser` and `gatsby-ssr`](/docs/reference/release-notes/v4.8/#support-for-typescript-in-gatsby-browser-and-gatsby-ssr) and as a follow-up we're introducing a much requested feature: Support for TypeScript in `gatsby-config` and `gatsby-node` 🎉

When you try it out in your project, please give us feedback in the [accompanying RFC](https://github.com/gatsbyjs/gatsby/discussions/34613) on what you like, what doesn't work, and what you like to see in the future. **Note:** There are currently [some limitations](/docs/how-to/custom-configuration/typescript/#current-limitations) that you'll need to be aware of. In the [RFC](https://github.com/gatsbyjs/gatsby/discussions/34613) you can also read why we chose [Parcel](https://parceljs.org/) for this feature and how we did it.

You can learn everything about this new feature on the [TypeScript and Gatsby documentation page](/docs/how-to/custom-configuration/typescript/) but here are two small examples of `gatsby-config` and `gatsby-node` with TypeScript:

```ts:title=gatsby-config.ts
import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: "Your Title",
  },
  plugins: [],
}

export default config
```

```ts:title=gatsby-node.ts
import type { GatsbyNode } from "gatsby"

type Person = {
  id: number
  name: string
  age: number
}

export const sourceNodes: GatsbyNode["sourceNodes"] = async ({
  actions,
  createNodeId,
  createContentDigest,
}) => {
  const { createNode } = actions

  const data = await getSomeData()

  data.forEach((person: Person) => {
    const node = {
      ...person,
      parent: null,
      children: [],
      id: createNodeId(`person__${person.id}`),
      internal: {
        type: "Person",
        content: JSON.stringify(person),
        contentDigest: createContentDigest(person),
      },
    }

    createNode(node)
  })
}
```

You can also check out the [using-typescript](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-typescript) and [using-vanilla-extract](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-vanilla-extract) examples!

### Migrating away from old workarounds

_This list is probably incomplete. If you've used another workaround in the past, add it to this document by using the "Edit on GitHub" button at the bottom._

- [`ts-node`](https://typestrong.org/ts-node/): By having both a `gatsby-config.js` and `gatsby-config.ts` (where `gatsby-config.js` registers `ts-node`) you were able to use TypeScript. You'll need to remove the `gatsby-config.js` file, `ts-node` dependency, and address any of the [current limitations](/docs/how-to/custom-configuration/typescript/#current-limitations). When both a `gatsby-config.js` and `gatsby-config.ts` exist the `.ts` file will now always take precedence.

## Notable bugfixes & improvements

- `gatsby`
  - Cache date formatting in LMDB cache for speed improvements, via [PR #34834](https://github.com/gatsbyjs/gatsby/pull/34834)
  - Batch page dependency actions for speed improvements, via [PR #34856](https://github.com/gatsbyjs/gatsby/pull/34856)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [0xflotus](https://github.com/0xflotus)
  - fix: small typo error [PR #34848](https://github.com/gatsbyjs/gatsby/pull/34848)
  - chore(gatsby-plugin-image): update readme typo [PR #34847](https://github.com/gatsbyjs/gatsby/pull/34847)
- [jamatz](https://github.com/jamatz): docs(gatsby): GatbsyImage -> GatsbyImage [PR #34914](https://github.com/gatsbyjs/gatsby/pull/34914)
- [brherr](https://github.com/brherr): Update gatsby-config.js [PR #34924](https://github.com/gatsbyjs/gatsby/pull/34924)
- [benackles](https://github.com/benackles): chore(docs): Update link to "How to create a Gatsby Starter" [PR #34937](https://github.com/gatsbyjs/gatsby/pull/34937)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.9.0-next.0...gatsby@4.9.0
