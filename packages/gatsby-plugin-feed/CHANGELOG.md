# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.2.0](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.1.2...gatsby-plugin-feed@2.2.0) (2019-05-02)

### Features

- **gatsby:** add assetPrefix to support deploying assets separate from html ([#12128](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/issues/12128)) ([8291044](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/commit/8291044))

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

## [2.1.2](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.1.1...gatsby-plugin-feed@2.1.2) (2019-04-30)

**Note:** Version bump only for package gatsby-plugin-feed

## [2.1.1](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.1.0...gatsby-plugin-feed@2.1.1) (2019-04-17)

**Note:** Version bump only for package gatsby-plugin-feed

# [2.1.0](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.15...gatsby-plugin-feed@2.1.0) (2019-03-21)

### Features

- **gatsby-plugin-feed:** warn for deprecations, validate options ([#12085](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/issues/12085)) ([626cab4](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/commit/626cab4))

## [2.0.15](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.14...gatsby-plugin-feed@2.0.15) (2019-03-11)

**Note:** Version bump only for package gatsby-plugin-feed

## [2.0.14](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.13...gatsby-plugin-feed@2.0.14) (2019-02-25)

### Features

- **docs:** adding an RSS Feed ([#11941](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/issues/11941)) ([0d7449d](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/commit/0d7449d))

## [2.0.13](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.12...gatsby-plugin-feed@2.0.13) (2019-02-01)

**Note:** Version bump only for package gatsby-plugin-feed

## [2.0.12](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.11...gatsby-plugin-feed@2.0.12) (2019-01-28)

**Note:** Version bump only for package gatsby-plugin-feed

<a name="2.0.11"></a>

## [2.0.11](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.10...gatsby-plugin-feed@2.0.11) (2018-12-01)

**Note:** Version bump only for package gatsby-plugin-feed

<a name="2.0.10"></a>

## [2.0.10](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.9...gatsby-plugin-feed@2.0.10) (2018-11-29)

**Note:** Version bump only for package gatsby-plugin-feed

<a name="2.0.9"></a>

## [2.0.9](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.8...gatsby-plugin-feed@2.0.9) (2018-10-29)

**Note:** Version bump only for package gatsby-plugin-feed

<a name="2.0.8"></a>

## [2.0.8](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.7...gatsby-plugin-feed@2.0.8) (2018-10-09)

**Note:** Version bump only for package gatsby-plugin-feed

<a name="2.0.7"></a>

## [2.0.7](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.6...gatsby-plugin-feed@2.0.7) (2018-10-05)

**Note:** Version bump only for package gatsby-plugin-feed

<a name="2.0.6"></a>

## [2.0.6](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.5...gatsby-plugin-feed@2.0.6) (2018-10-01)

**Note:** Version bump only for package gatsby-plugin-feed

<a name="2.0.5"></a>

## [2.0.5](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.0-rc.2...gatsby-plugin-feed@2.0.5) (2018-09-17)

**Note:** Version bump only for package gatsby-plugin-feed

<a name="2.0.0-rc.2"></a>

# [2.0.0-rc.2](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.0-rc.1...gatsby-plugin-feed@2.0.0-rc.2) (2018-08-29)

**Note:** Version bump only for package gatsby-plugin-feed

<a name="2.0.0-rc.1"></a>

# [2.0.0-rc.1](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.0-rc.0...gatsby-plugin-feed@2.0.0-rc.1) (2018-08-29)

**Note:** Version bump only for package gatsby-plugin-feed

<a name="2.0.0-rc.0"></a>

# [2.0.0-rc.0](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.0-beta.4...gatsby-plugin-feed@2.0.0-rc.0) (2018-08-21)

**Note:** Version bump only for package gatsby-plugin-feed

<a name="2.0.0-beta.4"></a>

# [2.0.0-beta.4](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.0-beta.3...gatsby-plugin-feed@2.0.0-beta.4) (2018-07-21)

**Note:** Version bump only for package gatsby-plugin-feed

<a name="2.0.0-beta.3"></a>

# [2.0.0-beta.3](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.0-beta.2...gatsby-plugin-feed@2.0.0-beta.3) (2018-06-25)

**Note:** Version bump only for package gatsby-plugin-feed

<a name="2.0.0-beta.2"></a>

# [2.0.0-beta.2](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.0-beta.1...gatsby-plugin-feed@2.0.0-beta.2) (2018-06-20)

**Note:** Version bump only for package gatsby-plugin-feed

<a name="2.0.0-beta.1"></a>

# [2.0.0-beta.1](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@2.0.0-beta.0...gatsby-plugin-feed@2.0.0-beta.1) (2018-06-17)

**Note:** Version bump only for package gatsby-plugin-feed

<a name="2.0.0-beta.0"></a>

# [2.0.0-beta.0](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed/compare/gatsby-plugin-feed@1.3.25...gatsby-plugin-feed@2.0.0-beta.0) (2018-06-17)

**Note:** Version bump only for package gatsby-plugin-feed
