# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.1.2](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.1.1...gatsby-plugin-catch-links@2.1.2) (2019-07-12)

### Bug Fixes

- correct links in package changelogs ([#15630](https://github.com/gatsbyjs/gatsby/issues/15630)) ([d07b9dd](https://github.com/gatsbyjs/gatsby/commit/d07b9dd))

## [2.1.1](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.1.0...gatsby-plugin-catch-links@2.1.1) (2019-07-11)

**Note:** Version bump only for package gatsby-plugin-catch-links

# [2.1.0](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.15...gatsby-plugin-catch-links@2.1.0) (2019-06-20)

**Note:** Version bump only for package gatsby-plugin-catch-links

## [2.0.15](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.14...gatsby-plugin-catch-links@2.0.15) (2019-05-22)

**Note:** Version bump only for package gatsby-plugin-catch-links

## [2.0.14](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.13...gatsby-plugin-catch-links@2.0.14) (2019-05-14)

### Bug Fixes

- **gatsby-plugin-catch-links:** Fall back to default browser link handling when resources fail to fetch ([#13904](https://github.com/gatsbyjs/gatsby/issues/13904)) ([d4b60f2](https://github.com/gatsbyjs/gatsby/commit/d4b60f2))

### Features

- **gatsby:** add assetPrefix to support deploying assets separate from html ([#12128](https://github.com/gatsbyjs/gatsby/issues/12128)) ([8291044](https://github.com/gatsbyjs/gatsby/commit/8291044))

### BREAKING CHANGES

- **gatsby:** this is a breaking change (as currently authored) for a
  few plugins (specified in this commit). I'll work on a fallback--but I
  think it might make sense to just fail here. We can specify a
  peerDependency in the package.json of each of these packages, too.

- test: get tests passing

- test: add a test for assetPrefix with nesting

- Update docs/docs/path-prefix.md

Co-Authored-By: DSchau <DSchau@users.noreply.github.com>

- chore: fix up merge conflicts/get tests passing

- chore: tweak version

- fix(gatsby-plugin-sitemap): work with asset prefix

- fix(gatsby): disallow both relative assetPrefix and pathPrefix

- chore: fallback to withPathPrefix, bump peerDep

- chore: remove caveat re: trailing slash

- fix: gatsby-plugin-sitemap regression

- chore: revert peer dep

- chore: use basePath if it's defined

- chore: remove eslint global comment

- chore: ensure prefixPaths is set to enable pathPrefix

- chore: fix read-only error (can't reassign imports ya dingus)

- chore: actually fallback

- Update docs/docs/asset-prefix.md

Co-Authored-By: DSchau <DSchau@users.noreply.github.com>

- Update docs/docs/path-prefix.md

Co-Authored-By: DSchau <DSchau@users.noreply.github.com>

- Update docs/docs/asset-prefix.md

Co-Authored-By: DSchau <DSchau@users.noreply.github.com>

- chore: simply/merely remove the easy term ;)

- Update docs/docs/asset-prefix.md

Co-Authored-By: DSchau <DSchau@users.noreply.github.com>

- test: write e2e test for asset prefix

Note: this very well may fail

- chore: fix package json and make isURL test stricter

- chore: fix yarn and stuff hopefully

- chore: minor clean up

- fix(gatsby): fix initial navigation not registering in history

- chore: remove unnecessary dep

- fix: use **BASE_PATH** in development runtime too; add a test

- chore: fix @pieh nit before he finds it

## [2.0.13](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.12...gatsby-plugin-catch-links@2.0.13) (2019-03-11)

**Note:** Version bump only for package gatsby-plugin-catch-links

## [2.0.12](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.11...gatsby-plugin-catch-links@2.0.12) (2019-02-28)

**Note:** Version bump only for package gatsby-plugin-catch-links

## [2.0.11](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.10...gatsby-plugin-catch-links@2.0.11) (2019-02-12)

**Note:** Version bump only for package gatsby-plugin-catch-links

## [2.0.10](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.9...gatsby-plugin-catch-links@2.0.10) (2019-02-01)

**Note:** Version bump only for package gatsby-plugin-catch-links

<a name="2.0.9"></a>

## [2.0.9](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.8...gatsby-plugin-catch-links@2.0.9) (2018-11-29)

**Note:** Version bump only for package gatsby-plugin-catch-links

<a name="2.0.8"></a>

## [2.0.8](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.7...gatsby-plugin-catch-links@2.0.8) (2018-11-09)

### Bug Fixes

- **gatsby-plugin-catch-links:** handle SVGAnimatedString href values ([#9829](https://github.com/gatsbyjs/gatsby/issues/9829)) ([4538ff3](https://github.com/gatsbyjs/gatsby/commit/4538ff3)), closes [#9816](https://github.com/gatsbyjs/gatsby/issues/9816)

<a name="2.0.7"></a>

## [2.0.7](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.6...gatsby-plugin-catch-links@2.0.7) (2018-11-08)

**Note:** Version bump only for package gatsby-plugin-catch-links

<a name="2.0.6"></a>

## [2.0.6](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.5...gatsby-plugin-catch-links@2.0.6) (2018-10-29)

**Note:** Version bump only for package gatsby-plugin-catch-links

<a name="2.0.5"></a>

## [2.0.5](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.4...gatsby-plugin-catch-links@2.0.5) (2018-10-16)

### Bug Fixes

- **plugin-catch-links:** handle pathPrefix ([#9000](https://github.com/gatsbyjs/gatsby/issues/9000)) ([6fed3e5](https://github.com/gatsbyjs/gatsby/commit/6fed3e5))

<a name="2.0.4"></a>

## [2.0.4](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.3...gatsby-plugin-catch-links@2.0.4) (2018-10-05)

### Bug Fixes

- handle more edge cases and fix IE ([#8646](https://github.com/gatsbyjs/gatsby/issues/8646)) ([4383a57](https://github.com/gatsbyjs/gatsby/commit/4383a57)), closes [#8685](https://github.com/gatsbyjs/gatsby/issues/8685)

<a name="2.0.3"></a>

## [2.0.3](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.2-rc.1...gatsby-plugin-catch-links@2.0.3) (2018-09-24)

**Note:** Version bump only for package gatsby-plugin-catch-links

<a name="2.0.2"></a>

## [2.0.2](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.2-rc.1...gatsby-plugin-catch-links@2.0.2) (2018-09-17)

**Note:** Version bump only for package gatsby-plugin-catch-links

<a name="2.0.2-rc.1"></a>

## [2.0.2-rc.1](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.2-rc.0...gatsby-plugin-catch-links@2.0.2-rc.1) (2018-08-29)

**Note:** Version bump only for package gatsby-plugin-catch-links

<a name="2.0.2-rc.0"></a>

## [2.0.2-rc.0](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.2-beta.11...gatsby-plugin-catch-links@2.0.2-rc.0) (2018-08-21)

**Note:** Version bump only for package gatsby-plugin-catch-links

<a name="2.0.2-beta.11"></a>

## [2.0.2-beta.11](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.2-beta.10...gatsby-plugin-catch-links@2.0.2-beta.11) (2018-08-20)

**Note:** Version bump only for package gatsby-plugin-catch-links

<a name="2.0.2-beta.10"></a>

## [2.0.2-beta.10](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.2-beta.9...gatsby-plugin-catch-links@2.0.2-beta.10) (2018-08-17)

### Bug Fixes

- **gatsby-plugin-catch-links:** update old react-router api to new reach-router ([#7408](https://github.com/gatsbyjs/gatsby/issues/7408)) ([bedc6f0](https://github.com/gatsbyjs/gatsby/commit/bedc6f0))

<a name="2.0.2-beta.9"></a>

## [2.0.2-beta.9](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.2-beta.8...gatsby-plugin-catch-links@2.0.2-beta.9) (2018-08-15)

### Bug Fixes

- update docs to remove `gatsby-link` reference ([#7315](https://github.com/gatsbyjs/gatsby/issues/7315)) ([a285e1c](https://github.com/gatsbyjs/gatsby/commit/a285e1c))

<a name="2.0.2-beta.8"></a>

## [2.0.2-beta.8](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.2-beta.7...gatsby-plugin-catch-links@2.0.2-beta.8) (2018-08-14)

**Note:** Version bump only for package gatsby-plugin-catch-links

<a name="2.0.2-beta.7"></a>

## [2.0.2-beta.7](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.2-beta.6...gatsby-plugin-catch-links@2.0.2-beta.7) (2018-08-04)

**Note:** Version bump only for package gatsby-plugin-catch-links

<a name="2.0.2-beta.6"></a>

## [2.0.2-beta.6](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.2-beta.5...gatsby-plugin-catch-links@2.0.2-beta.6) (2018-08-03)

### Bug Fixes

- refs 6990 plugin-catch-links URL wrong parameter ([#6993](https://github.com/gatsbyjs/gatsby/issues/6993)) ([fea0f6a](https://github.com/gatsbyjs/gatsby/commit/fea0f6a))

<a name="2.0.2-beta.5"></a>

## [2.0.2-beta.5](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.2-beta.4...gatsby-plugin-catch-links@2.0.2-beta.5) (2018-08-01)

**Note:** Version bump only for package gatsby-plugin-catch-links

<a name="2.0.2-beta.4"></a>

## [2.0.2-beta.4](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.2-beta.3...gatsby-plugin-catch-links@2.0.2-beta.4) (2018-07-21)

**Note:** Version bump only for package gatsby-plugin-catch-links

<a name="2.0.2-beta.3"></a>

## [2.0.2-beta.3](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.2-beta.2...gatsby-plugin-catch-links@2.0.2-beta.3) (2018-07-17)

### Bug Fixes

- catch-links should use gatsby for push ([#6477](https://github.com/gatsbyjs/gatsby/issues/6477)) ([a3b5b2d](https://github.com/gatsbyjs/gatsby/commit/a3b5b2d))

<a name="2.0.2-beta.2"></a>

## [2.0.2-beta.2](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.2-beta.1...gatsby-plugin-catch-links@2.0.2-beta.2) (2018-06-20)

**Note:** Version bump only for package gatsby-plugin-catch-links

<a name="2.0.2-beta.1"></a>

## [2.0.2-beta.1](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@2.0.2-beta.0...gatsby-plugin-catch-links@2.0.2-beta.1) (2018-06-17)

**Note:** Version bump only for package gatsby-plugin-catch-links

<a name="2.0.2-beta.0"></a>

## [2.0.2-beta.0](https://github.com/gatsbyjs/gatsby/compare/gatsby-plugin-catch-links@1.0.24...gatsby-plugin-catch-links@2.0.2-beta.0) (2018-06-17)

**Note:** Version bump only for package gatsby-plugin-catch-links
