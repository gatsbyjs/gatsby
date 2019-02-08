# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

# [2.0.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.0-rc.28...gatsby@2.0.0) (2018-09-17)

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
