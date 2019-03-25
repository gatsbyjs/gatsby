# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.2.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.8...gatsby@2.2.9) (2019-03-23)

### Features

- **redux:** cache truePath lookups for performance ([#12693](https://github.com/gatsbyjs/gatsby/issues/12693)) ([d5c3351](https://github.com/gatsbyjs/gatsby/commit/d5c3351))

## [2.2.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.7...gatsby@2.2.8) (2019-03-22)

### Bug Fixes

- **gatsby:** tolerate null object values ([#12756](https://github.com/gatsbyjs/gatsby/issues/12756)) ([7e51263](https://github.com/gatsbyjs/gatsby/commit/7e51263))
- **gatsby-source-filesystem:** pin chokidar@2.1.2 to fix unix issues ([#12759](https://github.com/gatsbyjs/gatsby/issues/12759)) ([0ea1505](https://github.com/gatsbyjs/gatsby/commit/0ea1505))

## [2.2.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.6...gatsby@2.2.7) (2019-03-22)

### Bug Fixes

- **gatsby:** make sure interface implementations in third-party schema ([#12721](https://github.com/gatsbyjs/gatsby/issues/12721)) ([423c953](https://github.com/gatsbyjs/gatsby/commit/423c953))

## [2.2.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.5...gatsby@2.2.6) (2019-03-21)

**Note:** Version bump only for package gatsby

## [2.2.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.4...gatsby@2.2.5) (2019-03-21)

**Note:** Version bump only for package gatsby

## [2.2.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.3...gatsby@2.2.4) (2019-03-21)

### Bug Fixes

- **gatsby:** keep track of pages created by stateful createPages after edits ([#12671](https://github.com/gatsbyjs/gatsby/issues/12671)) ([62f0d10](https://github.com/gatsbyjs/gatsby/commit/62f0d10)), closes [#12143](https://github.com/gatsbyjs/gatsby/issues/12143)
- **gatsby:** quick check if string looks like a date ([#12700](https://github.com/gatsbyjs/gatsby/issues/12700)) ([22a2689](https://github.com/gatsbyjs/gatsby/commit/22a2689)), closes [#12692](https://github.com/gatsbyjs/gatsby/issues/12692)

### Features

- **gatsby:** Add stack trace to error reporting in GraphiQL ([#12690](https://github.com/gatsbyjs/gatsby/issues/12690)) ([efa7d1a](https://github.com/gatsbyjs/gatsby/commit/efa7d1a))

## [2.2.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.2...gatsby@2.2.3) (2019-03-20)

### Features

- **gatsby:** add support for microsecond and alternative iso datetime formats ([#12533](https://github.com/gatsbyjs/gatsby/issues/12533)) ([dfe93ee](https://github.com/gatsbyjs/gatsby/commit/dfe93ee))

## [2.2.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.1...gatsby@2.2.2) (2019-03-19)

### Bug Fixes

- **develop:** query runner queue - use priority buckets for tasks instead of sorting ([#12365](https://github.com/gatsbyjs/gatsby/issues/12365)) ([653d771](https://github.com/gatsbyjs/gatsby/commit/653d771)), closes [#12343](https://github.com/gatsbyjs/gatsby/issues/12343)

## [2.2.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.0...gatsby@2.2.1) (2019-03-19)

### Bug Fixes

- **gatsby:** Fix third-party schemas with self-referential queries failing ([#12668](https://github.com/gatsbyjs/gatsby/issues/12668)) ([a1953e0](https://github.com/gatsbyjs/gatsby/commit/a1953e0))

# [2.2.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.39...gatsby@2.2.0) (2019-03-19)

### Features

- **gatsby:** allow schema customization ([#11480](https://github.com/gatsbyjs/gatsby/issues/11480)) ([07e69be](https://github.com/gatsbyjs/gatsby/commit/07e69be))

## [2.1.39](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.38...gatsby@2.1.39) (2019-03-19)

### Bug Fixes

- **gatsby:** filter null values in headComponents, preBodyComponents and postBodyComponents ([#12555](https://github.com/gatsbyjs/gatsby/issues/12555)) ([f7dbc8b](https://github.com/gatsbyjs/gatsby/commit/f7dbc8b))
- **gatsby:** workaround webpack terser plugin hanging on WSL ([#12636](https://github.com/gatsbyjs/gatsby/issues/12636)) ([8f71f50](https://github.com/gatsbyjs/gatsby/commit/8f71f50)), closes [#6540](https://github.com/gatsbyjs/gatsby/issues/6540) [#7013](https://github.com/gatsbyjs/gatsby/issues/7013)

## [2.1.38](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.37...gatsby@2.1.38) (2019-03-18)

### Features

- let shadowed components import parents ([#12586](https://github.com/gatsbyjs/gatsby/issues/12586)) ([368c9e0](https://github.com/gatsbyjs/gatsby/commit/368c9e0))

## [2.1.37](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.36...gatsby@2.1.37) (2019-03-16)

### Bug Fixes

- **gatsby:** extract queries from themes not starting with "gatsby-theme-\*" name ([#12604](https://github.com/gatsbyjs/gatsby/issues/12604)) ([b9808f2](https://github.com/gatsbyjs/gatsby/commit/b9808f2))

## [2.1.36](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.35...gatsby@2.1.36) (2019-03-16)

**Note:** Version bump only for package gatsby

## [2.1.35](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.34...gatsby@2.1.35) (2019-03-15)

### Features

- **gatsby:** set up webpack config for eventual PnP support ([#12315](https://github.com/gatsbyjs/gatsby/issues/12315)) ([ad6319b](https://github.com/gatsbyjs/gatsby/commit/ad6319b)), closes [/github.com/arcanis/pnp-webpack-plugin/blob/master/index.js#L110-L138](https://github.com//github.com/arcanis/pnp-webpack-plugin/blob/master/index.js/issues/L110-L138) [#10245](https://github.com/gatsbyjs/gatsby/issues/10245) [#12163](https://github.com/gatsbyjs/gatsby/issues/12163)

## [2.1.34](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.33...gatsby@2.1.34) (2019-03-14)

### Bug Fixes

- **gatsby:** properly support --no-color for pretty-error ([#12531](https://github.com/gatsbyjs/gatsby/issues/12531)) ([e493538](https://github.com/gatsbyjs/gatsby/commit/e493538))

## [2.1.33](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.32...gatsby@2.1.33) (2019-03-14)

### Bug Fixes

- **gatsby:** allow environment variables to be replaced per environment ([#10565](https://github.com/gatsbyjs/gatsby/issues/10565)) ([828eaf8](https://github.com/gatsbyjs/gatsby/commit/828eaf8))

## [2.1.32](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.31...gatsby@2.1.32) (2019-03-13)

### Features

- **redirects:** handle absolute from paths when path prefix is used ([#12509](https://github.com/gatsbyjs/gatsby/issues/12509)) ([c6583d4](https://github.com/gatsbyjs/gatsby/commit/c6583d4)), closes [#12497](https://github.com/gatsbyjs/gatsby/issues/12497)

## [2.1.31](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.30...gatsby@2.1.31) (2019-03-12)

**Note:** Version bump only for package gatsby

## [2.1.30](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.29...gatsby@2.1.30) (2019-03-11)

**Note:** Version bump only for package gatsby

## [2.1.29](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.28...gatsby@2.1.29) (2019-03-11)

### Bug Fixes

- **gatsby:** return graphqlRunner from bootstrap ([#12477](https://github.com/gatsbyjs/gatsby/issues/12477)) ([79b7d4e](https://github.com/gatsbyjs/gatsby/commit/79b7d4e))

## [2.1.28](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.27...gatsby@2.1.28) (2019-03-11)

### Bug Fixes

- **gatsby:** correct bootstrap emit order ([#12473](https://github.com/gatsbyjs/gatsby/issues/12473)) ([fceb4e7](https://github.com/gatsbyjs/gatsby/commit/fceb4e7))
- **gatsby:** Emit BOOTSTRAP_FINISHED when bootstrap finishes ([#12461](https://github.com/gatsbyjs/gatsby/issues/12461)) ([0f136d5](https://github.com/gatsbyjs/gatsby/commit/0f136d5))

## [2.1.27](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.26...gatsby@2.1.27) (2019-03-08)

### Bug Fixes

- **gatsby:** Vendor express-static so we can avoid loading html files from public during development ([#12336](https://github.com/gatsbyjs/gatsby/issues/12336)) ([800e023](https://github.com/gatsbyjs/gatsby/commit/800e023)), closes [/github.com/gatsbyjs/gatsby/pull/12243#pullrequestreview-210895624](https://github.com//github.com/gatsbyjs/gatsby/pull/12243/issues/pullrequestreview-210895624)

## [2.1.26](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.25...gatsby@2.1.26) (2019-03-08)

### Bug Fixes

- **gatsby): Revert "chore(gatsby:** Update more dependencies to support graphql@14" ([#12408](https://github.com/gatsbyjs/gatsby/issues/12408)) ([b040b44](https://github.com/gatsbyjs/gatsby/commit/b040b44)), closes [gatsbyjs/gatsby#11512](https://github.com/gatsbyjs/gatsby/issues/11512)

## [2.1.25](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.24...gatsby@2.1.25) (2019-03-08)

**Note:** Version bump only for package gatsby

## [2.1.24](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.23...gatsby@2.1.24) (2019-03-07)

### Features

- **gatsby:** add pnp resolving by passing rootdir in pkg resolving ([#12163](https://github.com/gatsbyjs/gatsby/issues/12163)) ([72e0d6f](https://github.com/gatsbyjs/gatsby/commit/72e0d6f)), closes [#10245](https://github.com/gatsbyjs/gatsby/issues/10245)

## [2.1.23](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.22...gatsby@2.1.23) (2019-03-05)

### Bug Fixes

- **core:** Only delete html/css files during prod builds ([#12243](https://github.com/gatsbyjs/gatsby/issues/12243)) ([9835f56](https://github.com/gatsbyjs/gatsby/commit/9835f56))
- **gatsby:** don't delete /404.html during development ([#12297](https://github.com/gatsbyjs/gatsby/issues/12297)) ([23488ea](https://github.com/gatsbyjs/gatsby/commit/23488ea))

## [2.1.22](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.21...gatsby@2.1.22) (2019-03-05)

**Note:** Version bump only for package gatsby

## [2.1.21](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.20...gatsby@2.1.21) (2019-03-04)

**Note:** Version bump only for package gatsby

## [2.1.20](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.19...gatsby@2.1.20) (2019-03-04)

### Bug Fixes

- **gatsby:** Call onPostBootstrap only once after bootstrap ([#12262](https://github.com/gatsbyjs/gatsby/issues/12262)) ([8fc999f](https://github.com/gatsbyjs/gatsby/commit/8fc999f))

### Features

- **gatsby:** configure physical cores, logical_cores or fixed number ([#10257](https://github.com/gatsbyjs/gatsby/issues/10257)) ([c51440e](https://github.com/gatsbyjs/gatsby/commit/c51440e))

## [2.1.19](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.18...gatsby@2.1.19) (2019-02-28)

### Bug Fixes

- **gatsby:** Adapt Loki workaround for eq:null ([#12062](https://github.com/gatsbyjs/gatsby/issues/12062)) ([ff7f5ba](https://github.com/gatsbyjs/gatsby/commit/ff7f5ba))
- **gatsby:** Don't delete nodes multiple times ([#12049](https://github.com/gatsbyjs/gatsby/issues/12049)) ([9a15739](https://github.com/gatsbyjs/gatsby/commit/9a15739))

## [2.1.18](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.17...gatsby@2.1.18) (2019-02-25)

### Bug Fixes

- **gatsby:** Catch errors when persisting state ([#12046](https://github.com/gatsbyjs/gatsby/issues/12046)) ([8460992](https://github.com/gatsbyjs/gatsby/commit/8460992))
- **gatsby:** normalize component path casing ([#12005](https://github.com/gatsbyjs/gatsby/issues/12005)) ([3006163](https://github.com/gatsbyjs/gatsby/commit/3006163))
- **gatsby:** theme component shadow fails when extension is used ([#12010](https://github.com/gatsbyjs/gatsby/issues/12010)) ([0d11ff5](https://github.com/gatsbyjs/gatsby/commit/0d11ff5))

## [2.1.17](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.16...gatsby@2.1.17) (2019-02-22)

**Note:** Version bump only for package gatsby

## [2.1.16](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.15...gatsby@2.1.16) (2019-02-22)

**Note:** Version bump only for package gatsby

## [2.1.15](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.14...gatsby@2.1.15) (2019-02-22)

**Note:** Version bump only for package gatsby

## [2.1.14](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.13...gatsby@2.1.14) (2019-02-21)

### Bug Fixes

- **themes:** reverse order of themes checked when shadowing ([#11954](https://github.com/gatsbyjs/gatsby/issues/11954)) ([8284793](https://github.com/gatsbyjs/gatsby/commit/8284793))

## [2.1.13](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.12...gatsby@2.1.13) (2019-02-20)

### Bug Fixes

- **gatsby:** don't show false positive async createPage warning ([#11929](https://github.com/gatsbyjs/gatsby/issues/11929)) ([5e66f87](https://github.com/gatsbyjs/gatsby/commit/5e66f87))

## [2.1.12](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.11...gatsby@2.1.12) (2019-02-20)

### Bug Fixes

- **gatsby:** Stopped queueing further calls to onCreatePage after a page is deleted ([#11777](https://github.com/gatsbyjs/gatsby/issues/11777)) ([f32c016](https://github.com/gatsbyjs/gatsby/commit/f32c016))

## [2.1.11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.10...gatsby@2.1.11) (2019-02-20)

### Bug Fixes

- **webpack.config.js:** Fix test for one CSS chunk to cover more flavors of CSS ([#11927](https://github.com/gatsbyjs/gatsby/issues/11927)) ([c2c66b9](https://github.com/gatsbyjs/gatsby/commit/c2c66b9))

## [2.1.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.9...gatsby@2.1.10) (2019-02-20)

### Bug Fixes

- **themes:** Remove require.resolve in component resolve path ([#11848](https://github.com/gatsbyjs/gatsby/issues/11848)) ([6295325](https://github.com/gatsbyjs/gatsby/commit/6295325))
- check for dirty pages when nodes are deleted (so queries are ru-run and data is removed from pages) ([#11831](https://github.com/gatsbyjs/gatsby/issues/11831)) ([1fff689](https://github.com/gatsbyjs/gatsby/commit/1fff689))

## [2.1.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.8...gatsby@2.1.9) (2019-02-19)

### Features

- **gatsby:** show warning if createPage was called after createPages API finished ([#11883](https://github.com/gatsbyjs/gatsby/issues/11883)) ([258b655](https://github.com/gatsbyjs/gatsby/commit/258b655))

## [2.1.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.7...gatsby@2.1.8) (2019-02-19)

### Features

- **gatsby-cli:** add a clean command to wipe out local dirs ([#9126](https://github.com/gatsbyjs/gatsby/issues/9126)) ([5807936](https://github.com/gatsbyjs/gatsby/commit/5807936))

## [2.1.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.6...gatsby@2.1.7) (2019-02-19)

### Bug Fixes

- **gatsby:** use route path to serve _exact_ page in client routing ([#11740](https://github.com/gatsbyjs/gatsby/issues/11740)) ([a680e69](https://github.com/gatsbyjs/gatsby/commit/a680e69))

## [2.1.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.5...gatsby@2.1.6) (2019-02-19)

**Note:** Version bump only for package gatsby

## [2.1.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.4...gatsby@2.1.5) (2019-02-19)

**Note:** Version bump only for package gatsby

## [2.1.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.3...gatsby@2.1.4) (2019-02-15)

### Features

- **gatsby:** update cache.set to resolve with set value ([#11327](https://github.com/gatsbyjs/gatsby/issues/11327)) ([930164a](https://github.com/gatsbyjs/gatsby/commit/930164a)), closes [#1234](https://github.com/gatsbyjs/gatsby/issues/1234) [#1234](https://github.com/gatsbyjs/gatsby/issues/1234) [#1234](https://github.com/gatsbyjs/gatsby/issues/1234) [#11275](https://github.com/gatsbyjs/gatsby/issues/11275)

## [2.1.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.2...gatsby@2.1.3) (2019-02-15)

### Bug Fixes

- Only create one CSS file during builds to avoid problems caused by split CSS files loading in different orders ([#11800](https://github.com/gatsbyjs/gatsby/issues/11800)) ([7058a25](https://github.com/gatsbyjs/gatsby/commit/7058a25)), closes [#11072](https://github.com/gatsbyjs/gatsby/issues/11072)

## [2.1.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.1...gatsby@2.1.2) (2019-02-14)

**Note:** Version bump only for package gatsby

## [2.1.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.0...gatsby@2.1.1) (2019-02-14)

### Bug Fixes

- **gatsby:** move to @gatsby scoped version of relay-compiler to fix some upstream bugs([#11759](https://github.com/gatsbyjs/gatsby/pull/11759))

# [2.1.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.120...gatsby@2.1.0) (2019-02-13)

### Features

- **gatsby:** add useStaticQuery hook ([#11588](https://github.com/gatsbyjs/gatsby/issues/11588)) ([f149c4c](https://github.com/gatsbyjs/gatsby/commit/f149c4c))

## [2.0.120](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.119...gatsby@2.0.120) (2019-02-13)

### Bug Fixes

- **core:** added event source polyfill in develop to fix IE/edge hmr ([#11582](https://github.com/gatsbyjs/gatsby/issues/11582)) ([8a6db6a](https://github.com/gatsbyjs/gatsby/commit/8a6db6a)), closes [#11495](https://github.com/gatsbyjs/gatsby/issues/11495)

## [2.0.119](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.118...gatsby@2.0.119) (2019-02-12)

### Bug Fixes

- **gatsby:** add history fallback for client-only routes ([#11610](https://github.com/gatsbyjs/gatsby/issues/11610)) ([a0da7a2](https://github.com/gatsbyjs/gatsby/commit/a0da7a2)), closes [#11581](https://github.com/gatsbyjs/gatsby/issues/11581) [#11581](https://github.com/gatsbyjs/gatsby/issues/11581)

## [2.0.118](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.117...gatsby@2.0.118) (2019-02-08)

### Bug Fixes

- **gatsby:** pin webpack to fix unexpected token error during build ([#11640](https://github.com/gatsbyjs/gatsby/issues/11640)) ([f460b7f](https://github.com/gatsbyjs/gatsby/commit/f460b7f)), closes [#11198](https://github.com/gatsbyjs/gatsby/issues/11198) [webpack/webpack#8656](https://github.com/webpack/webpack/issues/8656) [#11198](https://github.com/gatsbyjs/gatsby/issues/11198) [webpack/webpack#8656](https://github.com/webpack/webpack/issues/8656)

## [2.0.117](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.116...gatsby@2.0.117) (2019-02-07)

### Bug Fixes

- **gatsby:** add sanity check before displaying path for static html build error ([#11620](https://github.com/gatsbyjs/gatsby/issues/11620)) ([3ee60d5](https://github.com/gatsbyjs/gatsby/commit/3ee60d5))
- **gatsby:** Fix Loki query operators special casing ([#11517](https://github.com/gatsbyjs/gatsby/issues/11517)) ([e61692d](https://github.com/gatsbyjs/gatsby/commit/e61692d))

### Features

- **gatsby:** Cache resolved nodes in develop ([#11522](https://github.com/gatsbyjs/gatsby/issues/11522)) ([55e3425](https://github.com/gatsbyjs/gatsby/commit/55e3425))

## [2.0.116](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.115...gatsby@2.0.116) (2019-02-06)

### Bug Fixes

- **gatsby:** use history fallback to display client-only routes in serve ([#11581](https://github.com/gatsbyjs/gatsby/issues/11581)) ([75f6118](https://github.com/gatsbyjs/gatsby/commit/75f6118)), closes [#8080](https://github.com/gatsbyjs/gatsby/issues/8080)

### Features

- **gatsby-plugin-netlify:** Allow status codes in redirects ([#11255](https://github.com/gatsbyjs/gatsby/issues/11255)) ([#11484](https://github.com/gatsbyjs/gatsby/issues/11484)) ([024f6f4](https://github.com/gatsbyjs/gatsby/commit/024f6f4))

## [2.0.115](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.114...gatsby@2.0.115) (2019-02-05)

### Bug Fixes

- **gatsby-cli:** use host option if it is passed ([#11566](https://github.com/gatsbyjs/gatsby/issues/11566)) ([ec15b04](https://github.com/gatsbyjs/gatsby/commit/ec15b04)), closes [#8080](https://github.com/gatsbyjs/gatsby/issues/8080)

## [2.0.114](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.113...gatsby@2.0.114) (2019-02-04)

**Note:** Version bump only for package gatsby

## [2.0.113](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.112...gatsby@2.0.113) (2019-02-04)

**Note:** Version bump only for package gatsby

## [2.0.112](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.111...gatsby@2.0.112) (2019-02-04)

### Bug Fixes

- **gatsby:** update terser-webpack-plugin to avoid webpack error ([#11542](https://github.com/gatsbyjs/gatsby/issues/11542)) ([f945fe8](https://github.com/gatsbyjs/gatsby/commit/f945fe8))

## [2.0.111](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.110...gatsby@2.0.111) (2019-02-01)

### Bug Fixes

- **core:** empty cache if delete fails [docker](<[#11454](https://github.com/gatsbyjs/gatsby/issues/11454)>) ([c2fa762](https://github.com/gatsbyjs/gatsby/commit/c2fa762)), closes [#11097](https://github.com/gatsbyjs/gatsby/issues/11097)

## [2.0.110](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.109...gatsby@2.0.110) (2019-02-01)

**Note:** Version bump only for package gatsby

## [2.0.109](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.108...gatsby@2.0.109) (2019-02-01)

**Note:** Version bump only for package gatsby

## [2.0.108](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.107...gatsby@2.0.108) (2019-02-01)

### Bug Fixes

- **core:** Disable HMR for CSS modules ([#11032](https://github.com/gatsbyjs/gatsby/issues/11032)) ([97c98e9](https://github.com/gatsbyjs/gatsby/commit/97c98e9))

### Features

- **gatsby:** Update graphql to ^14.1.1, relay-compiler to 2.0.0 ([#11377](https://github.com/gatsbyjs/gatsby/issues/11377)) ([97c98e9](https://github.com/gatsbyjs/gatsby/commit/a5b322d))

## [2.0.107](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.106...gatsby@2.0.107) (2019-01-31)

### Bug Fixes

- **gatsby:** always respond with index html without checking path ([#11400](https://github.com/gatsbyjs/gatsby/issues/11400)) ([2f79efe](https://github.com/gatsbyjs/gatsby/commit/2f79efe)), closes [/github.com/gatsbyjs/gatsby/blob/aa4f9397665d6d1e7ea6cdd3bfd6f40b449daccf/packages/gatsby/src/commands/develop.js#L192](https://github.com//github.com/gatsbyjs/gatsby/blob/aa4f9397665d6d1e7ea6cdd3bfd6f40b449daccf/packages/gatsby/src/commands/develop.js/issues/L192)
- **gatsby:** check type when querying by ID ([#11448](https://github.com/gatsbyjs/gatsby/issues/11448)) ([1d95e67](https://github.com/gatsbyjs/gatsby/commit/1d95e67))

### Features

- **gatsby:** Allow specifying sort order per sort field ([#11381](https://github.com/gatsbyjs/gatsby/issues/11381)) ([11e8930](https://github.com/gatsbyjs/gatsby/commit/11e8930))

## [2.0.106](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.105...gatsby@2.0.106) (2019-01-29)

### Features

- **gatsby:** add support for GraphQL playground ([#11193](https://github.com/gatsbyjs/gatsby/issues/11193)) ([2b1b551](https://github.com/gatsbyjs/gatsby/commit/2b1b551))

## [2.0.105](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.104...gatsby@2.0.105) (2019-01-29)

### Features

- **gatsby:** show path to page that fails to render html ([#11390](https://github.com/gatsbyjs/gatsby/issues/11390)) ([3677150](https://github.com/gatsbyjs/gatsby/commit/3677150))

## [2.0.104](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.103...gatsby@2.0.104) (2019-01-29)

### Bug Fixes

- reevaluate page query when page context is modified ([#11048](https://github.com/gatsbyjs/gatsby/issues/11048)) ([6d7c576](https://github.com/gatsbyjs/gatsby/commit/6d7c576))

## [2.0.103](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.102...gatsby@2.0.103) (2019-01-28)

### Features

- **gatsby:** add support for ExportSpecifier in API files ([#11171](https://github.com/gatsbyjs/gatsby/issues/11171)) ([84abff0](https://github.com/gatsbyjs/gatsby/commit/84abff0))
- **gatsby:** extend core theming composition API to be recursive ([#10787](https://github.com/gatsbyjs/gatsby/issues/10787)) ([63c9dd9](https://github.com/gatsbyjs/gatsby/commit/63c9dd9))

## [2.0.102](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.101...gatsby@2.0.102) (2019-01-28)

**Note:** Version bump only for package gatsby

## [2.0.101](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.100...gatsby@2.0.101) (2019-01-28)

**Note:** Version bump only for package gatsby

## [2.0.100](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.99...gatsby@2.0.100) (2019-01-28)

### Features

- **gatsby-plugin-offline:** reload when missing resources and SW was updated + add "onServiceWorkerUpdateReady" API ([#10432](https://github.com/gatsbyjs/gatsby/issues/10432)) ([4a01c6d](https://github.com/gatsbyjs/gatsby/commit/4a01c6d))

## [2.0.99](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.98...gatsby@2.0.99) (2019-01-28)

### Features

- **gatsby:** add Jaeger tracing support ([#10268](https://github.com/gatsbyjs/gatsby/issues/10268)) ([916b834](https://github.com/gatsbyjs/gatsby/commit/916b834))

## [2.0.98](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.97...gatsby@2.0.98) (2019-01-25)

### Bug Fixes

- **gatsby:** Fix regression introduced in [#11149](https://github.com/gatsbyjs/gatsby/issues/11149) ([#11263](https://github.com/gatsbyjs/gatsby/issues/11263)) ([70c3f32](https://github.com/gatsbyjs/gatsby/commit/70c3f32))

## [2.0.97](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.96...gatsby@2.0.97) (2019-01-24)

### Bug Fixes

- **docs:** change bound-action-creators links into actions links ([#11207](https://github.com/gatsbyjs/gatsby/issues/11207)) ([5aaaadb](https://github.com/gatsbyjs/gatsby/commit/5aaaadb))

<a name="2.0.96"></a>

## [2.0.96](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.95...gatsby@2.0.96) (2019-01-24)

**Note:** Version bump only for package gatsby

<a name="2.0.95"></a>

## [2.0.95](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.94...gatsby@2.0.95) (2019-01-24)

### Bug Fixes

- **gatsby:** Resolve all fields before querying with Sift ([#11149](https://github.com/gatsbyjs/gatsby/issues/11149)) ([d432e2a](https://github.com/gatsbyjs/gatsby/commit/d432e2a))
- handle escaped regex string ([#11002](https://github.com/gatsbyjs/gatsby/issues/11002)) ([d7a2885](https://github.com/gatsbyjs/gatsby/commit/d7a2885))

<a name="2.0.94"></a>

## [2.0.94](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.93...gatsby@2.0.94) (2019-01-24)

**Note:** Version bump only for package gatsby

<a name="2.0.93"></a>

## [2.0.93](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.92...gatsby@2.0.93) (2019-01-23)

### Bug Fixes

- **gatsby:** Ensure publicPath is always relative for gatsby develop ([#11227](https://github.com/gatsbyjs/gatsby/issues/11227)) ([549b8ac](https://github.com/gatsbyjs/gatsby/commit/549b8ac))

<a name="2.0.92"></a>

## [2.0.92](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.91...gatsby@2.0.92) (2019-01-23)

### Bug Fixes

- **graphql:** findLinkedNodeByField not returning any value ([#11045](https://github.com/gatsbyjs/gatsby/issues/11045)) ([cef713a](https://github.com/gatsbyjs/gatsby/commit/cef713a)), closes [#1234](https://github.com/gatsbyjs/gatsby/issues/1234) [#1234](https://github.com/gatsbyjs/gatsby/issues/1234) [#1234](https://github.com/gatsbyjs/gatsby/issues/1234)

### Features

- **browser-api:** add previous location argument to navigation updates ([#11095](https://github.com/gatsbyjs/gatsby/issues/11095)) ([b842255](https://github.com/gatsbyjs/gatsby/commit/b842255))

<a name="2.0.91"></a>

## [2.0.91](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.90...gatsby@2.0.91) (2019-01-10)

**Note:** Version bump only for package gatsby

<a name="2.0.90"></a>

## [2.0.90](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.89...gatsby@2.0.90) (2019-01-09)

### Features

- **gatsby:** Add noscript tag to default-html ([#10945](https://github.com/gatsbyjs/gatsby/issues/10945)) ([d517ead](https://github.com/gatsbyjs/gatsby/commit/d517ead))

<a name="2.0.89"></a>

## [2.0.89](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.88...gatsby@2.0.89) (2019-01-08)

### Bug Fixes

- **gatsby:** test plugin name to handle symlinks, rather than path ([#10835](https://github.com/gatsbyjs/gatsby/issues/10835)) ([f914607](https://github.com/gatsbyjs/gatsby/commit/f914607))

<a name="2.0.88"></a>

## [2.0.88](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.87...gatsby@2.0.88) (2019-01-08)

### Features

- **gatsby:** provide a mechanism for plugins to use a named cache instance ([#10146](https://github.com/gatsbyjs/gatsby/issues/10146)) ([b9a8c00](https://github.com/gatsbyjs/gatsby/commit/b9a8c00))

<a name="2.0.87"></a>

## [2.0.87](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.86...gatsby@2.0.87) (2019-01-08)

### Bug Fixes

- allow plugins to use gatsby-browser.js to load global styles, etc. ([#10845](https://github.com/gatsbyjs/gatsby/issues/10845)) ([33a3e61](https://github.com/gatsbyjs/gatsby/commit/33a3e61))

<a name="2.0.86"></a>

## [2.0.86](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.85...gatsby@2.0.86) (2019-01-08)

### Bug Fixes

- fix SSL naming error caused by @ scoped package name in develop ([#10863](https://github.com/gatsbyjs/gatsby/issues/10863)) ([b5209b9](https://github.com/gatsbyjs/gatsby/commit/b5209b9))

<a name="2.0.85"></a>

## [2.0.85](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.84...gatsby@2.0.85) (2019-01-04)

### Bug Fixes

- **gatsby:** correctly inject static query in theme components ([#10786](https://github.com/gatsbyjs/gatsby/issues/10786)) ([edff703](https://github.com/gatsbyjs/gatsby/commit/edff703))

<a name="2.0.84"></a>

## [2.0.84](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.83...gatsby@2.0.84) (2019-01-04)

### Features

- update builtin ESLint to v5 ([#10220](https://github.com/gatsbyjs/gatsby/issues/10220)) ([2429459](https://github.com/gatsbyjs/gatsby/commit/2429459))

<a name="2.0.83"></a>

## [2.0.83](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.82...gatsby@2.0.83) (2019-01-03)

### Bug Fixes

- don't change default node_modules resolution ([#10561](https://github.com/gatsbyjs/gatsby/issues/10561)) ([201ff4b](https://github.com/gatsbyjs/gatsby/commit/201ff4b))

<a name="2.0.82"></a>

## [2.0.82](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.81...gatsby@2.0.82) (2019-01-02)

**Note:** Version bump only for package gatsby

<a name="2.0.81"></a>

## [2.0.81](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.80...gatsby@2.0.81) (2019-01-01)

**Note:** Version bump only for package gatsby

<a name="2.0.80"></a>

## [2.0.80](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.79...gatsby@2.0.80) (2019-01-01)

**Note:** Version bump only for package gatsby

<a name="2.0.79"></a>

## [2.0.79](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.78...gatsby@2.0.79) (2018-12-31)

### Features

- dev server can now reuse the same tab on Mac ([#6550](https://github.com/gatsbyjs/gatsby/issues/6550)) ([1a4ea3c](https://github.com/gatsbyjs/gatsby/commit/1a4ea3c))

<a name="2.0.78"></a>

## [2.0.78](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.77...gatsby@2.0.78) (2018-12-29)

### Bug Fixes

- **gatsby:** avoid full page refresh when navigating to non-existant page ([#10684](https://github.com/gatsbyjs/gatsby/issues/10684)) ([88866c7](https://github.com/gatsbyjs/gatsby/commit/88866c7))

<a name="2.0.77"></a>

## [2.0.77](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.76...gatsby@2.0.77) (2018-12-27)

### Bug Fixes

- **gatsby:** wrap dev 404 component with route update ([#10653](https://github.com/gatsbyjs/gatsby/issues/10653)) ([754174d](https://github.com/gatsbyjs/gatsby/commit/754174d))

<a name="2.0.76"></a>

## [2.0.76](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.75...gatsby@2.0.76) (2018-12-24)

### Bug Fixes

- **gatsby:** handle missing pages metadata chunk ([#10507](https://github.com/gatsbyjs/gatsby/issues/10507)) ([b9411d8](https://github.com/gatsbyjs/gatsby/commit/b9411d8))
- don't use EnsureResources for development 404 page ([#10625](https://github.com/gatsbyjs/gatsby/issues/10625)) ([f6e2e65](https://github.com/gatsbyjs/gatsby/commit/f6e2e65))

<a name="2.0.75"></a>

## [2.0.75](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.74...gatsby@2.0.75) (2018-12-21)

### Bug Fixes

- **query-runner:** replace .off with .removeListener ([#10613](https://github.com/gatsbyjs/gatsby/issues/10613)) ([ed5e5d5](https://github.com/gatsbyjs/gatsby/commit/ed5e5d5)), closes [#10593](https://github.com/gatsbyjs/gatsby/issues/10593) [#1234](https://github.com/gatsbyjs/gatsby/issues/1234) [#1234](https://github.com/gatsbyjs/gatsby/issues/1234) [#1234](https://github.com/gatsbyjs/gatsby/issues/1234) [#10612](https://github.com/gatsbyjs/gatsby/issues/10612)

<a name="2.0.74"></a>

## [2.0.74](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.73...gatsby@2.0.74) (2018-12-21)

### Bug Fixes

- **gatsby:** fix eventemitter leak in page query runner ([#10593](https://github.com/gatsbyjs/gatsby/issues/10593)) ([80a856f](https://github.com/gatsbyjs/gatsby/commit/80a856f))

<a name="2.0.73"></a>

## [2.0.73](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.72...gatsby@2.0.73) (2018-12-19)

### Bug Fixes

- **gatsby:** Ignore fields with key set to empty string in getExampleValues ([#10557](https://github.com/gatsbyjs/gatsby/issues/10557)) ([86fc9dc](https://github.com/gatsbyjs/gatsby/commit/86fc9dc)), closes [/github.com/graphql/graphql-js/blob/958eb961513de1147c19508d66f97920c26e99e5/src/type/validate.js#L220](https://github.com//github.com/graphql/graphql-js/blob/958eb961513de1147c19508d66f97920c26e99e5/src/type/validate.js/issues/L220) [#10480](https://github.com/gatsbyjs/gatsby/issues/10480)

<a name="2.0.72"></a>

## [2.0.72](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.71...gatsby@2.0.72) (2018-12-18)

**Note:** Version bump only for package gatsby

<a name="2.0.71"></a>

## [2.0.71](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.70...gatsby@2.0.71) (2018-12-18)

### Bug Fixes

- **gatsby:** add Safari 10 support to default terser options ([#10536](https://github.com/gatsbyjs/gatsby/issues/10536)) ([9db27c1](https://github.com/gatsbyjs/gatsby/commit/9db27c1)), closes [/github.com/parcel-bundler/parcel/blob/75310e15f6fa3c8a0ce6593ada1bcca00240ea54/packages/core/parcel-bundler/src/transforms/terser.js#L13](https://github.com//github.com/parcel-bundler/parcel/blob/75310e15f6fa3c8a0ce6593ada1bcca00240ea54/packages/core/parcel-bundler/src/transforms/terser.js/issues/L13)
- **gatsby:** bump minimum react-hot-loader version to get quick fix ([#10542](https://github.com/gatsbyjs/gatsby/issues/10542)) ([9cec72a](https://github.com/gatsbyjs/gatsby/commit/9cec72a)), closes [#10528](https://github.com/gatsbyjs/gatsby/issues/10528)

### Features

- **gatsby:** don't watch files in static directory for production builds ([#5807](https://github.com/gatsbyjs/gatsby/issues/5807)) ([a0bcc58](https://github.com/gatsbyjs/gatsby/commit/a0bcc58))

<a name="2.0.70"></a>

## [2.0.70](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.69...gatsby@2.0.70) (2018-12-17)

**Note:** Version bump only for package gatsby

<a name="2.0.69"></a>

## [2.0.69](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.68...gatsby@2.0.69) (2018-12-17)

**Note:** Version bump only for package gatsby

<a name="2.0.68"></a>

## [2.0.68](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.67...gatsby@2.0.68) (2018-12-17)

**Note:** Version bump only for package gatsby

<a name="2.0.67"></a>

## [2.0.67](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.66...gatsby@2.0.67) (2018-12-13)

### Bug Fixes

- **gatsby:** fix extracting StaticQuery nested in shorthand fragment ([#10443](https://github.com/gatsbyjs/gatsby/issues/10443)) ([d504d44](https://github.com/gatsbyjs/gatsby/commit/d504d44))

<a name="2.0.66"></a>

## [2.0.66](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.65...gatsby@2.0.66) (2018-12-11)

### Features

- **prefetch:** add support for effective-connection-type & saveData ([#10365](https://github.com/gatsbyjs/gatsby/issues/10365)) ([1c51831](https://github.com/gatsbyjs/gatsby/commit/1c51831))

<a name="2.0.65"></a>

## [2.0.65](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.64...gatsby@2.0.65) (2018-12-11)

### Bug Fixes

- **gatsby:** fix false type conflict warning on plugin fields ([#10355](https://github.com/gatsbyjs/gatsby/issues/10355)) ([510fb88](https://github.com/gatsbyjs/gatsby/commit/510fb88))

<a name="2.0.64"></a>

## [2.0.64](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.63...gatsby@2.0.64) (2018-12-07)

### Bug Fixes

- **gatsby:** [loki] sync db autosaves ([#10212](https://github.com/gatsbyjs/gatsby/issues/10212)) ([1c0d051](https://github.com/gatsbyjs/gatsby/commit/1c0d051))

<a name="2.0.63"></a>

## [2.0.63](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.62...gatsby@2.0.63) (2018-12-05)

### Bug Fixes

- **gatsby:** don't remount matchPath pages ([#10261](https://github.com/gatsbyjs/gatsby/issues/10261)) ([1dd3987](https://github.com/gatsbyjs/gatsby/commit/1dd3987))

<a name="2.0.62"></a>

## [2.0.62](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.61...gatsby@2.0.62) (2018-12-04)

### Features

- **gatsby:** update react-hot-loader dependency to enable hooks ([#10259](https://github.com/gatsbyjs/gatsby/issues/10259)) ([bf46002](https://github.com/gatsbyjs/gatsby/commit/bf46002))

<a name="2.0.61"></a>

## [2.0.61](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.60...gatsby@2.0.61) (2018-12-03)

**Note:** Version bump only for package gatsby

<a name="2.0.60"></a>

## [2.0.60](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.59...gatsby@2.0.60) (2018-12-01)

### Bug Fixes

- **gatsby:** skip functions when inferring schema ([#10177](https://github.com/gatsbyjs/gatsby/issues/10177)) ([64a8844](https://github.com/gatsbyjs/gatsby/commit/64a8844)), closes [/github.com/gatsbyjs/gatsby/pull/10159#issuecomment-442045709](https://github.com//github.com/gatsbyjs/gatsby/pull/10159/issues/issuecomment-442045709)

### Features

- **gatsby:** Add type checks to createNodeId ([#10234](https://github.com/gatsbyjs/gatsby/issues/10234)) ([6a86b4d](https://github.com/gatsbyjs/gatsby/commit/6a86b4d))

<a name="2.0.59"></a>

## [2.0.59](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.58...gatsby@2.0.59) (2018-11-29)

### Features

- **gatsby:** add lokijs nodes db implementation ([#9919](https://github.com/gatsbyjs/gatsby/issues/9919)) ([4bcca2a](https://github.com/gatsbyjs/gatsby/commit/4bcca2a)), closes [#9338](https://github.com/gatsbyjs/gatsby/issues/9338)

<a name="2.0.58"></a>

## [2.0.58](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.57...gatsby@2.0.58) (2018-11-29)

**Note:** Version bump only for package gatsby

<a name="2.0.57"></a>

## [2.0.57](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.56...gatsby@2.0.57) (2018-11-28)

### Bug Fixes

- **gatsby:** fix infinite reloads when resources fail ([#10141](https://github.com/gatsbyjs/gatsby/issues/10141)) ([9fc25f3](https://github.com/gatsbyjs/gatsby/commit/9fc25f3)), closes [#10074](https://github.com/gatsbyjs/gatsby/issues/10074)

<a name="2.0.56"></a>

## [2.0.56](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.55...gatsby@2.0.56) (2018-11-27)

**Note:** Version bump only for package gatsby

<a name="2.0.55"></a>

## [2.0.55](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.54...gatsby@2.0.55) (2018-11-22)

### Features

- **gatsby:** use cheap-module-source-map devtool webpack config in develop mode for easier debugging ([#10083](https://github.com/gatsbyjs/gatsby/issues/10083)) ([ce5cbe8](https://github.com/gatsbyjs/gatsby/commit/ce5cbe8)), closes [#6278](https://github.com/gatsbyjs/gatsby/issues/6278)

<a name="2.0.54"></a>

## [2.0.54](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.53...gatsby@2.0.54) (2018-11-21)

### Features

- **gatsby:** warn user about incompatible plugins ([#10034](https://github.com/gatsbyjs/gatsby/issues/10034)) ([8421707](https://github.com/gatsbyjs/gatsby/commit/8421707)), closes [#7143](https://github.com/gatsbyjs/gatsby/issues/7143) [#9731](https://github.com/gatsbyjs/gatsby/issues/9731)

<a name="2.0.53"></a>

## [2.0.53](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.52...gatsby@2.0.53) (2018-11-20)

### Features

- **gatsby-plugin-offline:** replace no-cache detection with dynamic path whitelist ([#9907](https://github.com/gatsbyjs/gatsby/issues/9907)) ([8d3af3f](https://github.com/gatsbyjs/gatsby/commit/8d3af3f))

<a name="2.0.52"></a>

## [2.0.52](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.51...gatsby@2.0.52) (2018-11-19)

### Bug Fixes

- prefix graphql type names with underscore if it starts with number ([#10007](https://github.com/gatsbyjs/gatsby/issues/10007)) ([1d2a9be](https://github.com/gatsbyjs/gatsby/commit/1d2a9be)), closes [#9950](https://github.com/gatsbyjs/gatsby/issues/9950)

<a name="2.0.51"></a>

## [2.0.51](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.50...gatsby@2.0.51) (2018-11-19)

### Bug Fixes

- avoid leaking defined env vars when trying to access not defined env vars ([#10030](https://github.com/gatsbyjs/gatsby/issues/10030)) ([8061e3b](https://github.com/gatsbyjs/gatsby/commit/8061e3b))

<a name="2.0.50"></a>

## [2.0.50](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.49...gatsby@2.0.50) (2018-11-15)

### Bug Fixes

- **gatsby:** correctly pick up browserslist overrides ([#9669](https://github.com/gatsbyjs/gatsby/issues/9669)) ([0f0feac](https://github.com/gatsbyjs/gatsby/commit/0f0feac))

<a name="2.0.49"></a>

## [2.0.49](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.48...gatsby@2.0.49) (2018-11-14)

### Bug Fixes

- **docs:** update broken links with working links ([#9912](https://github.com/gatsbyjs/gatsby/issues/9912)) ([e9f2a6f](https://github.com/gatsbyjs/gatsby/commit/e9f2a6f))

<a name="2.0.48"></a>

## [2.0.48](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.47...gatsby@2.0.48) (2018-11-13)

**Note:** Version bump only for package gatsby

<a name="2.0.47"></a>

## [2.0.47](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.46...gatsby@2.0.47) (2018-11-12)

**Note:** Version bump only for package gatsby

<a name="2.0.46"></a>

## [2.0.46](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.45...gatsby@2.0.46) (2018-11-12)

**Note:** Version bump only for package gatsby

<a name="2.0.45"></a>

## [2.0.45](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.44...gatsby@2.0.45) (2018-11-09)

### Bug Fixes

- handle development proxy exceptions and show some context ([#9839](https://github.com/gatsbyjs/gatsby/issues/9839)) ([b605ade](https://github.com/gatsbyjs/gatsby/commit/b605ade)), closes [#6771](https://github.com/gatsbyjs/gatsby/issues/6771)

<a name="2.0.44"></a>

## [2.0.44](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.43...gatsby@2.0.44) (2018-11-09)

### Features

- show GraphQL compile errors in browser overlay ([#6247](https://github.com/gatsbyjs/gatsby/issues/6247)) ([2cd7bfa](https://github.com/gatsbyjs/gatsby/commit/2cd7bfa)), closes [#5234](https://github.com/gatsbyjs/gatsby/issues/5234)

<a name="2.0.43"></a>

## [2.0.43](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.42...gatsby@2.0.43) (2018-11-08)

**Note:** Version bump only for package gatsby

<a name="2.0.42"></a>

## [2.0.42](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.41...gatsby@2.0.42) (2018-11-08)

### Bug Fixes

- use relative HMR path ([#9734](https://github.com/gatsbyjs/gatsby/issues/9734)) ([c4b9283](https://github.com/gatsbyjs/gatsby/commit/c4b9283))

<a name="2.0.41"></a>

## [2.0.41](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.40...gatsby@2.0.41) (2018-11-08)

### Features

- pass pathname to replaceRenderer and onPreRenderHTML SSR APIs ([#9792](https://github.com/gatsbyjs/gatsby/issues/9792)) ([f032ceb](https://github.com/gatsbyjs/gatsby/commit/f032ceb))

<a name="2.0.40"></a>

## [2.0.40](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.39...gatsby@2.0.40) (2018-11-06)

### Bug Fixes

- adjust page order to make nested matchPaths work ([#9719](https://github.com/gatsbyjs/gatsby/issues/9719)) ([5b4e0b5](https://github.com/gatsbyjs/gatsby/commit/5b4e0b5)), closes [#9705](https://github.com/gatsbyjs/gatsby/issues/9705)

<a name="2.0.39"></a>

## [2.0.39](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.38...gatsby@2.0.39) (2018-11-05)

**Note:** Version bump only for package gatsby

<a name="2.0.38"></a>

## [2.0.38](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.37...gatsby@2.0.38) (2018-11-02)

### Bug Fixes

- load plugin object style without options object ([#9647](https://github.com/gatsbyjs/gatsby/issues/9647)) ([42a2d07](https://github.com/gatsbyjs/gatsby/commit/42a2d07)), closes [#9559](https://github.com/gatsbyjs/gatsby/issues/9559)

<a name="2.0.37"></a>

## [2.0.37](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.36...gatsby@2.0.37) (2018-11-01)

**Note:** Version bump only for package gatsby

<a name="2.0.36"></a>

## [2.0.36](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.35...gatsby@2.0.36) (2018-11-01)

### Bug Fixes

- **gatsby:** detect additional 404 page locations when performing canonical path redirects ([679db41](https://github.com/gatsbyjs/gatsby/commit/679db41))

### Features

- **gatsby:** Move connection out of sift ([#9508](https://github.com/gatsbyjs/gatsby/issues/9508)) ([8c7a745](https://github.com/gatsbyjs/gatsby/commit/8c7a745)), closes [#9416](https://github.com/gatsbyjs/gatsby/issues/9416) [#9338](https://github.com/gatsbyjs/gatsby/issues/9338)

<a name="2.0.35"></a>

## [2.0.35](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.34...gatsby@2.0.35) (2018-10-30)

### Bug Fixes

- **gatsby:** fix crash on inferring input type with missing node ([#9487](https://github.com/gatsbyjs/gatsby/issues/9487)) ([b5b43d5](https://github.com/gatsbyjs/gatsby/commit/b5b43d5))

<a name="2.0.34"></a>

## [2.0.34](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.33...gatsby@2.0.34) (2018-10-29)

### Features

- **gatsby:** use json-stream-stringify to serialize redux state ([#9370](https://github.com/gatsbyjs/gatsby/issues/9370)) ([c334075](https://github.com/gatsbyjs/gatsby/commit/c334075)), closes [#9362](https://github.com/gatsbyjs/gatsby/issues/9362)

<a name="2.0.33"></a>

## [2.0.33](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.32...gatsby@2.0.33) (2018-10-29)

### Features

- **gatsby:** Add nodes db module ([#9416](https://github.com/gatsbyjs/gatsby/issues/9416)) ([7d31fe7](https://github.com/gatsbyjs/gatsby/commit/7d31fe7)), closes [#9338](https://github.com/gatsbyjs/gatsby/issues/9338)

<a name="2.0.32"></a>

## [2.0.32](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.31...gatsby@2.0.32) (2018-10-29)

### Bug Fixes

- **gatsby-plugin-jss:** use separate SheetsRegistry for each page ([#9401](https://github.com/gatsbyjs/gatsby/issues/9401)) ([15375c8](https://github.com/gatsbyjs/gatsby/commit/15375c8)), closes [#7716](https://github.com/gatsbyjs/gatsby/issues/7716)

<a name="2.0.31"></a>

## [2.0.31](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.30...gatsby@2.0.31) (2018-10-24)

**Note:** Version bump only for package gatsby

<a name="2.0.30"></a>

## [2.0.30](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.29...gatsby@2.0.30) (2018-10-24)

**Note:** Version bump only for package gatsby

<a name="2.0.29"></a>

## [2.0.29](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.28...gatsby@2.0.29) (2018-10-23)

### Bug Fixes

- handle node api-api error gracefully ([#9255](https://github.com/gatsbyjs/gatsby/issues/9255)) ([fa8ef4e](https://github.com/gatsbyjs/gatsby/commit/fa8ef4e))
- **package.json:** update homepage to point at the package ([#9227](https://github.com/gatsbyjs/gatsby/issues/9227)) ([69fd92b](https://github.com/gatsbyjs/gatsby/commit/69fd92b))

<a name="2.0.28"></a>

## [2.0.28](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.27...gatsby@2.0.28) (2018-10-19)

### Bug Fixes

- **schema:** share union type instances ([#9052](https://github.com/gatsbyjs/gatsby/issues/9052)) ([d87881a](https://github.com/gatsbyjs/gatsby/commit/d87881a))
- fix builds without gatsby-config [#8917](https://github.com/gatsbyjs/gatsby/issues/8917) ([#9256](https://github.com/gatsbyjs/gatsby/issues/9256)) ([27fcc4d](https://github.com/gatsbyjs/gatsby/commit/27fcc4d))

<a name="2.0.27"></a>

## [2.0.27](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.26...gatsby@2.0.27) (2018-10-19)

### Bug Fixes

- **gatsby:** ignore `__esModule` property when resolving module exports ([#9226](https://github.com/gatsbyjs/gatsby/issues/9226)) ([c57f1e0](https://github.com/gatsbyjs/gatsby/commit/c57f1e0))

<a name="2.0.26"></a>

## [2.0.26](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.25...gatsby@2.0.26) (2018-10-18)

### Bug Fixes

- check for empty fields in InputFilter inference ([#9057](https://github.com/gatsbyjs/gatsby/issues/9057)) ([4a0563e](https://github.com/gatsbyjs/gatsby/commit/4a0563e))

<a name="2.0.25"></a>

## [2.0.25](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.24...gatsby@2.0.25) (2018-10-16)

### Bug Fixes

- **gatsby:** Prevent minifier from compressing output using ES6+ syntax ([#9135](https://github.com/gatsbyjs/gatsby/issues/9135)) ([fed6d35](https://github.com/gatsbyjs/gatsby/commit/fed6d35))

<a name="2.0.24"></a>

## [2.0.24](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.23...gatsby@2.0.24) (2018-10-16)

### Bug Fixes

- **gatsby:** add main field pointing to transpiled commonjs entry ([#9123](https://github.com/gatsbyjs/gatsby/issues/9123)) ([eeca436](https://github.com/gatsbyjs/gatsby/commit/eeca436))
- make elemMatch operator work with \_\_\_NODE arrays ([#8076](https://github.com/gatsbyjs/gatsby/issues/8076)) ([d0b9d94](https://github.com/gatsbyjs/gatsby/commit/d0b9d94))

<a name="2.0.23"></a>

## [2.0.23](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.22...gatsby@2.0.23) (2018-10-15)

### Bug Fixes

- querying nodes by id and operator different than eq ([#9101](https://github.com/gatsbyjs/gatsby/issues/9101)) ([ccc3082](https://github.com/gatsbyjs/gatsby/commit/ccc3082))

<a name="2.0.22"></a>

## [2.0.22](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.21...gatsby@2.0.22) (2018-10-12)

**Note:** Version bump only for package gatsby

<a name="2.0.21"></a>

## [2.0.21](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.20...gatsby@2.0.21) (2018-10-10)

### Features

- add onCreateDevServer node api ([#7556](https://github.com/gatsbyjs/gatsby/issues/7556)) ([a1d3d70](https://github.com/gatsbyjs/gatsby/commit/a1d3d70))
- store sync token for contentful preview ([#8814](https://github.com/gatsbyjs/gatsby/issues/8814)) ([365942b](https://github.com/gatsbyjs/gatsby/commit/365942b))

<a name="2.0.20"></a>

## [2.0.20](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.19...gatsby@2.0.20) (2018-10-09)

### Bug Fixes

- **gatsby-plugin-offline:** delay adding resources for paths until we have urls ([#8613](https://github.com/gatsbyjs/gatsby/issues/8613)) ([2605aa0](https://github.com/gatsbyjs/gatsby/commit/2605aa0))
- **register-service-worker:** show an error if installing SW not over HTTPS ([#8958](https://github.com/gatsbyjs/gatsby/issues/8958)) ([2ba57ea](https://github.com/gatsbyjs/gatsby/commit/2ba57ea))
- more work to prevent queries from running when there's in-progress node processing ([#8859](https://github.com/gatsbyjs/gatsby/issues/8859)) ([00eeef0](https://github.com/gatsbyjs/gatsby/commit/00eeef0))

<a name="2.0.19"></a>

## [2.0.19](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.18...gatsby@2.0.19) (2018-10-05)

### Bug Fixes

- hot-reload page updates when querying by id ([#8799](https://github.com/gatsbyjs/gatsby/issues/8799)) ([508d3b6](https://github.com/gatsbyjs/gatsby/commit/508d3b6))
- pretty print syntax error in gatsby api files ([#8723](https://github.com/gatsbyjs/gatsby/issues/8723)) ([1ef38c2](https://github.com/gatsbyjs/gatsby/commit/1ef38c2))

<a name="2.0.18"></a>

## [2.0.18](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.17...gatsby@2.0.18) (2018-10-03)

### Features

- **gatsby:** switch to different caching mechanism backed by fs ([#8435](https://github.com/gatsbyjs/gatsby/issues/8435)) ([5386e1d](https://github.com/gatsbyjs/gatsby/commit/5386e1d))

<a name="2.0.17"></a>

## [2.0.17](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.16...gatsby@2.0.17) (2018-10-02)

**Note:** Version bump only for package gatsby

<a name="2.0.16"></a>

## [2.0.16](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.15...gatsby@2.0.16) (2018-10-02)

### Bug Fixes

- **gatsby:** add mjs config to webpack and resolve correctly ([#8717](https://github.com/gatsbyjs/gatsby/issues/8717)) ([a0cbbcb](https://github.com/gatsbyjs/gatsby/commit/a0cbbcb)), closes [#8655](https://github.com/gatsbyjs/gatsby/issues/8655)

<a name="2.0.15"></a>

## [2.0.15](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.14...gatsby@2.0.15) (2018-10-02)

**Note:** Version bump only for package gatsby

<a name="2.0.14"></a>

## [2.0.14](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.13...gatsby@2.0.14) (2018-10-01)

**Note:** Version bump only for package gatsby

<a name="2.0.13"></a>

## [2.0.13](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.12...gatsby@2.0.13) (2018-10-01)

### Bug Fixes

- run onPreRenderHTML after gatsby-script-loader and gatsby-chunk-mapper ([#8043](https://github.com/gatsbyjs/gatsby/issues/8043)) ([3bec55e](https://github.com/gatsbyjs/gatsby/commit/3bec55e))

<a name="2.0.12"></a>

## [2.0.12](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.11...gatsby@2.0.12) (2018-09-28)

### Bug Fixes

- add missing html and body attributes from ssr apis to develop mode ([#8594](https://github.com/gatsbyjs/gatsby/issues/8594)) ([e4dcd85](https://github.com/gatsbyjs/gatsby/commit/e4dcd85))

<a name="2.0.11"></a>

## [2.0.11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.10...gatsby@2.0.11) (2018-09-27)

### Bug Fixes

- fix unhandled rejection when no browser found when running with --open flag ([#8507](https://github.com/gatsbyjs/gatsby/issues/8507)) ([f497b74](https://github.com/gatsbyjs/gatsby/commit/f497b74))

<a name="2.0.10"></a>

## [2.0.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.9...gatsby@2.0.10) (2018-09-27)

### Bug Fixes

- fix displaying and hydrating 404 page in production builds ([#8510](https://github.com/gatsbyjs/gatsby/issues/8510)) ([c42924a](https://github.com/gatsbyjs/gatsby/commit/c42924a))

### Features

- **cache-dir:** Add a button for custom 404s in development ([#8548](https://github.com/gatsbyjs/gatsby/issues/8548)) ([0658f0b](https://github.com/gatsbyjs/gatsby/commit/0658f0b)), closes [#8234](https://github.com/gatsbyjs/gatsby/issues/8234)

<a name="2.0.9"></a>

## [2.0.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.8...gatsby@2.0.9) (2018-09-26)

### Bug Fixes

- scroll behaviour when navigating back to anchor on the same page ([#8061](https://github.com/gatsbyjs/gatsby/issues/8061)) ([ef44cff](https://github.com/gatsbyjs/gatsby/commit/ef44cff))

<a name="2.0.8"></a>

## [2.0.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.7...gatsby@2.0.8) (2018-09-24)

### Bug Fixes

- check for INVALID_VALUE to avoid throwing exceptions on bad data ([#8346](https://github.com/gatsbyjs/gatsby/issues/8346)) ([bb5c0d2](https://github.com/gatsbyjs/gatsby/commit/bb5c0d2))

<a name="2.0.7"></a>

## [2.0.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.6...gatsby@2.0.7) (2018-09-21)

**Note:** Version bump only for package gatsby

<a name="2.0.6"></a>

## [2.0.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.5...gatsby@2.0.6) (2018-09-19)

**Note:** Version bump only for package gatsby

<a name="2.0.5"></a>

## [2.0.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.4...gatsby@2.0.5) (2018-09-19)

**Note:** Version bump only for package gatsby

<a name="2.0.4"></a>

## [2.0.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.3...gatsby@2.0.4) (2018-09-19)

**Note:** Version bump only for package gatsby

<a name="2.0.3"></a>

## [2.0.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.2...gatsby@2.0.3) (2018-09-18)

**Note:** Version bump only for package gatsby

<a name="2.0.2"></a>

## [2.0.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.1...gatsby@2.0.2) (2018-09-18)

### Features

- add --prefix-paths option to gatsby serve cli ([#8060](https://github.com/gatsbyjs/gatsby/issues/8060)) ([98c8e91](https://github.com/gatsbyjs/gatsby/commit/98c8e91))

<a name="2.0.1"></a>

## [2.0.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.28...gatsby@2.0.1) (2018-09-18)

**Note:** Version bump only for package gatsby

<a name="2.0.0"></a>

## [2.0.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.28...gatsby@2.0.0) (2018-09-17)

### Added

- Improve Gatsby's routing accessibility by integrating @reach/router (#6918) @KyleAMathews
- Add new onPreRenderHTML SSR API to manage head components in html.js (#6760) @octalmage
- Improve build speeds on larger sites (HulkSmash!) (#6226) @KyleAMathews
- Add multi-process HTML rendering support(#6417) @KyleAMathews
- Add babel-plugin-macros for custom babel config (#7129) @porfirioribeiro
- Upgrade webpack to v3, improve webpack utils (#3126) @jquense
- Add gatsby-remark-graphviz plugin to render dot (graphviz) code blocks to SVG (#7341) @Moocar
- Improve support for non-latin language content in gatsby-transformer-remark (#6992) @youngboy
- Improve support for Drupal relationships in gatsby-source-drupal (#5020) @pieh
- Add support for extra connection string params in gatsby-source-mongodb (#5972) @lcostea
- Add support for additional options supplied to gatsby-plugin-styled-components (#5240) @nihgwu
- Add guide on debugging the Gatsby build process (#6369) @pieh
- Add docs on unit testing, Cypress, react-testing-library and testing CSS-in-JS (#6678, #6708) @ascorbic, @LeKoArts
- Redesigned docs navigation and expanded docs topics (#6245, #6610) @shannonbux, @fk
- Allow plugins to override core prefetching behavior (#5320) @KyleAMathews
- Add gatsby-codemods package to assist v1 -> v2 transition (#6122) @jquense
- Add gatsby-plugin-layout package to allow use of v1 layout components in v2 (#7204) @pieh
- Add support for service worker caching of prefetched resources in gatsby-plugin-offline (#6566) @kkemple
- Add critical scripts and links to static file globs in service worker in gatsby-plugin-offline (#6316) @kkemple
- Add snapshot testing for gatsby-link (#7090) @alexandernanberg
- Introduce REPL command to gatsby-cli (#7262) @kkemple
- Add support for webpackPrefetch (#5901) @pistachiology
- Explicitly export graphql tag from Gatsby (#5415) @pieh
- Add eslint-loader and eslint configuration (#4893) @kkemple
- Improve loading graphql query results ("ludicrous mode!") (#4555) @m-allanson
- Improve error messaging when Gatsby is not installed (#7106) @KyleAMathews
- Improve modifyWebpackConfig error messaging (#7152) @m-allanson
- Add support for open tracing with zipkin (#6347) @Moocar
- Improve error messaging when plugin can't be loaded (#7023) @KyleAMathews
- Display formatted message for graphql resolver errors (#6142) @pieh
- Improve error formatting on HTML build errors (#6188) @pieh

### Fixed

- Fix out of memory error by saving state to after bootstrap is complete (#6636) @KyleAMathews
- Fix out of memory error by flattening entry values (#6797) @chuntley
- Fix code syntax formatting bug which highlighted keywords in plaintext (#7342) @tryzniak
- Remove dependency on react-lifecycles-compat (#7070) @alexandernanberg
- Prevent both preloading and inlining css in head (#6009) @thescientist13
- Fix service worker bug originating from inlining webpack-runtime (#5540) @KyleAMathews
- Fix bug producing duplicates when naming GraphQL queries (#6765) @fusepilot
- Fix typo in type annotation (#6288) @sudodoki
- Fix showing 404 page in development (#7140) @KyleAMathews
- Tighten externals matching to prevent code imports from causing build errors (#7325) @m-allanson

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.28"></a>

# [2.0.0-rc.28](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.27...gatsby@2.0.0-rc.28) (2018-09-17)

### Features

- add generator meta tag for gatsby version ([#8221](https://github.com/gatsbyjs/gatsby/issues/8221)) ([0de459a](https://github.com/gatsbyjs/gatsby/commit/0de459a))

<a name="2.0.0-rc.27"></a>

# [2.0.0-rc.27](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.26...gatsby@2.0.0-rc.27) (2018-09-17)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.26"></a>

# [2.0.0-rc.26](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.25...gatsby@2.0.0-rc.26) (2018-09-17)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.25"></a>

# [2.0.0-rc.25](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.24...gatsby@2.0.0-rc.25) (2018-09-14)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.24"></a>

# [2.0.0-rc.24](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.23...gatsby@2.0.0-rc.24) (2018-09-13)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.23"></a>

# [2.0.0-rc.23](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.22...gatsby@2.0.0-rc.23) (2018-09-13)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.22"></a>

# [2.0.0-rc.22](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.21...gatsby@2.0.0-rc.22) (2018-09-13)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.21"></a>

# [2.0.0-rc.21](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.20...gatsby@2.0.0-rc.21) (2018-09-12)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.20"></a>

# [2.0.0-rc.20](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.19...gatsby@2.0.0-rc.20) (2018-09-12)

### Bug Fixes

- bug where client routes are redirected to their base page path ([#8083](https://github.com/gatsbyjs/gatsby/issues/8083)) ([4cd37ea](https://github.com/gatsbyjs/gatsby/commit/4cd37ea))

<a name="2.0.0-rc.19"></a>

# [2.0.0-rc.19](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.18...gatsby@2.0.0-rc.19) (2018-09-11)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.18"></a>

# [2.0.0-rc.18](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.17...gatsby@2.0.0-rc.18) (2018-09-11)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.17"></a>

# [2.0.0-rc.17](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.16...gatsby@2.0.0-rc.17) (2018-09-11)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.16"></a>

# [2.0.0-rc.16](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.15...gatsby@2.0.0-rc.16) (2018-09-11)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.15"></a>

# [2.0.0-rc.15](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.14...gatsby@2.0.0-rc.15) (2018-09-08)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.14"></a>

# [2.0.0-rc.14](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.13...gatsby@2.0.0-rc.14) (2018-09-07)

### Bug Fixes

- ensure graphql key (starting with numeric) is valid ([#7913](https://github.com/gatsbyjs/gatsby/issues/7913)) ([dd8f79c](https://github.com/gatsbyjs/gatsby/commit/dd8f79c))
- remove some warnings on promises ([#7922](https://github.com/gatsbyjs/gatsby/issues/7922)) ([e069f27](https://github.com/gatsbyjs/gatsby/commit/e069f27))

<a name="2.0.0-rc.13"></a>

# [2.0.0-rc.13](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.12...gatsby@2.0.0-rc.13) (2018-09-05)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.12"></a>

# [2.0.0-rc.12](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.11...gatsby@2.0.0-rc.12) (2018-09-05)

### Bug Fixes

- sort data before writing into the data.json cache file ([#7878](https://github.com/gatsbyjs/gatsby/issues/7878)) ([4cfee57](https://github.com/gatsbyjs/gatsby/commit/4cfee57))

<a name="2.0.0-rc.11"></a>

# [2.0.0-rc.11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.10...gatsby@2.0.0-rc.11) (2018-09-05)

### Bug Fixes

- babel options ([#7865](https://github.com/gatsbyjs/gatsby/issues/7865)) ([9c45441](https://github.com/gatsbyjs/gatsby/commit/9c45441))

<a name="2.0.0-rc.10"></a>

# [2.0.0-rc.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.9...gatsby@2.0.0-rc.10) (2018-09-04)

### Bug Fixes

- babel default options ([300277d](https://github.com/gatsbyjs/gatsby/commit/300277d))

<a name="2.0.0-rc.9"></a>

# [2.0.0-rc.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.8...gatsby@2.0.0-rc.9) (2018-09-03)

### Bug Fixes

- setBabelOptions ([#7838](https://github.com/gatsbyjs/gatsby/issues/7838)) ([66101ca](https://github.com/gatsbyjs/gatsby/commit/66101ca))

<a name="2.0.0-rc.8"></a>

# [2.0.0-rc.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.7...gatsby@2.0.0-rc.8) (2018-09-03)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.7"></a>

# [2.0.0-rc.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.6...gatsby@2.0.0-rc.7) (2018-08-31)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.6"></a>

# [2.0.0-rc.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.5...gatsby@2.0.0-rc.6) (2018-08-31)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.5"></a>

# [2.0.0-rc.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.4...gatsby@2.0.0-rc.5) (2018-08-31)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.4"></a>

# [2.0.0-rc.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.3...gatsby@2.0.0-rc.4) (2018-08-29)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.3"></a>

# [2.0.0-rc.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.2...gatsby@2.0.0-rc.3) (2018-08-29)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.2"></a>

# [2.0.0-rc.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.1...gatsby@2.0.0-rc.2) (2018-08-29)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.1"></a>

# [2.0.0-rc.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.0...gatsby@2.0.0-rc.1) (2018-08-29)

**Note:** Version bump only for package gatsby

<a name="2.0.0-rc.0"></a>

# [2.0.0-rc.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.113...gatsby@2.0.0-rc.0) (2018-08-21)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.113"></a>

# [2.0.0-beta.113](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.112...gatsby@2.0.0-beta.113) (2018-08-21)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.112"></a>

# [2.0.0-beta.112](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.111...gatsby@2.0.0-beta.112) (2018-08-20)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.111"></a>

# [2.0.0-beta.111](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.110...gatsby@2.0.0-beta.111) (2018-08-17)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.110"></a>

# [2.0.0-beta.110](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.109...gatsby@2.0.0-beta.110) (2018-08-16)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.109"></a>

# [2.0.0-beta.109](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.108...gatsby@2.0.0-beta.109) (2018-08-16)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.108"></a>

# [2.0.0-beta.108](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.107...gatsby@2.0.0-beta.108) (2018-08-16)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.107"></a>

# [2.0.0-beta.107](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.106...gatsby@2.0.0-beta.107) (2018-08-16)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.106"></a>

# [2.0.0-beta.106](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.105...gatsby@2.0.0-beta.106) (2018-08-16)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.105"></a>

# [2.0.0-beta.105](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.104...gatsby@2.0.0-beta.105) (2018-08-15)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.104"></a>

# [2.0.0-beta.104](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.103...gatsby@2.0.0-beta.104) (2018-08-15)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.103"></a>

# [2.0.0-beta.103](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.102...gatsby@2.0.0-beta.103) (2018-08-15)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.102"></a>

# [2.0.0-beta.102](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.101...gatsby@2.0.0-beta.102) (2018-08-15)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.101"></a>

# [2.0.0-beta.101](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.100...gatsby@2.0.0-beta.101) (2018-08-15)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.100"></a>

# [2.0.0-beta.100](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.99...gatsby@2.0.0-beta.100) (2018-08-14)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.99"></a>

# [2.0.0-beta.99](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.97...gatsby@2.0.0-beta.99) (2018-08-13)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.97"></a>

# [2.0.0-beta.97](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.96...gatsby@2.0.0-beta.97) (2018-08-10)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.96"></a>

# [2.0.0-beta.96](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.95...gatsby@2.0.0-beta.96) (2018-08-10)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.95"></a>

# [2.0.0-beta.95](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.94...gatsby@2.0.0-beta.95) (2018-08-10)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.94"></a>

# [2.0.0-beta.94](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.93...gatsby@2.0.0-beta.94) (2018-08-10)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.93"></a>

# [2.0.0-beta.93](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.92...gatsby@2.0.0-beta.93) (2018-08-09)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.92"></a>

# [2.0.0-beta.92](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.91...gatsby@2.0.0-beta.92) (2018-08-09)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.91"></a>

# [2.0.0-beta.91](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.90...gatsby@2.0.0-beta.91) (2018-08-09)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.90"></a>

# [2.0.0-beta.90](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.89...gatsby@2.0.0-beta.90) (2018-08-09)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.89"></a>

# [2.0.0-beta.89](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.88...gatsby@2.0.0-beta.89) (2018-08-09)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.88"></a>

# [2.0.0-beta.88](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.87...gatsby@2.0.0-beta.88) (2018-08-09)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.87"></a>

# [2.0.0-beta.87](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.86...gatsby@2.0.0-beta.87) (2018-08-08)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.86"></a>

# [2.0.0-beta.86](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.85...gatsby@2.0.0-beta.86) (2018-08-08)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.85"></a>

# [2.0.0-beta.85](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.84...gatsby@2.0.0-beta.85) (2018-08-08)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.84"></a>

# [2.0.0-beta.84](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.83...gatsby@2.0.0-beta.84) (2018-08-08)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.83"></a>

# [2.0.0-beta.83](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.81...gatsby@2.0.0-beta.83) (2018-08-07)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.81"></a>

# [2.0.0-beta.81](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.79...gatsby@2.0.0-beta.81) (2018-08-07)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.80"></a>

# [2.0.0-beta.80](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.79...gatsby@2.0.0-beta.80) (2018-08-07)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.79"></a>

# [2.0.0-beta.79](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.77...gatsby@2.0.0-beta.79) (2018-08-07)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.77"></a>

# [2.0.0-beta.77](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.76...gatsby@2.0.0-beta.77) (2018-08-07)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.76"></a>

# [2.0.0-beta.76](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.75...gatsby@2.0.0-beta.76) (2018-08-07)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.75"></a>

# [2.0.0-beta.75](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.74...gatsby@2.0.0-beta.75) (2018-08-07)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.74"></a>

# [2.0.0-beta.74](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.73...gatsby@2.0.0-beta.74) (2018-08-07)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.73"></a>

# [2.0.0-beta.73](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.71...gatsby@2.0.0-beta.73) (2018-08-07)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.72"></a>

# [2.0.0-beta.72](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.71...gatsby@2.0.0-beta.72) (2018-08-06)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.71"></a>

# [2.0.0-beta.71](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.70...gatsby@2.0.0-beta.71) (2018-08-06)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.70"></a>

# [2.0.0-beta.70](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.69...gatsby@2.0.0-beta.70) (2018-08-06)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.69"></a>

# [2.0.0-beta.69](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.68...gatsby@2.0.0-beta.69) (2018-08-04)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.68"></a>

# [2.0.0-beta.68](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.67...gatsby@2.0.0-beta.68) (2018-08-04)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.67"></a>

# [2.0.0-beta.67](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.66...gatsby@2.0.0-beta.67) (2018-08-03)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.66"></a>

# [2.0.0-beta.66](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.65...gatsby@2.0.0-beta.66) (2018-08-02)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.65"></a>

# [2.0.0-beta.65](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.64...gatsby@2.0.0-beta.65) (2018-08-01)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.64"></a>

# [2.0.0-beta.64](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.63...gatsby@2.0.0-beta.64) (2018-07-31)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.63"></a>

# [2.0.0-beta.63](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.62...gatsby@2.0.0-beta.63) (2018-07-31)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.62"></a>

# [2.0.0-beta.62](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.61...gatsby@2.0.0-beta.62) (2018-07-31)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.61"></a>

# [2.0.0-beta.61](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.60...gatsby@2.0.0-beta.61) (2018-07-28)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.60"></a>

# [2.0.0-beta.60](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.59...gatsby@2.0.0-beta.60) (2018-07-27)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.59"></a>

# [2.0.0-beta.59](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.58...gatsby@2.0.0-beta.59) (2018-07-25)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.58"></a>

# [2.0.0-beta.58](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.57...gatsby@2.0.0-beta.58) (2018-07-25)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.57"></a>

# [2.0.0-beta.57](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.56...gatsby@2.0.0-beta.57) (2018-07-24)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.56"></a>

# [2.0.0-beta.56](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.55...gatsby@2.0.0-beta.56) (2018-07-24)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.55"></a>

# [2.0.0-beta.55](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.54...gatsby@2.0.0-beta.55) (2018-07-21)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.54"></a>

# [2.0.0-beta.54](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.53...gatsby@2.0.0-beta.54) (2018-07-20)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.53"></a>

# [2.0.0-beta.53](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.52...gatsby@2.0.0-beta.53) (2018-07-20)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.52"></a>

# [2.0.0-beta.52](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.51...gatsby@2.0.0-beta.52) (2018-07-20)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.51"></a>

# [2.0.0-beta.51](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.50...gatsby@2.0.0-beta.51) (2018-07-20)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.50"></a>

# [2.0.0-beta.50](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.49...gatsby@2.0.0-beta.50) (2018-07-20)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.49"></a>

# [2.0.0-beta.49](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.48...gatsby@2.0.0-beta.49) (2018-07-20)

### Bug Fixes

- Bumping Serve Up to 9.2.0 Broke Calls to Serve's API ([#6598](https://github.com/gatsbyjs/gatsby/issues/6598)) ([ce9c3a8](https://github.com/gatsbyjs/gatsby/commit/ce9c3a8))

<a name="2.0.0-beta.48"></a>

# [2.0.0-beta.48](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.47...gatsby@2.0.0-beta.48) (2018-07-19)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.47"></a>

# [2.0.0-beta.47](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.46...gatsby@2.0.0-beta.47) (2018-07-18)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.46"></a>

# [2.0.0-beta.46](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.45...gatsby@2.0.0-beta.46) (2018-07-18)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.45"></a>

# [2.0.0-beta.45](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.44...gatsby@2.0.0-beta.45) (2018-07-18)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.44"></a>

# [2.0.0-beta.44](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.43...gatsby@2.0.0-beta.44) (2018-07-18)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.43"></a>

# [2.0.0-beta.43](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.42...gatsby@2.0.0-beta.43) (2018-07-17)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.42"></a>

# [2.0.0-beta.42](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.41...gatsby@2.0.0-beta.42) (2018-07-17)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.41"></a>

# [2.0.0-beta.41](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.40...gatsby@2.0.0-beta.41) (2018-07-17)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.40"></a>

# [2.0.0-beta.40](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.39...gatsby@2.0.0-beta.40) (2018-07-16)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.39"></a>

# [2.0.0-beta.39](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.38...gatsby@2.0.0-beta.39) (2018-07-16)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.38"></a>

# [2.0.0-beta.38](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.37...gatsby@2.0.0-beta.38) (2018-07-15)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.37"></a>

# [2.0.0-beta.37](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.36...gatsby@2.0.0-beta.37) (2018-07-15)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.36"></a>

# [2.0.0-beta.36](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.35...gatsby@2.0.0-beta.36) (2018-07-14)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.35"></a>

# [2.0.0-beta.35](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.34...gatsby@2.0.0-beta.35) (2018-07-13)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.34"></a>

# [2.0.0-beta.34](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.33...gatsby@2.0.0-beta.34) (2018-07-13)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.33"></a>

# [2.0.0-beta.33](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.32...gatsby@2.0.0-beta.33) (2018-07-13)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.32"></a>

# [2.0.0-beta.32](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.31...gatsby@2.0.0-beta.32) (2018-07-13)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.31"></a>

# [2.0.0-beta.31](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.30...gatsby@2.0.0-beta.31) (2018-07-13)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.30"></a>

# [2.0.0-beta.30](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.29...gatsby@2.0.0-beta.30) (2018-07-13)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.29"></a>

# [2.0.0-beta.29](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.28...gatsby@2.0.0-beta.29) (2018-07-12)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.28"></a>

# [2.0.0-beta.28](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.27...gatsby@2.0.0-beta.28) (2018-07-12)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.27"></a>

# [2.0.0-beta.27](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.26...gatsby@2.0.0-beta.27) (2018-07-12)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.26"></a>

# [2.0.0-beta.26](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.25...gatsby@2.0.0-beta.26) (2018-07-12)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.25"></a>

# [2.0.0-beta.25](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.24...gatsby@2.0.0-beta.25) (2018-07-11)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.24"></a>

# [2.0.0-beta.24](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.23...gatsby@2.0.0-beta.24) (2018-07-11)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.23"></a>

# [2.0.0-beta.23](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.22...gatsby@2.0.0-beta.23) (2018-07-11)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.22"></a>

# [2.0.0-beta.22](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.21...gatsby@2.0.0-beta.22) (2018-07-11)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.21"></a>

# [2.0.0-beta.21](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.20...gatsby@2.0.0-beta.21) (2018-07-11)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.20"></a>

# [2.0.0-beta.20](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.19...gatsby@2.0.0-beta.20) (2018-07-09)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.19"></a>

# [2.0.0-beta.19](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.18...gatsby@2.0.0-beta.19) (2018-07-06)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.18"></a>

# [2.0.0-beta.18](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.17...gatsby@2.0.0-beta.18) (2018-07-06)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.17"></a>

# [2.0.0-beta.17](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.16...gatsby@2.0.0-beta.17) (2018-07-03)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.16"></a>

# [2.0.0-beta.16](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.15...gatsby@2.0.0-beta.16) (2018-07-03)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.15"></a>

# [2.0.0-beta.15](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.14...gatsby@2.0.0-beta.15) (2018-07-02)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.14"></a>

# [2.0.0-beta.14](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.13...gatsby@2.0.0-beta.14) (2018-07-02)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.13"></a>

# [2.0.0-beta.13](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.12...gatsby@2.0.0-beta.13) (2018-06-29)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.12"></a>

# [2.0.0-beta.12](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.11...gatsby@2.0.0-beta.12) (2018-06-26)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.11"></a>

# [2.0.0-beta.11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.10...gatsby@2.0.0-beta.11) (2018-06-25)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.10"></a>

# [2.0.0-beta.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.9...gatsby@2.0.0-beta.10) (2018-06-25)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.9"></a>

# [2.0.0-beta.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.8...gatsby@2.0.0-beta.9) (2018-06-21)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.8"></a>

# [2.0.0-beta.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.7...gatsby@2.0.0-beta.8) (2018-06-21)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.7"></a>

# [2.0.0-beta.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.6...gatsby@2.0.0-beta.7) (2018-06-21)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.6"></a>

# [2.0.0-beta.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.5...gatsby@2.0.0-beta.6) (2018-06-21)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.5"></a>

# [2.0.0-beta.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.4...gatsby@2.0.0-beta.5) (2018-06-21)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.4"></a>

# [2.0.0-beta.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.3...gatsby@2.0.0-beta.4) (2018-06-20)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.3"></a>

# [2.0.0-beta.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.2...gatsby@2.0.0-beta.3) (2018-06-20)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.2"></a>

# [2.0.0-beta.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.1...gatsby@2.0.0-beta.2) (2018-06-19)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.1"></a>

# [2.0.0-beta.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-beta.0...gatsby@2.0.0-beta.1) (2018-06-17)

**Note:** Version bump only for package gatsby

<a name="2.0.0-beta.0"></a>

# [2.0.0-beta.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@1.9.272...gatsby@2.0.0-beta.0) (2018-06-17)

**Note:** Version bump only for package gatsby

## [1.5.0] - 2017-07-27

### Added

- Add gatsby-source-mongodb plugin to gatsby (#1570) @jorishermans
- [www] Refactor Homepage and Navigation & convert diagram to html/css (#1605)
  @fk
- Included example with WP-API-MENUS items (#1619) @sebastienfi
- added new site to showcase (#1616) @dvzrd
- Docs: add grommet starter (#1626) @alampros
- add a bunch of tests for various plugins (#1581) @DSchau

### Fixed

- fix broken gatsby link definition for typescript 2.4.2 (#1628) @DominikGuzei
- test: fix failing test due to missing argyle image (#1636) @DSchau
- Revise part one of tutorial to use hello-world starter (#1630) @KyleAMathews
- Fix passing createNode as argument (#1629) @sebastienfi
- Don't mutate page context (#1537) @okcoker
- Updated instructions for Windows (#1621) @sebastienfi
- Tweak JSS links + add it to plugins page (#1615) @KyleAMathews

## [1.4.0] - 2017-07-25

### Added

- Add gatsby-plugin-feed to www #1569 @nicholaswyoung
- Implement gatsby-plugin-jss #1431 @wizardzloy
- gatsby-transformer-sharp: Added the option to use the original image #1556
  @chiedo

### Fixed

- [www] Blog post meta styles #1561 @fk
- Fix unsupported method in IE #1573 @variadicintegrity
- Don't set a default title in html.js as not overriden by react-helmet #1578
  @KyleAMathews
- Downgrade Glamor to v2 as v3 unstable #1580 @KyleAMathews
- Remove the slash between the pathPrefix and pathname when navigating #1574
  @DaleWebb
- Fix url in Contentful example #1596 @axe312ger
- Small fixes to tutorial #1586 @benmathews
- Add missing dep to gatsby-source-filesystem #1607 @jquense
- Wordpress -> WordPress #1608 @Alaev
- Fix typo #1609 @fk
- Update modifyWebpackConfig docs #1613 @KyleAMathews
- Fix broken links #1614 @KyleAMathews

## [1.3.0] - 2017-07-19

### Added

- docs: add "creating a static blog with gatsby" blog post #1560 @DSchau
- add tests to gatsby-remark-images #1559 @DSchau
- add glitch-gatsby-starter-blog #1554 @100ideas
- use consistent chunk ids #1534 @stevensurgnier
- Enhance API for multiple feeds #1548 @nicholaswyoung
- Add new plugin to handle csv files #1496 @ssonal
- Adds showcase segment for starters/websites built with Gatsby. #1535 @Vagr9K
- Fancy Javascript Example #1492 @jbolda
- Add sitemap plugin to www #1541 @nicholaswyoung

### Fixed

- Clone context to prevent mutations #1553 @kyleamathews
- Update dependencies to avoid hoisting errors #1552 @kyleamathews
- Set pathPrefix if not defined to an empty string to avoid undefined #1551
  @kyleamathews
- Fix prefixes in gatsby-link + navigateTo #1550 @kyleamathews
- Make path to packages the same on website as github #1549 @kyleamathews
- Fixing sw.js 404-ing because of pathPrefix not being prefixed to sw.js
  properly. Fixing #1539 #1540 @gregsqueeb
- [gatsby-plugin-sharp] Fix PNG generation when using the "duotone" option #1506
  @fk
- fix: ensure pathPrefix is added to responsive images #1510 @DSchau
- Fix the onClick override logic #1489 @jakedeichert
- Check if node.value is set as otherwise cheerio throws an error #1543
  @kyleamathews
- Fix docs referencing outdated React Router <Link> API #1523 @ahfarmer
- Fixes component-renderer to allow for use of internal routing #1542 @scottyeck
- Center .twitter-tweet-rendered #1529 @fk
- double '... use use ...' word #1528 @GoreStarry

## [1.2.0] - 2017-07-13

### Added

- Watch for changes to html.js #1473 @felixjung
- Add stylus example #1479 @iansinnott
- Added support for nested img tags in html nodes #1485 @chiedo
- Prism plugin bugfix alt #1491 @bvaughn
- Allow for env files #1462 @okcoker
- Create deploy-gatsby.md #1480 @couturecraigj

### Fixed

- Fix Contentful example URL #1483 @oscar-b
- Fix reference to program.directory #1490 @jakedeichert
- Fixes docs referencing removed "1.0" branch source code instead of master.
  #1495 @Vagr9K
- fix(gatsby-source-contentful): missing host param in createClient #1487
  @Smiter
- use program directory over cwd #1478 @craig-mulligan

## [1.1.0] - 2017-07-11

### Added

- Add gatsby-plugin-twitter for embedding Tweets #1389 @KyleAMathews
- Document promise/callback interface for async plugins #1409 @KyleAMathews
- Add an example of a config query to migration docs #1429 @benmccormick
- Adds more information to documentation pages. #1428 @Vagr9K
- Add new plugin `gatsby-plugin-emotion` #1447 @rawrmonstar
- Gatsby remark images default alt tags and optional linking #1451 @chiedo
- Add stylus support #1437 @iansinnott
- [gatsby-source-contentful] Add Support for preview api #1464 @Khaledgarbaya

### Fixed

- Update init-starter.js #1393 @kimown
- fix URL for packages, using the master branch #1399 @bmackinney
- Use latest instead of next for versions in examples #1404 @KyleAMathews
- Update www dependencies #1402 @KyleAMathews
- Fix frontpage copy issues #1401 @KyleAMathews
- Add missing return statement #1405 @ahmedlhanafy
- Fixed documentation #1406 @chiedo
- fix: Update examples directory URL due to 404 with current link #1410
  @bencodezen
- Add link to gatsby-dev-cli + we're stable + copy editing @KyleAMathews
- fix glamor + babel modification #1416 @jaredly
- Typo, grammar and standardising flags #1426 @IrregularShed
- Fix bug where the target is incorrectly set #1427 @samzhao
- Fix "gastsby" to "gatsby" on line 34 #1433 @trautlein
- Fix "Creating Pages" example's variable reference #1430 @benmccormick
- Fixes the example for navigateTo. #1440 @Vagr9K
- Properly load options for Remark #1441 @benmccormick
- Use lowercase require for "rss" #1444 @nicholaswyoung
- fix issue with ssr for redux example #1445 lemuelbarango
- Update .nvmrc, Node 8 #1446 @nicholaswyoung
- Set a key on pages so when switching between pages, the same component
  instance isn't reusued #1460 @KyleAMathews
- Removed `owner` assignation to prevent error #1454 @sebastienfi
- Update gatsby-node.js #1452 @sebastienfi
- Update README.md #1453 @sebastienfi
- Improve typescript example #1466 @fabien0102
- Remove react-helmet from src/html.js fixes #1443 #1474 @KyleAMathews
- Updates add-custom-webpack-config.md to fix broken links #1420 @marcustisater
- Fix source-wordpress npmignore #1476 @KyleAMathews

## [1.0.0] - 2017-07-06

### Added

- Adds Material Blog starter to the list of starters. #1344 @Vagr9K committed
  with KyleAMathews 4 days ago
- Continuation: WIP update home page with new design #1355 @fk
- Wordpress source plugin and example site #1321 @sebastienfi
- [v1.0] Documentation improvements. #1370 @Vagr9K
- 1.0.0 announcement blog post #1379 @KyleAMathews
- Adds gatsby-transformer-toml to the core. ##1382 @Vagr9K

### Fixed

- Update README to make it clearer about deploying to gh pages #1343 @jsfeb26
- Call next() after serving HTML #1349 @levibuzolic
- Use int for defaultValue of int field #1352 @KyleAMathews
- Make default sitemap meet expectations #1351 @chiedo
- Guard against calling ga function if it doesn't (yet) exist #1361
  @KyleAMathews
- Namespace type names for Contentful #1374 @KyleAMathews
- Add missing parens in code examples #1376 @okcoker
- Fix gatsby-transformer-react-docgen dependencies #1377 @jquense

## [1.0.0-beta.6] - 2017-07-01

### Added

- Use the sync endpoint to pull data from Contentful #1241 @Khaledgarbaya
- Use localized space #1266 @Khaledgarbaya
- gatsby-transformer-javascript-static-exports #1253 @jbolda
- Added support for HTML img tags #1285 @chiedo
- [gatsby-source-contentful] support creating localized nodes #1279
  @kyleamathews
- Link pages to their plugin creators for easier understanding/debugging fixes
  #1281 #1297 @kyleamathews
- Support NavLink in gatsby-link #1302 @abi
- Add an example for using the sass plugin #1312 @danielfarrell
- Add CSS Modules example site #1314 @kyleamathews
- Add Typescript example #1319 @kyleamathews
- Support using browserslist for setting per-site browser targeting for JS/CSS
  transformations #1336 @kyleamathews
- Add gatsby-plugin-canonical-url #1337 @kyleamathews
- [source-contentful] Allow for querying gifs & when user queries for image
  height, actually crop #1339 @kyleamathews

### Changed

- Replace build-images with just images @kyleamathews
- Make mediaType optional #1299 @kyleamathews
- Just use name/value for createNodeField #1325 @kyleamathews
- Renamed remark-responsive-image-plugin to gatsby-remark-images @chiedo
- Write images processed by sharp to public/static along with other assets #1332
  @kyleamathews

### Fixed

- using-remark fixes #1250 @fk
- Broken example commands in DOCS / Getting Started page #1252 @sebastienfi
- Don't catch links to files #1260 @kyleamathews
- Improve develop-html stage #1254 @craig-mulligan
- Make various tweaks to the tutorial #1262 @kyleamathews
- Add tests for parsing regex args + fix bug #1267 @kyleamathews
- Fixes for feed plugin README #1273 @kyleamathews
- [gatsby-source-contentful] Add testing for existing API processing #1274
  @kyleamathews
- Throw error and quit if there's a JS parse error for gatsby-config.js #1296
  @kyleamathews
- Add missing npmignore files #1298 @kyleamathews
- Move creating 404.html page into plugin so can enforce pages only created by
  plugins #1300 @kyleamathews
- Fix occasionally out-of-order query watching which would throw errors #1301
  @kyleamathews
- Waiting for query extraction wasn't actually waiting #1303 @kyleamathews
- Improved plugin error without exit #1309 @0x80
- Fixed a small typo in gatsby-plugin-postcss-sass that prevented CSS modules
  from working #1307 @levibuzolic
- Don't use the sass loader on build-javascript #1278 @danielfarrell
- Fixes 1317 Google Analytics plugin; updates attachHistory listener logic #1318
  @camsjams
- Call onRouteUpdate on initial page load #1320 @kyleamathews
- Fix check if there's a sw plugin added #1323 @kyleamathews
- Only build 1 html page in development and always serve it #1324 @kyleamathews
- Fix server/client rendering mismatch #1326 @kyleamathews
- update gatsby-remark-responsive-iframe readme #1328 @eddywashere
- Use memory lowdb as it is significantly faster. Also snuck in yurnalist for
  better console output #1329 @kyleamathews
- Quit on ctrl-c #1334 @kyleamathews
- Set keys on head/body components #1335 @kyleamathews

## [1.0.0-beta.4] - 2017-06-23

### Added

- Add using-remark example site #1230 @fk
- Add friendly webpack ouput #1240 @craig-mulligan
- Add documentation on how to use custom webpack-config #1242 @bananenmannfrau
- Add graphql fields for creating responsive images using Contentful image API
  #1228 @kyleamathews

### Changed

- Refactor Contentful data processing into own module + use more standard
  GraphQL type names @kyleamathews
- Prefer floats over integers when inferring a GraphQL field #1229 @kyleamathews

### Fixed

- Fix babel compilation so targets uglify #1244 @kyleamathews
- Open external image link with rel='noopener' #1227 @wangsongiam
- Update index.d.ts for gatsby-link #1232 @timsuchanek

## [1.0.0-beta.3] - 2017-06-21

### Added

- Show better errors when there's a graphql compilation problem #1222
  @kyleamathews
- Add google tagmanager plugin #1123 @0x80
- Support path prefixes for service workers @kyleamathews
- When a new service worker is loaded, force reload #1217 @kyleamathews
- www: Make the header fixed for tablets and up #1215 @fk
- Update on Gatsby Windows instructions #1216 @sebastienfi
- Improve GQL query error handling #1214 @0x80
- An array of linked nodes linking to heterogeneous node types is now converted
  to a union type #1211 @kyleamathews

### Fixed

- Final fixes to highlight code line whitespace, doc #1207 @fk
- Increase contentful fetch limit to max of 1000 #1209 @kyleamathews
- Fix broken links on website #1205 @kyleamathews
- Merge sidebar components #1191 @fk
- absolute resolves for gatsby config files #1195 @craig-mulligan
- Update the default sitemap query #1204 @nicholaswyoung
- For Contentful, filter out unresolvable entries and create markdown text nodes
  #1202 @kyleamathews
- Reduce font-size of the mobile menu labels #1201 @fk
- gatsby-remark-responsive-image: fix misaligned images #1196 @rstacruz
- Fix 100% width code highlight background only being drawn for the vis… #1192
  @fk

## [1.0.0-beta.2] - 2017-06-16

### Added

- Add beta 1 blog post #1183 @kyleamathews

### Fixed

- Fix prism line highlighting #1187 @kyleamathews
- Add .npmignore to source-drupal plugin so it'll publish @kyleamathews
- Fix building thumbnails when an image is processed multiple times #1185
  @kyleamathews
- Add event when all plugins are finished running so know when to start running
  queries #1182 @kyleamathews | Fix a typo on gatby-link updating #1181
  @danielfarrell

## [1.0.0-beta.1] - 2017-06-15

Our first beta!!! 🎉

### Added

- Allow for gatsby-remark-smartypants options #1166 @mitchejj
- New design (for gatsbyjs.org) + new home page #1170 @kyleamathews
- Add ability to locally define plugins #1126 @0x80
- Add rough draft for docs for creating source plugins #1159 @kyleamathews
- Optimizations around prefetching page resources #1133 @kyleamathews
- Redux example site #1081 @scottyeck
- Sitemap Generator Plugin #1115 @nicholaswyoung
- Add documentation to gatsby-remark-prism @kyleamathews

### Changed

- Move all filter operators for connections under a top-level "filter" field
  #1177 @kyleamathews
- Change `linkPrefix` to `pathPrefix` and add an example site #1155
  @kyleamathews
- Make the plugin options for remark plugins the second argument (like
  everywhere else) #1167 @kyleamathews
- Start using next instead of canary in example sites for package versions
  @kyleamathews

### Fixed

- Fix graphql compiler on typescript #949 @fabien0102
- Replace react.createClass with ES6 classes in examples html.js, add PropTypes
  #1169 @abachuk
- Fix windows build issue #1158 @kyleamathews
- Use custom delimiter when flattening example values for enum fields so easy to
  convert back @kyleamathews
- gatsby-remark-responsive-images: use span instead of div #1151 @rstacruz
- Add check that we can actually find a linked image file node @kyleamathews
- Ignore SVGs in gatsby-remark-responsive-image #1157 @fk
- Replace using levelup for caching with lowdb to avoid native dependency #1142
  @kyleamathews
- Fix Appveyor bug regarding build all examples on release #1118 @jbolda

## [1.0.0-alpha20] - 2017-06-05

### Added

- RSS Feed plugin #1073 @nicholaswyoung
- Contentful source plugin #1084 @mericsson
- MVP part 1 of new community Gatsby tutorial #1107 @kyleamathews
- Debuggin help when building HTML fails #1109 @kyleamathews
- Default `html.js` component #1107 @kyleamathews
- Can now highlight specific line numbers in markdown code blocks #1107
  @kyleamathews

## Changed

- `gatsby-config.js` is no longer required #1107 @kyleamathews
- The Gatsby `serve-build` command is now just `serve` #1107 @kyleamathews

## Fixed

- Windows builds on Appveyor #1049 @jbolda

## [1.0.0-alpha19] - 2017-06-02

(Skipping over the previous two releases as they had bugs).

### Added

- Add a helpful 404 page during development that lists the page you might have
  wanted @kyleamathews to link to or how to create a new page at that link #1051
  @kyleamathews
- Add "Plop" script for quickly creating new packages #1059 @kyleamathews
- Add new plugin supporting server rendering of Styled Components #1060 @gutenye
- Add new plugin supporting server rendering of react-helmet #1085 @kyleamathews
- Add new plugin for extracting JSDocs information from JavaScript files using
  documentation.js #1053 @kyleamathews
- Add new API spec (rough draft) @kyleamathews
  https://www.gatsbyjs.org/docs/api-specification/
- Add new API reference pages @kyleamathews e.g.
  https://www.gatsbyjs.org/docs/node-apis/
- Add "duotone" image processing option to gatsby-plugin-sharp #1047 @fk
- Add example site for image processing @fk
  https://image-processing.gatsbyjs.org/
- Add example site for css-in-js library Glamor @kyleamathews
  https://using-glamor.gatsbyjs.org/
- Add example site for css-in-js library Styled Components @kyleamathews
  https://using-styled-components.gatsbyjs.org/

### Changed

#### Grand big API renaming based on our new API spec https://www.gatsbyjs.org/docs/api-specification/

API changes:

[Action creators](https://www.gatsbyjs.org/docs/bound-action-creators/):

- `upsertPage` is now `createPage`
- `addFieldToNode` is now `createNodeField`
- `deletePageByPath` is now `deletePage`
- `addNodeToParent` is now `createParentChildLink`

[gatsby-browser.js APIs](https://www.gatsbyjs.org/docs/browser-apis/):

- `clientEntry` is now `onClientEntry`

[gatsby-node.js APIs](https://www.gatsbyjs.org/docs/node-apis/):

- `onNodeCreate` is now `onCreateNode`
- `onUpsertPage` is now `onCreatePage`
- `extendNodeType` is now `setFieldsOnGraphQLNodeType`

[gatsby-ssr.js APIs](https://www.gatsbyjs.org/docs/ssr-apis/):

- `modifyHeadComponents` and `modifyPostBodyComponents` were removed in favor of
  a new API
  [`onRenderBody`](https://www.gatsbyjs.org/docs/ssr-apis/#onRenderBody).
- `replaceServerBodyRender` is now `replaceRenderer`

### Fixed

- Fix sharp image quality and force file format #1054 @0x80
- Expose crop focus parameter and make consistent with base64 #1055 @0x80
- Clean up TravisCI config #1066 @hawkrives
- Fix inference bug #1087 @jquense
- Provide default context for GraphQL #1052 @kyleamathews
- Make determining when a given stage is finished much more reliable #1080
  @kyleamathews
- Pick values off plugin's package.json to avoid weird metadata from NPM #1090
  @kyleamathews

### New 1.0 sites launched

- https://www.vauxlab.com
- https://meetfabric.com

## [1.0.0-alpha16] - 2017-05-26

### Added

- Migration guide @kyleamathews #1032
- Made nodes fully immutable @kyleamathews #1035
- Add no-plugins example @scottyeck #1028
- Add support for "internal" plugins #1010
- Expose internal Gatsby data through GraphQL @kyleamathews #1014

### Changed

- Removed `updateNode` action creator as part of making nodes immutable in
  #1035. Now sites/plugins should use `addFieldToNode` for adding fields to
  nodes created by other plugins and `addNodeToParent` for adding a new node as
  a child to an existing node.

### Fixed

- Don't override the default onClick handler in gatsby-link @scottyeck #1019

## [1.0.0-alpha15] - 2017-05-15

### Added

- Update version of React Router to v4 #940
- API proxy for use during development #957
- "static" directory for files to be copied directly into the "public" directory
  #956
- Add `toFormat` argument to the ImageSharp GraphQL type so can change format of
  image e.g. from `png` to `jpg`.
- React Docgen transformer plugin for parsing propType info from React
  components #928

### Changed

- Change node format to hide most node-specific fields under an "internal" key.
  Any code referencing `node.type` and others will need changed to
  `node.internal.type` #960
- Changed the id for the root `<div>` used by Gatsby to mount React to
  `___gatsby`
- The default layout component should be at `layouts/index.js` not
  `layouts/default.js`
  https://github.com/gatsbyjs/gatsby/pull/940#issuecomment-300537162
- `this.props.children` in layout components is now a function
  https://github.com/gatsbyjs/gatsby/pull/940#issuecomment-300878300
- Change the default port for serve-build to 9000
- Change the path to GraphiQL to `/___graphql`

### Chore

- Upgrade Jest to v20 #935

## [1.0.0-alpha14] - 2017-05-05

### Added

- Use the Relay Modern compiler for extracting GraphQL queries from components.
  This allows us to now support components being added to _all_ components. This
  means you can now write queries next to the views that use them. #912
- Hook for modifying pages #863
- New Drupal source plugin and example site #890
- Detect if a site's plugins have changed and when they do, delete the site
  cache as it might now be invalid #927
- New way to make connections between nodes e.g. article --> author #902

### Changed

- Combine transformer and typegen plugins. The distinction between the two types
  of plugins has proved somewhat artificial so they were combined. Any typegen
  plugins in your `package.json` and `gatsby-config.js` need to be removed. #918
- Gatsby now garbage collects old nodes. Source plugins should now "touch"
- nodes that haven't changed #861
- Due to adopting the Relay compiler, GraphQL query template strings need named
  "graphql" plus must be named. So if previously you wrote:

```js
export const pageQuery = `
{
  allMarkdownMark {
    edges {
      node {
        id
      }
    }
  }
}
`
```

You must now write:

```js
export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownMark {
      edges {
        node {
          id
        }
      }
    }
  }
`
```

## [1.0.0-alpha10] - 2016-11-17

### Added

- Did the intitial build of the new gatsbyjs.org! It's in the `www` subdirectory
  on the 1.0 branch and is built on each push! That's my kind of integration
  testing :-) You can see the early version of the site at
  https://gatsbyjs.netlify.com/. PRs welcome!
- Added <link preload> for page scripts. This speeds up loading scripts slightly
  by telling the browser to start downloading the scripts when the HTML first
  starts being parsed instead of when the browser reaches the end. This is
  especially helpful for large HTML documents on slow mobile networks.
  [PR](https://github.com/gatsbyjs/gatsby/pull/558)

## Changed

- Use namedmodulesplugin instead of recordsPath for ensuring deterministic
  builds and long-term cachability. The
  [previous PR adding support for recordsPath](https://github.com/gatsbyjs/gatsby/pull/533)
  proved unpleasant as you had to build locally and commit the outputted
  records.json which was confusing and annoying.
  [PR](https://github.com/gatsbyjs/gatsby/pull/559)

## [1.0.0-alpha9] - 2016-11-04

### Added

- Put the routes module on `window` to support experimental idea. See this issue
  for more](https://github.com/gatsbyjs/gatsby/issues/537).
  [commit](https://github.com/gatsbyjs/gatsby/commit/28e84f3aed480d1f5a8f9859172d1c6f531696d4)

### Changed

- Removed the package `sharp` as it's not used and is preventing Gatsby 1.0 from
  being installed on Windows.
  [commit](https://github.com/gatsbyjs/gatsby/commit/34fff74e6fb3cae88010b42f74d784382ead4031)

## [1.0.0-alpha8] - 2016-11-01

### Added

- Extension API `swOnUpdated` for when a service worker finishes updating. Use
  this to alert users of your app to reload to see the latest version.
  [commit](https://github.com/gatsbyjs/gatsby/commit/5173bdc5424e7c874b3f2abfad706cea2e38ebc3)

### Fixed

- hot reloading now fully works. Apparently you can't use function components
  for top-level routes on react-router with react-hot-loader 3.0 `¯\_( ツ )_/¯`
  [#532](https://github.com/gatsbyjs/gatsby/pull/532) and
  [commit](https://github.com/gatsbyjs/gatsby/commit/36f2c169586ea30518639d7b1493e08e05befb73)
- Webpack needs the help of an obscure setting `recordsPath` to preserve module
  ids across builds. Big thanks to @NekR for pointing this out to me. Previous
  to this change, loading changed JS chunks could cause a JS error as the module
  ids the new chunk expects wouldn't match the module ids from the older chunks.
  [#533](https://github.com/gatsbyjs/gatsby/pull/533)

### Changed

- Disabled hard-source-webpack-plugin. It speeds up builds significantly but has
  been causing hard-to-debug errors while developing. We'll circle back to it
  down the road.
  [commit](https://github.com/gatsbyjs/gatsby/commit/4bc9660ac8c371d23c0295cde52002775eee5aa1)
- Restored using ChunkManifestPlugin. It was disabled while trying to debug the
  mismatched module id bug but that being fixed, we're using it again.
  [commit](https://github.com/gatsbyjs/gatsby/commit/8d16905f31b80ca56db225904d60ed78c6091ca9)
- Name modules ids in development for easier debugging. Primary benefit is you
  can see which modules are getting hot reloaded.
  [commit](https://github.com/gatsbyjs/gatsby/commit/93f6bd2c4206e71623c1a7fa007322f8dc9887be)

## [1.0.0-alpha7] - 2016-10-27

### Fixed

- Removed entries from the webpack config looking for
  `node_modules/gatsby/node_modules`. This was added to help when developing
  Gatsby using `npm link` but when Gatsby is installed regularly, it then fails
  the Webpack validation as `node_modules/gatsby/node_modules` doesn't now
  exist.

## [1.0.0-alpha6] - 2016-10-27

### Added

- extension API for adding types to the GraphQL schema
  [commit](https://github.com/gatsbyjs/gatsby/commit/18b8b64ed4cbe3399fb262395c0c6e6a5a16099a)

### Fixed

- Use babel-traverse instead of using babel-plugin so that don't say done early
  when running graphql queries that have async resolvers
  [commit](https://github.com/gatsbyjs/gatsby/commit/a19677e38d1ce8ba4fb39ddff75482904f168db6)

## [1.0.0-alpha5] - 2016-10-14

### Added

- hard-source-webpack-plugin
  [commit](https://github.com/gatsbyjs/gatsby/commit/2c48e5c42887fecabc01c5f5b6f3dd8e06d3372f)
- New replacement API to wrap root component (useful for Redux, et al.)
  [commit](https://github.com/gatsbyjs/gatsby/commit/ebd57d2bd6c39b51a455b76018737e2957e146ef)
- yarn.lock
  [commit](https://github.com/gatsbyjs/gatsby/commit/5ce3321b84e912925c4705ececef6f2c817b0684)

### Changed

- Disable extracting the Webpack chunk manifest until understand why this breaks
  updates when using Service Workers
  [commit](https://github.com/gatsbyjs/gatsby/commit/07ed5b010ad27b1816084b361f06fd0ae6a017ba)

## [1.0.0-alpha4] - 2016-10-07

### Added

- Add more file extensions to file/url loader config. Default to url loader
  unless it never makes sense to use data-uri e.g. favicons.
- Use api-runner-browser for calling browser extension APIs/replacements. Prep
  for plugin system.
- Add extension API `clientEntry` that let's site code and plugins to run code
  at the very start of client app.

### Changed

- Add config to uglify to ignore ie8.
- Disable building AppCache until can research if useful.
- Turn on screw_ie8 options in UglifyJS.

### Fixed

- Actually use the "sources" key from gatsby-config.js for looking for markdown
  files. This will be getting an overhaul soon.
- Don't use null-loader for css during the build-js stage as this prevents
  offline-plugin from caching files referenced in your CSS.
- Add missing publicPath for build-html step.

## [1.0.0-alpha3] - 2016-10-05

### Added

- Introduce way to programmatically add components to `<head>` + API to take
  over SSR rendering
  [a39c2a5](https://github.com/gatsbyjs/gatsby/commit/a39c2a5)
- Extract webpack manifest from commons.js so it doesn't change on every build
  improving its cachability
  [0941d33](https://github.com/gatsbyjs/gatsby/commit/0941d33)
- Always add babel-plugin-add-module-exports
  [97f083d](https://github.com/gatsbyjs/gatsby/commit/97f083d)

### Changed

- Upgraded React Hot Loader to 3.0-beta5
  [5185c3a](https://github.com/gatsbyjs/gatsby/commit/5185c3a)

### Fixed

- Ensure bundle names for components and paths are unique
  [342030d](https://github.com/gatsbyjs/gatsby/commit/342030d)
  [a1dfe19](https://github.com/gatsbyjs/gatsby/commit/a1dfe19)
- Remove old code loading config.toml
  [66f901](https://github.com/gatsbyjs/gatsby/commit/66f901)

## [1.0.0-alpha2] - 2016-09-21

### Added

- New system for specifying page layouts inspired by Jekyll.
- `<HTMLScripts />` and `<HTMLStyles />` helper components for rendering correct
  scripts and styles in your html.js,
- Validate at runtime gatsby-config.js and page objects.
- Start of new plugin system.
- New extension API: `onPostCreatePages` — called with pages after all pages are
  created. Useful for programmatically modifying pages created in plugins.

### Changed

- Removed remaining 0.x code
- Exit if can't find local install of Gatsby.
  [030f655](https://github.com/gatsbyjs/gatsby/commit/030f655075be5ad91af1dc12a05e6bd153a861df)
- Fix folder hierarchy for looking for loaders and modules #435
- Changed default `Config` GraphQL type to `Site` and added some Jekyll-inspired
  fields.

## [1.0.0-alpha1] - 2016-09-02

### Added

- Initial versions of new GraphQL data layer, PRPL pattern, programmatic routes,
  code splitting, supporting long-term caching of JS files.
