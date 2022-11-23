---
date: "2021-03-16"
version: "3.1.0"
title: "v3.1 Release Notes"
---

Welcome to `gatsby@3.1.0` release (March 2021 #2)

Key highlights of this release:

- [Fast Refresh Dark Mode](#fast-refresh-dark-mode)
- [Improved Error Messages](#improved-error-messages)
- [Contentful `gatsbyImageData` is stable](#contentful-gatsbyimagedata-is-stable)

Also check out [notable bugfixes](#notable-bugfixes).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.0)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.1.0-next.0...gatsby@3.1.0)

## Fast Refresh Dark Mode

Gatsby's Fast Refresh modal now respects the [`prefers-color-scheme` setting](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) from your operating system. Depending on your setting you'll see the overlay in light or dark mode -- which is great because it makes the modal more accessible!

![Showing a toggle between light and dark mode](https://user-images.githubusercontent.com/16143594/111284667-9faee400-8640-11eb-87c3-0015d439d894.gif)

## Improved Error Messages

We've seen many complaints about the unspecific error `"Error page resources for <path> not found. Not rendering React"`. There are many reasons why this could happen so we improved our error logging to output the original error. As usual you'll see the error in DevTools console or in your error tracker.

Consider the following example, it now shows the actual error.

```js
if (typeof window === "undefined") {
  throw new Error("GATSBY")
}

export default function MyPage() {}
```

![Browser console showing the actual error](https://user-images.githubusercontent.com/1120926/109872417-afa3ec80-7c6c-11eb-83dc-1d061fd4cd97.png)

In development mode we also now show the original error when it occurs in `gatsby-browser.js` or outside of React components.

![Fast Refresh overlay showing an error that happened outside of React](https://user-images.githubusercontent.com/1120926/110111666-fe5a9f00-7db0-11eb-8d2a-d9a7f2709f24.png)

## Contentful `gatsbyImageData` is stable

Contentful now fully supports `gatsby-plugin-image` out of the box. You can find the official docs for gatsby-plugin-image in gatsby-source-contentful [the official contentful plugin docs](https://www.gatsbyjs.com/plugins/gatsby-source-contentful/#using-the-new-gatsby-image-plugin)

```graphql
{
  allContentfulBlogPost {
    nodes {
      heroImage {
        gatsbyImageData(layout: FULL_WIDTH)
      }
    }
  }
}
```

You can find more information on how to switch to [`gatsby-plugin-image`](https://www.gatsbyjs.com/plugins/gatsby-plugin-image/#dynamic-images) by going to our [`gatsby-image` to `gatsby-plugin-image` migration guide](https://www.gatsbyjs.com/docs/reference/release-notes/image-migration-guide/)

---

## Notable bugfixes

- gatsby: Fix routing when path starts with @ symbol, via [PR #29935](https://github.com/gatsbyjs/gatsby/pull/29935)
- gatsby: Fix incremental builds when remove trailing slashes is used, via [PR #29953](https://github.com/gatsbyjs/gatsby/pull/29953)
- gatsby: Add build stage to custom babel-preset-gatsby configurations, via [PR #30047](https://github.com/gatsbyjs/gatsby/pull/30047)
- gatsby: Fix hanging Gatsby process between webpack rebuilds in development, via [PR 30127](https://github.com/gatsbyjs/gatsby/pull/30127)
- gatsby: fix SitePage schema, via [PR #30132](https://github.com/gatsbyjs/gatsby/pull/30132)
- gatsby: fix double save during gatsby develop, via [PR #30193](https://github.com/gatsbyjs/gatsby/pull/30193)
- gatsby-plugin-image: Handle placeholder in plugin toolkit correctly, via [PR #30141](https://github.com/gatsbyjs/gatsby/pull/30141)
- gatsby-source-contentful: fix deprecation warnings, via [PR #29675](https://github.com/gatsbyjs/gatsby/pull/29675)

## Contributors

- [visualfanatic](https://github.com/visualfanatic): docs(gatsby-plugin-subfont): correct property name [PR #29803](https://github.com/gatsbyjs/gatsby/pull/29803)
- [mottox2](https://github.com/mottox2)

  - fix(example): import styles as ESModules [PR #29818](https://github.com/gatsbyjs/gatsby/pull/29818)
  - fix(example): import styles as ESModules in simple-auth [PR #29823](https://github.com/gatsbyjs/gatsby/pull/29823)
  - fix(docs): update library link in docs [PR #29819](https://github.com/gatsbyjs/gatsby/pull/29819)

- [chrsep](https://github.com/chrsep): fix: query on demand loading indicator always active on preact. [PR #29829](https://github.com/gatsbyjs/gatsby/pull/29829)
- [jbampton](https://github.com/jbampton)

  - chore: fix spelling, remove whitespace and fix link [PR #29846](https://github.com/gatsbyjs/gatsby/pull/29846)
  - chore: fix spelling, remove whitespace and fix links [PR #30012](https://github.com/gatsbyjs/gatsby/pull/30012)
  - chore: fix spelling, grammar, links, whitespace and end of files [PR #30063](https://github.com/gatsbyjs/gatsby/pull/30063)
  - chore: make ./starters/upgrade-starters.sh executable [PR #30102](https://github.com/gatsbyjs/gatsby/pull/30102)

- [imshubhamsingh](https://github.com/imshubhamsingh): chore(docs): updated doc for payment using square [PR #27272](https://github.com/gatsbyjs/gatsby/pull/27272)
- [ahmetcanaydemir](https://github.com/ahmetcanaydemir): fix(gatsby-react-router-scroll): debounce function for scrollListener [PR #26933](https://github.com/gatsbyjs/gatsby/pull/26933)
- [talohana](https://github.com/talohana): chore(docs): add paths to unit-testing using typescript [PR #28029](https://github.com/gatsbyjs/gatsby/pull/28029)
- [hashimwarren](https://github.com/hashimwarren): chore(docs): Update headless WordPress article [PR #29402](https://github.com/gatsbyjs/gatsby/pull/29402)
- [lorensr](https://github.com/lorensr): chore(docs): Add twitter links to tutorial [PR #29696](https://github.com/gatsbyjs/gatsby/pull/29696)
- [herecydev](https://github.com/herecydev): fix(gatsby): Add dir=ltr to Fast Refresh overlay [PR #29900](https://github.com/gatsbyjs/gatsby/pull/29900)
- [dan2k3k4](https://github.com/dan2k3k4): chore(docs): Fix link to /docs/conceptual/using-gatsby-image [PR #29930](https://github.com/gatsbyjs/gatsby/pull/29930)
- [lourd](https://github.com/lourd): refactor(gatsby-transformer-remark): Refactors out Bluebird usage in transformer-remark [PR #29638](https://github.com/gatsbyjs/gatsby/pull/29638)
- [ahollenbach](https://github.com/ahollenbach): docs: clarify env variable prefix in gatsby-source-filesystem docs [PR #30013](https://github.com/gatsbyjs/gatsby/pull/30013)
- [Swarleys](https://github.com/Swarleys): docs(gatsby-plugin-image): fixing a typo. [PR #29994](https://github.com/gatsbyjs/gatsby/pull/29994)
- [samlogan](https://github.com/samlogan): fix(gatsby-plugin-image): broken documentation links [PR #30065](https://github.com/gatsbyjs/gatsby/pull/30065)
- [KarlBaumann](https://github.com/KarlBaumann): chore(gatsby-source-wordpress): Remove version from README [PR #30056](https://github.com/gatsbyjs/gatsby/pull/30056)
- [Vazerthon](https://github.com/Vazerthon): chore(docs): Add link to art direction docs [PR #30041](https://github.com/gatsbyjs/gatsby/pull/30041)
- [magnusdahlstrand](https://github.com/magnusdahlstrand): chore(gatsby-plugin-postcss): Update README to show correct usage [PR #30035](https://github.com/gatsbyjs/gatsby/pull/30035)
- [feedm3](https://github.com/feedm3): chore(docs): set process polyfill correctly [PR #30160](https://github.com/gatsbyjs/gatsby/pull/30160)
- [axe312ger](https://github.com/axe312ger): contentful <3 gatsby v3 [PR #29675](https://github.com/gatsbyjs/gatsby/pull/29675)
- [machadoluiz](https://github.com/machadoluiz): fix(docs): update conceptual gatsby image doc [PR #30175](https://github.com/gatsbyjs/gatsby/pull/30175)
- [dhrumilp15](https://github.com/dhrumilp15): chore(docs): Update deploying-to-digitalocean-droplet [PR #30161](https://github.com/gatsbyjs/gatsby/pull/30161)
- [nop33](https://github.com/nop33): chore(docs): Fix typo in migration guide [PR #30197](https://github.com/gatsbyjs/gatsby/pull/30197)
