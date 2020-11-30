---
date: "2020-12-01"
version: "2.28.0"
---

# [v2.28](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.28.0-next.0...gatsby@2.28.0) (December 2020 #1)

---

Welcome to `gatsby@2.28.0` release (December 2020 #1).

Key highlights of this release:

- [New `gatsby new`](#new-gatsby-new) - new, interactive way to create a Gatsby site
- [Improved `react-refresh` integration](#improved-react-refresh-integration)
- [Feature flags in gatsby-config](#feature-flags-in-gatsby-config) - set your feature toggles without environment variables
- [Experimental: Lazy images in develop](#experimental-lazy-images-in-develop) - run image transformations only when they are needed by browser
- [Removed experimental lazy page bundling](#removed-experimental-lazy-page-bundling)
- [Notable bugfixes](#notable-bugfixes)

Sneak peek to next releases:

- [Less aggressive cache invalidation](#less-aggressive-cache-invalidation)

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](../v2.27/index.md)<br>
[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.28.0-next.0...gatsby@2.28.0)

## new `gatsby new`

In previous release we added [interactive way of scaffolding new gatsby project](../v2.27/index.md#create-gatsby) (with `npm init gatsby`). Now we adjusted `gatsby new` command when no arguments are passed to also use the same flow.

## Improved `react-refresh` integration

Gatsby had some support for `react-refresh` (or Fast Refresh as it can be referred to) already. This release improves it and adds better error overlays to be able to fix runtime and compilation error faster!

To use it:

```shell
GATSBY_HOT_LOADER=fast-refresh gatsby develop
```

## Feature flags in `gatsby-config`

Gatsby traditionally used environment variables to use various modes or enable experimental features. This was getting the job done but was far from pleasant experience. Setting environment variables through command line doesn't have uniform syntax for all operating systems (it's different for Windows and different for Linux or MacOS), it often forced using npm scripts when user wanted to use it permanently. Using flags in `gatsby-config.js` will allow to set and forget and will allow for tracking it in source control so the mode is consistent for everyone working on shared source code.

To use those, add `flags` to your `gatsby-config.js`:

```js
// In your gatsby-config.js
module.exports = {
  // your existing config
  flags: {
    FAST_DEV: true,
  },
}
```

Currently supported flags:

- `DEV_SSR` - SSR pages on full reloads during develop. Helps you detect SSR bugs and fix them without needing to do full builds.
- `QUERY_ON_DEMAND` - Only run queries when needed instead of running all queries upfront. Speeds starting the develop server.
- `LAZY_IMAGES` - Don't process images during development until they're requested from the browser. Speeds starting the develop server. See [Experimental: Lazy images in develo](#experimental-lazy-images-in-develop) section for additional details.
- `FAST_DEV` - Umbrella flag that enables `DEV_SSR`, `QUERY_ON_DEMAND` and `LAZY_IMAGES` features.

## Removed experimental lazy page bundling

In previous release we added [Experimental: Lazy page bundling](../v2.27/index.md#experimental-lazy-page-bundling-in-development) mode for `gatsby develop` that would delay compiling page templates until it was needed. While preliminary tests were very promising, we discovered few showstoppers that degraded development experience. [We decided to end the experiment](https://github.com/gatsbyjs/gatsby/discussions/28137#discussioncomment-138998) for now and shift our efforts to [Less aggressive cache invalidation](#less-aggressive-cache-invalidation).

## Making `gatsby develop` faster

We continue working on speeding up development server startup:

### Experimental: Lazy images in develop

We've got some feedback that the more images your website contains, the slower your local development experience gets.
You spend time waiting for images to process, instead of you know, developing! No longer!
This experimental version of `gatsby-plugin-sharp` only does image processing when the page gets requested.

To use it, make sure you have `gatsby-plugin-sharp@^2.10.0` and add

[Details and discussion](https://github.com/gatsbyjs/gatsby/discussions/27603).

## Notable bugfixes

...

## Work in progress

### Less aggressive cache invalidation

Gatsby is quite aggressive when it comes to cache clearing. This is particularly painful when it comes to downloading remote images and image transformation. We will be exploring ways to keep some caches around for longer if those don't really need to be invalidated.

## Contributors

A big **Thank You** to [everyone who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.28.0-next.0...gatsby@2.28.0) to this release 💜
