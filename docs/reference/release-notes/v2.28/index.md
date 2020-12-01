---
date: "2020-12-01"
version: "2.28.0"
---

# [v2.28](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.28.0-next.0...gatsby@2.28.0) (December 2020 #1)

---

Welcome to `gatsby@2.28.0` release (December 2020 #1).

Key highlights of this release:

- [New `gatsby new`](#new-gatsby-new) - new, interactive way to create a Gatsby site
- [Feature flags in gatsby-config](#feature-flags-in-gatsby-config) - set your feature toggles without environment variables
- [Improved Fast Refresh integration](#improved-fast-refresh-integration)
- [Experimental: Lazy images in develop](#experimental-lazy-images-in-develop) - run image transformations only when they are needed by browser
- [Removed experimental lazy page bundling](#removed-experimental-lazy-page-bundling)
- [Notable bugfixes](#notable-bugfixes)

Sneak peek to next releases:

- [Less aggressive cache invalidation](#less-aggressive-cache-invalidation)

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](../v2.27/index.md)<br>
[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.28.0-next.0...gatsby@2.28.0)

## New `gatsby new`

In previous release we added [interactive way of scaffolding new gatsby project](../v2.27/index.md#create-gatsby) (with `npm init gatsby`). Now we adjusted `gatsby new` command when no arguments are passed to also use the same flow.

## Feature flags in `gatsby-config`

Gatsby traditionally used environment variables to use various modes or enable experimental features. This worked, but it was far from pleasant and had many issues, notably:

- Setting environment variables has idiosyncrasies across platforms (it's different for Windows and different for Linux or MacOS)
- Forced using NPM scripts (and correlating environment variables in continuous deployment solutions like Gatsby Cloud)

No longer! Now you can use flags in `gatsby-config.js`, which will work the same regardless of which environment you're on, where you're deploying, and for every member of your team! Woo hoo!

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

- `DEV_SSR` - Server-side render (SSR) pages on full reloads during develop. Helps you detect SSR bugs and fix them without needing to do full builds.
- `QUERY_ON_DEMAND` - Only run queries when needed instead of running all queries upfront. Speeds starting the develop server.
- `LAZY_IMAGES` - Don't process images during development until they're requested from the browser. Speeds starting the develop server (requires `gatsby-plugin-sharp@^2.10.0`). See [Experimental: Lazy images in develop](#experimental-lazy-images-in-develop) section for additional details.
- `FAST_DEV` - Umbrella flag that enables `DEV_SSR`, `QUERY_ON_DEMAND` and `LAZY_IMAGES` features.
- `FAST_REFRESH` - Use React Fast Refresh instead of the legacy react-hot-loader for instantaneous feedback in your development server. Recommended for versions of React >= 17.0.

## Improved Fast Refresh integration

Gatsby had some support for `react-refresh` (or Fast Refresh as it can be referred to) already. The PR for a [preliminary Fast Refresh integration](https://github.com/gatsbyjs/gatsby/pull/26664) added a custom overlay, better error recovery and in general a better communication between Gatsby's dev server and React Fast Refresh. This will give you quicker feedback and an overall improved development experience.

To use it, add a flag to your `gatsby-config.js`:

```js
// In your gatsby-config.js
module.exports = {
  // your existing config
  flags: {
    FAST_REFRESH: true,
  },
}
```

Visit the [umbrella issue about Fast Refresh](https://github.com/gatsbyjs/gatsby/discussions/28390) to see preview images and give feedback.

## Removed experimental lazy page bundling

In gatsby@2.27.0 we added [Experimental: Lazy page bundling](../v2.27/index.md#experimental-lazy-page-bundling-in-development) mode for `gatsby develop` that would delay compiling page templates until it was needed. While preliminary tests were very promising, we discovered few showstoppers that degraded development experience. [We decided to end the experiment](https://github.com/gatsbyjs/gatsby/discussions/28137#discussioncomment-138998) for now and shift our efforts to [Less aggressive cache invalidation](#less-aggressive-cache-invalidation).

## Making `gatsby develop` faster

We continue working on speeding up development server startup:

### Experimental: Lazy images in develop

As more and more images are added to a Gatsby site, the slower the local development experience oftentimes becomes.
You spend time waiting for images to process, instead of you know, developing! No longer!
This experimental version of `gatsby-plugin-sharp` only does image processing when the page gets requested.

To use it, make sure you have `gatsby-plugin-sharp@^2.10.0` and add `LAZY_IMAGES` to flags in `gatsby-config.js`:

```js
// In your gatsby-config.js
module.exports = {
  // your existing config
  flags: {
    LAZY_IMAGES: true,
  },
}
```

[Details and discussion](https://github.com/gatsbyjs/gatsby/discussions/27603).

## Notable bugfixes

...

## Work in progress

### Less aggressive cache invalidation

Gatsby aggressively clears its cache, sometimes too aggressively. Here's a few examples:

- You `npm install` a plugin, or update an existing
- You change your `gatsby-node.js` and add a few log statements
- You change your `siteMetadata` in `gatsby-config.js` to update your site's title

In all of these caches, your cache is entirely cleared, which means that the next time you run `gatsby develop` the experience is slower than it needs to be. We'll be working on this to ensure that your first run, and every run thereafter, is as quick and speedy as you expect!



## Contributors

A big **Thank You** to [everyone who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.28.0-next.0...gatsby@2.28.0) to this release 💜
