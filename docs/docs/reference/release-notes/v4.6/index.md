---
date: "2022-01-25"
version: "4.6.0"
title: "v4.6 Release Notes"
---

Welcome to `gatsby@4.6.0` release (January 2022 #2)

Key highlights of this release:

- [Speeding Up Subsequent Queries](#speeding-up-subsequent-queries)
- [Tracking Image Changes in Markdown Files](#tracking-image-changes-in-markdown-files)
- [New Major Version for `gatsby-plugin-utils`](#fix-plugin-schema-validation)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.5)

[Full changelog][full-changelog]

---

## Speeding Up Subsequent Queries

Subseqent queries now get a ~10-15% performance boost! You'll see this improvement after your first `gatsby build` for all following runs (unless the cache is cleared). These percentage may defer depending on the complexity of nodes. We were able to achieve this by caching `rootNode` & `trackedRootNodes` across instances of `graphqlRunner` via [PR #33695](https://github.com/gatsbyjs/gatsby/pull/33695)

## Tracking Image Changes in Markdown Files

When using an image inside markdown files together with `gatsby-remark-images` (e.g. `![alt text](./some-image.jpg)`) there where cases when a change to the image wasn't reflected in the site. Changes like resizing or directly editing the image required a `gatsby clean` in the past. This broken functionality is now fixed with [PR #34433 ](https://github.com/gatsbyjs/gatsby/pull/34433) and changed images will now directly show during `gatsby develop` and `gatsby build`.

## New Major Version for `gatsby-plugin-utils`

You can [configure plugin options](/docs/how-to/plugins-and-themes/configuring-usage-with-plugin-options/) for your plugins and [unit test](/docs/how-to/plugins-and-themes/configuring-usage-with-plugin-options/#unit-testing-an-options-schema) the options schema using helper functions from `gatsby-plugin-utils`. The schema validation for the options schema now **does not** throw errors anymore on warnings like unknown keys (see [PR that implemented this](https://github.com/gatsbyjs/gatsby/pull/34182) for more information). This fixed an issue where default values where not passed through to the plugin if e.g. unknown keys were used.

Here's a short list of changes you'll need to make or be aware of:

- [`pluginOptionsSchema`](/docs/reference/config-files/gatsby-node/#pluginOptionsSchema) returns warnings instead of errors now for unknown keys
- [`testPluginOptionsSchema`](/docs/how-to/plugins-and-themes/configuring-usage-with-plugin-options/#unit-testing-an-options-schema) now returns `warnings` and `hasWarnings` in addition to the existing values

### Migration

Here's a short before/after example on how to migrate your test when you're checking for unknown keys.

**Before:**

```js:title=gatsby-node.js
// The plugin doesn't take any options
exports.pluginOptionsSchema = ({ Joi }) => Joi.object({})
```

```js:title=__tests__/gatsby-node.js
import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../gatsby-node"

it(`should not accept any options`, async () => {
  const expectedErrors = [`"optionA" is not allowed`]

  const { errors } = await testPluginOptionsSchema(
    pluginOptionsSchema, 
    {
      optionA: `This options shouldn't exist`,
    }
  )

  expect(errors).toEqual(expectedErrors)
})
```

**After:**

```js:title=__tests__/gatsby-node.js
import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../gatsby-node"

it(`should not accept any options`, async () => {
  const expectedWarnings = [`"optionA" is not allowed`]

  const { warnings, isValid, hasWarnings } = await testPluginOptionsSchema(
    pluginOptionsSchema,
    {
      optionA: `This options shouldn't exist`,
    }
  )
  expect(isValid).toBe(true)
  expect(hasWarnings).toBe(true)
  expect(warnings).toEqual(expectedWarnings)
})
```

## Notable Bugfixes & Improvements

- `gatsby-plugin-manifest`: Generate icons sequentially, via [PR #34331](https://github.com/gatsbyjs/gatsby/pull/34331)
- `create-gatsby`: Fixed an issue where user-provided `GATSBY_TELEMETRY_DISABLED` environment variable did not disable telemetry, via [PR #34495](https://github.com/gatsbyjs/gatsby/pull/34495)
- `gatsby-sharp`: Create more resilient wrapper around sharp, via [PR #34339](https://github.com/gatsbyjs/gatsby/pull/34339)
- `gatsby-source-contentful`: Enable tag support for assets, via [PR #34480](https://github.com/gatsbyjs/gatsby/pull/34480)
- `gatsby`: Optimized queries that filter just on `id`, via [PR #34520](https://github.com/gatsbyjs/gatsby/pull/34520)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.6.0-next.0...gatsby@4.6.0
