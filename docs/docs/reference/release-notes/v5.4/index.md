---
date: "2023-01-10"
version: "5.4.0"
title: "v5.4 Release Notes"
---

Welcome to `gatsby@5.4.0` release (January 2023 #1)

The whole team took time off for a much deserved winter break and we hope you had relaxing holidays, too! Before the break we spent time doing maintenance work such as updating internal dependencies or fixing some smaller bugs here and there. In case you missed it, we shipped [ES Modules (ESM) in Gatsby files](/docs/reference/release-notes/v5.3#es-modules-esm-in-gatsby-files) in the last release.

So check out the [notable bugfixes](#notable-bugfixes--improvements) section to learn more.

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v5.3)

[Full changelog][full-changelog]

---

## Notable bugfixes & improvements

- We merged over 40 [renovate](https://www.mend.io/free-developer-tools/renovate/) PRs to update dependencies across various packages. If you're curious about the changes, you can use [this GitHub search](https://github.com/gatsbyjs/gatsby/pulls?q=is%3Apr+sort%3Aupdated-desc+author%3Aapp%2Frenovate+merged%3A2022-12-08..2023-01-05).
- `gatsby`:
  - Bump `socket.io` to address [CVE-2022-41940](https://github.com/advisories/GHSA-r7qp-cfhv-p84w), via [PR #37272](https://github.com/gatsbyjs/gatsby/pull/37272)
  - Bump `yaml-loader` from `0.6.0` to `0.8.0` to address security warning, via [PR #37401](https://github.com/gatsbyjs/gatsby/pull/37401)
  - Improve `SlicePlaceholderProps` TypeScript type, via [PR #37409](https://github.com/gatsbyjs/gatsby/pull/37409)
  - Allow `gatsby-node` in folder names (e.g. `<root>/gatsby-node/on-pre-init.ts`), via [PR #36712](https://github.com/gatsbyjs/gatsby/pull/36712)
  - Restore asset, path prefix for file-loader handled files (fixing a regression in `gatsby@5.3.3`), via [PR #37429](https://github.com/gatsbyjs/gatsby/pull/37429)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [Simply007](https://github.com/Simply007): chore(gatsby): Adjust information about `trailingSlash` for `createRedirect` [PR #37259](https://github.com/gatsbyjs/gatsby/pull/37259)
- [bicstone](https://github.com/bicstone): chore(docs): fix typo in reference guide [PR #37347](https://github.com/gatsbyjs/gatsby/pull/37347)
- [demondragong](https://github.com/demondragong): chore(gatsby-plugin-google-analytics): Fix typo in README [PR #37276](https://github.com/gatsbyjs/gatsby/pull/37276)
- [markacola](https://github.com/markacola): chore: Update `.gitpod` to use correct Node version [PR #37336](https://github.com/gatsbyjs/gatsby/pull/37336)
- [openscript](https://github.com/openscript): docs(how-to): remove unecessary decomposition [PR #37341](https://github.com/gatsbyjs/gatsby/pull/37341)
- [trentschnee](https://github.com/trentschnee): chore(docs): Update Storybook instructions [PR #37321](https://github.com/gatsbyjs/gatsby/pull/37321)
- [xavivars](https://github.com/xavivars): fix(gatsby-source-contentful): Add contentTypeFilter to Joi schema [PR #37403](https://github.com/gatsbyjs/gatsby/pull/37403)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.4.0-next.0...gatsby@5.4.0
