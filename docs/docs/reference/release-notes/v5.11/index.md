---
date: "2023-06-15"
version: "5.11.0"
title: "v5.11 Release Notes"
---

Welcome to `gatsby@5.11.0` release (June 2023 #1)

Key highlights of this release:

- [RFC: Adapters](#rfc-adapters)
- [`gatsby-source-wordpress`: Support for multiple instances](#gatsby-source-wordpress-support-for-multiple-instances)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v5.10)

[Full changelog][full-changelog]

---

## RFC: Adapters

We intend to add an additional type of plugin to Gatsby called Adapter. Adapters are responsible for taking the production output from Gatsby and turning it into something your deployment platform (e.g. Netlify, Vercel, Self-Hosted, etc.) understands. As part of this work we also intend to add a `headers` and `adapter` option to `gatsby-config`.

**We want to make it easier to deploy and host Gatsby on any platform.**

If you want to read all the details and try it out, head over to [RFC: Adapters](https://github.com/gatsbyjs/gatsby/discussions/38231). We also prepared a demo project at [gatsby-adapters-alpha-demo](https://github.com/LekoArts/gatsby-adapters-alpha-demo) and a [Codesandbox](https://githubbox.com/LekoArts/gatsby-adapters-alpha-demo).

You'll be able to use an adapter inside your `gatsby-config` like so:

```js:title=gatsby-config.js
const adapter = require("gatsby-adapter-foo")

module.exports = {
  adapter: adapter()
}
```

As part of this RFC we also saw the need to allow setting HTTP headers for request paths which you’ll be able to do with the new `headers` option:

```js:title=gatsby-config.js
module.exports = {
  headers: [
    {
      source: "/some-path",
      headers: [
        {
          key: "x-custom-header",
          value: "hello world"
        }
      ]
    }
  ]
}
```

Please give [RFC: Adapters](https://github.com/gatsbyjs/gatsby/discussions/38231) a read and let us know what you think!

## `gatsby-source-wordpress`: Support for multiple instances

Up until now you could only have one instance of `gatsby-source-wordpress` inside your `gatsby-config`. You're now able to use as many instances as you want as long as you provide a [`typePrefix`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-wordpress/docs/plugin-options.md#schematypeprefix).

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        url: `https://burgerplace.com/graphql`,
        schema: {
          typePrefix: `Burger`,
        },
      },
    },
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        url: `https://tacoplace.com/graphql`,
        schema: {
          typePrefix: `Taco`,
        },
      },
    },
  ]
}
```

Internally, `gatsby-source-wordpress` uses a global store to pass information around. This store is now scoped to the `typePrefix` which in turn enables support for multiple instances.

In case you missed it, we also enabled [typePrefix support for `gatsby-source-contentful`](https://github.com/gatsbyjs/gatsby/pull/37981) to enable multiple instances.

## Notable bugfixes & improvements

- We merged 50 [renovate](https://www.mend.io/free-developer-tools/renovate/) PRs to update dependencies across various packages. If you're curious about the changes, you can use [this GitHub search](https://github.com/gatsbyjs/gatsby/pulls?q=is%3Apr+sort%3Aupdated-desc+author%3Aapp%2Frenovate+merged%3A2023-05-16..2023-06-15).
- `gatsby`
  - Support `style` attribute on `html` & `body`, via [PR #38098](https://github.com/gatsbyjs/gatsby/pull/38098)
  - Fix regression in type ownership, via [PR #38235](https://github.com/gatsbyjs/gatsby/pull/38235)
- `gatsby-plugin-mdx`: Allow modern JS syntax in MDX layout components, via [PR #38126](https://github.com/gatsbyjs/gatsby/pull/38126)
- `gatsby-source-wordpress`: Allow using SSR/DSG when using `options.auth`, via [PR #38103](https://github.com/gatsbyjs/gatsby/pull/38103)
- `gatsby-transformer-screenshot`: Add `screenshotEndpoint` option, via [PR #38136](https://github.com/gatsbyjs/gatsby/pull/38136)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [ModupeD](https://github.com/ModupeD): chore(docs): Add Flightcontrol to "Deploying to Other Services" [PR #38194](https://github.com/gatsbyjs/gatsby/pull/38194)
- [averysmithproductions](https://github.com/averysmithproductions): chore(docs): Update schema-customization type builder types [PR #38095](https://github.com/gatsbyjs/gatsby/pull/38095)
- [davwheat](https://github.com/davwheat): chore(docs): Add note about TS limitations on MDX layout components [PR #38104](https://github.com/gatsbyjs/gatsby/pull/38104)
- [naveen521kk](https://github.com/naveen521kk): chore(gatsby-plugin-feed): Remove `@hapi/joi` dependency [PR #38205](https://github.com/gatsbyjs/gatsby/pull/38205)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.11.0-next.0...gatsby@5.11.0
