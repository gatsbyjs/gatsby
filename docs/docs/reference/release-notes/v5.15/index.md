---
date: "2025-08-27"
version: "5.15.0"
title: "v5.15 Release Notes"
---

Welcome to `gatsby@5.15.0` release (August 2025)

Key highlights of this release:

- [Node.js 22 support!](#nodejs-22)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v5.14)

[Full changelog][full-changelog]

---

## Node.js 22

Support Node.js 22 by @serhalp in <https://github.com/gatsbyjs/gatsby/pull/39349>

This release formally introduces Node.js 22 support, which is officially tested and supported going forward.

If you wish to use Node.js 22 with Gatsby, we highly recommend using the _latest_ 22.x release, as there are known issues with some older 22.x versions that Gatsby is unable to work around at this time.

### ⚠️ Known Issue: `gatsby develop` fails with Node.js 22.7.0, 22.8.0, and 22.9.0

There is a critical bug in Node.js (<https://github.com/nodejs/node/issues/55145>?) affecting versions 22.7.0, 22.8.0, and 22.9.0 that causes `gatsby develop` to fail with the error reported in <https://github.com/gatsbyjs/gatsby/issues/39068>.

👉🏼 To avoid this, **use Node.js 22.10.0 or later**. (You can also use 22.6.0 or earlier.)

### ⚠️ Known Issue: Page loads may hang in dev with experimental `DEV_SSR` enabled _and_ Node.js ≥22.14.0 (or ≥20.19.0)

This will not affect most users.

A change landed in Node.js 20.19.0 and 22.14.0 results in requests to the `gatsby develop` dev server to occasionally hang for 15 seconds. This can only occur if you have opted in to the experimental `DEV_SSR` flag.

👉🏼 To avoid this, **disable the experimental `DEV_SSR` flag**. (You can also downgrade to Node.js 22.13.1 or earlier, 20.18.3 or earlier, or 18.x.)

## Notable bugfixes & improvements

- `gatsby`:
  - fix(gatsby): update socket.io to address vulnerable subdeps by @serhalp in <https://github.com/gatsbyjs/gatsby/pull/39352>

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- @pajosieg made their first contribution in <https://github.com/gatsbyjs/gatsby/pull/39169>
- @johnmurphy01 made their first contribution in <https://github.com/gatsbyjs/gatsby/pull/39324>
- @shrisoundharyaa made their first contribution in <https://github.com/gatsbyjs/gatsby/pull/39286>

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.14.6...gatsby@5.15.0
