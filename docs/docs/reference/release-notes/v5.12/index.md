---
date: "2023-08-24"
version: "5.12.0"
title: "v5.12 Release Notes"
---

Welcome to `gatsby@5.12.0` release (August 2023 #1)

Key highlight of this release:

- [Adapters](#adapters)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v5.11)

[Full changelog][full-changelog]

---

## Adapters

In the beginning, Gatsby was just a Static Site Generation but now it’s a [Reactive Site Generator](https://www.gatsbyjs.com/blog/re-introducing-gatsby-a-reactive-site-generator) that offers features like Deferred Static Generation, Server-Side Rendering, or serverless functions. These additional features require more glue code on deployment platforms and for self-hosting Gatsby. In the past, plugins had to work around missing features or reach into Gatsby’s internals.

Luckily, these problems are now in the past as today we’re happy to introduce **Gatsby Adapters**!

Adapters are responsible for taking the production output from Gatsby and turning it into something your deployment platform understands. We want to make it easier to deploy and host Gatsby on your preferred platform and Gatsby Adapters are a huge step towards that goal.

Want to learn more? Head to the [Gatsby adapters docs](/docs/how-to/previews-deploys-hosting/adapters).

### Zero-Configuration Deployments

In the past, deployment platforms had to resort to brittle tricks to automatically inject their deployment plugin to provide seamless experience for users or force users to manually install and configure their deployment plugin. With release of adapters we introduce easier support for Zero-Configuration Deployments. Gatsby will automatically install and use platform specific adapter.

Check [Zero-Configuration Deployments documentation](/docs/how-to/previews-deploys-hosting/zero-configuration-deployments/) for more information.

### HTTP Headers

As part of the work on Gatsby Adapters, you’re now also able to define custom HTTP headers inside `gatsby-config`:

```ts
import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  headers: [
    {
      source: "/some-path",
      headers: [
        {
          key: "x-custom-header",
          value: "hello world",
        },
      ],
    },
  ],
}

export default config
```

This is common feature that deployment plugin offered via their plugin options so we decided to make that feature first class citizen in Gatsby.

Check [HTTP Headers](/docs/how-to/previews-deploys-hosting/headers/) for more information.

## Notable bugfixes & improvements

- `gatsby`:
  - Correctly support slice overrides in 404 page, via [PR #38263](https://github.com/gatsbyjs/gatsby/pull/38358)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [SagarGi](https://github.com/SagarGi): chore(e2e-tests): change deprecated e2e test repo name [PR #38271](https://github.com/gatsbyjs/gatsby/pull/38271)
- [derrysucari](https://github.com/derrysucari): fix(gatsby-source-contentful): handle nullable fields [PR #38358](https://github.com/gatsbyjs/gatsby/pull/38358)
- [dslovinsky](https://github.com/dslovinsky): fix(babel-plugin-remove-graphql-queries): Correct `staticQueryDir` default and improved Storybook support [PR #38267](https://github.com/gatsbyjs/gatsby/pull/38267)
- [kaltepeter](https://github.com/kaltepeter): chore(docs): clarify react upgrade with --legacy-peer-deps [PR #38359](https://github.com/gatsbyjs/gatsby/pull/38359)
- [stall84](https://github.com/stall84): chore(docs): Improve "using-local-fonts" [PR #38250](https://github.com/gatsbyjs/gatsby/pull/38250)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.12.0-next.0...gatsby@5.12.0
