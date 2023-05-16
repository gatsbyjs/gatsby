---
date: "2023-05-16"
version: "5.10.0"
title: "v5.10 Release Notes"
---

Welcome to `gatsby@5.10.0` release (May 2023 #1)

Check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v5.9)

[Full changelog][full-changelog]

---

## Notable bugfixes & improvements

- We merged over 40 [renovate](https://www.mend.io/free-developer-tools/renovate/) PRs to update dependencies across various packages. If you're curious about the changes, you can use [this GitHub search](https://github.com/gatsbyjs/gatsby/pulls?q=is%3Apr+sort%3Aupdated-desc+author%3Aapp%2Frenovate+merged%3A2023-04-18..2023-05-16).
- `gatsby`:
  - Decrease size of produced SSR/DSG engine by deduplicating shared modules, via [PR #37961](https://github.com/gatsbyjs/gatsby/pull/37961)
  - Prevent infinite recursion when webpack chunk is parent of itself, via [PR #38052](https://github.com/gatsbyjs/gatsby/pull/38052)
  - Don't serve error overlay codeframes for files outside of compilation, via [PR #38059](https://github.com/gatsbyjs/gatsby/pull/38059)
- `gatsby-source-drupal`
  - Add support for setting type prefix, via [PR #37967](https://github.com/gatsbyjs/gatsby/pull/37967)
  - Find mimetype field, via [PR #38056](https://github.com/gatsbyjs/gatsby/pull/38056)
  - Add image cdn support for files type and typePrefix, via [PR #38057](https://github.com/gatsbyjs/gatsby/pull/38057)
- `gatsby-source-contentful`: Add support for setting type prefix, via [PR #37981](https://github.com/gatsbyjs/gatsby/pull/37981)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [JosueDLA](https://github.com/JosueDLA): chore(docs): Typo in v4 to v5 migration guide [PR #38081](https://github.com/gatsbyjs/gatsby/pull/38081)
- [Leksat](https://github.com/Leksat)
  - fix(gatsby): avoid plus2space conversion using json encoded options [PR #37980](https://github.com/gatsbyjs/gatsby/pull/37980)
  - fix(gatsby): encode window.pagePath to get valid JS code [PR #36349](https://github.com/gatsbyjs/gatsby/pull/36349)
- [ascorbic](https://github.com/ascorbic)
  - feat(gatsby-source-drupal): add `typePrefix` option [PR #37967](https://github.com/gatsbyjs/gatsby/pull/37967)
  - feat(gatsby-source-contentful): add support for setting type prefix [PR #37981](https://github.com/gatsbyjs/gatsby/pull/37981)
  - fix(gatsby-source-drupal): find mimetype field [PR #38056](https://github.com/gatsbyjs/gatsby/pull/38056)
  - fix(gatsby-source-drupal): add image cdn support for `files` type and `typePrefix` [PR #38057](https://github.com/gatsbyjs/gatsby/pull/38057)
- [dhayab](https://github.com/dhayab): chore(docs): update algolia guide [PR #38085](https://github.com/gatsbyjs/gatsby/pull/38085)
- [jeremyoftheberemies](https://github.com/jeremyoftheberemies): chore(docs): Improve wording in main tutorial part 6 [PR #38054](https://github.com/gatsbyjs/gatsby/pull/38054)
- [kspeyanski](https://github.com/kspeyanski): fix(gatsby-plugin-netlify-cms): ignore PartialHydrationPlugin [PR #37962](https://github.com/gatsbyjs/gatsby/pull/37962)
- [steventhanna](https://github.com/steventhanna): fix(gatsby): Correct `stitching slices` build activity name [PR #37975](https://github.com/gatsbyjs/gatsby/pull/37975)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.10.0-next.0...gatsby@5.10.0
