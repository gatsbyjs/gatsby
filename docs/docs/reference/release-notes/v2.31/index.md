---
date: "2021-01-19"
version: "2.31.0"
---

# [v2.31](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.31.0-next.0...gatsby@2.31.0) (January 2021 #2)

---

Welcome to `gatsby@2.31.0` release (January 2021 #2)

Key highlights of this release:

- [Performance improvements](#performance-improvements)
- [Support for Gatsby's fragments in GraphiQL](#TODO)
- [Use Fast Refresh by default for React 17](#use-fast-refresh-by-default-for-react-17)

Also check out [notable bugfixes](#notable-bugfixes).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v2.30)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.31.0-next.0...gatsby@2.31.0)

## Performance improvements

A massive reduction in build speed for local file usage was found in PR [#28891](https://github.com/gatsbyjs/gatsby/pull/28891). This change hugely benefits sites that use markdown and/or images, for up to an 84% improvement on our 128k pages markdown benchmark.

In [#28957](https://github.com/gatsbyjs/gatsby/pull/28957) an improvement to `gatsby develop` was made by not using the `debug` config for `bluebird`. This can improve your `source nodes` step.

## Support for Gatsby's fragments in GraphiQL

The underlying `graphiql` package added support for registering fragments and Gatsby now leverages this new feature! You now get auto-completion for image fragments inside GraphiQL:

![Screenshot showing the GraphiQL IDE with the fragments in auto-completion](https://user-images.githubusercontent.com/419821/103703746-686ce880-4fa8-11eb-852a-8f33f0b5b6b2.png)

## Use Fast Refresh by default for React 17

With the PRs [#28689](https://github.com/gatsbyjs/gatsby/pull/28689) & [#28930](https://github.com/gatsbyjs/gatsby/pull/28930) merged, Gatsby will now automatically use Fast Refresh if you use React >= 17.0.0 for your site. As you can read in the [release notes for 2.28](/docs/reference/release-notes/v2.28#improved-fast-refresh-integration) we've added support for Fast Refresh giving you a better (and custom) error overlay, quicker error recovery and in general a better `gatsby develop` experience.

Two ESLint rules that will warn you against anti-patterns in your code were added now:

- No anonymous default exports
- Page templates must only export one default export (the page) and `query` as a named export

Please give us your feedback about the Fast Refresh integration in the [umbrella issue](https://github.com/gatsbyjs/gatsby/discussions/28390). Thanks!

## Notable bugfixes

- Extract non-CSS-in-JS CSS and add to `<head>` when SSRing in develop mode (with `DEV_SSR` flag), via [#28471](https://github.com/gatsbyjs/gatsby/pull/28471)
- Show stack trace for non-GraphQL errors, via [#28888](https://github.com/gatsbyjs/gatsby/pull/28888)
- Update vulnerable packages and include React 17 in peerDeps, via [#28545](https://github.com/gatsbyjs/gatsby/pull/28545)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.31.0-next.0...gatsby@2.31.0) to this release 💜

TODO: Needs to be generated after with the script
