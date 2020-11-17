---
date: "2020-11-19"
version: "2.27.0"
---

# [v2.27](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.27.0-next.0...gatsby@2.27.0) (November 2020 #2)

---

Welcome to `gatsby@2.27.0` release (November 2020 #2).

Key highlights of this release:

- [Queries on Demand](#queries-on-demand) - improves `gatsby develop` bootup time
- [Add your item here](#link-to-header) - one-line summary

Other notable changes and bugfixes:

- [Add your item here](#link-to-header) - one-line summary

Sneak peek to next releases:

- [Experimental: Lazy images in develop](#experimental-lazy-images-in-develop)
- [Documentation Reorganization](#documentation-reorganization)
- [Experimental: SSR in develop](#experimental-ssr-in-develop)

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](../v2.26/index.md)

### Queries on Demand

When developing a Gatsby site there's no need to run all graphql queries before serving the site.
Instead, Gatsby could run queries for pages as they're requested by a browser.
This would avoid having to wait for slower queries (like image processing) if you're editing an unrelated part of a site.

This feature is available under a flag.

```sh
cross-env GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND=1 gatsby develop
```

Please try it and [let us know](https://github.com/gatsbyjs/gatsby/discussions/27620) if you have any issues
(it may become a default for `develop` in the future)

[Details and discussion](https://github.com/gatsbyjs/gatsby/discussions/27620).

## Work in progress

### Experimental: Lazy images in develop

We've got some feedback that the more image-heavy your website gets, the slower `gatsby develop`.
This experimental version of `gatsby-plugin-sharp` only does image processing when the page gets requested.

Try early alpha (and [let us know](https://github.com/gatsbyjs/gatsby/discussions/27603) if you have any issues with it):

```
npm install gatsby-plugin-sharp@lazy-images
```

Lazy images are enabled by-default in this version.

[Details and discussion](https://github.com/gatsbyjs/gatsby/discussions/27603).

### Documentation Reorganization

We’ve heard repeatedly from the community that Gatsby is a powerful tool,
but it has a steep learning curve. We want to make it easier to get started with Gatsby.
And that means having documentation that helps y’all find the information you need when you need it.

[Announcement and discussion](https://github.com/gatsbyjs/gatsby/discussions/27856).

## Experimental: SSR in Development
One of the least enjoyable bugs to encounter in Gatsby is when your build fails due to code trying to reference `window` or `document` or other globals that are only accessible in the browser and not in node.js when doing SSR.

Currently the only way to debug this is to change some code and rebuild and then repeat until the problem is solved. This is a very slow way to debug. Worst, these sorts of bugs are often only encountered after a long development period. It's no fun to push code you're proud of to CI only to discover it's broken.

With this coming feature, we'll SSR pages during development when do a full refresh of a page (navigating between pages will still only do a client-side render). This will help you both discover build errors earlier _and_ fix them faster.

Try it out immediately by running `GATSBY_EXPERIMENT_DEVJS_LAZY=true gatsby develop`. Join in the discussion in its umbrella issue at https://github.com/gatsbyjs/gatsby/issues/28138

## Contributors

A big **Thank You** to [everyone who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.27.0-next.0...gatsby@2.27.0) to this release 💜
