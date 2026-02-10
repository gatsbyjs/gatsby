---
date: "2026-01-26"
version: "5.16.0"
title: "v5.16 Release Notes"
---

Welcome to `gatsby@5.16.0` release (January 2026)

Key highlights of this release:

- [React 19 support!](#react-19)
- [Node.js 24 support](#nodejs-24)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

[Previous release notes](/docs/reference/release-notes/v5.15)

[Full changelog][full-changelog]

---

## React 19

> 🔐 Note that, as of January 26 2026, **none of the React 19 security vulnerabilities** affect Gatsby.

🚀 React 19 is here!

React 19 is now officially supported by Gatsby and all `gatsby-` packages maintained by the Gatsby team.

This is not a breaking change. You can safely upgrade to this release while staying on React 18.

All packages' peer dependencies on `react` and `react-dom` have been extended from `^18.0.0` to `^18.0.0 || ^19.0.0`.

All existing **stable** Gatsby functionality is intended to now work with React 19.

PR: <https://github.com/gatsbyjs/gatsby/pull/39306>

### Upgrade Guide

> ⚠️ **Community** plugins may not have been updated yet to support React 19, so please check their repository for the current status. All plugins managed by the Gatsby team (in the [gatsbyjs/gatsby](https://github.com/gatsbyjs/gatsby) repository) have been updated.

To upgrade to React 19, first upgrade `gatsby` and all your dependencies that start with `gatsby-` to the latest version. (Check out [this guide](https://www.gatsbyjs.com/docs/reference/release-notes/upgrade-gatsby-and-dependencies/) if you need help with that.)

> 💬 If you use npm 7 or higher you’ll want to use the `--legacy-peer-deps` option. For example, if you use `gatsby` and `gatsby-plugin-postcss`:
>
> ```sh
> npm install --legacy-peer-deps gatsby@latest gatsby-plugin-postcss@latest
> ```

Then, [follow the React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide). No other changes are required.

Please note:

- Some _new_ React 19 features may not be available yet via Gatsby.
  - Notably, the new [document metadata hoisting feature](https://react.dev/blog/2024/12/05/react-19#support-for-metadata-tags) is disabled in Gatsby, as it conflicts with the existing [Gatsby Head API](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/)
- Gatsby [Partial Hydration](https://www.gatsbyjs.com/docs/how-to/performance/partial-hydration), an **experimental** feature for three years now, is known to be **incompatible with React 19** at this time. If you rely on this feature, do not upgrade to React 19.

### New features

Gatsby now supports [React 19's new root error callbacks](https://react.dev/blog/2024/12/05/react-19#error-handling).

Users can export `onCaughtError` and `onUncaughtError` from their `gatsby-browser.js` to handle errors caught by error boundaries and uncaught errors respectively:

```js
// gatsby-browser.js

export const onCaughtError = ({ error, errorInfo }) => {
  // e.g. send to an error tracking service
  myErrorTracker.reportError(error, { extra: errorInfo })
}

export const onUncaughtError = ({ error, errorInfo }) => {
  // e.g. send to an error tracking service
  myErrorTracker.captureException(error, { extra: errorInfo })
}
```

In development, these errors also appear in Gatsby's Fast Refresh error overlay. These callbacks are only invoked in React 19.

## Node.js 24

Node.js 24 is now officially supported by Gatsby.

PR: <https://github.com/gatsbyjs/gatsby/pull/39380> and <https://github.com/gatsbyjs/gatsby/pull/39398>

## Notable bugfixes & improvements

- `gatsby`, `gatsby-source-drupal`:
  - fix(deps): bump `body-parser` to resolve `qs` vulnerability warning by @serhalp in <https://github.com/gatsbyjs/gatsby/pull/39396>
- chore: remove misc. outdated, invalid, or misleading contributor instructions by @serhalp in <https://github.com/gatsbyjs/gatsby/pull/39363>

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.15.0...gatsby@5.16.0
