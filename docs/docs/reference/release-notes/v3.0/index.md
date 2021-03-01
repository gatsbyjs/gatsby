---
date: "2021-03-02"
version: "3.0.0"
---

# v3.0 (March 2021 #1)

---

Welcome to `gatsby@3.0.0` release (March 2021 #1).

This is the first major bump of Gatsby since [September 2018](https://www.npmjs.com/package/gatsby/v/2.0.0)!
We’ve tried to make migration smooth, please refer to the [migration guide](/docs/reference/release-notes/migrating-from-v2-to-v3/)
and [let us know](https://github.com/gatsbyjs/gatsby/issues/new/choose) if you encounter any issues when migrating.

Key highlights of this release:

- [Incremental Builds in OSS](#incremental-builds-in-oss) - regenerate HTML only when necessary; faster re-builds
- [Fast Refresh](#fast-refresh) - new hot-reloading engine, error recovery, better DX
- [gatsby-plugin-image@1.0.0](#gatsby-plugin-image100)
- [gatsby-source-wordpress@5.0.0](#gatsby-source-wordpress500) - brand new, significantly improved integration with WordPress
- [gatsby-source-contentful@5.0.0](#gatsby-source-contentful500)
- [Miscellaneous changes in plugins](#miscellaneous-changes-in-plugins)

Major dependency updates:

- [Node 12](#node-12)
- [webpack 5](#webpack-5)
- [React 17](#react-17)
- [GraphQL 15](#graphql-15)
- [Eslint 7](#eslint-7)

Also check out [notable bugfixes and improvements](#notable-bugfixes-and-improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v2.32)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.32.0-next.0...gatsby@3.0.0)

## Breaking Changes

If you're looking for an overview of all breaking changes and how to migrate, please see the [migrating from v2 to v3 guide](/docs/reference/release-notes/migrating-from-v2-to-v3/).

## Incremental Builds in OSS

Gatsby v2 introduced experimental "Conditional Page Builds" (enabled by `GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES` environment variable). It had some gotchas and quirks and wasn't ready yet for GA. With Gatsby v3 we improved this feature, and activated it by default for everyone! So incremental builds is available in OSS now. This improvement is (re)generating only subset of HTML files that needs to be generated. To be able to use it you will need to keep to `.cache` and `public` directories from previous builds.

Take a project powered by Shopify as an example. You have your listing of all products and then individual product pages -- when you change one single product, only that page should be rebuilt. In the screenshot below you can see exactly that (the sentence "Hello World" was added to the description):

![Side-by-side view of a Shopify store instance on the left, and the preview on the right. At the bottom the terminal shows that after the change only one page was rebuilt](./incremental-builds-in-oss.jpg)

The screenshot is taken from a lengthy video about Gatsby v3 at [GatsbyConf](https://gatsbyconf.com/). You can view the video showcasing this feature on YouTube there.

### How does it work?

Gatsby tracks "inputs" when generating HTML files. When those inputs change since the last build, the HTML files are marked to be regenerated (if they don't change we can reuse HTML files generated in previous build). In particular we track:

- which page template the page is using
- result of page query
- results of static queries used by a page template
- frontend source code (shared and also browser `gatsby-browser` / SSR `gatsby-ssr` specifically)

### Gotchas

As we mentioned, Gatsby tracks "inputs" used to generate HTML files. However, the `gatsby-ssr` file allows some arbitrary code execution. This includes for example `fs` reads. While Gatsby could also track files that are read, the custom code that does those reads might have some special logic that Gatsby is not aware of. If Gatsby discovers that those are used, it will disable "Incremental Builds"-mode to stay on the safe side (there will be warnings mentioning "unsafe builtin method").

If your `gatsby-ssr` (either site itself or plugin) make use of FS reads, head over to [migrating from v2 to v3 guide](/docs/reference/release-notes/migrating-from-v2-to-v3/#using-fs-in-SSR) and check how to migrate.

## Fast Refresh

After adding our initial Fast Refresh integration back in November 2020, we worked on it over the last couple of releases. For Gatsby v3 we further improved usability, reliability, and accessibility to make it the default overlay. With this the old `react-hot-loader` is removed and you can benefit from all the new features it has: Fast Refresh is faster, handles errors better, and preserves state across re-renders.

Here's a preview:

![Three error overlays from left to right: Compile error, GraphQL errors, and runtime errors](./compile-graphql-runtime-errors.jpg)

We built a custom error overlay that aims to give you helpful information to fix your bugs more quickly. It features:

- A clear indication whether it's a runtime error, compile error, or GraphQL error
- Source code snippets that you can open in your editor with the press of a button
- The exact error location, including the original line and column
- The overlay automatically goes away once you fix the error

We also added two new ESLint rules inside the default configuration that will warn you against anti-patterns in your code:

- No anonymous default exports
- Page templates must only export one default export (the page) and `query` as a named export

## Node 12

We are dropping support for Node 10 as it is approaching maintenance EOL date (2021-04-30).
The new required version of Node is `12.13.0`. See the main changes in [Node 12 release notes](https://nodejs.org/en/blog/release/v12.0.0/).

Check [Node’s releases document](https://github.com/nodejs/Release#nodejs-release-working-group) for version statuses.

## webpack 5

Please refer to webpack own [release notes](https://webpack.js.org/blog/2020-10-10-webpack-5-release/) for a full list of changes.

Key changes in the new webpack version:

- Improve build performance with Persistent Caching
- Improve Long Term Caching with better algorithms and defaults
- Improve bundle size with better Tree Shaking and Code Generation
- Improve compatibility with the web platform
- Clean up internal structures that were left in a weird state while implementing features in v4 without introducing any breaking changes
- Prepare for future features by introducing breaking changes now, allowing us to stay on v5 for as long as possible

What does that mean for your Gatsby site? Gatsby is now able to tree-shake on a page level instead of an app level. You'll see reductions up to 20% on file size. Recurring users benefit from the improved hashing algorithms as unchanged files will stay in the browser cache.

We’ve tried to fence you from the burden of manual webpack migration but if you are using a custom
webpack config or community plugins that do not support webpack 5 yet, you may find the [webpack migration guide](https://webpack.js.org/migrate/5/) useful.

## React 17

Please refer to React's own [release notes](https://reactjs.org/blog/2020/10/20/react-v17.html) for a full list of changes.

The minimum version of Gatsby is now 16.9.0 to support Fast-Refresh, React Hooks, Suspense by default. We've also made sure we're 100% compatible with React 17. To use the new [React JSX transformer](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) have a look at the [`babel-preset-gatsby`](#babel-preset-gatsby) section below.

With this change, we'll be adding more experiments to support [Concurrent mode](https://reactjs.org/blog/2019/11/06/building-great-user-experiences-with-concurrent-mode-and-suspense.html) and [React Server Components](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html) in future releases.

## GraphQL 15

Please refer to `graphql-js`'s own [release notes](https://github.com/graphql/graphql-js/releases/tag/v15.0.0) for a full list of changes.

With this upgrade we can finally leverage interface inheritance for [queryable interfaces](https://www.gatsbyjs.com/docs/reference/graphql-data-layer/schema-customization/#queryable-interfaces-with-the-nodeinterface-extension).
You no longer need to use `@nodeInterface` directive in schema customization:

```diff
exports.createSchemaCustomization = function createSchemaCustomization({ actions }) {
  const { createTypes } = actions
  createTypes(`
-   interface Foo @nodeInterface
+   interface Foo implements Node
    {
      id: ID!
    }
  `)
}
```

Also, Gatsby now displays GraphQL deprecations as CLI warnings when queries. Example output:

![GraphQL deprecation warning in CLI](./graphql-deprecation-warnings.png)

## Eslint 7

Please refer to `eslint`'s own [migration guide](https://eslint.org/docs/user-guide/migrating-to-7.0.0) to update your custom eslint files.

If you rely on Gatsby's default eslint configuration - you should have a smooth transition. We upgraded the underlying rules so you might get some new warnings/errors.

Gatsby no longer uses the deprecated `eslint-loader`, we’ve moved to `eslint-webpack-plugin`. By using the plugin, behaviour has changed a little bit as warnings and errors are displayed later than in version 2.

## gatsby-plugin-image@1.0.0

This release includes a new plugin, `gatsby-plugin-image`, replacing the old `gatsby-image` plugin. Built from the ground up for speed and best practices, it's the most performant way to use images in React. If you saw your scores drop with recent Lighthouse updates, migrating to this plugin should help you get top scores again. It comes with a new, simplified GraphQL API (no more fragments), as well as a new `StaticImage` component that's as easy to use as an `<img>` tag.

The `GatsbyImage` component supports three responsive layout types, as shown in the video below.

<video controls autoplay loop>
  <source
    type="video/mp4"
    src="/docs/reference/built-in-components/layouts.mp4"
  />
  <p>Your browser does not support the video element.</p>
</video>

There is a codemod available to help migrate from `gatsby-image`. Support is included in all sources that use `childImageSharp`, as well as out of the box support in several CMS plugins, with more coming soon.

For more information, see:

- [Migrating from gatsby-image to gatsby-plugin-image](/docs/reference/release-notes/image-migration-guide/)
- [The step-by-step guide to using gatsby-plugin-image](/docs/how-to/images-and-media/using-gatsby-plugin-image/)
- [The reference guide](/docs/reference/built-in-components/gatsby-plugin-image/)
- [The plugin README](/plugins/gatsby-plugin-image/)

## gatsby-source-wordpress@5.0.0

Recently we’ve announced the brand new WordPress integration. Refer to [this blog post](/blog/wordpress-integration/)
for full details.

The originally published version of renewed `gatsby-source-wordpress` is `4.0.0`. It is
fully compatible with Gatsby v2.

For Gatsby v3 bump we’ve also bumped `gatsby-source-wordpress` to `5.0.0`. It should
be a straight-forward update from `gatsby-source-wordpress@^4.0.0`, no additional changes
from you are required.

## gatsby-source-contentful@5.0.0

- Migrated to the latest Contentful SDK, via [PR #29520](https://github.com/gatsbyjs/gatsby/pull/29520)
- Compatibility with `gatsby-plugin-image`
- Retries when downloading assets
- Retries on network errors

## Miscellaneous changes in plugins

### `babel-preset-gatsby`

`babel-preset-gatsby` now accepts `reactImportSource` which is passed to the underlying `@babel/preset-react` importSource field. Note that this field is only supported when `reactRuntime` is `automatic`, it is `classic` by default.

Configuration looks like this.

```json
{
  "presets": [
    [
      "babel-preset-gatsby",
      {
        "reactRuntime": "automatic",
        "reactImportSource": "@emotion/react"
      }
    ]
  ]
}
```

### `gatsby-plugin-guessjs`

The plugin is **deprecated**. It is not compatible with Gatsby v3.

### `gatsby-transformer-remark`

When using the `tableOfContents` functionality, the defaults have changed. `absolute` now defaults to `false` and `pathToSlugField` defaults to an empty string.

### `gatsby-react-router-scroll`

`ScrollContainer`, previously deprecated, has now been removed. Please use the `useScrollRestoration`hook instead.

### `gatsby-core-utils`

Introduce `fetchRemoteNode` utility (supersedes file download utils from `gatsby-source-filesystem`) via [PR #29531](https://github.com/gatsbyjs/gatsby/pull/29531)

### `gatsby-plugin-styled-components`

Support `topLevelImportPaths` option, via [PR #29544](https://github.com/gatsbyjs/gatsby/pull/29544)

### `gatsby-plugin-canonical-urls`

Add plugin options validation to `gatsby-plugin-canonical-urls`, via [PR #29688](https://github.com/gatsbyjs/gatsby/pull/29688)

## Notable bugfixes and improvements

- Drop `terminal-link` from our CLI as in some terminals it turned lines blank, via [PR #29472](https://github.com/gatsbyjs/gatsby/pull/29472)
- Update the `pathExist` function in `gatsby-plugin-feed`, via [PR #29616](https://github.com/gatsbyjs/gatsby/pull/29616)
- Cache avif images in `gatsby-plugin-offline`, via [PR #29394](https://github.com/gatsbyjs/gatsby/pull/29394)
- Improve efficiency when writing html files to disk, via [PR #29219](https://github.com/gatsbyjs/gatsby/pull/29219)
- 10-20% faster sourcing by memoizing actions when running plugins, via [PR #29240](https://github.com/gatsbyjs/gatsby/pull/29240)
- Do not miss page invalidations when using `runQuery` in custom resolvers, via [PR #29392](https://github.com/gatsbyjs/gatsby/pull/29392)
- Upgrade typescript to 4.0, via [PR #29388](https://github.com/gatsbyjs/gatsby/pull/29388)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.32.0-next.0...gatsby@3.0.0) to this release 💜

TODO: Needs to be generated after with the script
