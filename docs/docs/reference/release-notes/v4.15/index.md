---
date: "2022-05-24"
version: "4.15.0"
title: "v4.15 Release Notes"
---

Welcome to `gatsby@4.14.0` release (May 2022 #1)

Key highlights of this release:

- [Script Component](#script-component)
- [GraphQL Typegen](#graphql-typegen)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.14)

[Full changelog][full-changelog]

---

## Script Component

We're releasing a built-in `<Script>` component that aids in loading third-party scripts performantly.

As a familiar React component, migration to the `<Script>` component is as simple as importing and capitalizing your existing script tags in most cases:

```diff
import { Script } from "gatsby";

-<script src="https://my-example-script" />
+<Script src="https://my-example-script" />
```

This will load your script after your page has hydrated by default, offering performance benefits over the native `<script>` tag (even with `async` or `defer` applied).

The Gatsby `<Script>` component includes three loading strategies that you can define, allowing a great deal of flexibility via a single `strategy` attribute:

- `post-hydrate` - Loads after the page has hydrated
- `idle` - Loads after the page has become idle
- `off-main-thread` - Loads off the main thread in a web worker via [Partytown](https://partytown.builder.io)

In addition, these features are supported out of the box:

- Inline scripts via template literals and the `dangerouslySetInnerHTML` property
- `onLoad` and `onError` callbacks for `post-hydrate` and `idle` scripts with sources
- Partytown proxy and forwards collection

For full details, see the [Gatsby Script reference documentation](/docs/reference/built-in-components/gatsby-script/).

## GraphQL Typegen

In the last [v4.14 release](/docs/reference/release-notes/v4.14/#experimental-graphql-typegen) we've added GraphQL Typegen as an experimental feature. After some bugfixing and improving its documentation the feature is now generally available behind a `gatsby-config` option.

```js:title=gatsby-config.js
module.exports = {
  graphqlTypegen: true,
}
```

Read the [GraphQL Typegen guide](/docs/how-to/local-development/graphql-typegen) to learn how you can use it today and continue to give us your feedback in the [RFC discussion](https://github.com/gatsbyjs/gatsby/discussions/35420).

## Notable bugfixes & improvements

TODO

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.15.0-next.0...gatsby@4.15.0
