# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.1.0](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.25...gatsby-plugin-offline@2.1.0) (2019-05-02)

### Features

- **gatsby:** add assetPrefix to support deploying assets separate from html ([#12128](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/issues/12128)) ([8291044](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/commit/8291044))

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

- chore: remove unneccessary dep

- fix: use **BASE_PATH** in development runtime too; add a test

- chore: fix @pieh nit before he finds it

## [2.0.25](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.24...gatsby-plugin-offline@2.0.25) (2019-03-11)

**Note:** Version bump only for package gatsby-plugin-offline

## [2.0.24](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.23...gatsby-plugin-offline@2.0.24) (2019-02-19)

**Note:** Version bump only for package gatsby-plugin-offline

## [2.0.23](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.22...gatsby-plugin-offline@2.0.23) (2019-02-07)

**Note:** Version bump only for package gatsby-plugin-offline

## [2.0.22](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.21...gatsby-plugin-offline@2.0.22) (2019-01-28)

### Features

- **gatsby-plugin-offline:** reload when missing resources and SW was updated + add "onServiceWorkerUpdateReady" API ([#10432](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/issues/10432)) ([4a01c6d](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/commit/4a01c6d))

<a name="2.0.21"></a>

## [2.0.21](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.20...gatsby-plugin-offline@2.0.21) (2019-01-06)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.20"></a>

## [2.0.20](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.19...gatsby-plugin-offline@2.0.20) (2018-12-17)

### Bug Fixes

- **gatsby-plugin-offline:** prevent incorrect revisioning of static file by workbox ([#10416](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/issues/10416)) ([008b5db](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/commit/008b5db))

<a name="2.0.19"></a>

## [2.0.19](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.18...gatsby-plugin-offline@2.0.19) (2018-12-07)

### Bug Fixes

- **gatsby-plugin-offline:** gracefully degrade if appshell isn't precached ([#10329](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/issues/10329)) ([19e9f3e](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/commit/19e9f3e))

<a name="2.0.18"></a>

## [2.0.18](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.17...gatsby-plugin-offline@2.0.18) (2018-11-29)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.17"></a>

## [2.0.17](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.16...gatsby-plugin-offline@2.0.17) (2018-11-21)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.16"></a>

## [2.0.16](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.15...gatsby-plugin-offline@2.0.16) (2018-11-20)

### Features

- **gatsby-plugin-offline:** replace no-cache detection with dynamic path whitelist ([#9907](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/issues/9907)) ([8d3af3f](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/commit/8d3af3f))

<a name="2.0.15"></a>

## [2.0.15](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.14...gatsby-plugin-offline@2.0.15) (2018-11-14)

### Bug Fixes

- **gatsby-plugin-offline:** fix certain resources being cached excessively ([#9923](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/issues/9923)) ([7c826a1](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/commit/7c826a1)), closes [#9415](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/issues/9415)

<a name="2.0.14"></a>

## [2.0.14](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.13...gatsby-plugin-offline@2.0.14) (2018-11-13)

### Bug Fixes

- **gatsby-plugin-offline:** Sync docs with actual defaults being used ([#9903](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/issues/9903)) ([8cd7432](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/commit/8cd7432))

<a name="2.0.13"></a>

## [2.0.13](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.12...gatsby-plugin-offline@2.0.13) (2018-11-08)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.12"></a>

## [2.0.12](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.11...gatsby-plugin-offline@2.0.12) (2018-11-05)

### Bug Fixes

- **gatsby-plugin-offline:** Serve the offline shell for short URLs + use no-cors for external resources ([#9679](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/issues/9679)) ([430e8f1](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/commit/430e8f1)), closes [#8145](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/issues/8145)

<a name="2.0.11"></a>

## [2.0.11](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.10...gatsby-plugin-offline@2.0.11) (2018-11-01)

### Bug Fixes

- **gatsby-plugin-offline:** don't precache the index page ([#9603](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/issues/9603)) ([00284e0](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/commit/00284e0)), closes [#7997](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/issues/7997)

<a name="2.0.10"></a>

## [2.0.10](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.9...gatsby-plugin-offline@2.0.10) (2018-10-29)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.9"></a>

## [2.0.9](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.8...gatsby-plugin-offline@2.0.9) (2018-10-24)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.8"></a>

## [2.0.8](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.7...gatsby-plugin-offline@2.0.8) (2018-10-23)

### Features

- update Workbox to 3.6.3 ([#9294](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/issues/9294)) ([f53d457](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/commit/f53d457))

<a name="2.0.7"></a>

## [2.0.7](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.6...gatsby-plugin-offline@2.0.7) (2018-10-16)

### Bug Fixes

- update gatsby peerDep version ([#9150](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/issues/9150)) ([f5c5556](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/commit/f5c5556))

<a name="2.0.6"></a>

## [2.0.6](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.5...gatsby-plugin-offline@2.0.6) (2018-10-09)

### Bug Fixes

- **gatsby-plugin-offline:** delay adding resources for paths until we have urls ([#8613](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/issues/8613)) ([2605aa0](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/commit/2605aa0))

<a name="2.0.5"></a>

## [2.0.5](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-rc.9...gatsby-plugin-offline@2.0.5) (2018-09-17)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-rc.9"></a>

# [2.0.0-rc.9](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-rc.8...gatsby-plugin-offline@2.0.0-rc.9) (2018-09-17)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-rc.8"></a>

# [2.0.0-rc.8](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-rc.7...gatsby-plugin-offline@2.0.0-rc.8) (2018-09-14)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-rc.7"></a>

# [2.0.0-rc.7](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-rc.6...gatsby-plugin-offline@2.0.0-rc.7) (2018-09-12)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-rc.6"></a>

# [2.0.0-rc.6](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-rc.5...gatsby-plugin-offline@2.0.0-rc.6) (2018-09-08)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-rc.5"></a>

# [2.0.0-rc.5](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-rc.4...gatsby-plugin-offline@2.0.0-rc.5) (2018-09-07)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-rc.4"></a>

# [2.0.0-rc.4](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-rc.3...gatsby-plugin-offline@2.0.0-rc.4) (2018-09-05)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-rc.3"></a>

# [2.0.0-rc.3](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-rc.2...gatsby-plugin-offline@2.0.0-rc.3) (2018-09-05)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-rc.2"></a>

# [2.0.0-rc.2](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-rc.1...gatsby-plugin-offline@2.0.0-rc.2) (2018-08-31)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-rc.1"></a>

# [2.0.0-rc.1](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-rc.0...gatsby-plugin-offline@2.0.0-rc.1) (2018-08-29)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-rc.0"></a>

# [2.0.0-rc.0](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-beta.10...gatsby-plugin-offline@2.0.0-rc.0) (2018-08-21)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-beta.10"></a>

# [2.0.0-beta.10](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-beta.9...gatsby-plugin-offline@2.0.0-beta.10) (2018-08-21)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-beta.9"></a>

# [2.0.0-beta.9](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-beta.8...gatsby-plugin-offline@2.0.0-beta.9) (2018-08-07)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-beta.8"></a>

# [2.0.0-beta.8](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-beta.7...gatsby-plugin-offline@2.0.0-beta.8) (2018-08-07)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-beta.7"></a>

# [2.0.0-beta.7](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-beta.6...gatsby-plugin-offline@2.0.0-beta.7) (2018-08-07)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-beta.6"></a>

# [2.0.0-beta.6](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-beta.5...gatsby-plugin-offline@2.0.0-beta.6) (2018-08-02)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-beta.5"></a>

# [2.0.0-beta.5](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-beta.4...gatsby-plugin-offline@2.0.0-beta.5) (2018-07-24)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-beta.4"></a>

# [2.0.0-beta.4](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-beta.3...gatsby-plugin-offline@2.0.0-beta.4) (2018-07-21)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-beta.3"></a>

# [2.0.0-beta.3](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-beta.2...gatsby-plugin-offline@2.0.0-beta.3) (2018-07-06)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-beta.2"></a>

# [2.0.0-beta.2](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-beta.1...gatsby-plugin-offline@2.0.0-beta.2) (2018-06-20)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-beta.1"></a>

# [2.0.0-beta.1](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@2.0.0-beta.0...gatsby-plugin-offline@2.0.0-beta.1) (2018-06-17)

**Note:** Version bump only for package gatsby-plugin-offline

<a name="2.0.0-beta.0"></a>

# [2.0.0-beta.0](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline/compare/gatsby-plugin-offline@1.0.18...gatsby-plugin-offline@2.0.0-beta.0) (2018-06-17)

**Note:** Version bump only for package gatsby-plugin-offline
