# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.23.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.23.9...gatsby@2.23.10) (2020-06-23)

### Bug Fixes

- **gatsby:** Typo in the code example of the PageProps inline docs ([#25200](https://github.com/gatsbyjs/gatsby/issues/25200)) ([a72caa6](https://github.com/gatsbyjs/gatsby/commit/a72caa6))

## [2.23.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.23.8...gatsby@2.23.9) (2020-06-22)

**Note:** Version bump only for package gatsby

## [2.23.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.23.7...gatsby@2.23.8) (2020-06-22)

### Bug Fixes

- **gatsby:** convert module.exports to es6 in redux/filters ([#25191](https://github.com/gatsbyjs/gatsby/issues/25191)) ([3934c37](https://github.com/gatsbyjs/gatsby/commit/3934c37))
- **gatsby:** show error message instead of [Object object](<[#25182](https://github.com/gatsbyjs/gatsby/issues/25182)>) ([445e315](https://github.com/gatsbyjs/gatsby/commit/445e315))

## [2.23.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.23.6...gatsby@2.23.7) (2020-06-20)

### Bug Fixes

- **bin:** point bin to always existing files ([#25121](https://github.com/gatsbyjs/gatsby/issues/25121)) ([eba033e](https://github.com/gatsbyjs/gatsby/commit/eba033e))
- **gatsby:** remove page-date from jest-worker ([#25135](https://github.com/gatsbyjs/gatsby/issues/25135)) ([bed5dc4](https://github.com/gatsbyjs/gatsby/commit/bed5dc4))

## [2.23.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.23.5...gatsby@2.23.6) (2020-06-19)

**Note:** Version bump only for package gatsby

## [2.23.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.23.4...gatsby@2.23.5) (2020-06-19)

### Bug Fixes

- **gatsby:** allow amending autoprefixer options ([#24907](https://github.com/gatsbyjs/gatsby/issues/24907)) ([8e6e021](https://github.com/gatsbyjs/gatsby/commit/8e6e021))

### Features

- **gatsby:** allow serving of dotfiles from public folder ([#24958](https://github.com/gatsbyjs/gatsby/issues/24958)) ([2270c5a](https://github.com/gatsbyjs/gatsby/commit/2270c5a))
- **gatsby:** Instrument partial writes to page data ([#24808](https://github.com/gatsbyjs/gatsby/issues/24808)) ([b2bf298](https://github.com/gatsbyjs/gatsby/commit/b2bf298))

### Performance Improvements

- **gatsby:** Lazily re-create GraphQL runner ([#25063](https://github.com/gatsbyjs/gatsby/issues/25063)) ([0407cc6](https://github.com/gatsbyjs/gatsby/commit/0407cc6))

## [2.23.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.23.3...gatsby@2.23.4) (2020-06-15)

### Bug Fixes

- **gatsby:** Add null context check ([#24904](https://github.com/gatsbyjs/gatsby/issues/24904)) ([b554bd5](https://github.com/gatsbyjs/gatsby/commit/b554bd5))

## [2.23.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.23.2...gatsby@2.23.3) (2020-06-09)

**Note:** Version bump only for package gatsby

## [2.23.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.23.1...gatsby@2.23.2) (2020-06-09)

### Bug Fixes

- **babel-plugin-remove-graphql-queries:** Strip ignored characters from query text for better caching and deduping ([#24807](https://github.com/gatsbyjs/gatsby/issues/24807)) ([752f5ff](https://github.com/gatsbyjs/gatsby/commit/752f5ff))
- **gatsby:** Fix issue where inline static query in page gets added to page data ([#24805](https://github.com/gatsbyjs/gatsby/issues/24805)) ([7c9711b](https://github.com/gatsbyjs/gatsby/commit/7c9711b))

## [2.23.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.23.0...gatsby@2.23.1) (2020-06-05)

**Note:** Version bump only for package gatsby

# [2.23.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.22...gatsby@2.23.0) (2020-06-04)

### Performance Improvements

- **gatsby:** stop using Sift as fallback ([#24743](https://github.com/gatsbyjs/gatsby/issues/24743)) ([6ee4a35](https://github.com/gatsbyjs/gatsby/commit/6ee4a35))

## [2.22.22](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.21...gatsby@2.22.22) (2020-06-04)

### Bug Fixes

- **gatsby:** add connection data dependency on concrete types when abstract type is queried ([#24754](https://github.com/gatsbyjs/gatsby/issues/24754)) ([54d0cf9](https://github.com/gatsbyjs/gatsby/commit/54d0cf9))

## [2.22.21](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.20...gatsby@2.22.21) (2020-06-04)

**Note:** Version bump only for package gatsby

## [2.22.20](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.19...gatsby@2.22.20) (2020-06-03)

### Bug Fixes

- **gatsby:** bind develop-proxy server to host specified by user ([#24761](https://github.com/gatsbyjs/gatsby/issues/24761)) ([8750898](https://github.com/gatsbyjs/gatsby/commit/8750898))

## [2.22.19](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.18...gatsby@2.22.19) (2020-06-03)

### Bug Fixes

- **gatsby:** Fix develop SSL by moving the SSL setup to the proxy ([#24335](https://github.com/gatsbyjs/gatsby/issues/24335)) ([7180b26](https://github.com/gatsbyjs/gatsby/commit/7180b26))

## [2.22.18](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.17...gatsby@2.22.18) (2020-06-03)

### Performance Improvements

- **gatsby:** be more conservative in when to sort ([#24609](https://github.com/gatsbyjs/gatsby/issues/24609)) ([2b578e8](https://github.com/gatsbyjs/gatsby/commit/2b578e8))
- **gatsby:** drop severe scaling regression caused by analytics ([#24709](https://github.com/gatsbyjs/gatsby/issues/24709)) ([2528a85](https://github.com/gatsbyjs/gatsby/commit/2528a85))

## [2.22.17](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.16...gatsby@2.22.17) (2020-06-02)

### Bug Fixes

- **data-dependency-tracking:** clear data dependencies when rerunning dirty queries ([#24378](https://github.com/gatsbyjs/gatsby/issues/24378)) ([a56012c](https://github.com/gatsbyjs/gatsby/commit/a56012c))

### Features

- **gatsby:** Add support for relative links ([#24054](https://github.com/gatsbyjs/gatsby/issues/24054)) ([e2c6cf2](https://github.com/gatsbyjs/gatsby/commit/e2c6cf2))

## [2.22.16](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.15...gatsby@2.22.16) (2020-06-02)

**Note:** Version bump only for package gatsby

## [2.22.15](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.14...gatsby@2.22.15) (2020-05-31)

**Note:** Version bump only for package gatsby

## [2.22.14](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.13...gatsby@2.22.14) (2020-05-31)

**Note:** Version bump only for package gatsby

## [2.22.13](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.12...gatsby@2.22.13) (2020-05-30)

### Bug Fixes

- **gatsby:** show correct `serve` info when running on another port ([#24591](https://github.com/gatsbyjs/gatsby/issues/24591)) ([3717ad6](https://github.com/gatsbyjs/gatsby/commit/3717ad6))
- **gatsby:** Turn off react/jsx-pascal-case in ESLint to fix Theme-UI warnings ([#24560](https://github.com/gatsbyjs/gatsby/issues/24560)) ([ee00a6f](https://github.com/gatsbyjs/gatsby/commit/ee00a6f))

### Features

- **gatsby:** serve Admin from develop parent process ([#23734](https://github.com/gatsbyjs/gatsby/issues/23734)) ([a6eb21b](https://github.com/gatsbyjs/gatsby/commit/a6eb21b))

## [2.22.12](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.11...gatsby@2.22.12) (2020-05-28)

### Bug Fixes

- **code:** redux types - sireUrl -> siteUrl ([#24488](https://github.com/gatsbyjs/gatsby/issues/24488)) ([2beab4b](https://github.com/gatsbyjs/gatsby/commit/2beab4b))

### Performance Improvements

- **gatsby:** stop using sets and use ordered arrays instead ([#24486](https://github.com/gatsbyjs/gatsby/issues/24486)) ([928fd05](https://github.com/gatsbyjs/gatsby/commit/928fd05))

## [2.22.11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.10...gatsby@2.22.11) (2020-05-26)

### Bug Fixes

- **gatsby:** add explicit dependency on `socket.io-client` and explicitly set `url-loader` fallback ([#24465](https://github.com/gatsbyjs/gatsby/issues/24465)) ([36357ab](https://github.com/gatsbyjs/gatsby/commit/36357ab))
- **gatsby:** Also traverse `FunctionDeclaration` ([#24472](https://github.com/gatsbyjs/gatsby/issues/24472)) ([6eb7290](https://github.com/gatsbyjs/gatsby/commit/6eb7290))

## [2.22.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.9...gatsby@2.22.10) (2020-05-25)

### Bug Fixes

- **docs:** brand name Webpack to webpack ([#22906](https://github.com/gatsbyjs/gatsby/issues/22906)) ([44cbb14](https://github.com/gatsbyjs/gatsby/commit/44cbb14))
- **gatsby:** Pass through ws in proxy ([#24352](https://github.com/gatsbyjs/gatsby/issues/24352)) ([5389bfd](https://github.com/gatsbyjs/gatsby/commit/5389bfd))

## [2.22.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.8...gatsby@2.22.9) (2020-05-22)

### Performance Improvements

- **gatsby:** support empty filters without sift ([#24258](https://github.com/gatsbyjs/gatsby/issues/24258)) ([542cda8](https://github.com/gatsbyjs/gatsby/commit/542cda8))

## [2.22.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.7...gatsby@2.22.8) (2020-05-22)

**Note:** Version bump only for package gatsby

## [2.22.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.6...gatsby@2.22.7) (2020-05-22)

**Note:** Version bump only for package gatsby

## [2.22.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.5...gatsby@2.22.6) (2020-05-21)

**Note:** Version bump only for package gatsby

## [2.22.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.4...gatsby@2.22.5) (2020-05-21)

### Bug Fixes

- **gatsby:** add control-has-associated-label rule into eslint-config ([#24311](https://github.com/gatsbyjs/gatsby/issues/24311)) ([c1ae8f2](https://github.com/gatsbyjs/gatsby/commit/c1ae8f2))
- **gatsby:** adjust `create-react-context` alias to match actual package exports ([#24305](https://github.com/gatsbyjs/gatsby/issues/24305)) ([cb5d055](https://github.com/gatsbyjs/gatsby/commit/cb5d055))

## [2.22.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.3...gatsby@2.22.4) (2020-05-20)

**Note:** Version bump only for package gatsby

## [2.22.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.2...gatsby@2.22.3) (2020-05-20)

**Note:** Version bump only for package gatsby

## [2.22.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.1...gatsby@2.22.2) (2020-05-20)

### Bug Fixes

- **gatsby-core-utils:** create lock per service, rather than per site ([#24252](https://github.com/gatsbyjs/gatsby/issues/24252)) ([718deb3](https://github.com/gatsbyjs/gatsby/commit/718deb3))

## [2.22.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.22.0...gatsby@2.22.1) (2020-05-20)

**Note:** Version bump only for package gatsby

# [2.22.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.40...gatsby@2.22.0) (2020-05-19)

### Features

- **gatsby:** Prompt users to restart process on gatsby-config & gatsby-node changes ([#22759](https://github.com/gatsbyjs/gatsby/issues/22759)) ([d4ec5e5](https://github.com/gatsbyjs/gatsby/commit/d4ec5e5))

## [2.21.40](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.39...gatsby@2.21.40) (2020-05-19)

**Note:** Version bump only for package gatsby

## [2.21.39](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.38...gatsby@2.21.39) (2020-05-19)

### Performance Improvements

- **gatsby:** Enable fast filters for $regex/$glob ([#24188](https://github.com/gatsbyjs/gatsby/issues/24188)) ([acfc455](https://github.com/gatsbyjs/gatsby/commit/acfc455))

## [2.21.38](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.37...gatsby@2.21.38) (2020-05-19)

**Note:** Version bump only for package gatsby

## [2.21.37](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.36...gatsby@2.21.37) (2020-05-18)

**Note:** Version bump only for package gatsby

## [2.21.36](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.35...gatsby@2.21.36) (2020-05-18)

**Note:** Version bump only for package gatsby

## [2.21.35](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.34...gatsby@2.21.35) (2020-05-18)

### Performance Improvements

- **gatsby:** Enable fast filters for \$nin comparator ([#24184](https://github.com/gatsbyjs/gatsby/issues/24184)) ([8e3428f](https://github.com/gatsbyjs/gatsby/commit/8e3428f))

## [2.21.34](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.33...gatsby@2.21.34) (2020-05-18)

### Features

- **gatsby:** Warn when pageContext is over 500k ([#23310](https://github.com/gatsbyjs/gatsby/issues/23310)) ([02bdba9](https://github.com/gatsbyjs/gatsby/commit/02bdba9))

## [2.21.33](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.32...gatsby@2.21.33) (2020-05-15)

### Performance Improvements

- **gatsby:** enable fast filters for `in` comparator ([#24095](https://github.com/gatsbyjs/gatsby/issues/24095)) ([70a7533](https://github.com/gatsbyjs/gatsby/commit/70a7533))

## [2.21.32](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.31...gatsby@2.21.32) (2020-05-15)

### Bug Fixes

- **gatsby:** Protect about possibly missing context in graphql ([#24108](https://github.com/gatsbyjs/gatsby/issues/24108)) ([9ad511b](https://github.com/gatsbyjs/gatsby/commit/9ad511b))

### Features

- **gatsby:** Add total count to pageInfo ([#24084](https://github.com/gatsbyjs/gatsby/issues/24084)) ([1e3b775](https://github.com/gatsbyjs/gatsby/commit/1e3b775))

## [2.21.31](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.30...gatsby@2.21.31) (2020-05-14)

### Bug Fixes

- **gatsby:** Update to handle changes to fast refresh webpack plugin ([#24091](https://github.com/gatsbyjs/gatsby/issues/24091)) ([7adad91](https://github.com/gatsbyjs/gatsby/commit/7adad91))

## [2.21.30](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.29...gatsby@2.21.30) (2020-05-14)

**Note:** Version bump only for package gatsby

## [2.21.29](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.28...gatsby@2.21.29) (2020-05-13)

### Bug Fixes

- **gatsby:** don't fail validation on fragments that are not used ([#24032](https://github.com/gatsbyjs/gatsby/issues/24032)) ([61d0ef4](https://github.com/gatsbyjs/gatsby/commit/61d0ef4))
- **gatsby:** update script to generate apis.json to accomodate Typescript ([#24023](https://github.com/gatsbyjs/gatsby/issues/24023)) ([7878d0f](https://github.com/gatsbyjs/gatsby/commit/7878d0f))

## [2.21.28](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.27...gatsby@2.21.28) (2020-05-13)

### Bug Fixes

- **gatsby:** add generic locationState to types ([#24029](https://github.com/gatsbyjs/gatsby/issues/24029)) ([8f16846](https://github.com/gatsbyjs/gatsby/commit/8f16846))

### Performance Improvements

- **gatsby:** enable fast filters for \$ne ([#24050](https://github.com/gatsbyjs/gatsby/issues/24050)) ([8e5e5f7](https://github.com/gatsbyjs/gatsby/commit/8e5e5f7))

## [2.21.27](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.26...gatsby@2.21.27) (2020-05-13)

**Note:** Version bump only for package gatsby

## [2.21.26](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.25...gatsby@2.21.26) (2020-05-13)

### Bug Fixes

- **gatsby:** wait for app-data.json file writing ([#22099](https://github.com/gatsbyjs/gatsby/issues/22099)) ([037de56](https://github.com/gatsbyjs/gatsby/commit/037de56))

## [2.21.25](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.24...gatsby@2.21.25) (2020-05-13)

**Note:** Version bump only for package gatsby

## [2.21.24](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.23...gatsby@2.21.24) (2020-05-12)

### Bug Fixes

- **gatsby:** allow elemMatch on non-arrays, fix tests ([#23634](https://github.com/gatsbyjs/gatsby/issues/23634)) ([1d99ffd](https://github.com/gatsbyjs/gatsby/commit/1d99ffd))

### Performance Improvements

- **gatsby:** enable fast filters for lt and gt ([#23978](https://github.com/gatsbyjs/gatsby/issues/23978)) ([1d22341](https://github.com/gatsbyjs/gatsby/commit/1d22341))

## [2.21.23](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.22...gatsby@2.21.23) (2020-05-12)

### Bug Fixes

- handle nullish announcementRef to fix client side redirect error ([#23956](https://github.com/gatsbyjs/gatsby/issues/23956)) ([7a23392](https://github.com/gatsbyjs/gatsby/commit/7a23392))

### Features

- **gatsby:** Add tracing for graphql resolvers ([#23589](https://github.com/gatsbyjs/gatsby/issues/23589)) ([e124aae](https://github.com/gatsbyjs/gatsby/commit/e124aae))
- **gatsby:** Gatsby config validation should suggest related keys ([#23284](https://github.com/gatsbyjs/gatsby/issues/23284)) ([e50407a](https://github.com/gatsbyjs/gatsby/commit/e50407a))

## [2.21.22](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.21...gatsby@2.21.22) (2020-05-11)

**Note:** Version bump only for package gatsby

## [2.21.21](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.20...gatsby@2.21.21) (2020-05-08)

**Note:** Version bump only for package gatsby

## [2.21.20](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.19...gatsby@2.21.20) (2020-05-08)

**Note:** Version bump only for package gatsby

## [2.21.19](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.18...gatsby@2.21.19) (2020-05-07)

**Note:** Version bump only for package gatsby

## [2.21.18](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.17...gatsby@2.21.18) (2020-05-07)

### Performance Improvements

- **gatsby:** replace `mitt` with a modern Map/Set based version of it ([#23223](https://github.com/gatsbyjs/gatsby/issues/23223)) ([986f7b8](https://github.com/gatsbyjs/gatsby/commit/986f7b8))

## [2.21.17](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.16...gatsby@2.21.17) (2020-05-07)

### Bug Fixes

- **gatsby:** print LAN url with serve (like gatsby develop) ([#23418](https://github.com/gatsbyjs/gatsby/issues/23418)) ([0dc20a3](https://github.com/gatsbyjs/gatsby/commit/0dc20a3))
- **gatsby:** use scoped requires for theme plugins ([#23696](https://github.com/gatsbyjs/gatsby/issues/23696)) ([4430687](https://github.com/gatsbyjs/gatsby/commit/4430687))

### Performance Improvements

- **gatsby:** include node counts in output after sourcing steps ([#23671](https://github.com/gatsbyjs/gatsby/issues/23671)) ([192faf6](https://github.com/gatsbyjs/gatsby/commit/192faf6))

## [2.21.16](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.15...gatsby@2.21.16) (2020-05-06)

### Features

- **gatsby/dev-404-page:** support reading and writing filter to `?filter` query string ([#23618](https://github.com/gatsbyjs/gatsby/issues/23618)) ([8f4257a](https://github.com/gatsbyjs/gatsby/commit/8f4257a))

## [2.21.15](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.14...gatsby@2.21.15) (2020-05-06)

**Note:** Version bump only for package gatsby

## [2.21.14](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.13...gatsby@2.21.14) (2020-05-06)

**Note:** Version bump only for package gatsby

## [2.21.13](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.12...gatsby@2.21.13) (2020-05-05)

### Bug Fixes

- Add 98124 error to better help with "Can't resolve [...]" errors ([#23741](https://github.com/gatsbyjs/gatsby/issues/23741)) ([9970faf](https://github.com/gatsbyjs/gatsby/commit/9970faf))

## [2.21.12](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.11...gatsby@2.21.12) (2020-05-05)

### Bug Fixes

- **babel-preset-gatsby:** remove prop-types in production for dependencies ([#23609](https://github.com/gatsbyjs/gatsby/issues/23609)) ([a844157](https://github.com/gatsbyjs/gatsby/commit/a844157))
- **gatsby:** log config validation errors ([#23620](https://github.com/gatsbyjs/gatsby/issues/23620)) ([62d6bb4](https://github.com/gatsbyjs/gatsby/commit/62d6bb4))

## [2.21.11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.10...gatsby@2.21.11) (2020-05-04)

### Bug Fixes

- **gatsby:** Fix dirty check for schema rebuilding ([#23658](https://github.com/gatsbyjs/gatsby/issues/23658)) ([fa50f3e](https://github.com/gatsbyjs/gatsby/commit/fa50f3e))

## [2.21.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.9...gatsby@2.21.10) (2020-05-04)

**Note:** Version bump only for package gatsby

## [2.21.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.8...gatsby@2.21.9) (2020-05-01)

**Note:** Version bump only for package gatsby

## [2.21.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.7...gatsby@2.21.8) (2020-05-01)

### Bug Fixes

- **gatsby:** add maxAsyncRequests to infinity to reduce bundle size ([#23528](https://github.com/gatsbyjs/gatsby/issues/23528)) ([0acafdd](https://github.com/gatsbyjs/gatsby/commit/0acafdd))

## [2.21.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.6...gatsby@2.21.7) (2020-04-30)

### Bug Fixes

- **gatsby:** fix binary search incorrectly setting next pivot + tests ([#23637](https://github.com/gatsbyjs/gatsby/issues/23637)) ([867cb31](https://github.com/gatsbyjs/gatsby/commit/867cb31))

## [2.21.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.5...gatsby@2.21.6) (2020-04-30)

### Performance Improvements

- **gatsby:** support fast filters for gte ([#23348](https://github.com/gatsbyjs/gatsby/issues/23348)) ([a69701b](https://github.com/gatsbyjs/gatsby/commit/a69701b))

## [2.21.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.4...gatsby@2.21.5) (2020-04-29)

**Note:** Version bump only for package gatsby

## [2.21.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.3...gatsby@2.21.4) (2020-04-29)

**Note:** Version bump only for package gatsby

## [2.21.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.2...gatsby@2.21.3) (2020-04-29)

**Note:** Version bump only for package gatsby

## [2.21.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.1...gatsby@2.21.2) (2020-04-29)

### Bug Fixes

- **gatsby:** fix dirty check for inference metadata with related nodes ([#23472](https://github.com/gatsbyjs/gatsby/issues/23472)) ([7b43a60](https://github.com/gatsbyjs/gatsby/commit/7b43a60))

## [2.21.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.21.0...gatsby@2.21.1) (2020-04-28)

### Bug Fixes

- update packages ([#23525](https://github.com/gatsbyjs/gatsby/issues/23525)) ([e65dd1e](https://github.com/gatsbyjs/gatsby/commit/e65dd1e))
- **gatsby:** don't show error for proper redirects ([#19789](https://github.com/gatsbyjs/gatsby/issues/19789)) ([2e6c509](https://github.com/gatsbyjs/gatsby/commit/2e6c509))

# [2.21.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.36...gatsby@2.21.0) (2020-04-27)

### Bug Fixes

- **webpack:** ensure resolution of react-refresh-webpack-plugin ([#23456](https://github.com/gatsbyjs/gatsby/issues/23456)) ([8c32917](https://github.com/gatsbyjs/gatsby/commit/8c32917))

## [2.20.36](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.35...gatsby@2.20.36) (2020-04-25)

**Note:** Version bump only for package gatsby

## [2.20.35](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.34...gatsby@2.20.35) (2020-04-25)

**Note:** Version bump only for package gatsby

## [2.20.34](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.33...gatsby@2.20.34) (2020-04-25)

**Note:** Version bump only for package gatsby

## [2.20.33](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.32...gatsby@2.20.33) (2020-04-24)

**Note:** Version bump only for package gatsby

## [2.20.32](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.31...gatsby@2.20.32) (2020-04-24)

**Note:** Version bump only for package gatsby

## [2.20.31](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.30...gatsby@2.20.31) (2020-04-24)

**Note:** Version bump only for package gatsby

## [2.20.30](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.29...gatsby@2.20.30) (2020-04-24)

**Note:** Version bump only for package gatsby

## [2.20.29](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.28...gatsby@2.20.29) (2020-04-22)

### Bug Fixes

- **gatsby:** fix Uncaught TypeError in navigation.js ([#23196](https://github.com/gatsbyjs/gatsby/issues/23196)) ([da535a8](https://github.com/gatsbyjs/gatsby/commit/da535a8)), closes [#21263](https://github.com/gatsbyjs/gatsby/issues/21263)
- **gatsby:** Improve error message when calling useStaticQuery without graphql ([#23189](https://github.com/gatsbyjs/gatsby/issues/23189)) ([6a079fb](https://github.com/gatsbyjs/gatsby/commit/6a079fb))

## [2.20.28](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.27...gatsby@2.20.28) (2020-04-21)

### Bug Fixes

- **gatsby:** Check for files before delete action when using GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES ([#23219](https://github.com/gatsbyjs/gatsby/issues/23219)) ([ea7160d](https://github.com/gatsbyjs/gatsby/commit/ea7160d))

## [2.20.27](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.26...gatsby@2.20.27) (2020-04-20)

**Note:** Version bump only for package gatsby

## [2.20.26](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.25...gatsby@2.20.26) (2020-04-20)

### Bug Fixes

- **gatsby:** Throw error on default export in gatsby-ssr/brows… ([#23133](https://github.com/gatsbyjs/gatsby/issues/23133)) ([3def3a7](https://github.com/gatsbyjs/gatsby/commit/3def3a7))

## [2.20.25](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.24...gatsby@2.20.25) (2020-04-18)

### Bug Fixes

- **gatsby:** Add self-signed cert to node trust store (https) ([#18703](https://github.com/gatsbyjs/gatsby/issues/18703)) ([4fd8f8e](https://github.com/gatsbyjs/gatsby/commit/4fd8f8e))

## [2.20.24](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.23...gatsby@2.20.24) (2020-04-17)

### Bug Fixes

- wrap ignore pattern in quotes ([#23176](https://github.com/gatsbyjs/gatsby/issues/23176)) ([7563db6](https://github.com/gatsbyjs/gatsby/commit/7563db6))

## [2.20.23](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.22...gatsby@2.20.23) (2020-04-16)

### Features

- **Gatsby Recipes:** Initial release ([#22709](https://github.com/gatsbyjs/gatsby/issues/22709)) ([c59a421](https://github.com/gatsbyjs/gatsby/commit/c59a421)), closes [#22721](https://github.com/gatsbyjs/gatsby/issues/22721) [#22743](https://github.com/gatsbyjs/gatsby/issues/22743) [#22764](https://github.com/gatsbyjs/gatsby/issues/22764) [#22783](https://github.com/gatsbyjs/gatsby/issues/22783) [#22805](https://github.com/gatsbyjs/gatsby/issues/22805) [#22823](https://github.com/gatsbyjs/gatsby/issues/22823) [#22830](https://github.com/gatsbyjs/gatsby/issues/22830) [#22861](https://github.com/gatsbyjs/gatsby/issues/22861) [#22864](https://github.com/gatsbyjs/gatsby/issues/22864) [#22876](https://github.com/gatsbyjs/gatsby/issues/22876) [#22885](https://github.com/gatsbyjs/gatsby/issues/22885) [#22889](https://github.com/gatsbyjs/gatsby/issues/22889) [#22891](https://github.com/gatsbyjs/gatsby/issues/22891) [#22909](https://github.com/gatsbyjs/gatsby/issues/22909) [#22911](https://github.com/gatsbyjs/gatsby/issues/22911) [#22648](https://github.com/gatsbyjs/gatsby/issues/22648) [#22903](https://github.com/gatsbyjs/gatsby/issues/22903) [#22901](https://github.com/gatsbyjs/gatsby/issues/22901) [#22902](https://github.com/gatsbyjs/gatsby/issues/22902) [#22895](https://github.com/gatsbyjs/gatsby/issues/22895) [#22900](https://github.com/gatsbyjs/gatsby/issues/22900) [#22772](https://github.com/gatsbyjs/gatsby/issues/22772) [#22653](https://github.com/gatsbyjs/gatsby/issues/22653) [#22628](https://github.com/gatsbyjs/gatsby/issues/22628) [#22882](https://github.com/gatsbyjs/gatsby/issues/22882) [#22708](https://github.com/gatsbyjs/gatsby/issues/22708) [#22871](https://github.com/gatsbyjs/gatsby/issues/22871) [#22863](https://github.com/gatsbyjs/gatsby/issues/22863) [#22874](https://github.com/gatsbyjs/gatsby/issues/22874) [#22851](https://github.com/gatsbyjs/gatsby/issues/22851) [#22870](https://github.com/gatsbyjs/gatsby/issues/22870) [#22786](https://github.com/gatsbyjs/gatsby/issues/22786) [#22687](https://github.com/gatsbyjs/gatsby/issues/22687) [#22866](https://github.com/gatsbyjs/gatsby/issues/22866) [#22666](https://github.com/gatsbyjs/gatsby/issues/22666) [#22865](https://github.com/gatsbyjs/gatsby/issues/22865) [#22820](https://github.com/gatsbyjs/gatsby/issues/22820) [#22793](https://github.com/gatsbyjs/gatsby/issues/22793) [#4](https://github.com/gatsbyjs/gatsby/issues/4) [#22796](https://github.com/gatsbyjs/gatsby/issues/22796) [#22775](https://github.com/gatsbyjs/gatsby/issues/22775) [#22835](https://github.com/gatsbyjs/gatsby/issues/22835) [#22767](https://github.com/gatsbyjs/gatsby/issues/22767) [#22850](https://github.com/gatsbyjs/gatsby/issues/22850) [#22836](https://github.com/gatsbyjs/gatsby/issues/22836) [#22800](https://github.com/gatsbyjs/gatsby/issues/22800) [#22801](https://github.com/gatsbyjs/gatsby/issues/22801) [#21847](https://github.com/gatsbyjs/gatsby/issues/21847) [#22808](https://github.com/gatsbyjs/gatsby/issues/22808) [#22828](https://github.com/gatsbyjs/gatsby/issues/22828) [#22815](https://github.com/gatsbyjs/gatsby/issues/22815) [#22827](https://github.com/gatsbyjs/gatsby/issues/22827) [#22848](https://github.com/gatsbyjs/gatsby/issues/22848) [#22845](https://github.com/gatsbyjs/gatsby/issues/22845) [#22839](https://github.com/gatsbyjs/gatsby/issues/22839) [#22837](https://github.com/gatsbyjs/gatsby/issues/22837) [#22787](https://github.com/gatsbyjs/gatsby/issues/22787) [#22362](https://github.com/gatsbyjs/gatsby/issues/22362) [#22769](https://github.com/gatsbyjs/gatsby/issues/22769) [#22756](https://github.com/gatsbyjs/gatsby/issues/22756) [#22712](https://github.com/gatsbyjs/gatsby/issues/22712) [#22698](https://github.com/gatsbyjs/gatsby/issues/22698) [#22371](https://github.com/gatsbyjs/gatsby/issues/22371) [#22790](https://github.com/gatsbyjs/gatsby/issues/22790) [#22824](https://github.com/gatsbyjs/gatsby/issues/22824) [#22797](https://github.com/gatsbyjs/gatsby/issues/22797) [#22803](https://github.com/gatsbyjs/gatsby/issues/22803) [#22819](https://github.com/gatsbyjs/gatsby/issues/22819) [#22807](https://github.com/gatsbyjs/gatsby/issues/22807) [#22802](https://github.com/gatsbyjs/gatsby/issues/22802) [#22771](https://github.com/gatsbyjs/gatsby/issues/22771) [#22799](https://github.com/gatsbyjs/gatsby/issues/22799) [#22791](https://github.com/gatsbyjs/gatsby/issues/22791) [#22779](https://github.com/gatsbyjs/gatsby/issues/22779) [#22780](https://github.com/gatsbyjs/gatsby/issues/22780) [#22766](https://github.com/gatsbyjs/gatsby/issues/22766) [#22760](https://github.com/gatsbyjs/gatsby/issues/22760) [#22710](https://github.com/gatsbyjs/gatsby/issues/22710) [#22563](https://github.com/gatsbyjs/gatsby/issues/22563) [#22752](https://github.com/gatsbyjs/gatsby/issues/22752) [#22738](https://github.com/gatsbyjs/gatsby/issues/22738) [#22770](https://github.com/gatsbyjs/gatsby/issues/22770) [#22740](https://github.com/gatsbyjs/gatsby/issues/22740) [#22781](https://github.com/gatsbyjs/gatsby/issues/22781) [#22692](https://github.com/gatsbyjs/gatsby/issues/22692) [#22686](https://github.com/gatsbyjs/gatsby/issues/22686) [#22736](https://github.com/gatsbyjs/gatsby/issues/22736) [#22761](https://github.com/gatsbyjs/gatsby/issues/22761) [#22690](https://github.com/gatsbyjs/gatsby/issues/22690) [#22729](https://github.com/gatsbyjs/gatsby/issues/22729) [#22732](https://github.com/gatsbyjs/gatsby/issues/22732) [#22745](https://github.com/gatsbyjs/gatsby/issues/22745) [#22737](https://github.com/gatsbyjs/gatsby/issues/22737) [#22739](https://github.com/gatsbyjs/gatsby/issues/22739) [#22727](https://github.com/gatsbyjs/gatsby/issues/22727) [#22603](https://github.com/gatsbyjs/gatsby/issues/22603) [#22723](https://github.com/gatsbyjs/gatsby/issues/22723) [#22720](https://github.com/gatsbyjs/gatsby/issues/22720) [#22705](https://github.com/gatsbyjs/gatsby/issues/22705) [#22604](https://github.com/gatsbyjs/gatsby/issues/22604) [#22716](https://github.com/gatsbyjs/gatsby/issues/22716) [#22699](https://github.com/gatsbyjs/gatsby/issues/22699) [#22953](https://github.com/gatsbyjs/gatsby/issues/22953) [#22986](https://github.com/gatsbyjs/gatsby/issues/22986) [#22987](https://github.com/gatsbyjs/gatsby/issues/22987) [#23003](https://github.com/gatsbyjs/gatsby/issues/23003) [#23064](https://github.com/gatsbyjs/gatsby/issues/23064) [#23063](https://github.com/gatsbyjs/gatsby/issues/23063) [#23076](https://github.com/gatsbyjs/gatsby/issues/23076) [#23079](https://github.com/gatsbyjs/gatsby/issues/23079) [#23083](https://github.com/gatsbyjs/gatsby/issues/23083) [#23085](https://github.com/gatsbyjs/gatsby/issues/23085) [#23084](https://github.com/gatsbyjs/gatsby/issues/23084) [#23086](https://github.com/gatsbyjs/gatsby/issues/23086) [#23108](https://github.com/gatsbyjs/gatsby/issues/23108) [#23112](https://github.com/gatsbyjs/gatsby/issues/23112) [#23078](https://github.com/gatsbyjs/gatsby/issues/23078) [#23117](https://github.com/gatsbyjs/gatsby/issues/23117) [#23119](https://github.com/gatsbyjs/gatsby/issues/23119) [#23122](https://github.com/gatsbyjs/gatsby/issues/23122) [#23113](https://github.com/gatsbyjs/gatsby/issues/23113) [#23111](https://github.com/gatsbyjs/gatsby/issues/23111) [#23103](https://github.com/gatsbyjs/gatsby/issues/23103) [#23072](https://github.com/gatsbyjs/gatsby/issues/23072) [#23100](https://github.com/gatsbyjs/gatsby/issues/23100) [#23073](https://github.com/gatsbyjs/gatsby/issues/23073) [#23096](https://github.com/gatsbyjs/gatsby/issues/23096) [#23080](https://github.com/gatsbyjs/gatsby/issues/23080) [#23095](https://github.com/gatsbyjs/gatsby/issues/23095) [#23043](https://github.com/gatsbyjs/gatsby/issues/23043) [#22932](https://github.com/gatsbyjs/gatsby/issues/22932) [#23075](https://github.com/gatsbyjs/gatsby/issues/23075) [#23074](https://github.com/gatsbyjs/gatsby/issues/23074) [#23089](https://github.com/gatsbyjs/gatsby/issues/23089) [#23088](https://github.com/gatsbyjs/gatsby/issues/23088) [#23065](https://github.com/gatsbyjs/gatsby/issues/23065) [#23055](https://github.com/gatsbyjs/gatsby/issues/23055) [#23022](https://github.com/gatsbyjs/gatsby/issues/23022) [#23069](https://github.com/gatsbyjs/gatsby/issues/23069) [#23070](https://github.com/gatsbyjs/gatsby/issues/23070) [#23068](https://github.com/gatsbyjs/gatsby/issues/23068) [#23066](https://github.com/gatsbyjs/gatsby/issues/23066) [#23067](https://github.com/gatsbyjs/gatsby/issues/23067) [#22954](https://github.com/gatsbyjs/gatsby/issues/22954) [#22883](https://github.com/gatsbyjs/gatsby/issues/22883) [#22858](https://github.com/gatsbyjs/gatsby/issues/22858) [#22788](https://github.com/gatsbyjs/gatsby/issues/22788) [#23060](https://github.com/gatsbyjs/gatsby/issues/23060) [#23028](https://github.com/gatsbyjs/gatsby/issues/23028) [#23056](https://github.com/gatsbyjs/gatsby/issues/23056) [#23021](https://github.com/gatsbyjs/gatsby/issues/23021) [#23048](https://github.com/gatsbyjs/gatsby/issues/23048) [#23053](https://github.com/gatsbyjs/gatsby/issues/23053) [#23042](https://github.com/gatsbyjs/gatsby/issues/23042) [#22960](https://github.com/gatsbyjs/gatsby/issues/22960) [#23025](https://github.com/gatsbyjs/gatsby/issues/23025) [#23046](https://github.com/gatsbyjs/gatsby/issues/23046) [#23009](https://github.com/gatsbyjs/gatsby/issues/23009) [#23034](https://github.com/gatsbyjs/gatsby/issues/23034) [#23036](https://github.com/gatsbyjs/gatsby/issues/23036) [#22965](https://github.com/gatsbyjs/gatsby/issues/22965) [#22843](https://github.com/gatsbyjs/gatsby/issues/22843) [#22703](https://github.com/gatsbyjs/gatsby/issues/22703) [#23029](https://github.com/gatsbyjs/gatsby/issues/23029) [#23017](https://github.com/gatsbyjs/gatsby/issues/23017) [#23014](https://github.com/gatsbyjs/gatsby/issues/23014) [#23016](https://github.com/gatsbyjs/gatsby/issues/23016) [#23015](https://github.com/gatsbyjs/gatsby/issues/23015) [#22985](https://github.com/gatsbyjs/gatsby/issues/22985) [#21907](https://github.com/gatsbyjs/gatsby/issues/21907) [#23008](https://github.com/gatsbyjs/gatsby/issues/23008) [#22750](https://github.com/gatsbyjs/gatsby/issues/22750) [#23007](https://github.com/gatsbyjs/gatsby/issues/23007) [#23001](https://github.com/gatsbyjs/gatsby/issues/23001) [#22881](https://github.com/gatsbyjs/gatsby/issues/22881) [#23000](https://github.com/gatsbyjs/gatsby/issues/23000) [#22638](https://github.com/gatsbyjs/gatsby/issues/22638) [#22854](https://github.com/gatsbyjs/gatsby/issues/22854) [#22993](https://github.com/gatsbyjs/gatsby/issues/22993) [#22872](https://github.com/gatsbyjs/gatsby/issues/22872) [#22893](https://github.com/gatsbyjs/gatsby/issues/22893) [#22992](https://github.com/gatsbyjs/gatsby/issues/22992) [#22297](https://github.com/gatsbyjs/gatsby/issues/22297) [#22984](https://github.com/gatsbyjs/gatsby/issues/22984) [#22942](https://github.com/gatsbyjs/gatsby/issues/22942) [#22981](https://github.com/gatsbyjs/gatsby/issues/22981) [#22967](https://github.com/gatsbyjs/gatsby/issues/22967) [#22966](https://github.com/gatsbyjs/gatsby/issues/22966) [#22544](https://github.com/gatsbyjs/gatsby/issues/22544) [#22696](https://github.com/gatsbyjs/gatsby/issues/22696) [#22747](https://github.com/gatsbyjs/gatsby/issues/22747) [#22774](https://github.com/gatsbyjs/gatsby/issues/22774) [#22929](https://github.com/gatsbyjs/gatsby/issues/22929) [#22898](https://github.com/gatsbyjs/gatsby/issues/22898) [#22943](https://github.com/gatsbyjs/gatsby/issues/22943) [#22873](https://github.com/gatsbyjs/gatsby/issues/22873) [#22617](https://github.com/gatsbyjs/gatsby/issues/22617) [#22798](https://github.com/gatsbyjs/gatsby/issues/22798) [#22956](https://github.com/gatsbyjs/gatsby/issues/22956) [#22860](https://github.com/gatsbyjs/gatsby/issues/22860) [#22944](https://github.com/gatsbyjs/gatsby/issues/22944) [#22946](https://github.com/gatsbyjs/gatsby/issues/22946) [#22947](https://github.com/gatsbyjs/gatsby/issues/22947) [#22961](https://github.com/gatsbyjs/gatsby/issues/22961) [#22959](https://github.com/gatsbyjs/gatsby/issues/22959) [#22810](https://github.com/gatsbyjs/gatsby/issues/22810) [#22869](https://github.com/gatsbyjs/gatsby/issues/22869) [#22879](https://github.com/gatsbyjs/gatsby/issues/22879) [#23138](https://github.com/gatsbyjs/gatsby/issues/23138) [#23146](https://github.com/gatsbyjs/gatsby/issues/23146) [#23154](https://github.com/gatsbyjs/gatsby/issues/23154) [#23152](https://github.com/gatsbyjs/gatsby/issues/23152) [#23168](https://github.com/gatsbyjs/gatsby/issues/23168) [#23169](https://github.com/gatsbyjs/gatsby/issues/23169) [#23175](https://github.com/gatsbyjs/gatsby/issues/23175)

## [2.20.22](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.20...gatsby@2.20.22) (2020-04-15)

**Note:** Version bump only for package gatsby

## [2.20.20](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.19...gatsby@2.20.20) (2020-04-14)

### Performance Improvements

- **gatsby:** Support `lte` for indexed fast filters ([#22932](https://github.com/gatsbyjs/gatsby/issues/22932)) ([fd57224](https://github.com/gatsbyjs/gatsby/commit/fd57224))

## [2.20.19](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.18...gatsby@2.20.19) (2020-04-14)

### Bug Fixes

- **gatsby:** call schema rebuild manually on \_\_refresh ([#23009](https://github.com/gatsbyjs/gatsby/issues/23009)) ([8493de8](https://github.com/gatsbyjs/gatsby/commit/8493de8))
- **gatsby:** Set a timeout of 15 seconds on queries ([#23036](https://github.com/gatsbyjs/gatsby/issues/23036)) ([1e81c76](https://github.com/gatsbyjs/gatsby/commit/1e81c76))
- Ensure component order is deterministic ([#22965](https://github.com/gatsbyjs/gatsby/issues/22965)) ([94267be](https://github.com/gatsbyjs/gatsby/commit/94267be))

## [2.20.18](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.17...gatsby@2.20.18) (2020-04-11)

### Bug Fixes

- **gatsby:** Use `moveSync` over `renameSync` to fix cross mount cases ([#23029](https://github.com/gatsbyjs/gatsby/issues/23029)) ([96f8d4b](https://github.com/gatsbyjs/gatsby/commit/96f8d4b))

## [2.20.17](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.16...gatsby@2.20.17) (2020-04-10)

**Note:** Version bump only for package gatsby

## [2.20.16](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.15...gatsby@2.20.16) (2020-04-10)

### Bug Fixes

- **gatsby:** Use tmp dir for tmp redux cache folder ([#22959](https://github.com/gatsbyjs/gatsby/issues/22959)) ([86cf920](https://github.com/gatsbyjs/gatsby/commit/86cf920))

## [2.20.15](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.14...gatsby@2.20.15) (2020-04-09)

### Bug Fixes

- **gatsby:** improve async commons chunking ([#22879](https://github.com/gatsbyjs/gatsby/issues/22879)) ([7cf056f](https://github.com/gatsbyjs/gatsby/commit/7cf056f))

## [2.20.14](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.13...gatsby@2.20.14) (2020-04-08)

### Performance Improvements

- **gatsby:** support `elemMatch` as fast filter ([#22742](https://github.com/gatsbyjs/gatsby/issues/22742)) ([66b3d35](https://github.com/gatsbyjs/gatsby/commit/66b3d35))

## [2.20.13](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.12...gatsby@2.20.13) (2020-04-07)

**Note:** Version bump only for package gatsby

## [2.20.12](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.11...gatsby@2.20.12) (2020-04-03)

### Bug Fixes

- **gatsby:** Fix OOM from telemetry storing too much ([#22752](https://github.com/gatsbyjs/gatsby/issues/22752)) ([a7281c2](https://github.com/gatsbyjs/gatsby/commit/a7281c2))

## [2.20.11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.10...gatsby@2.20.11) (2020-04-03)

### Bug Fixes

- **gatsby:** Support grouping by reserved keywords ([#22603](https://github.com/gatsbyjs/gatsby/issues/22603)) ([ad6bc16](https://github.com/gatsbyjs/gatsby/commit/ad6bc16))

## [2.20.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.9...gatsby@2.20.10) (2020-04-01)

### Bug Fixes

- **core:** Add gatsby/graphql type definitions ([#22652](https://github.com/gatsbyjs/gatsby/issues/22652)) ([ac205cf](https://github.com/gatsbyjs/gatsby/commit/ac205cf))

## [2.20.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.8...gatsby@2.20.9) (2020-03-30)

### Bug Fixes

- **gatsby:** Collect nested webpack compilation stats errors ([#22598](https://github.com/gatsbyjs/gatsby/issues/22598)) ([3986380](https://github.com/gatsbyjs/gatsby/commit/3986380)), closes [#22597](https://github.com/gatsbyjs/gatsby/issues/22597)

## [2.20.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.7...gatsby@2.20.8) (2020-03-27)

### Bug Fixes

- **gatsby:** Mark plugin parameter as optional for actions ([#22546](https://github.com/gatsbyjs/gatsby/issues/22546)) ([6d1356c](https://github.com/gatsbyjs/gatsby/commit/6d1356c))

## [2.20.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.6...gatsby@2.20.7) (2020-03-26)

### Features

- **gatsby:** enable granular chunks ([#22253](https://github.com/gatsbyjs/gatsby/issues/22253)) ([0f02ea7](https://github.com/gatsbyjs/gatsby/commit/0f02ea7))

## [2.20.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.5...gatsby@2.20.6) (2020-03-25)

### Features

- **gatsby-telemetry:** Make build collect GraphQL/Sift query data for telemetry ([#22540](https://github.com/gatsbyjs/gatsby/issues/22540)) ([1bec140](https://github.com/gatsbyjs/gatsby/commit/1bec140))

## [2.20.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.4...gatsby@2.20.5) (2020-03-25)

### Features

- **gatsby-source-graphql:** Query batching ([#22347](https://github.com/gatsbyjs/gatsby/issues/22347)) ([2a4c7fd](https://github.com/gatsbyjs/gatsby/commit/2a4c7fd))

## [2.20.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.3...gatsby@2.20.4) (2020-03-24)

### Bug Fixes

- **docs:** remove double words ([#22494](https://github.com/gatsbyjs/gatsby/issues/22494)) ([75f6ee2](https://github.com/gatsbyjs/gatsby/commit/75f6ee2))

## [2.20.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.2...gatsby@2.20.3) (2020-03-23)

**Note:** Version bump only for package gatsby

## [2.20.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.1...gatsby@2.20.2) (2020-03-20)

**Note:** Version bump only for package gatsby

## [2.20.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.20.0...gatsby@2.20.1) (2020-03-20)

**Note:** Version bump only for package gatsby

# [2.20.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.50...gatsby@2.20.0) (2020-03-20)

### Features

- **gatsby:** bump node min version to 10.13.0 ([#22400](https://github.com/gatsbyjs/gatsby/issues/22400)) ([83d681a](https://github.com/gatsbyjs/gatsby/commit/83d681a))

## [2.19.50](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.49...gatsby@2.19.50) (2020-03-20)

### Bug Fixes

- **gatsby:** Incorrect PackageJson type ([#22406](https://github.com/gatsbyjs/gatsby/issues/22406)) ([5496e6b](https://github.com/gatsbyjs/gatsby/commit/5496e6b))

## [2.19.49](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.48...gatsby@2.19.49) (2020-03-19)

**Note:** Version bump only for package gatsby

## [2.19.48](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.47...gatsby@2.19.48) (2020-03-18)

**Note:** Version bump only for package gatsby

## [2.19.47](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.46...gatsby@2.19.47) (2020-03-18)

**Note:** Version bump only for package gatsby

## [2.19.46](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.45...gatsby@2.19.46) (2020-03-18)

### Bug Fixes

- update dependency axios to ^0.19.2 ([#22317](https://github.com/gatsbyjs/gatsby/issues/22317)) ([91e780f](https://github.com/gatsbyjs/gatsby/commit/91e780f))
- update dependency mini-css-extract-plugin ([#22320](https://github.com/gatsbyjs/gatsby/issues/22320)) ([d5c936e](https://github.com/gatsbyjs/gatsby/commit/d5c936e))
- update dependency webpack-stats-plugin to ^0.3.1 ([#22325](https://github.com/gatsbyjs/gatsby/issues/22325)) ([cc75305](https://github.com/gatsbyjs/gatsby/commit/cc75305))
- update minor updates in packages ([#22329](https://github.com/gatsbyjs/gatsby/issues/22329)) ([bfb864b](https://github.com/gatsbyjs/gatsby/commit/bfb864b))

## [2.19.45](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.44...gatsby@2.19.45) (2020-03-16)

**Note:** Version bump only for package gatsby

## [2.19.44](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.43...gatsby@2.19.44) (2020-03-16)

**Note:** Version bump only for package gatsby

## [2.19.43](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.42...gatsby@2.19.43) (2020-03-13)

### Bug Fixes

- **gatsby:** render <RouteAnnouncer> in html ([#21625](https://github.com/gatsbyjs/gatsby/issues/21625)) ([2fdd518](https://github.com/gatsbyjs/gatsby/commit/2fdd518))

## [2.19.42](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.41...gatsby@2.19.42) (2020-03-13)

### Bug Fixes

- **gatsby:** make SSR more compatible with PnP (fixes gatsby-plugin-sitemap usage in PnP) ([#21976](https://github.com/gatsbyjs/gatsby/issues/21976)) ([2eb8861](https://github.com/gatsbyjs/gatsby/commit/2eb8861))
- ensure that errorParser always returns something ([#20749](https://github.com/gatsbyjs/gatsby/issues/20749)) ([2688f29](https://github.com/gatsbyjs/gatsby/commit/2688f29))

## [2.19.41](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.40...gatsby@2.19.41) (2020-03-12)

### Bug Fixes

- runtime network/resource loading resilience fixes + restore e2e tests for it ([#18051](https://github.com/gatsbyjs/gatsby/issues/18051)) ([030d927](https://github.com/gatsbyjs/gatsby/commit/030d927))

## [2.19.40](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.39...gatsby@2.19.40) (2020-03-12)

### Bug Fixes

- **gatsby:** Show meaningful error when directory names are too long ([#21518](https://github.com/gatsbyjs/gatsby/issues/21518)) ([4404af1](https://github.com/gatsbyjs/gatsby/commit/4404af1))

## [2.19.39](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.38...gatsby@2.19.39) (2020-03-11)

### Features

- **gatsby:** Support FastRefresh for development hot reloading ([#21534](https://github.com/gatsbyjs/gatsby/issues/21534)) ([205847b](https://github.com/gatsbyjs/gatsby/commit/205847b))

## [2.19.38](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.37...gatsby@2.19.38) (2020-03-11)

**Note:** Version bump only for package gatsby

## [2.19.37](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.36...gatsby@2.19.37) (2020-03-11)

**Note:** Version bump only for package gatsby

## [2.19.36](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.35...gatsby@2.19.36) (2020-03-10)

**Note:** Version bump only for package gatsby

## [2.19.35](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.34...gatsby@2.19.35) (2020-03-10)

### Bug Fixes

- **gatsby:** Update types for WrapPageElement\*Args ([#22120](https://github.com/gatsbyjs/gatsby/issues/22120)) ([97fa23e](https://github.com/gatsbyjs/gatsby/commit/97fa23e)), closes [#21542](https://github.com/gatsbyjs/gatsby/issues/21542)

### Performance Improvements

- **gatsby:** more efficient parent-child check through arrays ([#22126](https://github.com/gatsbyjs/gatsby/issues/22126)) ([be7111b](https://github.com/gatsbyjs/gatsby/commit/be7111b))

## [2.19.34](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.33...gatsby@2.19.34) (2020-03-09)

**Note:** Version bump only for package gatsby

## [2.19.33](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.32...gatsby@2.19.33) (2020-03-09)

**Note:** Version bump only for package gatsby

## [2.19.32](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.31...gatsby@2.19.32) (2020-03-06)

**Note:** Version bump only for package gatsby

## [2.19.31](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.30...gatsby@2.19.31) (2020-03-06)

**Note:** Version bump only for package gatsby

## [2.19.30](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.29...gatsby@2.19.30) (2020-03-06)

### Bug Fixes

- **gatsby:** Prevent cache invalidation case for loki ([#22009](https://github.com/gatsbyjs/gatsby/issues/22009)) ([b5942d6](https://github.com/gatsbyjs/gatsby/commit/b5942d6))

## [2.19.29](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.28...gatsby@2.19.29) (2020-03-05)

**Note:** Version bump only for package gatsby

## [2.19.28](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.27...gatsby@2.19.28) (2020-03-04)

### Bug Fixes

- **gatsby:** Resolve linked interfaces consistently with objec… ([#21936](https://github.com/gatsbyjs/gatsby/issues/21936)) ([bd5bdd1](https://github.com/gatsbyjs/gatsby/commit/bd5bdd1))

## [2.19.27](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.26...gatsby@2.19.27) (2020-03-03)

### Features

- **gatsby:** Page build optimisations for incremental data changes ([#21523](https://github.com/gatsbyjs/gatsby/issues/21523)) ([c49d7b4](https://github.com/gatsbyjs/gatsby/commit/c49d7b4))

## [2.19.26](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.25...gatsby@2.19.26) (2020-03-03)

### Features

- **gatsby:** add react profiling option ([#21863](https://github.com/gatsbyjs/gatsby/issues/21863)) ([3e8f2c7](https://github.com/gatsbyjs/gatsby/commit/3e8f2c7))

## [2.19.25](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.24...gatsby@2.19.25) (2020-03-02)

### Bug Fixes

- **gatsby:** bump flex-bug postcss-plugin and postcss-loader ([#21398](https://github.com/gatsbyjs/gatsby/issues/21398)) ([47b05fc](https://github.com/gatsbyjs/gatsby/commit/47b05fc))
- **gatsby:** Check for nullable locations in query-runner ([#21839](https://github.com/gatsbyjs/gatsby/issues/21839)) ([dc484eb](https://github.com/gatsbyjs/gatsby/commit/dc484eb))
- **gatsby:** fix codepaths that result in js errors ([#21829](https://github.com/gatsbyjs/gatsby/issues/21829)) ([a87f1bd](https://github.com/gatsbyjs/gatsby/commit/a87f1bd))
- **gatsby:** Improve warning for built-in GraphQL type overrides ([#21899](https://github.com/gatsbyjs/gatsby/issues/21899)) ([1f4db4b](https://github.com/gatsbyjs/gatsby/commit/1f4db4b))
- hot fix for `gatsby develop` when HOME is not set ([#21914](https://github.com/gatsbyjs/gatsby/issues/21914)) ([b6de2b9](https://github.com/gatsbyjs/gatsby/commit/b6de2b9))

### Features

- **gatsby:** Allow silencing the warning for adding resolvers for missing types ([#21769](https://github.com/gatsbyjs/gatsby/issues/21769)) ([6b7ed63](https://github.com/gatsbyjs/gatsby/commit/6b7ed63))

## [2.19.24](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.23...gatsby@2.19.24) (2020-03-02)

### Bug Fixes

- **gatsby:** Improve error message when EnsureResources fails to ensure a resource ([#21429](https://github.com/gatsbyjs/gatsby/issues/21429)) ([7527993](https://github.com/gatsbyjs/gatsby/commit/7527993))
- **gatsby:** Switching from devcert-san to devcert to fix HTTP… ([#16726](https://github.com/gatsbyjs/gatsby/issues/16726)) ([22ead19](https://github.com/gatsbyjs/gatsby/commit/22ead19)), closes [#16212](https://github.com/gatsbyjs/gatsby/issues/16212)

## [2.19.23](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.22...gatsby@2.19.23) (2020-02-28)

### Bug Fixes

- Remove global namespace hack for a proper workflow ([#21591](https://github.com/gatsbyjs/gatsby/issues/21591)) ([4bc595b](https://github.com/gatsbyjs/gatsby/commit/4bc595b))

## [2.19.22](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.21...gatsby@2.19.22) (2020-02-25)

### Bug Fixes

- **gatsby:** Chunk nodes when serializing redux to prevent OOM ([#21555](https://github.com/gatsbyjs/gatsby/issues/21555)) ([c944aae](https://github.com/gatsbyjs/gatsby/commit/c944aae)), closes [#17233](https://github.com/gatsbyjs/gatsby/issues/17233)

## [2.19.21](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.20...gatsby@2.19.21) (2020-02-24)

**Note:** Version bump only for package gatsby

## [2.19.20](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.19...gatsby@2.19.20) (2020-02-24)

### Bug Fixes

- **gatsby:** add app-data to preload list ([#21537](https://github.com/gatsbyjs/gatsby/issues/21537)) ([ad92e13](https://github.com/gatsbyjs/gatsby/commit/ad92e13))
- **gatsby:** Fix wrongly skipping graphql filter cache ([#21578](https://github.com/gatsbyjs/gatsby/issues/21578)) ([4f68761](https://github.com/gatsbyjs/gatsby/commit/4f68761))

## [2.19.19](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.18...gatsby@2.19.19) (2020-02-20)

### Bug Fixes

- **gatsby:** Fix static query parsing for a special case ([#21551](https://github.com/gatsbyjs/gatsby/issues/21551)) ([dd344ac](https://github.com/gatsbyjs/gatsby/commit/dd344ac))

## [2.19.18](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.17...gatsby@2.19.18) (2020-02-17)

### Bug Fixes

- **gatsby:** Fix an edge case with sift queries using index ([#21458](https://github.com/gatsbyjs/gatsby/issues/21458)) ([b7e6bb1](https://github.com/gatsbyjs/gatsby/commit/b7e6bb1))

## [2.19.17](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.16...gatsby@2.19.17) (2020-02-13)

### Bug Fixes

- **gatsby:** add onPostBuild activity ([#21366](https://github.com/gatsbyjs/gatsby/issues/21366)) ([6780461](https://github.com/gatsbyjs/gatsby/commit/6780461))
- **gatsby:** Reset graphql runner on certain node events ([#20586](https://github.com/gatsbyjs/gatsby/issues/20586)) ([ef72f2b](https://github.com/gatsbyjs/gatsby/commit/ef72f2b))
- **gatsby:** revert auto-adding id field to queries ([#21216](https://github.com/gatsbyjs/gatsby/issues/21216)) ([e1fd083](https://github.com/gatsbyjs/gatsby/commit/e1fd083)), closes [#20943](https://github.com/gatsbyjs/gatsby/issues/20943)
- **gatsby:** Use argument for updating cache ([#21365](https://github.com/gatsbyjs/gatsby/issues/21365)) ([fb36368](https://github.com/gatsbyjs/gatsby/commit/fb36368)), closes [/github.com/gatsbyjs/gatsby/pull/20729#pullrequestreview-350948674](https://github.com//github.com/gatsbyjs/gatsby/pull/20729/issues/pullrequestreview-350948674)

## [2.19.16](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.15...gatsby@2.19.16) (2020-02-11)

### Features

- **www:** Convert API pages to MDX ([#20763](https://github.com/gatsbyjs/gatsby/issues/20763)) ([c905014](https://github.com/gatsbyjs/gatsby/commit/c905014))

## [2.19.15](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.14...gatsby@2.19.15) (2020-02-10)

**Note:** Version bump only for package gatsby

## [2.19.14](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.13...gatsby@2.19.14) (2020-02-10)

**Note:** Version bump only for package gatsby

## [2.19.13](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.12...gatsby@2.19.13) (2020-02-10)

**Note:** Version bump only for package gatsby

## [2.19.12](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.11...gatsby@2.19.12) (2020-02-02)

### Bug Fixes

- **gatsby:** Pin reach since they do not pass in location.href… ([#21144](https://github.com/gatsbyjs/gatsby/issues/21144)) ([f7d2f03](https://github.com/gatsbyjs/gatsby/commit/f7d2f03))

## [2.19.11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.10...gatsby@2.19.11) (2020-02-01)

### Bug Fixes

- **gatsby:** Fix invalid algorithm of fragment cycles detection ([#21128](https://github.com/gatsbyjs/gatsby/issues/21128)) ([f570db3](https://github.com/gatsbyjs/gatsby/commit/f570db3))
- **gatsby:** fix onCreatePage typings ([#20871](https://github.com/gatsbyjs/gatsby/issues/20871)) ([26e0cbc](https://github.com/gatsbyjs/gatsby/commit/26e0cbc))

## [2.19.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.9...gatsby@2.19.10) (2020-01-29)

### Bug Fixes

- **gatsby-plugin-mdx:** support yarn PnP ([#20638](https://github.com/gatsbyjs/gatsby/issues/20638)) ([6375ba9](https://github.com/gatsbyjs/gatsby/commit/6375ba9))

## [2.19.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.8...gatsby@2.19.9) (2020-01-29)

### Bug Fixes

- **gatsby:** Do not add field `id` to the query when `id` alias exists ([#20980](https://github.com/gatsbyjs/gatsby/issues/20980)) ([acf2c35](https://github.com/gatsbyjs/gatsby/commit/acf2c35))
- **gatsby:** Fix potential issue in fragment cycles detection ([#20953](https://github.com/gatsbyjs/gatsby/issues/20953)) ([c6f4c62](https://github.com/gatsbyjs/gatsby/commit/c6f4c62))

## [2.19.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.7...gatsby@2.19.8) (2020-01-28)

### Bug Fixes

- **gatsby:** Fix stack overflow on queries with circular fragments ([#20936](https://github.com/gatsbyjs/gatsby/issues/20936)) ([094ca4c](https://github.com/gatsbyjs/gatsby/commit/094ca4c))
- **gatsby:** remove role alert on gatsby-announcer ([#20914](https://github.com/gatsbyjs/gatsby/issues/20914)) ([0008bc4](https://github.com/gatsbyjs/gatsby/commit/0008bc4))
- **gatsby:** structured error might be a string ([#20909](https://github.com/gatsbyjs/gatsby/issues/20909)) ([7e40b21](https://github.com/gatsbyjs/gatsby/commit/7e40b21))

### Performance Improvements

- **gatsby:** Create index on the fly for non-id index ([#20729](https://github.com/gatsbyjs/gatsby/issues/20729)) ([115d5c4](https://github.com/gatsbyjs/gatsby/commit/115d5c4))

## [2.19.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.6...gatsby@2.19.7) (2020-01-27)

### Bug Fixes

- wrap `GraphQLRunner.query` return in Promise.resolve ([#20904](https://github.com/gatsbyjs/gatsby/issues/20904)) ([86d3cda](https://github.com/gatsbyjs/gatsby/commit/86d3cda))

## [2.19.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.5...gatsby@2.19.6) (2020-01-27)

### Bug Fixes

- **gatsby:** Add `__typename` and `id` fields in queries to ma… ([#20849](https://github.com/gatsbyjs/gatsby/issues/20849)) ([4d27336](https://github.com/gatsbyjs/gatsby/commit/4d27336))

## [2.19.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.4...gatsby@2.19.5) (2020-01-24)

### Features

- **gatsby:** enable external jobs with ipc ([#20835](https://github.com/gatsbyjs/gatsby/issues/20835)) ([b4c5bfb](https://github.com/gatsbyjs/gatsby/commit/b4c5bfb))

## [2.19.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.3...gatsby@2.19.4) (2020-01-24)

### Bug Fixes

- **gatsby:** revert [#19664](https://github.com/gatsbyjs/gatsby/issues/19664) fix duplicate runs in develop mode ([#20836](https://github.com/gatsbyjs/gatsby/issues/20836)) ([9419bb3](https://github.com/gatsbyjs/gatsby/commit/9419bb3))

## [2.19.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.2...gatsby@2.19.3) (2020-01-23)

### Bug Fixes

- remove 1px line from gatsby-announcer on 100vh pages ([#20781](https://github.com/gatsbyjs/gatsby/issues/20781)) ([3880394](https://github.com/gatsbyjs/gatsby/commit/3880394))
- **chore:** remove processing and waiting queue ([#20757](https://github.com/gatsbyjs/gatsby/issues/20757)) ([c2ecb3a](https://github.com/gatsbyjs/gatsby/commit/c2ecb3a))

## [2.19.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.1...gatsby@2.19.2) (2020-01-23)

### Bug Fixes

- **gatsby:** Improve `gatsby` TS types for `sourceNodes` ([#20397](https://github.com/gatsbyjs/gatsby/issues/20397)) ([2a1508e](https://github.com/gatsbyjs/gatsby/commit/2a1508e))

## [2.19.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.19.0...gatsby@2.19.1) (2020-01-21)

### Bug Fixes

- **gatsby:** use slash from gatsby-core-utils ([#20744](https://github.com/gatsbyjs/gatsby/issues/20744)) ([00f3190](https://github.com/gatsbyjs/gatsby/commit/00f3190))

# [2.19.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.25...gatsby@2.19.0) (2020-01-21)

### Features

- **gatsby:** enable Jobs API v2 ([#19858](https://github.com/gatsbyjs/gatsby/issues/19858)) ([039c601](https://github.com/gatsbyjs/gatsby/commit/039c601)), closes [#19831](https://github.com/gatsbyjs/gatsby/issues/19831)

## [2.18.25](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.24...gatsby@2.18.25) (2020-01-17)

### Performance Improvements

- **gatsby:** cache parsing and validation results in graphql-runner ([#20477](https://github.com/gatsbyjs/gatsby/issues/20477)) ([ac7c79f](https://github.com/gatsbyjs/gatsby/commit/ac7c79f))

## [2.18.24](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.23...gatsby@2.18.24) (2020-01-17)

### Bug Fixes

- **gatsby:** Respect `[@dont](https://github.com/dont)Infer` directive on `SitePage` type ([#20662](https://github.com/gatsbyjs/gatsby/issues/20662)) ([631ba49](https://github.com/gatsbyjs/gatsby/commit/631ba49))

## [2.18.23](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.22...gatsby@2.18.23) (2020-01-16)

### Performance Improvements

- **gatsby:** Create one promise per queue, not one per job ([#20606](https://github.com/gatsbyjs/gatsby/issues/20606)) ([79eb6de](https://github.com/gatsbyjs/gatsby/commit/79eb6de))
- **gatsby:** Shortcut trivial queries by id ([#20609](https://github.com/gatsbyjs/gatsby/issues/20609)) ([fa4ff69](https://github.com/gatsbyjs/gatsby/commit/fa4ff69))
- **gatsby:** Use a Map instead of Object for job id lookups ([#20605](https://github.com/gatsbyjs/gatsby/issues/20605)) ([54fb530](https://github.com/gatsbyjs/gatsby/commit/54fb530))

## [2.18.22](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.21...gatsby@2.18.22) (2020-01-14)

### Bug Fixes

- **gatsby:** fix error cannot read referencePath of undefined ([#20517](https://github.com/gatsbyjs/gatsby/issues/20517)) ([c759a7d](https://github.com/gatsbyjs/gatsby/commit/c759a7d))
- **typing:** more precise typing for ssr api ([#20564](https://github.com/gatsbyjs/gatsby/issues/20564)) ([b53ec9a](https://github.com/gatsbyjs/gatsby/commit/b53ec9a))

### Features

- **gatsby:** Supports multiple development proxies ([#20369](https://github.com/gatsbyjs/gatsby/issues/20369)) ([8d1e37a](https://github.com/gatsbyjs/gatsby/commit/8d1e37a))

## [2.18.21](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.20...gatsby@2.18.21) (2020-01-09)

**Note:** Version bump only for package gatsby

## [2.18.20](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.18...gatsby@2.18.20) (2020-01-09)

### Bug Fixes

- **gatsby:** webpack /_ webpackPrefetch/webpackPreload _/ comments causing a bug ([#20403](https://github.com/gatsbyjs/gatsby/issues/20403)) ([1b89b10](https://github.com/gatsbyjs/gatsby/commit/1b89b10))

### Features

- **gatsby:** Allow alternative import syntax for useStaticQuery ([#20330](https://github.com/gatsbyjs/gatsby/issues/20330)) ([17eaa72](https://github.com/gatsbyjs/gatsby/commit/17eaa72))

## [2.18.19](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.18...gatsby@2.18.19) (2020-01-09)

### Bug Fixes

- **gatsby:** webpack /_ webpackPrefetch/webpackPreload _/ comments causing a bug ([#20403](https://github.com/gatsbyjs/gatsby/issues/20403)) ([1b89b10](https://github.com/gatsbyjs/gatsby/commit/1b89b10))

### Features

- **gatsby:** Allow alternative import syntax for useStaticQuery ([#20330](https://github.com/gatsbyjs/gatsby/issues/20330)) ([17eaa72](https://github.com/gatsbyjs/gatsby/commit/17eaa72))

## [2.18.18](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.17...gatsby@2.18.18) (2020-01-06)

**Note:** Version bump only for package gatsby

## [2.18.17](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.16...gatsby@2.18.17) (2019-12-23)

### Bug Fixes

- **gatsby:** don't write out `isCreatedByStatefulCreatePages` to page-data files ([#20241](https://github.com/gatsbyjs/gatsby/issues/20241)) ([4b113bd](https://github.com/gatsbyjs/gatsby/commit/4b113bd))

### Features

- **gatsby:** Improve structured errors around GraphQL ([#20120](https://github.com/gatsbyjs/gatsby/issues/20120)) ([a5740f9](https://github.com/gatsbyjs/gatsby/commit/a5740f9))

## [2.18.16](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.15...gatsby@2.18.16) (2019-12-20)

### Bug Fixes

- **gatsby:** enable static queries in `wrapRootElement` ([#19986](https://github.com/gatsbyjs/gatsby/issues/19986)) ([c591eb7](https://github.com/gatsbyjs/gatsby/commit/c591eb7))

### Features

- **gatsby:** bundle and page-data stats for telemetry ([#20146](https://github.com/gatsbyjs/gatsby/issues/20146)) ([3fe97f2](https://github.com/gatsbyjs/gatsby/commit/3fe97f2))

## [2.18.15](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.14...gatsby@2.18.15) (2019-12-19)

### Bug Fixes

- **gatsby:** Fix sift query against empty nodes ([#20212](https://github.com/gatsbyjs/gatsby/issues/20212)) ([6beeec3](https://github.com/gatsbyjs/gatsby/commit/6beeec3))

## [2.18.14](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.13...gatsby@2.18.14) (2019-12-18)

### Bug Fixes

- **gatsby:** add ./ prefix to paths in async-requires ([#20169](https://github.com/gatsbyjs/gatsby/issues/20169)) ([4f2154a](https://github.com/gatsbyjs/gatsby/commit/4f2154a))
- **gatsby:** do not rebuild schema having identical conflicts ([#20099](https://github.com/gatsbyjs/gatsby/issues/20099)) ([0d14926](https://github.com/gatsbyjs/gatsby/commit/0d14926))
- **gatsby:** support file inference for any field name (not just [a-zA-Z0-9_]) ([#20186](https://github.com/gatsbyjs/gatsby/issues/20186)) ([b681959](https://github.com/gatsbyjs/gatsby/commit/b681959))
- **gatsby:** support unicode characters for 404 page ([#20165](https://github.com/gatsbyjs/gatsby/issues/20165)) ([51474e8](https://github.com/gatsbyjs/gatsby/commit/51474e8))
- **gatsby-telemetry:** only report unique plugins ([#20147](https://github.com/gatsbyjs/gatsby/issues/20147)) ([4c138d5](https://github.com/gatsbyjs/gatsby/commit/4c138d5))

## [2.18.13](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.12...gatsby@2.18.13) (2019-12-17)

### Bug Fixes

- **gatsby:** fix circular ref stack overflow checks ([#20039](https://github.com/gatsbyjs/gatsby/issues/20039)) ([f780d21](https://github.com/gatsbyjs/gatsby/commit/f780d21))

### Features

- **gatsby:** Use webpack watchOptions config for webpack-dev-middleware ([#20067](https://github.com/gatsbyjs/gatsby/issues/20067)) ([aff5540](https://github.com/gatsbyjs/gatsby/commit/aff5540))

### Performance Improvements

- **gatsby:** Eliminate generator ([#20102](https://github.com/gatsbyjs/gatsby/issues/20102)) ([c3ca41a](https://github.com/gatsbyjs/gatsby/commit/c3ca41a))

## [2.18.12](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.11...gatsby@2.18.12) (2019-12-15)

**Note:** Version bump only for package gatsby

## [2.18.11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.10...gatsby@2.18.11) (2019-12-11)

### Bug Fixes

- **gatsby:** Add early return in link resolver for empty arrays ([#20068](https://github.com/gatsbyjs/gatsby/issues/20068)) ([3e2ad17](https://github.com/gatsbyjs/gatsby/commit/3e2ad17))
- **gatsby:** remove default noscript tag from html.js template ([#20023](https://github.com/gatsbyjs/gatsby/issues/20023)) ([ebdaf6d](https://github.com/gatsbyjs/gatsby/commit/ebdaf6d))

## [2.18.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.8...gatsby@2.18.10) (2019-12-10)

**Note:** Version bump only for package gatsby

## [2.18.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.8...gatsby@2.18.9) (2019-12-10)

**Note:** Version bump only for package gatsby

## [2.18.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.7...gatsby@2.18.8) (2019-12-09)

### Bug Fixes

- **gatsby:** Ensure the number of jest-workers respects GATSBY_CPU_COUNT env var ([#19975](https://github.com/gatsbyjs/gatsby/issues/19975)) ([ce53d81](https://github.com/gatsbyjs/gatsby/commit/ce53d81))

## [2.18.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.6...gatsby@2.18.7) (2019-12-05)

### Bug Fixes

- **gatsby:** support union types for one-to-one \_\_\_NODE relations ([#19916](https://github.com/gatsbyjs/gatsby/issues/19916)) ([44875b8](https://github.com/gatsbyjs/gatsby/commit/44875b8))

### Features

- **gatsby:** add all rules from eslint-plugin-jsx-a11y ([#19946](https://github.com/gatsbyjs/gatsby/issues/19946)) ([000bef3](https://github.com/gatsbyjs/gatsby/commit/000bef3))

## [2.18.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.5...gatsby@2.18.6) (2019-12-02)

### Bug Fixes

- **gatsby:** use correct state in the schema hot reloader ([#19862](https://github.com/gatsbyjs/gatsby/issues/19862)) ([f92cb9c](https://github.com/gatsbyjs/gatsby/commit/f92cb9c))

## [2.18.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.4...gatsby@2.18.5) (2019-11-28)

### Bug Fixes

- **gatsby:** Call cwd() when called instead of on import ([#19800](https://github.com/gatsbyjs/gatsby/issues/19800)) ([451a489](https://github.com/gatsbyjs/gatsby/commit/451a489))
- **gatsby:** do not cause stack overflow over circular refs ([#19802](https://github.com/gatsbyjs/gatsby/issues/19802)) ([89c6b89](https://github.com/gatsbyjs/gatsby/commit/89c6b89)), closes [#11364](https://github.com/gatsbyjs/gatsby/issues/11364)

### Performance Improvements

- **gatsby:** Avoid unnecessary type inference during bootstrap ([#19781](https://github.com/gatsbyjs/gatsby/issues/19781)) ([006ecd8](https://github.com/gatsbyjs/gatsby/commit/006ecd8))

## [2.18.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.3...gatsby@2.18.4) (2019-11-26)

### Bug Fixes

- **gatsby:** Remove relay compiler & use our own ([#19665](https://github.com/gatsbyjs/gatsby/issues/19665)) ([bda9f1f](https://github.com/gatsbyjs/gatsby/commit/bda9f1f))
- update minor updates in packages ([#19776](https://github.com/gatsbyjs/gatsby/issues/19776)) ([559beb2](https://github.com/gatsbyjs/gatsby/commit/559beb2))
- **gatsby:** memoize shadowCreatePagePath to fix performance r… ([#19774](https://github.com/gatsbyjs/gatsby/issues/19774)) ([3043786](https://github.com/gatsbyjs/gatsby/commit/3043786))

## [2.18.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.2...gatsby@2.18.3) (2019-11-25)

**Note:** Version bump only for package gatsby

## [2.18.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.1...gatsby@2.18.2) (2019-11-22)

### Bug Fixes

- **gatsby:** Clean up third party schema customizations to avoid schema rebuilding failure ([#19712](https://github.com/gatsbyjs/gatsby/issues/19712)) ([b703ab1](https://github.com/gatsbyjs/gatsby/commit/b703ab1))
- **gatsby:** Fix createRequireFromPath deprecation warning ([#19677](https://github.com/gatsbyjs/gatsby/issues/19677)) ([78a7858](https://github.com/gatsbyjs/gatsby/commit/78a7858))
- **gatsby:** Improve warning message about implicit child fields ([#19657](https://github.com/gatsbyjs/gatsby/issues/19657)) ([3501267](https://github.com/gatsbyjs/gatsby/commit/3501267))

### Performance Improvements

- **gatsby:** perf problem for match-page search in large sites ([#19691](https://github.com/gatsbyjs/gatsby/issues/19691)) ([58b89fa](https://github.com/gatsbyjs/gatsby/commit/58b89fa)), closes [#19512](https://github.com/gatsbyjs/gatsby/issues/19512)

## [2.18.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.18.0...gatsby@2.18.1) (2019-11-20)

### Bug Fixes

- **gatsby:** don't rerun static queries if text didn't change ([#19616](https://github.com/gatsbyjs/gatsby/issues/19616)) ([824b685](https://github.com/gatsbyjs/gatsby/commit/824b685))
- **gatsby:** Improve discoverPluginsWithoutNodes performance ([#19594](https://github.com/gatsbyjs/gatsby/issues/19594)) ([83f3f0f](https://github.com/gatsbyjs/gatsby/commit/83f3f0f))
- **reporter:** TypeScript definitions for Reporter ([#19189](https://github.com/gatsbyjs/gatsby/issues/19189)) ([02ddd46](https://github.com/gatsbyjs/gatsby/commit/02ddd46)), closes [#19025](https://github.com/gatsbyjs/gatsby/issues/19025)

### Features

- **gatsby:** add plugin data to `gatsby develop` telemetry to… ([#19623](https://github.com/gatsbyjs/gatsby/issues/19623)) ([3c559c9](https://github.com/gatsbyjs/gatsby/commit/3c559c9))
- **gatsby:** Enable shadowing of page template queries ([#17681](https://github.com/gatsbyjs/gatsby/issues/17681)) ([6a82da8](https://github.com/gatsbyjs/gatsby/commit/6a82da8))

# [2.18.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.17...gatsby@2.18.0) (2019-11-19)

### Features

- **gatsby:** Schema rebuilding ([#19092](https://github.com/gatsbyjs/gatsby/issues/19092)) ([e4dae4d](https://github.com/gatsbyjs/gatsby/commit/e4dae4d))

## [2.17.17](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.16...gatsby@2.17.17) (2019-11-18)

### Bug Fixes

- **gatsby:** Handle special characters in windows paths ([#19600](https://github.com/gatsbyjs/gatsby/issues/19600)) ([9929cf0](https://github.com/gatsbyjs/gatsby/commit/9929cf0))
- **gatsby:** Improve perf of stale node detection ([#19599](https://github.com/gatsbyjs/gatsby/issues/19599)) ([2e8f381](https://github.com/gatsbyjs/gatsby/commit/2e8f381))

## [2.17.16](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.15...gatsby@2.17.16) (2019-11-18)

### Bug Fixes

- **gatsby:** Fix filtering on resolvable children ([#19586](https://github.com/gatsbyjs/gatsby/issues/19586)) ([7b500f4](https://github.com/gatsbyjs/gatsby/commit/7b500f4))

## [2.17.15](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.14...gatsby@2.17.15) (2019-11-15)

### Bug Fixes

- **gatsby:** createIndexHtml call missing activity ([#19544](https://github.com/gatsbyjs/gatsby/issues/19544)) ([b2df860](https://github.com/gatsbyjs/gatsby/commit/b2df860))

## [2.17.14](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.13...gatsby@2.17.14) (2019-11-15)

### Bug Fixes

- update dependency babel-plugin-dynamic-import-node to v2 ([#19535](https://github.com/gatsbyjs/gatsby/issues/19535)) ([500ebf6](https://github.com/gatsbyjs/gatsby/commit/500ebf6))
- update dependency convert-hrtime to v3 ([#19530](https://github.com/gatsbyjs/gatsby/issues/19530)) ([1a5ddc5](https://github.com/gatsbyjs/gatsby/commit/1a5ddc5))
- update dependency copyfiles to v2 ([#19531](https://github.com/gatsbyjs/gatsby/issues/19531)) ([1f9a2b5](https://github.com/gatsbyjs/gatsby/commit/1f9a2b5))

## [2.17.13](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.12...gatsby@2.17.13) (2019-11-13)

### Bug Fixes

- **gatsby:** Use crossorigin for link in linkPrefetch strategy ([#17581](https://github.com/gatsbyjs/gatsby/issues/17581)) ([2aac625](https://github.com/gatsbyjs/gatsby/commit/2aac625))

## [2.17.12](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.11...gatsby@2.17.12) (2019-11-13)

### Bug Fixes

- **gatsby:** add / to prefix when stripping prefixes ([#17544](https://github.com/gatsbyjs/gatsby/issues/17544)) ([58fe032](https://github.com/gatsbyjs/gatsby/commit/58fe032))
- **gatsby:** controlled search input component on dev-404-page ([#19168](https://github.com/gatsbyjs/gatsby/issues/19168)) ([d65183b](https://github.com/gatsbyjs/gatsby/commit/d65183b))
- **gatsby:** Ensure inferred types do not conflict with types created via schema customization ([#19338](https://github.com/gatsbyjs/gatsby/issues/19338)) ([3565d5a](https://github.com/gatsbyjs/gatsby/commit/3565d5a))
- **gatsby:** non-latin hash link ([#19376](https://github.com/gatsbyjs/gatsby/issues/19376)) ([8938c95](https://github.com/gatsbyjs/gatsby/commit/8938c95))
- **gatsby:** Re-use plugin resolution logic for theme dir resolution ([#19470](https://github.com/gatsbyjs/gatsby/issues/19470)) ([52be765](https://github.com/gatsbyjs/gatsby/commit/52be765))
- update minor updates in packages ([#19423](https://github.com/gatsbyjs/gatsby/issues/19423)) ([9935376](https://github.com/gatsbyjs/gatsby/commit/9935376))

## [2.17.11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.10...gatsby@2.17.11) (2019-11-10)

**Note:** Version bump only for package gatsby

## [2.17.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.9...gatsby@2.17.10) (2019-11-06)

### Bug Fixes

- **gatsby:** Use CWD to get name if not specified in package.j… ([#19304](https://github.com/gatsbyjs/gatsby/issues/19304)) ([d50ddbc](https://github.com/gatsbyjs/gatsby/commit/d50ddbc))

## [2.17.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.8...gatsby@2.17.9) (2019-11-05)

### Bug Fixes

- **requires-writer:** use `@reach/router` path ranking algorit… ([#19050](https://github.com/gatsbyjs/gatsby/issues/19050)) ([813c191](https://github.com/gatsbyjs/gatsby/commit/813c191))

## [2.17.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.7...gatsby@2.17.8) (2019-11-04)

### Bug Fixes

- **gatsby:** clear cache before refresh ([#19159](https://github.com/gatsbyjs/gatsby/issues/19159)) ([4d5d780](https://github.com/gatsbyjs/gatsby/commit/4d5d780))
- **gatsby:** Fix flatMap import in schema/print.js ([#19208](https://github.com/gatsbyjs/gatsby/issues/19208)) ([0471751](https://github.com/gatsbyjs/gatsby/commit/0471751))
- **webpack-utils:** compact user JS only in production builds ([#19240](https://github.com/gatsbyjs/gatsby/issues/19240)) ([982fd22](https://github.com/gatsbyjs/gatsby/commit/982fd22)), closes [#19128](https://github.com/gatsbyjs/gatsby/issues/19128)

## [2.17.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.6...gatsby@2.17.7) (2019-10-29)

### Bug Fixes

- update minor updates in packages ([#19087](https://github.com/gatsbyjs/gatsby/issues/19087)) ([294a48f](https://github.com/gatsbyjs/gatsby/commit/294a48f))

### Features

- **gatsby:** enable local themes ([#15856](https://github.com/gatsbyjs/gatsby/issues/15856)) ([bd85555](https://github.com/gatsbyjs/gatsby/commit/bd85555))

## [2.17.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.5...gatsby@2.17.6) (2019-10-28)

### Bug Fixes

- update minor updates in packages ([#19086](https://github.com/gatsbyjs/gatsby/issues/19086)) ([54565f0](https://github.com/gatsbyjs/gatsby/commit/54565f0))

## [2.17.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.4...gatsby@2.17.5) (2019-10-28)

### Bug Fixes

- update minor updates in packages ([#19080](https://github.com/gatsbyjs/gatsby/issues/19080)) ([95e908e](https://github.com/gatsbyjs/gatsby/commit/95e908e))
- **gatsby:** Remove internal Node modules in getNonGatsbyCallS… ([#19009](https://github.com/gatsbyjs/gatsby/issues/19009)) ([467aa54](https://github.com/gatsbyjs/gatsby/commit/467aa54))
- update minor updates in packages ([#18875](https://github.com/gatsbyjs/gatsby/issues/18875)) ([b692879](https://github.com/gatsbyjs/gatsby/commit/b692879))

### Features

- **redirects:** allow multiple redirects from same path when they have different options ([#19048](https://github.com/gatsbyjs/gatsby/issues/19048)) ([84f8aea](https://github.com/gatsbyjs/gatsby/commit/84f8aea))

## [2.17.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.3...gatsby@2.17.4) (2019-10-25)

### Bug Fixes

- **gatsby:** fix hashes used in webpack for output ([#18973](https://github.com/gatsbyjs/gatsby/issues/18973)) ([76ac266](https://github.com/gatsbyjs/gatsby/commit/76ac266))

## [2.17.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.2...gatsby@2.17.3) (2019-10-25)

### Bug Fixes

- **gatsby:** Fix matchpath ordering ([#18478](https://github.com/gatsbyjs/gatsby/issues/18478)) ([b8aa333](https://github.com/gatsbyjs/gatsby/commit/b8aa333))

## [2.17.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.1...gatsby@2.17.2) (2019-10-23)

### Bug Fixes

- fix overriding default options of `gatsby-plugin-page-creator` on Windows ([#18828](https://github.com/gatsbyjs/gatsby/issues/18828)) ([fc61f06](https://github.com/gatsbyjs/gatsby/commit/fc61f06))
- **gatsby:** ensure `[@child](https://github.com/child)Of` adds convenience fields before root field arguments ([#18935](https://github.com/gatsbyjs/gatsby/issues/18935)) ([366d915](https://github.com/gatsbyjs/gatsby/commit/366d915))

### Features

- **gatsby:** Ensure status is set to Failed for thrown errors or panicOnBuild in plugins ([#18887](https://github.com/gatsbyjs/gatsby/issues/18887)) ([d7950e1](https://github.com/gatsbyjs/gatsby/commit/d7950e1))

## [2.17.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.0...gatsby@2.17.1) (2019-10-22)

**Note:** Version bump only for package gatsby

# [2.17.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.16.5...gatsby@2.17.0) (2019-10-21)

### Features

- **gatsby:** Move webpackCompilationHash into app-data.json ([#16686](https://github.com/gatsbyjs/gatsby/issues/16686)) ([ebff315](https://github.com/gatsbyjs/gatsby/commit/ebff315))

## [2.16.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.16.4...gatsby@2.16.5) (2019-10-18)

**Note:** Version bump only for package gatsby

## [2.16.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.16.3...gatsby@2.16.4) (2019-10-17)

**Note:** Version bump only for package gatsby

## [2.16.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.16.2...gatsby@2.16.3) (2019-10-15)

### Performance Improvements

- **schema:** speed up and lower memory usage of type inference ([#18008](https://github.com/gatsbyjs/gatsby/issues/18008)) ([e87ac50](https://github.com/gatsbyjs/gatsby/commit/e87ac50))

## [2.16.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.16.1...gatsby@2.16.2) (2019-10-15)

### Bug Fixes

- **gatsby:** create page dependencies from contextual node model methods even if no path is passed ([#18650](https://github.com/gatsbyjs/gatsby/issues/18650)) ([3d38af2](https://github.com/gatsbyjs/gatsby/commit/3d38af2))
- **gatsby:** Extend fields when merging types ([#18500](https://github.com/gatsbyjs/gatsby/issues/18500)) ([302aa26](https://github.com/gatsbyjs/gatsby/commit/302aa26))

## [2.16.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.16.0...gatsby@2.16.1) (2019-10-14)

### Bug Fixes

- **gatsby:** Fix sort for Node 12 ([#18502](https://github.com/gatsbyjs/gatsby/issues/18502)) ([d2869ad](https://github.com/gatsbyjs/gatsby/commit/d2869ad))
- update dependency autoprefixer to ^9.6.5 ([#18598](https://github.com/gatsbyjs/gatsby/issues/18598)) ([1525257](https://github.com/gatsbyjs/gatsby/commit/1525257))
- update dependency core-js to ^2.6.10 ([#18569](https://github.com/gatsbyjs/gatsby/issues/18569)) ([7a20eb7](https://github.com/gatsbyjs/gatsby/commit/7a20eb7))

# [2.16.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.37...gatsby@2.16.0) (2019-10-14)

### Features

- **gatsby:** structured logging ([#14973](https://github.com/gatsbyjs/gatsby/issues/14973)) ([eafb8c6](https://github.com/gatsbyjs/gatsby/commit/eafb8c6))

## [2.15.37](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.36...gatsby@2.15.37) (2019-10-14)

### Bug Fixes

- update dependency webpack to v4.41.1 ([#18504](https://github.com/gatsbyjs/gatsby/issues/18504)) ([a93df04](https://github.com/gatsbyjs/gatsby/commit/a93df04))

## [2.15.36](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.35...gatsby@2.15.36) (2019-10-11)

### Bug Fixes

- **gatsby:** update location state when location.key changes ([#18039](https://github.com/gatsbyjs/gatsby/issues/18039)) ([de3f323](https://github.com/gatsbyjs/gatsby/commit/de3f323))

## [2.15.35](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.34...gatsby@2.15.35) (2019-10-10)

**Note:** Version bump only for package gatsby

## [2.15.34](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.33...gatsby@2.15.34) (2019-10-09)

**Note:** Version bump only for package gatsby

## [2.15.33](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.32...gatsby@2.15.33) (2019-10-08)

**Note:** Version bump only for package gatsby

## [2.15.32](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.31...gatsby@2.15.32) (2019-10-08)

### Bug Fixes

- **gatsby:** In public actions, don't let actionOptions overwr… ([#18302](https://github.com/gatsbyjs/gatsby/issues/18302)) ([014b95e](https://github.com/gatsbyjs/gatsby/commit/014b95e))

## [2.15.31](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.30...gatsby@2.15.31) (2019-10-08)

### Bug Fixes

- update dependency react-hot-loader to ^4.12.15 ([#18295](https://github.com/gatsbyjs/gatsby/issues/18295)) ([7c3e8b3](https://github.com/gatsbyjs/gatsby/commit/7c3e8b3))

## [2.15.30](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.29...gatsby@2.15.30) (2019-10-08)

### Bug Fixes

- update dependency autoprefixer to ^9.6.4 ([#18204](https://github.com/gatsbyjs/gatsby/issues/18204)) ([b31fc56](https://github.com/gatsbyjs/gatsby/commit/b31fc56))
- update dependency eslint-plugin-react to ^7.16.0 ([#18119](https://github.com/gatsbyjs/gatsby/issues/18119)) ([a8144ee](https://github.com/gatsbyjs/gatsby/commit/a8144ee))
- **gatsby:** catch more browser only variable for SSR error ([#18112](https://github.com/gatsbyjs/gatsby/issues/18112)) ([e9ef934](https://github.com/gatsbyjs/gatsby/commit/e9ef934))

## [2.15.29](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.28...gatsby@2.15.29) (2019-10-04)

### Bug Fixes

- update dependency bluebird to ^3.7.0 ([#18029](https://github.com/gatsbyjs/gatsby/issues/18029)) ([bd235a8](https://github.com/gatsbyjs/gatsby/commit/bd235a8))
- update dependency chokidar to v3.2.1 ([#18009](https://github.com/gatsbyjs/gatsby/issues/18009)) ([4df0306](https://github.com/gatsbyjs/gatsby/commit/4df0306))
- update dependency eslint-plugin-react to ^7.15.0 ([#18010](https://github.com/gatsbyjs/gatsby/issues/18010)) ([6a5cd19](https://github.com/gatsbyjs/gatsby/commit/6a5cd19))
- update dependency eslint-plugin-react to ^7.15.1 ([#18031](https://github.com/gatsbyjs/gatsby/issues/18031)) ([8d5597f](https://github.com/gatsbyjs/gatsby/commit/8d5597f))
- update dependency webpack-dev-server to ^3.8.2 ([#18055](https://github.com/gatsbyjs/gatsby/issues/18055)) ([aa540c3](https://github.com/gatsbyjs/gatsby/commit/aa540c3))
- **gatsby:** Fix not materializing concrete fields ([#17942](https://github.com/gatsbyjs/gatsby/issues/17942)) ([8439305](https://github.com/gatsbyjs/gatsby/commit/8439305))

## [2.15.28](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.26...gatsby@2.15.28) (2019-09-26)

### Bug Fixes

- **gatsby:** console output: npm run build -> gatsby build ([#17896](https://github.com/gatsbyjs/gatsby/issues/17896)) ([fbbf406](https://github.com/gatsbyjs/gatsby/commit/fbbf406))

## [2.15.27](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.26...gatsby@2.15.27) (2019-09-26)

### Bug Fixes

- **gatsby:** console output: npm run build -> gatsby build ([#17896](https://github.com/gatsbyjs/gatsby/issues/17896)) ([fbbf406](https://github.com/gatsbyjs/gatsby/commit/fbbf406))

## [2.15.26](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.25...gatsby@2.15.26) (2019-09-25)

**Note:** Version bump only for package gatsby

## [2.15.25](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.24...gatsby@2.15.25) (2019-09-25)

### Bug Fixes

- **gatsby:** don't add undefined ([#17886](https://github.com/gatsbyjs/gatsby/issues/17886)) ([f0cdef0](https://github.com/gatsbyjs/gatsby/commit/f0cdef0))

## [2.15.24](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.23...gatsby@2.15.24) (2019-09-25)

### Bug Fixes

- **query:** improve query performance ([#17682](https://github.com/gatsbyjs/gatsby/issues/17682)) ([a1b1396](https://github.com/gatsbyjs/gatsby/commit/a1b1396))

## [2.15.23](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.22...gatsby@2.15.23) (2019-09-25)

### Bug Fixes

- **gatsby:** remove 404 pagedata logic on client side pages ([#17412](https://github.com/gatsbyjs/gatsby/issues/17412)) ([6c64948](https://github.com/gatsbyjs/gatsby/commit/6c64948))
- update dependency webpack to ~4.41.0 ([#17863](https://github.com/gatsbyjs/gatsby/issues/17863)) ([9c24bca](https://github.com/gatsbyjs/gatsby/commit/9c24bca))
- **gatsby:** prevent unmount wrapPageElement while page-data l… ([#17111](https://github.com/gatsbyjs/gatsby/issues/17111)) ([610b581](https://github.com/gatsbyjs/gatsby/commit/610b581))

### Features

- **gatsby-telemetry:** add exitCode to `BUILD_END` event ([#17847](https://github.com/gatsbyjs/gatsby/issues/17847)) ([6ab4de6](https://github.com/gatsbyjs/gatsby/commit/6ab4de6))

## [2.15.22](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.21...gatsby@2.15.22) (2019-09-24)

### Bug Fixes

- update dependency react-hot-loader to ^4.12.14 ([#17817](https://github.com/gatsbyjs/gatsby/issues/17817)) ([9e9dc3b](https://github.com/gatsbyjs/gatsby/commit/9e9dc3b))

## [2.15.21](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.20...gatsby@2.15.21) (2019-09-23)

### Bug Fixes

- update dependency is-wsl to ^2.1.1 ([#17815](https://github.com/gatsbyjs/gatsby/issues/17815)) ([1287648](https://github.com/gatsbyjs/gatsby/commit/1287648))

## [2.15.20](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.19...gatsby@2.15.20) (2019-09-20)

### Bug Fixes

- **gatsby:** add timeout so fetching API info doesn't fail on very slow connections ([#17735](https://github.com/gatsbyjs/gatsby/issues/17735)) ([e85278c](https://github.com/gatsbyjs/gatsby/commit/e85278c))
- update dependency eslint-plugin-graphql to ^3.1.0 ([#17775](https://github.com/gatsbyjs/gatsby/issues/17775)) ([5f4db21](https://github.com/gatsbyjs/gatsby/commit/5f4db21))
- update dependency socket.io to ^2.3.0 ([#17760](https://github.com/gatsbyjs/gatsby/issues/17760)) ([1ef5053](https://github.com/gatsbyjs/gatsby/commit/1ef5053))

## [2.15.19](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.18...gatsby@2.15.19) (2019-09-20)

### Bug Fixes

- **gatsby:** support `export { X as default }` syntax when checking if page template files have default export ([#17752](https://github.com/gatsbyjs/gatsby/issues/17752)) ([b785583](https://github.com/gatsbyjs/gatsby/commit/b785583))

## [2.15.18](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.17...gatsby@2.15.18) (2019-09-18)

**Note:** Version bump only for package gatsby

## [2.15.17](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.16...gatsby@2.15.17) (2019-09-18)

### Bug Fixes

- update dependency webpack-dev-server to ^3.8.1 ([#17669](https://github.com/gatsbyjs/gatsby/issues/17669)) ([97f328c](https://github.com/gatsbyjs/gatsby/commit/97f328c))

## [2.15.16](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.15...gatsby@2.15.16) (2019-09-16)

### Bug Fixes

- update dependency @babel/parser to ^7.6.0 ([#17620](https://github.com/gatsbyjs/gatsby/issues/17620)) ([2d942ed](https://github.com/gatsbyjs/gatsby/commit/2d942ed))

## [2.15.15](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.14...gatsby@2.15.15) (2019-09-13)

### Bug Fixes

- update dependency react-hot-loader to ^4.12.13 ([#17580](https://github.com/gatsbyjs/gatsby/issues/17580)) ([d43d2be](https://github.com/gatsbyjs/gatsby/commit/d43d2be))
- update minor updates in packages except react, babel and eslint ([#17601](https://github.com/gatsbyjs/gatsby/issues/17601)) ([588cd8f](https://github.com/gatsbyjs/gatsby/commit/588cd8f))

## [2.15.14](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.13...gatsby@2.15.14) (2019-09-10)

**Note:** Version bump only for package gatsby

## [2.15.13](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.12...gatsby@2.15.13) (2019-09-09)

### Bug Fixes

- **gatsby:** fix node internal validation ([#17511](https://github.com/gatsbyjs/gatsby/issues/17511)) ([97a720d](https://github.com/gatsbyjs/gatsby/commit/97a720d))

## [2.15.12](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.11...gatsby@2.15.12) (2019-09-09)

### Bug Fixes

- **gatsby:** move default-site-plugin lower than plugin page-creation ([#17409](https://github.com/gatsbyjs/gatsby/issues/17409)) ([4af8a59](https://github.com/gatsbyjs/gatsby/commit/4af8a59))

## [2.15.11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.10...gatsby@2.15.11) (2019-09-09)

### Bug Fixes

- **gatsby:** Allow overriding options for default instance of gatsby-plugin-page-creator ([#17420](https://github.com/gatsbyjs/gatsby/issues/17420)) ([9bdeda4](https://github.com/gatsbyjs/gatsby/commit/9bdeda4))

## [2.15.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.9...gatsby@2.15.10) (2019-09-09)

### Bug Fixes

- **gatsby:** fix mapping stack trace to source file after dependency upgrade ([#17445](https://github.com/gatsbyjs/gatsby/issues/17445)) ([f38d8c7](https://github.com/gatsbyjs/gatsby/commit/f38d8c7))
- **gatsby:** Handle Windows drive letter casing correctly ([#17492](https://github.com/gatsbyjs/gatsby/issues/17492)) ([beddfb8](https://github.com/gatsbyjs/gatsby/commit/beddfb8))
- **gatsby:** Use concrete type resolver on interface fields ([#17284](https://github.com/gatsbyjs/gatsby/issues/17284)) ([fd72133](https://github.com/gatsbyjs/gatsby/commit/fd72133))

## [2.15.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.8...gatsby@2.15.9) (2019-09-05)

**Note:** Version bump only for package gatsby

## [2.15.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.7...gatsby@2.15.8) (2019-09-05)

### Bug Fixes

- **gatsby:** order matchpaths paths by specificity ([#17411](https://github.com/gatsbyjs/gatsby/issues/17411)) ([2968413](https://github.com/gatsbyjs/gatsby/commit/2968413))

## [2.15.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.6...gatsby@2.15.7) (2019-09-04)

**Note:** Version bump only for package gatsby

## [2.15.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.5...gatsby@2.15.6) (2019-09-04)

### Features

- **gatsby:** enable page-creator on all themes ([#16698](https://github.com/gatsbyjs/gatsby/issues/16698)) ([7398da4](https://github.com/gatsbyjs/gatsby/commit/7398da4))

## [2.15.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.4...gatsby@2.15.5) (2019-09-03)

### Bug Fixes

- update dependency webpack-dev-middleware to ^3.7.1 ([#17343](https://github.com/gatsbyjs/gatsby/issues/17343)) ([a578f4e](https://github.com/gatsbyjs/gatsby/commit/a578f4e))

## [2.15.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.3...gatsby@2.15.4) (2019-09-03)

**Note:** Version bump only for package gatsby

## [2.15.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.2...gatsby@2.15.3) (2019-09-02)

**Note:** Version bump only for package gatsby

## [2.15.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.1...gatsby@2.15.2) (2019-09-01)

### Bug Fixes

- **gatsby:** fix an infinite loop in node child collection ([#17078](https://github.com/gatsbyjs/gatsby/issues/17078)) ([240b4f8](https://github.com/gatsbyjs/gatsby/commit/240b4f8))
- **gatsby-cli:** Open Lan URL if Windows ([#16769](https://github.com/gatsbyjs/gatsby/issues/16769)) ([b2a2d6b](https://github.com/gatsbyjs/gatsby/commit/b2a2d6b))
- update minor updates in packages except react, babel and eslint ([#17254](https://github.com/gatsbyjs/gatsby/issues/17254)) ([252d867](https://github.com/gatsbyjs/gatsby/commit/252d867))

## [2.15.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.0...gatsby@2.15.1) (2019-08-30)

**Note:** Version bump only for package gatsby

# [2.15.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.14.7...gatsby@2.15.0) (2019-08-30)

### Features

- **gatsby:** Materialization ([#16091](https://github.com/gatsbyjs/gatsby/issues/16091)) ([ac10d3d](https://github.com/gatsbyjs/gatsby/commit/ac10d3d))

## [2.14.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.14.6...gatsby@2.14.7) (2019-08-30)

**Note:** Version bump only for package gatsby

## [2.14.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.14.5...gatsby@2.14.6) (2019-08-29)

**Note:** Version bump only for package gatsby

## [2.14.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.14.4...gatsby@2.14.5) (2019-08-29)

### Bug Fixes

- update minor updates in packages except react, babel and eslint ([#17178](https://github.com/gatsbyjs/gatsby/issues/17178)) ([77dad68](https://github.com/gatsbyjs/gatsby/commit/77dad68))

## [2.14.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.14.3...gatsby@2.14.4) (2019-08-29)

### Bug Fixes

- **gatsby:** revert redirects map to array ([#17168](https://github.com/gatsbyjs/gatsby/issues/17168)) ([b553891](https://github.com/gatsbyjs/gatsby/commit/b553891))

## [2.14.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.14.2...gatsby@2.14.3) (2019-08-29)

### Bug Fixes

- update dependency react-hot-loader to ^4.12.12 ([#17103](https://github.com/gatsbyjs/gatsby/issues/17103)) ([41f60b7](https://github.com/gatsbyjs/gatsby/commit/41f60b7))

## [2.14.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.14.1...gatsby@2.14.2) (2019-08-28)

### Bug Fixes

- **gatsby:** Release stdio streams when exiting `gatsby develop` ([#16714](https://github.com/gatsbyjs/gatsby/issues/16714)) ([280cf7f](https://github.com/gatsbyjs/gatsby/commit/280cf7f))

## [2.14.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.14.0...gatsby@2.14.1) (2019-08-28)

**Note:** Version bump only for package gatsby

# [2.14.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.83...gatsby@2.14.0) (2019-08-26)

### Bug Fixes

- update dependency address to v1.1.2 ([#17083](https://github.com/gatsbyjs/gatsby/issues/17083)) ([1f9664a](https://github.com/gatsbyjs/gatsby/commit/1f9664a))

### Features

- **gatsby:** add better splitchunks config ([#17093](https://github.com/gatsbyjs/gatsby/issues/17093)) ([fc93b7b](https://github.com/gatsbyjs/gatsby/commit/fc93b7b))

## [2.13.83](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.82...gatsby@2.13.83) (2019-08-25)

### Bug Fixes

- update dependency babel-eslint to ^10.0.3 ([#17071](https://github.com/gatsbyjs/gatsby/issues/17071)) ([28a7daf](https://github.com/gatsbyjs/gatsby/commit/28a7daf))

## [2.13.82](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.81...gatsby@2.13.82) (2019-08-24)

### Bug Fixes

- update dependency del to v5 ([#17026](https://github.com/gatsbyjs/gatsby/issues/17026)) ([47b2d86](https://github.com/gatsbyjs/gatsby/commit/47b2d86))

## [2.13.81](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.80...gatsby@2.13.81) (2019-08-24)

### Bug Fixes

- update dependency dotenv to v8 ([#17027](https://github.com/gatsbyjs/gatsby/issues/17027)) ([f92295e](https://github.com/gatsbyjs/gatsby/commit/f92295e))
- update dependency fs-extra to v8 ([#17031](https://github.com/gatsbyjs/gatsby/issues/17031)) ([d891a19](https://github.com/gatsbyjs/gatsby/commit/d891a19))
- update dependency is-relative-url to v3 ([#17038](https://github.com/gatsbyjs/gatsby/issues/17038)) ([ff9ae84](https://github.com/gatsbyjs/gatsby/commit/ff9ae84))
- update dependency is-wsl to v2 ([#17039](https://github.com/gatsbyjs/gatsby/issues/17039)) ([bfed424](https://github.com/gatsbyjs/gatsby/commit/bfed424))
- update dependency jest-worker to v24 ([#17040](https://github.com/gatsbyjs/gatsby/issues/17040)) ([bd089a4](https://github.com/gatsbyjs/gatsby/commit/bd089a4))
- update dependency slash to v3 ([#17019](https://github.com/gatsbyjs/gatsby/issues/17019)) ([c81f45c](https://github.com/gatsbyjs/gatsby/commit/c81f45c))

## [2.13.80](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.79...gatsby@2.13.80) (2019-08-23)

### Bug Fixes

- update dependency @gatsbyjs/relay-compiler to v2.0.0-prin… ([#16986](https://github.com/gatsbyjs/gatsby/issues/16986)) ([25f0318](https://github.com/gatsbyjs/gatsby/commit/25f0318))

## [2.13.79](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.78...gatsby@2.13.79) (2019-08-23)

### Bug Fixes

- update dependency chokidar to v3 ([#16975](https://github.com/gatsbyjs/gatsby/issues/16975)) ([816d475](https://github.com/gatsbyjs/gatsby/commit/816d475))

## [2.13.78](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.77...gatsby@2.13.78) (2019-08-23)

### Bug Fixes

- **gatsby:** update check for default exports ([#16979](https://github.com/gatsbyjs/gatsby/issues/16979)) ([d16474d](https://github.com/gatsbyjs/gatsby/commit/d16474d))

## [2.13.77](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.76...gatsby@2.13.77) (2019-08-23)

### Bug Fixes

- update minor updates in packages except react, babel and… ([#16960](https://github.com/gatsbyjs/gatsby/issues/16960)) ([d6bd515](https://github.com/gatsbyjs/gatsby/commit/d6bd515))

## [2.13.76](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.75...gatsby@2.13.76) (2019-08-22)

### Bug Fixes

- update minor updates in packages except react, babel and… ([#16948](https://github.com/gatsbyjs/gatsby/issues/16948)) ([1c34c9b](https://github.com/gatsbyjs/gatsby/commit/1c34c9b))
- **gatsby:** Remove deprecation warning from express-graphql ([#16956](https://github.com/gatsbyjs/gatsby/issues/16956)) ([58ed3ca](https://github.com/gatsbyjs/gatsby/commit/58ed3ca))

## [2.13.75](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.74...gatsby@2.13.75) (2019-08-22)

**Note:** Version bump only for package gatsby

## [2.13.74](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.73...gatsby@2.13.74) (2019-08-21)

### Bug Fixes

- update dependency bluebird to ^3.5.5 ([#16825](https://github.com/gatsbyjs/gatsby/issues/16825)) ([ec0be83](https://github.com/gatsbyjs/gatsby/commit/ec0be83))
- update dependency cache-manager to ^2.10.0 ([#16828](https://github.com/gatsbyjs/gatsby/issues/16828)) ([917a1a7](https://github.com/gatsbyjs/gatsby/commit/917a1a7))
- update dependency chalk to ^2.4.2 ([#16830](https://github.com/gatsbyjs/gatsby/issues/16830)) ([3c89607](https://github.com/gatsbyjs/gatsby/commit/3c89607))
- update dependency common-tags to ^1.8.0 ([#16834](https://github.com/gatsbyjs/gatsby/issues/16834)) ([8ed5197](https://github.com/gatsbyjs/gatsby/commit/8ed5197))
- update dependency core-js to ^2.6.9 ([#16839](https://github.com/gatsbyjs/gatsby/issues/16839)) ([e1860c0](https://github.com/gatsbyjs/gatsby/commit/e1860c0))
- update dependency css-loader to ^1.0.1 ([#16858](https://github.com/gatsbyjs/gatsby/issues/16858)) ([2d3536f](https://github.com/gatsbyjs/gatsby/commit/2d3536f))
- update dependency debug to ^3.2.6 ([#16859](https://github.com/gatsbyjs/gatsby/issues/16859)) ([697f76b](https://github.com/gatsbyjs/gatsby/commit/697f76b))
- update dependency detect-port to ^1.3.0 ([#16860](https://github.com/gatsbyjs/gatsby/issues/16860)) ([d4246d8](https://github.com/gatsbyjs/gatsby/commit/d4246d8))
- update dependency eslint to ^5.16.0 ([#16862](https://github.com/gatsbyjs/gatsby/issues/16862)) ([e3b306c](https://github.com/gatsbyjs/gatsby/commit/e3b306c))
- update dependency eslint-loader to ^2.2.1 ([#16864](https://github.com/gatsbyjs/gatsby/issues/16864)) ([7c7c79c](https://github.com/gatsbyjs/gatsby/commit/7c7c79c))
- update dependency eslint-plugin-flowtype to ^2.50.3 ([#16866](https://github.com/gatsbyjs/gatsby/issues/16866)) ([aeaa141](https://github.com/gatsbyjs/gatsby/commit/aeaa141))
- update dependency eslint-plugin-import to ^2.18.2 ([#16867](https://github.com/gatsbyjs/gatsby/issues/16867)) ([aed2414](https://github.com/gatsbyjs/gatsby/commit/aed2414))
- update dependency eslint-plugin-jsx-a11y to ^6.2.3 ([#16868](https://github.com/gatsbyjs/gatsby/issues/16868)) ([a6a1d4f](https://github.com/gatsbyjs/gatsby/commit/a6a1d4f))
- update dependency eslint-plugin-react to ^7.14.3 ([#16869](https://github.com/gatsbyjs/gatsby/issues/16869)) ([6864ef6](https://github.com/gatsbyjs/gatsby/commit/6864ef6))
- update dependency event-source-polyfill to ^1.0.8 ([#16870](https://github.com/gatsbyjs/gatsby/issues/16870)) ([1430af5](https://github.com/gatsbyjs/gatsby/commit/1430af5))
- **gatsby:** Fix tracing so that everything happens under one span ([#16893](https://github.com/gatsbyjs/gatsby/issues/16893)) ([f8cae16](https://github.com/gatsbyjs/gatsby/commit/f8cae16))
- **gatsby:** Use publicLoader in production-app ([#16800](https://github.com/gatsbyjs/gatsby/issues/16800)) ([4ea8cb1](https://github.com/gatsbyjs/gatsby/commit/4ea8cb1))
- update dependency express to ^4.17.1 ([#16872](https://github.com/gatsbyjs/gatsby/issues/16872)) ([b0ae41e](https://github.com/gatsbyjs/gatsby/commit/b0ae41e))
- update dependency express-graphql to ^0.9.0 ([#16873](https://github.com/gatsbyjs/gatsby/issues/16873)) ([9e16547](https://github.com/gatsbyjs/gatsby/commit/9e16547))
- update dependency flat to ^4.1.0 ([#16875](https://github.com/gatsbyjs/gatsby/issues/16875)) ([19e5b30](https://github.com/gatsbyjs/gatsby/commit/19e5b30))
- update dependency got to v8.3.2 ([#16881](https://github.com/gatsbyjs/gatsby/issues/16881)) ([ac583b1](https://github.com/gatsbyjs/gatsby/commit/ac583b1))
- update dependency graphql-compose to ^6.3.5 ([#16882](https://github.com/gatsbyjs/gatsby/issues/16882)) ([10ec53b](https://github.com/gatsbyjs/gatsby/commit/10ec53b))

### Features

- **gatsby:** Bumps eslint-config-react-app 4.x ([#16168](https://github.com/gatsbyjs/gatsby/issues/16168)) ([1bbce27](https://github.com/gatsbyjs/gatsby/commit/1bbce27))

## [2.13.73](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.72...gatsby@2.13.73) (2019-08-21)

### Bug Fixes

- update dependency babel-plugin-add-module-exports to ^0.3.3([#16810](https://github.com/gatsbyjs/gatsby/issues/16810)) ([6378994](https://github.com/gatsbyjs/gatsby/commit/6378994))
- update dependency better-queue to ^3.8.10 ([#16824](https://github.com/gatsbyjs/gatsby/issues/16824)) ([6834344](https://github.com/gatsbyjs/gatsby/commit/6834344))
- update dependency cache-manager-fs-hash to ^0.0.7 ([#16829](https://github.com/gatsbyjs/gatsby/issues/16829)) ([3ceb6db](https://github.com/gatsbyjs/gatsby/commit/3ceb6db))
- update dependency chokidar to v2.1.6 ([#16832](https://github.com/gatsbyjs/gatsby/issues/16832)) ([dbcf65f](https://github.com/gatsbyjs/gatsby/commit/dbcf65f))
- update dependency compression to ^1.7.4 ([#16836](https://github.com/gatsbyjs/gatsby/issues/16836)) ([2e60499](https://github.com/gatsbyjs/gatsby/commit/2e60499))

## [2.13.72](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.71...gatsby@2.13.72) (2019-08-20)

### Bug Fixes

- update dependency [@hapi](https://github.com/hapi)/joi to ^15.1.1 ([#16796](https://github.com/gatsbyjs/gatsby/issues/16796)) ([2cfc19c](https://github.com/gatsbyjs/gatsby/commit/2cfc19c))
- update dependency [@reach](https://github.com/reach)/router to ^1.2.1 ([#16797](https://github.com/gatsbyjs/gatsby/issues/16797)) ([f3554bc](https://github.com/gatsbyjs/gatsby/commit/f3554bc))
- update dependency address to v1.1.0 ([#16802](https://github.com/gatsbyjs/gatsby/issues/16802)) ([503f1b3](https://github.com/gatsbyjs/gatsby/commit/503f1b3))
- update dependency autoprefixer to ^9.6.1 ([#16807](https://github.com/gatsbyjs/gatsby/issues/16807)) ([780c62a](https://github.com/gatsbyjs/gatsby/commit/780c62a))

## [2.13.71](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.70...gatsby@2.13.71) (2019-08-20)

### Bug Fixes

- **gatsby:** keep all page-data files in public ([#16766](https://github.com/gatsbyjs/gatsby/issues/16766)) ([a573f9f](https://github.com/gatsbyjs/gatsby/commit/a573f9f))

## [2.13.70](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.69...gatsby@2.13.70) (2019-08-20)

### Features

- **gatsby:** Add meta tag for development ([#16743](https://github.com/gatsbyjs/gatsby/issues/16743)) ([d0e24d2](https://github.com/gatsbyjs/gatsby/commit/d0e24d2))

## [2.13.69](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.68...gatsby@2.13.69) (2019-08-20)

### Bug Fixes

- **telemetry:** only look at websocket updates when we have active clients. ([#16750](https://github.com/gatsbyjs/gatsby/issues/16750)) ([164cd5b](https://github.com/gatsbyjs/gatsby/commit/164cd5b))

## [2.13.68](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.67...gatsby@2.13.68) (2019-08-19)

### Bug Fixes

- **gatsby:** remove finally to enable ie11 + firefox support ([#16734](https://github.com/gatsbyjs/gatsby/issues/16734)) ([a4c97e3](https://github.com/gatsbyjs/gatsby/commit/a4c97e3))

### Features

- **gatsby:** Allow specifying type on link extension ([#16680](https://github.com/gatsbyjs/gatsby/issues/16680)) ([f9bbb55](https://github.com/gatsbyjs/gatsby/commit/f9bbb55))

## [2.13.67](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.66...gatsby@2.13.67) (2019-08-16)

**Note:** Version bump only for package gatsby

## [2.13.66](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.65...gatsby@2.13.66) (2019-08-16)

### Bug Fixes

- **gatsby:** don't break if an ancestor directory is inaccessible ([#15876](https://github.com/gatsbyjs/gatsby/issues/15876)) ([cac4246](https://github.com/gatsbyjs/gatsby/commit/cac4246))

## [2.13.65](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.64...gatsby@2.13.65) (2019-08-16)

### Bug Fixes

- **gatsby:** Set default for modulesThatUseGatsby ([#16657](https://github.com/gatsbyjs/gatsby/issues/16657)) ([278ff98](https://github.com/gatsbyjs/gatsby/commit/278ff98))

## [2.13.64](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.63...gatsby@2.13.64) (2019-08-15)

### Bug Fixes

- **gatsby:** adjust regex to handle MODULE_NOT_FOUND errors thrown by Bazel ([#16573](https://github.com/gatsbyjs/gatsby/issues/16573)) ([ee19535](https://github.com/gatsbyjs/gatsby/commit/ee19535))

## [2.13.63](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.62...gatsby@2.13.63) (2019-08-14)

### Bug Fixes

- **gatsby:** Set CORS to \* in serve ([#14483](https://github.com/gatsbyjs/gatsby/issues/14483)) ([74959ab](https://github.com/gatsbyjs/gatsby/commit/74959ab))
- **gatsby:** Use anonymous requests when fetching resources ([#14443](https://github.com/gatsbyjs/gatsby/issues/14443)) ([cdd800f](https://github.com/gatsbyjs/gatsby/commit/cdd800f)), closes [/github.com/gatsbyjs/gatsby/issues/14293#issue-448125073](https://github.com//github.com/gatsbyjs/gatsby/issues/14293/issues/issue-448125073) [#14293](https://github.com/gatsbyjs/gatsby/issues/14293)

## [2.13.62](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.61...gatsby@2.13.62) (2019-08-13)

### Bug Fixes

- **gatsby:** check if navigator.connection is defined ([#16572](https://github.com/gatsbyjs/gatsby/issues/16572)) ([8c54e5b](https://github.com/gatsbyjs/gatsby/commit/8c54e5b))
- **gatsby:** Don't show deprecation warning when adding childr… ([#16559](https://github.com/gatsbyjs/gatsby/issues/16559)) ([5c7a3e1](https://github.com/gatsbyjs/gatsby/commit/5c7a3e1))

## [2.13.61](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.60...gatsby@2.13.61) (2019-08-12)

### Features

- **gatsby-plugin-schema-snapshot:** First version ([#16561](https://github.com/gatsbyjs/gatsby/issues/16561)) ([9dd1070](https://github.com/gatsbyjs/gatsby/commit/9dd1070))

## [2.13.60](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.59...gatsby@2.13.60) (2019-08-12)

### Bug Fixes

- **gatsby:** improve hot-reloading for hooks ([#16546](https://github.com/gatsbyjs/gatsby/issues/16546)) ([8d66161](https://github.com/gatsbyjs/gatsby/commit/8d66161))

## [2.13.59](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.58...gatsby@2.13.59) (2019-08-12)

### Bug Fixes

- **gatsby:** remove page not found for client routes in develop ([#16301](https://github.com/gatsbyjs/gatsby/issues/16301)) ([69b808a](https://github.com/gatsbyjs/gatsby/commit/69b808a))

### Features

- **gatsby:** Allow proxying field values from nested fields ([#16149](https://github.com/gatsbyjs/gatsby/issues/16149)) ([d2128ab](https://github.com/gatsbyjs/gatsby/commit/d2128ab))

## [2.13.58](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.57...gatsby@2.13.58) (2019-08-11)

### Features

- **gatsby:** Display network url for GraphiQL when using -H ([#16530](https://github.com/gatsbyjs/gatsby/issues/16530)) ([44fd333](https://github.com/gatsbyjs/gatsby/commit/44fd333))
- **gatsby:** enable richer error handling for unknown APIs ([#16105](https://github.com/gatsbyjs/gatsby/issues/16105)) ([0adab13](https://github.com/gatsbyjs/gatsby/commit/0adab13))

## [2.13.57](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.56...gatsby@2.13.57) (2019-08-09)

**Note:** Version bump only for package gatsby

## [2.13.56](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.55...gatsby@2.13.56) (2019-08-09)

**Note:** Version bump only for package gatsby

## [2.13.55](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.54...gatsby@2.13.55) (2019-08-09)

### Bug Fixes

- **gatsby:** Make root plural fields non nullable ([#15321](https://github.com/gatsbyjs/gatsby/issues/15321)) ([2c79309](https://github.com/gatsbyjs/gatsby/commit/2c79309))
- **gatsby:** Reserve graphqljs internal directive names ([#16483](https://github.com/gatsbyjs/gatsby/issues/16483)) ([4032012](https://github.com/gatsbyjs/gatsby/commit/4032012))

### Features

- **gatsby:** Allow field extensions to register return types ([#16484](https://github.com/gatsbyjs/gatsby/issues/16484)) ([0df297b](https://github.com/gatsbyjs/gatsby/commit/0df297b))
- **gatsby:** Allow printing type definitions to file (schema lock-down) ([#16291](https://github.com/gatsbyjs/gatsby/issues/16291)) ([23a460a](https://github.com/gatsbyjs/gatsby/commit/23a460a))

## [2.13.54](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.53...gatsby@2.13.54) (2019-08-08)

### Bug Fixes

- **gatsby:** reevaluate page query if context modified via createPage ([#15404](https://github.com/gatsbyjs/gatsby/issues/15404)) ([ddddc68](https://github.com/gatsbyjs/gatsby/commit/ddddc68))

## [2.13.53](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.52...gatsby@2.13.53) (2019-08-08)

### Bug Fixes

- **gatsby-plugin-offline:** Change navigation handler logic ([#13502](https://github.com/gatsbyjs/gatsby/issues/13502)) ([504b077](https://github.com/gatsbyjs/gatsby/commit/504b077))

## [2.13.52](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.51...gatsby@2.13.52) (2019-08-06)

### Bug Fixes

- **gatsby:** Add findMatchPath to the default loader ([#16334](https://github.com/gatsbyjs/gatsby/issues/16334)) ([f6aa41e](https://github.com/gatsbyjs/gatsby/commit/f6aa41e))
- **gatsby:** always use publicLoader for window.\_\_\_loader ([#16122](https://github.com/gatsbyjs/gatsby/issues/16122)) ([afb3485](https://github.com/gatsbyjs/gatsby/commit/afb3485))
- **gatsby:** createSchemaCustomization typings ([#16369](https://github.com/gatsbyjs/gatsby/issues/16369)) ([ac48c51](https://github.com/gatsbyjs/gatsby/commit/ac48c51))

### Features

- **gatsby:** Allow custom resolver context ([#16359](https://github.com/gatsbyjs/gatsby/issues/16359)) ([142b8ff](https://github.com/gatsbyjs/gatsby/commit/142b8ff))

## [2.13.51](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.50...gatsby@2.13.51) (2019-08-05)

### Bug Fixes

- **gatsby:** Don't delete 404 page-data so we don't crash build ([#16354](https://github.com/gatsbyjs/gatsby/issues/16354)) ([a2855b3](https://github.com/gatsbyjs/gatsby/commit/a2855b3))
- **gatsby:** Prefer a user's shouldUpdateScroll over a plugin's ([#16328](https://github.com/gatsbyjs/gatsby/issues/16328)) ([f02f366](https://github.com/gatsbyjs/gatsby/commit/f02f366))

### Features

- **gatsby:** Allow all dateformat options as directive args ([#16335](https://github.com/gatsbyjs/gatsby/issues/16335)) ([1a02b85](https://github.com/gatsbyjs/gatsby/commit/1a02b85))

## [2.13.50](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.48...gatsby@2.13.50) (2019-08-01)

**Note:** Version bump only for package gatsby

## [2.13.48](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.47...gatsby@2.13.48) (2019-08-01)

**Note:** Version bump only for package gatsby

## [2.13.47](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.46...gatsby@2.13.47) (2019-08-01)

### Bug Fixes

- **gatsby:** Handle missing match-paths.json in serve ([#16246](https://github.com/gatsbyjs/gatsby/issues/16246)) ([d54de72](https://github.com/gatsbyjs/gatsby/commit/d54de72))

## [2.13.46](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.45...gatsby@2.13.46) (2019-08-01)

### Bug Fixes

- **gatsby:** Check if callSite exists in stack-trace-utils ([#16257](https://github.com/gatsbyjs/gatsby/issues/16257)) ([4a348b2](https://github.com/gatsbyjs/gatsby/commit/4a348b2))
- **gatsby:** Check if page exists before trying to get page data ([#16220](https://github.com/gatsbyjs/gatsby/issues/16220)) ([065a551](https://github.com/gatsbyjs/gatsby/commit/065a551))
- **gatsby:** Panic when root config is a function ([#16272](https://github.com/gatsbyjs/gatsby/issues/16272)) ([81ff489](https://github.com/gatsbyjs/gatsby/commit/81ff489))
- **gatsby:** use Set instead of Array in page-component state machine ([#15533](https://github.com/gatsbyjs/gatsby/issues/15533)) ([d5d7e5d](https://github.com/gatsbyjs/gatsby/commit/d5d7e5d))

## [2.13.45](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.44...gatsby@2.13.45) (2019-07-30)

### Bug Fixes

- **gatsby:** Add error message for field extension validation ([#16232](https://github.com/gatsbyjs/gatsby/issues/16232)) ([f64a9e0](https://github.com/gatsbyjs/gatsby/commit/f64a9e0))
- **gatsby:** Fix absent parents ([#16228](https://github.com/gatsbyjs/gatsby/issues/16228)) ([5330a21](https://github.com/gatsbyjs/gatsby/commit/5330a21))
- **gatsby:** Fix special case id:eq queries for abstract types ([#16114](https://github.com/gatsbyjs/gatsby/issues/16114)) ([6d8b663](https://github.com/gatsbyjs/gatsby/commit/6d8b663))
- **gatsby:** Respect infer extension in schema update ([#16110](https://github.com/gatsbyjs/gatsby/issues/16110)) ([ce56b9d](https://github.com/gatsbyjs/gatsby/commit/ce56b9d))

## [2.13.44](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.43...gatsby@2.13.44) (2019-07-30)

### Bug Fixes

- **gatsby:** enable babel.config.js once again ([#16205](https://github.com/gatsbyjs/gatsby/issues/16205)) ([d72b6d9](https://github.com/gatsbyjs/gatsby/commit/d72b6d9))
- **gatsby:** run onPrefetchPathname when prefetch is disabled ([#16208](https://github.com/gatsbyjs/gatsby/issues/16208)) ([da859c0](https://github.com/gatsbyjs/gatsby/commit/da859c0))

## [2.13.43](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.42...gatsby@2.13.43) (2019-07-30)

**Note:** Version bump only for package gatsby

## [2.13.42](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.41...gatsby@2.13.42) (2019-07-29)

**Note:** Version bump only for package gatsby

## [2.13.41](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.40...gatsby@2.13.41) (2019-07-25)

**Note:** Version bump only for package gatsby

## [2.13.40](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.39...gatsby@2.13.40) (2019-07-25)

**Note:** Version bump only for package gatsby

## [2.13.39](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.38...gatsby@2.13.39) (2019-07-24)

**Note:** Version bump only for package gatsby

## [2.13.38](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.37...gatsby@2.13.38) (2019-07-23)

### Bug Fixes

- **gatsby:** use joi validation result instead of payload ([#15379](https://github.com/gatsbyjs/gatsby/issues/15379)) ([5856fb7](https://github.com/gatsbyjs/gatsby/commit/5856fb7))

## [2.13.37](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.36...gatsby@2.13.37) (2019-07-23)

**Note:** Version bump only for package gatsby

## [2.13.36](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.35...gatsby@2.13.36) (2019-07-23)

### Features

- **gatsby:** Includes ts/tsx files to eslint rules ([#15976](https://github.com/gatsbyjs/gatsby/issues/15976)) ([6adcb9a](https://github.com/gatsbyjs/gatsby/commit/6adcb9a))

## [2.13.35](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.34...gatsby@2.13.35) (2019-07-23)

**Note:** Version bump only for package gatsby

## [2.13.34](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.33...gatsby@2.13.34) (2019-07-23)

### Bug Fixes

- **gatsby:** add jsdoc for matchPath on page Object ([#15749](https://github.com/gatsbyjs/gatsby/issues/15749)) ([5633fdb](https://github.com/gatsbyjs/gatsby/commit/5633fdb))
- **gatsby:** Add touchNode to populate typeOwners ([#15919](https://github.com/gatsbyjs/gatsby/issues/15919)) ([9d5026f](https://github.com/gatsbyjs/gatsby/commit/9d5026f))

## [2.13.33](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.32...gatsby@2.13.33) (2019-07-22)

### Bug Fixes

- **gatsby:** Use UTC dates in test ([#15895](https://github.com/gatsbyjs/gatsby/issues/15895)) ([6eb1b76](https://github.com/gatsbyjs/gatsby/commit/6eb1b76))

## [2.13.32](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.31...gatsby@2.13.32) (2019-07-20)

**Note:** Version bump only for package gatsby

## [2.13.31](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.30...gatsby@2.13.31) (2019-07-19)

**Note:** Version bump only for package gatsby

## [2.13.30](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.29...gatsby@2.13.30) (2019-07-19)

**Note:** Version bump only for package gatsby

## [2.13.29](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.28...gatsby@2.13.29) (2019-07-19)

**Note:** Version bump only for package gatsby

## [2.13.28](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.27...gatsby@2.13.28) (2019-07-18)

### Bug Fixes

- **gatsby:** 404 page when using path-prefix ([#15858](https://github.com/gatsbyjs/gatsby/issues/15858)) ([51886a3](https://github.com/gatsbyjs/gatsby/commit/51886a3))
- **gatsby:** Make intermediate schema available to createResolvers API ([#15838](https://github.com/gatsbyjs/gatsby/issues/15838)) ([055a1b0](https://github.com/gatsbyjs/gatsby/commit/055a1b0))

### Features

- **gatsby:** Allow explicitly defining parent-child relations with type extensions ([#15715](https://github.com/gatsbyjs/gatsby/issues/15715)) ([696106d](https://github.com/gatsbyjs/gatsby/commit/696106d))

## [2.13.27](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.26...gatsby@2.13.27) (2019-07-17)

### Bug Fixes

- **gatsby:** Hot reload package and theme queries ([#15739](https://github.com/gatsbyjs/gatsby/issues/15739)) ([1685a2b](https://github.com/gatsbyjs/gatsby/commit/1685a2b))
- **gatsby:** Track nodes when mutated ([#15720](https://github.com/gatsbyjs/gatsby/issues/15720)) ([f939f6c](https://github.com/gatsbyjs/gatsby/commit/f939f6c))

## [2.13.26](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.25...gatsby@2.13.26) (2019-07-17)

### Bug Fixes

- **docs:** Don’t include example code in API docs that doesn’t work ([#15803](https://github.com/gatsbyjs/gatsby/issues/15803)) ([044eea5](https://github.com/gatsbyjs/gatsby/commit/044eea5))

### Features

- **gatsby:** pass webhook data to sourceNodes functions ([#15564](https://github.com/gatsbyjs/gatsby/issues/15564)) ([dd130f1](https://github.com/gatsbyjs/gatsby/commit/dd130f1))

## [2.13.25](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.24...gatsby@2.13.25) (2019-07-16)

### Bug Fixes

- **gatsby:** fix matchpath prioritisation ([#15762](https://github.com/gatsbyjs/gatsby/issues/15762)) ([a1ab8bc](https://github.com/gatsbyjs/gatsby/commit/a1ab8bc))

## [2.13.24](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.23...gatsby@2.13.24) (2019-07-16)

### Bug Fixes

- **gatsby:** Fix import on cache-dir/gatsby-browser-entry.js ([#15735](https://github.com/gatsbyjs/gatsby/issues/15735)) ([4b206c3](https://github.com/gatsbyjs/gatsby/commit/4b206c3)), closes [/github.com/gatsbyjs/gatsby/blob/2d27d7d42112fcbeb13cd52fa9fe0d46b1764d13/packages/gatsby/cache-dir/loader.js#L355](https://github.com//github.com/gatsbyjs/gatsby/blob/2d27d7d42112fcbeb13cd52fa9fe0d46b1764d13/packages/gatsby/cache-dir/loader.js/issues/L355)

## [2.13.23](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.22...gatsby@2.13.23) (2019-07-15)

### Features

- **gatsby:** Refine typing on createPage ([#15723](https://github.com/gatsbyjs/gatsby/issues/15723)) ([65d5181](https://github.com/gatsbyjs/gatsby/commit/65d5181))

## [2.13.22](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.21...gatsby@2.13.22) (2019-07-15)

### Bug Fixes

- **gatsby:** Add NodeInput for createNode function types ([#14537](https://github.com/gatsbyjs/gatsby/issues/14537)) ([1b549e8](https://github.com/gatsbyjs/gatsby/commit/1b549e8))

### Features

- **gatsby:** Add nodeInterface extension ([#15545](https://github.com/gatsbyjs/gatsby/issues/15545)) ([8c46237](https://github.com/gatsbyjs/gatsby/commit/8c46237))
- **gatsby:** add prefetchPathname the public api ([#13985](https://github.com/gatsbyjs/gatsby/issues/13985)) ([7173f96](https://github.com/gatsbyjs/gatsby/commit/7173f96))

## [2.13.21](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.20...gatsby@2.13.21) (2019-07-14)

### Features

- **gatsby:** Add enum and scalar type builders ([#15689](https://github.com/gatsbyjs/gatsby/issues/15689)) ([e12d79d](https://github.com/gatsbyjs/gatsby/commit/e12d79d))

## [2.13.20](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.19...gatsby@2.13.20) (2019-07-13)

**Note:** Version bump only for package gatsby

## [2.13.19](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.18...gatsby@2.13.19) (2019-07-12)

**Note:** Version bump only for package gatsby

## [2.13.18](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.17...gatsby@2.13.18) (2019-07-12)

**Note:** Version bump only for package gatsby

## [2.13.17](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.16...gatsby@2.13.17) (2019-07-12)

### Bug Fixes

- **gatsby:** blank dev-404-page when no custom 404 page found ([#15658](https://github.com/gatsbyjs/gatsby/issues/15658)) ([11e86a6](https://github.com/gatsbyjs/gatsby/commit/11e86a6))

## [2.13.16](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.15...gatsby@2.13.16) (2019-07-12)

### Bug Fixes

- **gatsby:** Make createPage action errors structured ([#15619](https://github.com/gatsbyjs/gatsby/issues/15619)) ([44654be](https://github.com/gatsbyjs/gatsby/commit/44654be))
- **svg:** don't try to use convertShapeToPath svgo optim ([#15636](https://github.com/gatsbyjs/gatsby/issues/15636)) ([4db78dc](https://github.com/gatsbyjs/gatsby/commit/4db78dc))

## [2.13.15](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.14...gatsby@2.13.15) (2019-07-11)

### Bug Fixes

- **gatsby:** handle `/404/`, `/404`, `404/` or `404` page paths ([#15615](https://github.com/gatsbyjs/gatsby/issues/15615)) ([482ea8d](https://github.com/gatsbyjs/gatsby/commit/482ea8d))

## [2.13.14](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.13...gatsby@2.13.14) (2019-07-11)

**Note:** Version bump only for package gatsby

## [2.13.13](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.12...gatsby@2.13.13) (2019-07-10)

### Bug Fixes

- don't break joi validation for production bundles webpack… ([#15602](https://github.com/gatsbyjs/gatsby/issues/15602)) ([4c50024](https://github.com/gatsbyjs/gatsby/commit/4c50024))
- don't break joi validation for unhandledRejections & apirunner ([#15600](https://github.com/gatsbyjs/gatsby/issues/15600)) ([14ba538](https://github.com/gatsbyjs/gatsby/commit/14ba538))

## [2.13.12](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.11...gatsby@2.13.12) (2019-07-10)

### Bug Fixes

- **gatsby:** Prefer nodes over inline objects in findRootNodeAncestor ([#14843](https://github.com/gatsbyjs/gatsby/issues/14843)) ([e18acb6](https://github.com/gatsbyjs/gatsby/commit/e18acb6))

### Features

- **gatsby:** Make builtin field extensions wrap resolvers ([#15515](https://github.com/gatsbyjs/gatsby/issues/15515)) ([c2edf6c](https://github.com/gatsbyjs/gatsby/commit/c2edf6c))

## [2.13.11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.10...gatsby@2.13.11) (2019-07-09)

### Bug Fixes

- support unicode paths ([#15552](https://github.com/gatsbyjs/gatsby/issues/15552)) ([f3b9912](https://github.com/gatsbyjs/gatsby/commit/f3b9912))

## [2.13.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.9...gatsby@2.13.10) (2019-07-09)

### Bug Fixes

- **gatsby:** restore client-only-paths behaviour ([#15457](https://github.com/gatsbyjs/gatsby/issues/15457)) ([0ffbe59](https://github.com/gatsbyjs/gatsby/commit/0ffbe59))

## [2.13.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.8...gatsby@2.13.9) (2019-07-08)

### Bug Fixes

- **gatsby:** support for yarn workspaces in gatsby-dependents ([#15517](https://github.com/gatsbyjs/gatsby/issues/15517)) ([3b5e41b](https://github.com/gatsbyjs/gatsby/commit/3b5e41b))

## [2.13.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.7...gatsby@2.13.8) (2019-07-08)

### Bug Fixes

- **gatsby:** speed up and lower memory of createPages ([#15503](https://github.com/gatsbyjs/gatsby/issues/15503)) ([0ffa8bc](https://github.com/gatsbyjs/gatsby/commit/0ffa8bc))

## [2.13.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.6...gatsby@2.13.7) (2019-07-07)

### Bug Fixes

- **gatsby:** bump `react-hot-loader` version to fix regression… ([#15485](https://github.com/gatsbyjs/gatsby/issues/15485)) ([02eaaa4](https://github.com/gatsbyjs/gatsby/commit/02eaaa4))
- **gatsby:** Exclude node_modules when depth > 1 ([#15442](https://github.com/gatsbyjs/gatsby/issues/15442)) ([ba0c3cb](https://github.com/gatsbyjs/gatsby/commit/ba0c3cb))

## [2.13.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.5...gatsby@2.13.6) (2019-07-06)

### Bug Fixes

- **gatsby:** parse pageData response when contentType is not s… ([#15410](https://github.com/gatsbyjs/gatsby/issues/15410)) ([8bf80be](https://github.com/gatsbyjs/gatsby/commit/8bf80be))

## [2.13.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.4...gatsby@2.13.5) (2019-07-06)

### Bug Fixes

- **PnP:** updates the test to account for the property name ch… ([#15463](https://github.com/gatsbyjs/gatsby/issues/15463)) ([f657474](https://github.com/gatsbyjs/gatsby/commit/f657474))

## [2.13.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.3...gatsby@2.13.4) (2019-07-05)

**Note:** Version bump only for package gatsby

## [2.13.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.2...gatsby@2.13.3) (2019-07-03)

### Bug Fixes

- **gatsby:** regression ~ show non structured grapqhl errors ([#15352](https://github.com/gatsbyjs/gatsby/issues/15352)) ([a364c3d](https://github.com/gatsbyjs/gatsby/commit/a364c3d))

## [2.13.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.1...gatsby@2.13.2) (2019-07-03)

### Bug Fixes

- **gatsby:** fix not focusing router wrapper after navigation ([#13197](https://github.com/gatsbyjs/gatsby/issues/13197)) ([b8e2adc](https://github.com/gatsbyjs/gatsby/commit/b8e2adc))

## [2.13.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.12.1...gatsby@2.13.1) (2019-07-02)

### Bug Fixes

- **gatsby:** Default to empty arrays in load-themes ([#15331](https://github.com/gatsbyjs/gatsby/issues/15331)) ([6366914](https://github.com/gatsbyjs/gatsby/commit/6366914))

### Features

- **gatsby:** Make \_\_experimentalThemes part of plugin APIs ([#15144](https://github.com/gatsbyjs/gatsby/issues/15144)) ([3dce8cb](https://github.com/gatsbyjs/gatsby/commit/3dce8cb))

## [2.12.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.12.1...gatsby@2.12.2) (2019-07-02)

### Bug Fixes

- **gatsby:** Default to empty arrays in load-themes ([#15331](https://github.com/gatsbyjs/gatsby/issues/15331)) ([6366914](https://github.com/gatsbyjs/gatsby/commit/6366914))

### Features

- **gatsby:** Make \_\_experimentalThemes part of plugin APIs ([#15144](https://github.com/gatsbyjs/gatsby/issues/15144)) ([3dce8cb](https://github.com/gatsbyjs/gatsby/commit/3dce8cb))

## [2.12.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.12.0...gatsby@2.12.1) (2019-07-02)

### Bug Fixes

- **gatsby:** adds the missing micromatch dependency ([#15310](https://github.com/gatsbyjs/gatsby/issues/15310)) ([5f66f21](https://github.com/gatsbyjs/gatsby/commit/5f66f21))
- **gatsby:** Exclude gatsby itself in gatsby-dependents ([#15318](https://github.com/gatsbyjs/gatsby/issues/15318)) ([25cd90e](https://github.com/gatsbyjs/gatsby/commit/25cd90e))
- **gatsby:** various TypeScript definitions ([#15268](https://github.com/gatsbyjs/gatsby/issues/15268)) ([b8f3ed5](https://github.com/gatsbyjs/gatsby/commit/b8f3ed5))
- **themes:** normalize plugin entries before merging plugin ar… ([#15307](https://github.com/gatsbyjs/gatsby/issues/15307)) ([300d331](https://github.com/gatsbyjs/gatsby/commit/300d331))

### Features

- **gatsby:** enable babel in deps ([#15284](https://github.com/gatsbyjs/gatsby/issues/15284)) ([4ea3fa1](https://github.com/gatsbyjs/gatsby/commit/4ea3fa1))
- **gatsby:** Refine typing on createPages’ graphql function ([#14575](https://github.com/gatsbyjs/gatsby/issues/14575)) ([5bedc01](https://github.com/gatsbyjs/gatsby/commit/5bedc01))
- **gatsby:** support symlinked directories ([#15295](https://github.com/gatsbyjs/gatsby/issues/15295)) ([54b417f](https://github.com/gatsbyjs/gatsby/commit/54b417f))
- **gatsby:** Switch to name based package filtering for speed ([#15308](https://github.com/gatsbyjs/gatsby/issues/15308)) ([b79e96a](https://github.com/gatsbyjs/gatsby/commit/b79e96a))

# [2.12.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.11.8...gatsby@2.12.0) (2019-07-02)

### Features

- **gatsby:** Allow adding custom field extensions ([#14610](https://github.com/gatsbyjs/gatsby/issues/14610)) ([4f9c790](https://github.com/gatsbyjs/gatsby/commit/4f9c790))

## [2.11.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.11.7...gatsby@2.11.8) (2019-07-02)

### Bug Fixes

- enable separate config for node_modules transpilation ([#15270](https://github.com/gatsbyjs/gatsby/issues/15270)) ([7e39a12](https://github.com/gatsbyjs/gatsby/commit/7e39a12))

### Features

- **gatsby:** Add gatsby-dependents util ([#15269](https://github.com/gatsbyjs/gatsby/issues/15269)) ([f55250e](https://github.com/gatsbyjs/gatsby/commit/f55250e))
- **gatsby:** Handle duplicated fragment definitions ([#15179](https://github.com/gatsbyjs/gatsby/issues/15179)) ([a92f6e1](https://github.com/gatsbyjs/gatsby/commit/a92f6e1))

## [2.11.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.11.6...gatsby@2.11.7) (2019-07-01)

### Bug Fixes

- **gatsby:** update tsc definition for some actions ([1adb7d5](https://github.com/gatsbyjs/gatsby/commit/1adb7d5))

## [2.11.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.11.5...gatsby@2.11.6) (2019-06-30)

### Bug Fixes

- pin terser-webpack-plugin ([#15253](https://github.com/gatsbyjs/gatsby/issues/15253)) ([62cdce2](https://github.com/gatsbyjs/gatsby/commit/62cdce2))

## [2.11.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.11.4...gatsby@2.11.5) (2019-06-29)

**Note:** Version bump only for package gatsby

## [2.11.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.11.3...gatsby@2.11.4) (2019-06-29)

**Note:** Version bump only for package gatsby

## [2.11.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.11.2...gatsby@2.11.3) (2019-06-28)

**Note:** Version bump only for package gatsby

## [2.11.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.11.1...gatsby@2.11.2) (2019-06-28)

### Features

- **gatsby-cli:** Add error codes and structured errors ([#14904](https://github.com/gatsbyjs/gatsby/issues/14904)) ([d26651e](https://github.com/gatsbyjs/gatsby/commit/d26651e))

## [2.11.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.11.0...gatsby@2.11.1) (2019-06-28)

### Features

- **gatsby:** Rewrite resource loading - retry mechanism ([#14889](https://github.com/gatsbyjs/gatsby/issues/14889)) ([68e15e7](https://github.com/gatsbyjs/gatsby/commit/68e15e7))

# [2.11.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.10.5...gatsby@2.11.0) (2019-06-27)

### Bug Fixes

- **gatsby:** update tsc definition of cache in NodePluginArgs ([#14955](https://github.com/gatsbyjs/gatsby/issues/14955)) ([65b42e9](https://github.com/gatsbyjs/gatsby/commit/65b42e9))

### Features

- **gatsby:** enable babel-loader for all dependencies ([#14111](https://github.com/gatsbyjs/gatsby/issues/14111)) ([268ed27](https://github.com/gatsbyjs/gatsby/commit/268ed27))
- **gatsby:** Support absolute certificate paths for developme… ([#14932](https://github.com/gatsbyjs/gatsby/issues/14932)) ([7694c0c](https://github.com/gatsbyjs/gatsby/commit/7694c0c))

## [2.10.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.10.4...gatsby@2.10.5) (2019-06-25)

**Note:** Version bump only for package gatsby

## [2.10.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.10.3...gatsby@2.10.4) (2019-06-24)

### Bug Fixes

- **gatsby:** Fix client side routing match paths regression ([#15010](https://github.com/gatsbyjs/gatsby/issues/15010)) ([f52bbac](https://github.com/gatsbyjs/gatsby/commit/f52bbac))

## [2.10.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.10.2...gatsby@2.10.3) (2019-06-24)

**Note:** Version bump only for package gatsby

## [2.10.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.10.1...gatsby@2.10.2) (2019-06-24)

**Note:** Version bump only for package gatsby

## [2.10.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.10.0...gatsby@2.10.1) (2019-06-24)

**Note:** Version bump only for package gatsby

# [2.10.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.9.11...gatsby@2.10.0) (2019-06-20)

**Note:** Version bump only for package gatsby

## [2.9.11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.9.10...gatsby@2.9.11) (2019-06-19)

### Bug Fixes

- **gatsby:** Normalize paths for run queries before caching ([#14910](https://github.com/gatsbyjs/gatsby/issues/14910)) ([f03bf5c](https://github.com/gatsbyjs/gatsby/commit/f03bf5c)), closes [#14903](https://github.com/gatsbyjs/gatsby/issues/14903)

## [2.9.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.9.9...gatsby@2.9.10) (2019-06-19)

**Note:** Version bump only for package gatsby

## [2.9.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.9.6...gatsby@2.9.9) (2019-06-19)

**Note:** Version bump only for package gatsby

## [2.9.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.9.7...gatsby@2.9.8) (2019-06-19)

**Note:** Version bump only for package gatsby

## [2.9.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.9.6...gatsby@2.9.7) (2019-06-18)

**Note:** Version bump only for package gatsby

## [2.9.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.9.5...gatsby@2.9.6) (2019-06-18)

**Note:** Version bump only for package gatsby

## [2.9.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.9.4...gatsby@2.9.5) (2019-06-18)

**Note:** Version bump only for package gatsby

## [2.9.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.9.2...gatsby@2.9.4) (2019-06-14)

### Bug Fixes

- **gatsby:** Move importing of match-paths.json outside of loader.js ([#14732](https://github.com/gatsbyjs/gatsby/issues/14732)) ([672e384](https://github.com/gatsbyjs/gatsby/commit/672e384))

## [2.9.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.9.2...gatsby@2.9.3) (2019-06-14)

### Bug Fixes

- **gatsby:** Move importing of match-paths.json outside of loader.js ([#14732](https://github.com/gatsbyjs/gatsby/issues/14732)) ([672e384](https://github.com/gatsbyjs/gatsby/commit/672e384))

## [2.9.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.9.0...gatsby@2.9.2) (2019-06-12)

### Bug Fixes

- **gatsby:** Fix group and distinct when used with fragments ([#14728](https://github.com/gatsbyjs/gatsby/issues/14728)) ([3a15873](https://github.com/gatsbyjs/gatsby/commit/3a15873))
- **gatsby:** Make createPageDependency public again ([#14679](https://github.com/gatsbyjs/gatsby/issues/14679)) ([9ff3ba7](https://github.com/gatsbyjs/gatsby/commit/9ff3ba7))

## [2.9.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.9.0...gatsby@2.9.1) (2019-06-12)

**Note:** Version bump only for package gatsby

# [2.9.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.8.8...gatsby@2.9.0) (2019-06-11)

**Note:** Version bump only for package gatsby

## [2.8.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.8.7...gatsby@2.8.8) (2019-06-10)

### Bug Fixes

- **react-hooks-support:** Changed the gatsby browser entry to not bre… ([#13184](https://github.com/gatsbyjs/gatsby/issues/13184)) ([f311698](https://github.com/gatsbyjs/gatsby/commit/f311698))

## [2.8.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.8.6...gatsby@2.8.7) (2019-06-10)

### Bug Fixes

- **gatsby:** Resolve group and distinct field ([#14625](https://github.com/gatsbyjs/gatsby/issues/14625)) ([0c3cba1](https://github.com/gatsbyjs/gatsby/commit/0c3cba1))

## [2.8.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.8.5...gatsby@2.8.6) (2019-06-07)

### Bug Fixes

- **gatsby:** respect the GATSBY_CPU_COUNT env var, if set, by default for sharp ([#14624](https://github.com/gatsbyjs/gatsby/issues/14624)) ([a812c5f](https://github.com/gatsbyjs/gatsby/commit/a812c5f))

## [2.8.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.8.4...gatsby@2.8.5) (2019-06-05)

**Note:** Version bump only for package gatsby

## [2.8.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.8.3...gatsby@2.8.4) (2019-06-05)

### Bug Fixes

- **themes:** Upgrade Tapable Calls ([#14552](https://github.com/gatsbyjs/gatsby/issues/14552)) ([9359098](https://github.com/gatsbyjs/gatsby/commit/9359098))

## [2.8.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.8.2...gatsby@2.8.3) (2019-06-04)

### Bug Fixes

- **gatsby:** autoprefixer browsers option warning ([#14533](https://github.com/gatsbyjs/gatsby/issues/14533)) ([cb09e78](https://github.com/gatsbyjs/gatsby/commit/cb09e78))

## [2.8.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.8.1...gatsby@2.8.2) (2019-05-31)

**Note:** Version bump only for package gatsby

## [2.8.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.8.0...gatsby@2.8.1) (2019-05-31)

**Note:** Version bump only for package gatsby

# [2.8.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.7.6...gatsby@2.8.0) (2019-05-31)

### Features

- **gatsby:** Allow sorting resolved fields ([#14423](https://github.com/gatsbyjs/gatsby/issues/14423)) ([461439a](https://github.com/gatsbyjs/gatsby/commit/461439a))

## [2.7.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.7.5...gatsby@2.7.6) (2019-05-31)

### Bug Fixes

- **gatsby:** Find identifiers only in the first argument when extracting queries from useStaticQuery ([#14362](https://github.com/gatsbyjs/gatsby/issues/14362)) ([524817a](https://github.com/gatsbyjs/gatsby/commit/524817a)), closes [#14345](https://github.com/gatsbyjs/gatsby/issues/14345)
- **schema:** Handle types wrapped in js array in createResolvers ([#14422](https://github.com/gatsbyjs/gatsby/issues/14422)) ([56647bc](https://github.com/gatsbyjs/gatsby/commit/56647bc))

## [2.7.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.7.4...gatsby@2.7.5) (2019-05-29)

**Note:** Version bump only for package gatsby

## [2.7.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.7.3...gatsby@2.7.4) (2019-05-29)

### Features

- **gatsby:** Add `ogv` support to webpack media rule ([#14365](https://github.com/gatsbyjs/gatsby/issues/14365)) ([6070279](https://github.com/gatsbyjs/gatsby/commit/6070279))

## [2.7.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.7.2...gatsby@2.7.3) (2019-05-27)

### Features

- **gatsby:** use graphiql-explorer ([#14280](https://github.com/gatsbyjs/gatsby/issues/14280)) ([3863f24](https://github.com/gatsbyjs/gatsby/commit/3863f24))

## [2.7.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.7.1...gatsby@2.7.2) (2019-05-27)

### Bug Fixes

- **gatsby:** send all responses from the proxy API to the client ([#14329](https://github.com/gatsbyjs/gatsby/issues/14329)) ([17b6ea0](https://github.com/gatsbyjs/gatsby/commit/17b6ea0))

## [2.7.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.7.0...gatsby@2.7.1) (2019-05-23)

### Bug Fixes

- **gatsby:** fix `gatsby develop` with Yarn PnP ([#14261](https://github.com/gatsbyjs/gatsby/issues/14261)) ([2870dfb](https://github.com/gatsbyjs/gatsby/commit/2870dfb))

# [2.7.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.6.4...gatsby@2.7.0) (2019-05-23)

### Features

- **schema:** Merge user-defined types with plugin-defined types ([#14116](https://github.com/gatsbyjs/gatsby/issues/14116)) ([321ae05](https://github.com/gatsbyjs/gatsby/commit/321ae05))

## [2.6.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.6.3...gatsby@2.6.4) (2019-05-23)

### Bug Fixes

- **gatsby:** improve `externals` webpack configuration to better support yarn PnP ([#14208](https://github.com/gatsbyjs/gatsby/issues/14208)) ([e47ed89](https://github.com/gatsbyjs/gatsby/commit/e47ed89))

## [2.6.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.6.2...gatsby@2.6.3) (2019-05-22)

### Bug Fixes

- **docs:** Updating Docs so CommonJS syntax with wrapPageElement works ([#14235](https://github.com/gatsbyjs/gatsby/issues/14235)) ([4f53fd5](https://github.com/gatsbyjs/gatsby/commit/4f53fd5))

## [2.6.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.6.1...gatsby@2.6.2) (2019-05-22)

**Note:** Version bump only for package gatsby

## [2.6.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.6.0...gatsby@2.6.1) (2019-05-22)

**Note:** Version bump only for package gatsby

# [2.6.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.5.7...gatsby@2.6.0) (2019-05-21)

**Note:** Version bump only for package gatsby

## [2.5.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.5.6...gatsby@2.5.7) (2019-05-20)

### Bug Fixes

- **themes:** package names don't have to match filesystem ([#14149](https://github.com/gatsbyjs/gatsby/issues/14149)) ([e4b27b3](https://github.com/gatsbyjs/gatsby/commit/e4b27b3)), closes [#14134](https://github.com/gatsbyjs/gatsby/issues/14134)

## [2.5.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.5.5...gatsby@2.5.6) (2019-05-20)

### Bug Fixes

- **develop:** fix "Unexpected token < in JSON at position 0" after restarting development server ([#14166](https://github.com/gatsbyjs/gatsby/issues/14166)) ([c63dbb8](https://github.com/gatsbyjs/gatsby/commit/c63dbb8))
- **gatsby:** Fix ordering for node links when search field isn't id ([#14176](https://github.com/gatsbyjs/gatsby/issues/14176)) ([eeb1f8c](https://github.com/gatsbyjs/gatsby/commit/eeb1f8c))

## [2.5.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.5.4...gatsby@2.5.5) (2019-05-18)

**Note:** Version bump only for package gatsby

## [2.5.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.5.3...gatsby@2.5.4) (2019-05-18)

### Features

- **gatsby-source-contentful:** add options validation and more detailed error messages ([#9231](https://github.com/gatsbyjs/gatsby/issues/9231)) ([68cb1a5](https://github.com/gatsbyjs/gatsby/commit/68cb1a5))

## [2.5.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.5.2...gatsby@2.5.3) (2019-05-17)

### Bug Fixes

- **gatsby:** include includePrerelease in semver.satisfies check ([#14118](https://github.com/gatsbyjs/gatsby/issues/14118)) ([20c2169](https://github.com/gatsbyjs/gatsby/commit/20c2169))

## [2.5.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.5.1...gatsby@2.5.2) (2019-05-17)

### Bug Fixes

- **gatsby:** fix hot-reloading for hooks (patch hmr) ([#13713](https://github.com/gatsbyjs/gatsby/issues/13713)) ([117fbb4](https://github.com/gatsbyjs/gatsby/commit/117fbb4))

## [2.5.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.5.0...gatsby@2.5.1) (2019-05-17)

### Bug Fixes

- **schema:** Fix proxying invalid field names ([#14108](https://github.com/gatsbyjs/gatsby/issues/14108)) ([6d297c5](https://github.com/gatsbyjs/gatsby/commit/6d297c5))

# [2.5.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.4.7...gatsby@2.5.0) (2019-05-16)

### Features

- **schema:** Inference controls and improvements ([#13028](https://github.com/gatsbyjs/gatsby/issues/13028)) ([0f8febf](https://github.com/gatsbyjs/gatsby/commit/0f8febf))

## [2.4.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.4.6...gatsby@2.4.7) (2019-05-16)

### Features

- **gatsby:** cors is enabled correctly in development ([#14065](https://github.com/gatsbyjs/gatsby/issues/14065)) ([32e49ce](https://github.com/gatsbyjs/gatsby/commit/32e49ce))

## [2.4.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.4.5...gatsby@2.4.6) (2019-05-15)

### Bug Fixes

- **gatsby:** compile themes through default webpack config ([#13651](https://github.com/gatsbyjs/gatsby/issues/13651)) ([d5be306](https://github.com/gatsbyjs/gatsby/commit/d5be306))

## [2.4.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.4.4...gatsby@2.4.5) (2019-05-14)

### Features

- **gatsby:** allow awaiting API run triggered by createNode action ([#12748](https://github.com/gatsbyjs/gatsby/issues/12748)) ([17a67a5](https://github.com/gatsbyjs/gatsby/commit/17a67a5))

## [2.4.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.4.3...gatsby@2.4.4) (2019-05-14)

**Note:** Version bump only for package gatsby

## [2.4.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.4.2...gatsby@2.4.3) (2019-05-09)

**Note:** Version bump only for package gatsby

## [2.4.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.4.1...gatsby@2.4.2) (2019-05-03)

**Note:** Version bump only for package gatsby

## [2.4.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.4.0...gatsby@2.4.1) (2019-05-03)

**Note:** Version bump only for package gatsby

# [2.4.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.36...gatsby@2.4.0) (2019-05-02)

### Features

- **gatsby:** add assetPrefix to support deploying assets separate from html ([#12128](https://github.com/gatsbyjs/gatsby/issues/12128)) ([8291044](https://github.com/gatsbyjs/gatsby/commit/8291044))

## [2.3.36](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.35...gatsby@2.3.36) (2019-05-02)

### Bug Fixes

- **types:** node APIs typings should be in GatsbyNode interface not in Node ([#13799](https://github.com/gatsbyjs/gatsby/issues/13799)) ([cbdb039](https://github.com/gatsbyjs/gatsby/commit/cbdb039))

## [2.3.35](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.34...gatsby@2.3.35) (2019-05-01)

### Bug Fixes

- **types:** update TypeScript declarations ([#13755](https://github.com/gatsbyjs/gatsby/issues/13755)) ([b41755b](https://github.com/gatsbyjs/gatsby/commit/b41755b))

## [2.3.34](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.33...gatsby@2.3.34) (2019-04-30)

**Note:** Version bump only for package gatsby

## [2.3.33](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.32...gatsby@2.3.33) (2019-04-29)

### Bug Fixes

- **gatsby:** development proxy should proceed request headers and method ([#13685](https://github.com/gatsbyjs/gatsby/issues/13685)) ([842d9ce](https://github.com/gatsbyjs/gatsby/commit/842d9ce))
- **typo:** fix typos in error message ([#13683](https://github.com/gatsbyjs/gatsby/issues/13683)) ([f472a08](https://github.com/gatsbyjs/gatsby/commit/f472a08))

## [2.3.32](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.31...gatsby@2.3.32) (2019-04-27)

**Note:** Version bump only for package gatsby

## [2.3.31](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.30...gatsby@2.3.31) (2019-04-25)

### Bug Fixes

- **gatsby:** fixes react-hot-reloader for new react features ([#13610](https://github.com/gatsbyjs/gatsby/issues/13610)) ([213da5a](https://github.com/gatsbyjs/gatsby/commit/213da5a))

## [2.3.30](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.29...gatsby@2.3.30) (2019-04-25)

### Features

- **gatsby:** Add details to pagination info ([#13625](https://github.com/gatsbyjs/gatsby/issues/13625)) ([f115994](https://github.com/gatsbyjs/gatsby/commit/f115994))

## [2.3.29](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.28...gatsby@2.3.29) (2019-04-24)

**Note:** Version bump only for package gatsby

## [2.3.28](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.27...gatsby@2.3.28) (2019-04-24)

### Bug Fixes

- Add fallback for createContentDigest ([#13584](https://github.com/gatsbyjs/gatsby/issues/13584)) ([093f1f2](https://github.com/gatsbyjs/gatsby/commit/093f1f2))

## [2.3.27](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.26...gatsby@2.3.27) (2019-04-23)

**Note:** Version bump only for package gatsby

## [2.3.26](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.25...gatsby@2.3.26) (2019-04-23)

### Bug Fixes

- **docs:** Fix typo in Gatsby Browser APIs ([#13527](https://github.com/gatsbyjs/gatsby/issues/13527)) ([a60a909](https://github.com/gatsbyjs/gatsby/commit/a60a909))
- raise Unexpected Errors in resolve-module-exports ([#13476](https://github.com/gatsbyjs/gatsby/issues/13476)) ([805a1dd](https://github.com/gatsbyjs/gatsby/commit/805a1dd))
- **gatsby:** respect node type owner in deleteNode ([#13492](https://github.com/gatsbyjs/gatsby/issues/13492)) ([dffb74e](https://github.com/gatsbyjs/gatsby/commit/dffb74e))
- **gatsby:** Set fixed precision for "bootstrap finished" timer ([#13528](https://github.com/gatsbyjs/gatsby/issues/13528)) ([74a60af](https://github.com/gatsbyjs/gatsby/commit/74a60af))

## [2.3.25](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.24...gatsby@2.3.25) (2019-04-18)

**Note:** Version bump only for package gatsby

## [2.3.24](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.23...gatsby@2.3.24) (2019-04-17)

### Bug Fixes

- Handle links to array of array of File nodes ([#13295](https://github.com/gatsbyjs/gatsby/issues/13295)) ([ed74ec0](https://github.com/gatsbyjs/gatsby/commit/ed74ec0)), closes [#13272](https://github.com/gatsbyjs/gatsby/issues/13272)

## [2.3.23](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.22...gatsby@2.3.23) (2019-04-15)

### Bug Fixes

- pageInfo.totalCount should be total number of results ([#13352](https://github.com/gatsbyjs/gatsby/issues/13352)) ([f77b053](https://github.com/gatsbyjs/gatsby/commit/f77b053)), closes [#13342](https://github.com/gatsbyjs/gatsby/issues/13342)
- Pin graphql-compose version ([#13356](https://github.com/gatsbyjs/gatsby/issues/13356)) ([7a34c6d](https://github.com/gatsbyjs/gatsby/commit/7a34c6d))
- **cpu-core-count:** fallback to generic Node.JS method if system specific call fails ([#13294](https://github.com/gatsbyjs/gatsby/issues/13294)) ([857e9e3](https://github.com/gatsbyjs/gatsby/commit/857e9e3)), closes [#12734](https://github.com/gatsbyjs/gatsby/issues/12734)
- **gatsby:** bail early if pageResources are not available in public pageRenderer ([#13113](https://github.com/gatsbyjs/gatsby/issues/13113)) ([da1d5a6](https://github.com/gatsbyjs/gatsby/commit/da1d5a6))

### Features

- pathname in SSR APIs when in develop ([#12995](https://github.com/gatsbyjs/gatsby/issues/12995)) ([077a9c8](https://github.com/gatsbyjs/gatsby/commit/077a9c8))

## [2.3.22](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.21...gatsby@2.3.22) (2019-04-12)

### Bug Fixes

- **gatsby:** fix NODE_ENV & GATSBY_ACTIVE_ENV in webpack ([#13314](https://github.com/gatsbyjs/gatsby/issues/13314)) ([21db36f](https://github.com/gatsbyjs/gatsby/commit/21db36f))
- **themes:** Include user's site in the list of potential shadowFiles ([#13323](https://github.com/gatsbyjs/gatsby/issues/13323)) ([116cb48](https://github.com/gatsbyjs/gatsby/commit/116cb48))

## [2.3.21](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.20...gatsby@2.3.21) (2019-04-12)

### Bug Fixes

- **themes:** Restrict the paths that count as shadowable for an issuer ([#12930](https://github.com/gatsbyjs/gatsby/issues/12930)) ([e040947](https://github.com/gatsbyjs/gatsby/commit/e040947))

## [2.3.20](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.19...gatsby@2.3.20) (2019-04-11)

### Features

- **gatsby:** use V8.serialize instead of JSON.stringify if available ([#10732](https://github.com/gatsbyjs/gatsby/issues/10732)) ([c043816](https://github.com/gatsbyjs/gatsby/commit/c043816))

## [2.3.19](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.18...gatsby@2.3.19) (2019-04-11)

### Bug Fixes

- Get parent not root File node in resolver ([#13289](https://github.com/gatsbyjs/gatsby/issues/13289)) ([8031fcf](https://github.com/gatsbyjs/gatsby/commit/8031fcf)), closes [#13267](https://github.com/gatsbyjs/gatsby/issues/13267) [#13267](https://github.com/gatsbyjs/gatsby/issues/13267)

## [2.3.18](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.17...gatsby@2.3.18) (2019-04-11)

**Note:** Version bump only for package gatsby

## [2.3.17](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.16...gatsby@2.3.17) (2019-04-10)

**Note:** Version bump only for package gatsby

## [2.3.16](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.15...gatsby@2.3.16) (2019-04-09)

### Features

- **gatsby:** Add normalization for pathPrefix, siteUrl, etc ([#12139](https://github.com/gatsbyjs/gatsby/issues/12139)) ([1e74779](https://github.com/gatsbyjs/gatsby/commit/1e74779)), closes [#11871](https://github.com/gatsbyjs/gatsby/issues/11871) [#11871](https://github.com/gatsbyjs/gatsby/issues/11871)

## [2.3.15](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.14...gatsby@2.3.15) (2019-04-08)

### Bug Fixes

- **gatsby:** move db.startAutosave after bootstrap in `gatsby develop` ([#13180](https://github.com/gatsbyjs/gatsby/issues/13180)) ([530e087](https://github.com/gatsbyjs/gatsby/commit/530e087))

## [2.3.14](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.13...gatsby@2.3.14) (2019-04-05)

**Note:** Version bump only for package gatsby

## [2.3.13](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.12...gatsby@2.3.13) (2019-04-04)

### Features

- **gatsby:** add DANGEROUSLY_DISABLE_OOM ([#13066](https://github.com/gatsbyjs/gatsby/issues/13066)) ([800b8d7](https://github.com/gatsbyjs/gatsby/commit/800b8d7))

## [2.3.12](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.11...gatsby@2.3.12) (2019-04-04)

**Note:** Version bump only for package gatsby

## [2.3.11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.10...gatsby@2.3.11) (2019-04-03)

### Bug Fixes

- **query-extraction:** handle duplicated graphql query names error ([#12931](https://github.com/gatsbyjs/gatsby/issues/12931)) ([0263a77](https://github.com/gatsbyjs/gatsby/commit/0263a77))

### Features

- **gatsby:** write match-paths.json ([#13012](https://github.com/gatsbyjs/gatsby/issues/13012)) ([cec5e28](https://github.com/gatsbyjs/gatsby/commit/cec5e28))

## [2.3.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.9...gatsby@2.3.10) (2019-04-03)

### Bug Fixes

- **gatsby:** ignore \_\_esModule export in gatsby-node exports ([#13081](https://github.com/gatsbyjs/gatsby/issues/13081)) ([1c78ffb](https://github.com/gatsbyjs/gatsby/commit/1c78ffb)), closes [#13079](https://github.com/gatsbyjs/gatsby/issues/13079)

## [2.3.9](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.8...gatsby@2.3.9) (2019-04-03)

### Features

- **gatsby:** add util.promisify polyfill for older node version ([#13024](https://github.com/gatsbyjs/gatsby/issues/13024)) ([b278a60](https://github.com/gatsbyjs/gatsby/commit/b278a60))

## [2.3.8](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.7...gatsby@2.3.8) (2019-04-03)

### Bug Fixes

- **gatsby:** don't try to statically analyze gatsby-node, require it and examine exports instead ([#13053](https://github.com/gatsbyjs/gatsby/issues/13053)) ([d74b3f0](https://github.com/gatsbyjs/gatsby/commit/d74b3f0))

## [2.3.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.6...gatsby@2.3.7) (2019-04-02)

**Note:** Version bump only for package gatsby

## [2.3.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.5...gatsby@2.3.6) (2019-04-02)

**Note:** Version bump only for package gatsby

## [2.3.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.4...gatsby@2.3.5) (2019-04-02)

### Bug Fixes

- **gatsby:** Only use one redux namespace for plugins ([#12263](https://github.com/gatsbyjs/gatsby/issues/12263)) ([bba69e9](https://github.com/gatsbyjs/gatsby/commit/bba69e9))

### Features

- **gatsby-cli:** Detect if something is already running on a port when running gatsby serve ([#12989](https://github.com/gatsbyjs/gatsby/issues/12989)) ([e587e57](https://github.com/gatsbyjs/gatsby/commit/e587e57))

## [2.3.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.3...gatsby@2.3.4) (2019-03-28)

### Features

- **schema:** Use extensions to specify infer config ([ff102c9](https://github.com/gatsbyjs/gatsby/commit/ff102c9))

## [2.3.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.2...gatsby@2.3.3) (2019-03-27)

### Bug Fixes

- **gatsby:** Handle already deleted nodes in deleteNode action ([#12866](https://github.com/gatsbyjs/gatsby/issues/12866)) ([1548841](https://github.com/gatsbyjs/gatsby/commit/1548841))
- **gatsby-telemetry:** Ensure quickly running commands exit freely ([#12888](https://github.com/gatsbyjs/gatsby/issues/12888)) ([e30d264](https://github.com/gatsbyjs/gatsby/commit/e30d264))
- **themes:** Handle shared parent theme with component shadowing ([#12883](https://github.com/gatsbyjs/gatsby/issues/12883)) ([7a82dc2](https://github.com/gatsbyjs/gatsby/commit/7a82dc2))

### Features

- **themes:** copy static folders in themes ([#12746](https://github.com/gatsbyjs/gatsby/issues/12746)) ([edd6cb1](https://github.com/gatsbyjs/gatsby/commit/edd6cb1))

## [2.3.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.1...gatsby@2.3.2) (2019-03-26)

**Note:** Version bump only for package gatsby

## [2.3.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.0...gatsby@2.3.1) (2019-03-26)

**Note:** Version bump only for package gatsby

# [2.3.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.13...gatsby@2.3.0) (2019-03-26)

### Features

- **gatsby:** add anonymous telemetry instrumentation to gatsby ([#12758](https://github.com/gatsbyjs/gatsby/issues/12758)) ([da8ded9](https://github.com/gatsbyjs/gatsby/commit/da8ded9))

## [2.2.13](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.12...gatsby@2.2.13) (2019-03-26)

### Bug Fixes

- **schema:** Add tests for incorrect list counting ([#12824](https://github.com/gatsbyjs/gatsby/issues/12824)) ([d2bf6f5](https://github.com/gatsbyjs/gatsby/commit/d2bf6f5))
- **schema:** Remove accidental capitalization of lowercase typenames. ([#12837](https://github.com/gatsbyjs/gatsby/issues/12837)) ([d25b39d](https://github.com/gatsbyjs/gatsby/commit/d25b39d))

## [2.2.12](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.11...gatsby@2.2.12) (2019-03-26)

### Features

- **gatsby:** Move page component state & side effect handling to xstate ([#11897](https://github.com/gatsbyjs/gatsby/issues/11897)) ([91086d4](https://github.com/gatsbyjs/gatsby/commit/91086d4))

## [2.2.11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.10...gatsby@2.2.11) (2019-03-25)

**Note:** Version bump only for package gatsby

## [2.2.10](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.9...gatsby@2.2.10) (2019-03-25)

### Bug Fixes

- **gatsby:** added looksLikeADate to check date on schema creation ([#12722](https://github.com/gatsbyjs/gatsby/issues/12722)) ([aff2c5d](https://github.com/gatsbyjs/gatsby/commit/aff2c5d))
- **gatsby:** Allow setting nullability in createResolvers ([#12775](https://github.com/gatsbyjs/gatsby/issues/12775)) ([4fbac99](https://github.com/gatsbyjs/gatsby/commit/4fbac99))
- **gatsby:** Improve handling of sparse arrays in example value creation ([#12807](https://github.com/gatsbyjs/gatsby/issues/12807)) ([3e84352](https://github.com/gatsbyjs/gatsby/commit/3e84352))
- **schema:** Don't default to tracking all nodes ([#12825](https://github.com/gatsbyjs/gatsby/issues/12825)) ([a9b6d68](https://github.com/gatsbyjs/gatsby/commit/a9b6d68))
- **schema:** fix `types` for buildUnionType config object ([#12814](https://github.com/gatsbyjs/gatsby/issues/12814)) ([0c2cda4](https://github.com/gatsbyjs/gatsby/commit/0c2cda4))
- **schema:** Fix querying for filtered File type ([#12752](https://github.com/gatsbyjs/gatsby/issues/12752)) ([c949b9a](https://github.com/gatsbyjs/gatsby/commit/c949b9a))
- **schema:** Preserve resolvers on \_\_\_NODE fields ([#12806](https://github.com/gatsbyjs/gatsby/issues/12806)) ([e8816bf](https://github.com/gatsbyjs/gatsby/commit/e8816bf))

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

- **gatsby:** avoid full page refresh when navigating to non-existent page ([#10684](https://github.com/gatsbyjs/gatsby/issues/10684)) ([88866c7](https://github.com/gatsbyjs/gatsby/commit/88866c7))

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

- fix broken gatsby link definition for TypeScript 2.4.2 (#1628) @DominikGuzei
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
- Don't set a default title in html.js as not overridden by react-helmet #1578
  @KyleAMathews
- Downgrade Glamor to v2 as v3 unstable #1580 @KyleAMathews
- Remove the slash between the pathPrefix and pathname when navigating #1574
  @DaleWebb
- Fix url in Contentful example #1596 @axe312ger
- Small fixes to tutorial #1586 @benmathews
- Add missing dep to gatsby-source-filesystem #1607 @jquense
- WordPress -> WordPress #1608 @Alaev
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
- Fancy JavaScript Example #1492 @jbolda
- Add sitemap plugin to www #1541 @nicholaswyoung

### Fixed

- Clone context to prevent mutations #1553 @kyleamathews
- Update dependencies to avoid hoisting errors #1552 @kyleamathews
- Set pathPrefix if not defined to an empty string to avoid undefined #1551
  @kyleamathews
- Fix prefixes in gatsby-link + navigateTo #1550 @kyleamathews
- Make path to packages the same on website as GitHub #1549 @kyleamathews
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
- Improve TypeScript example #1466 @fabien0102
- Remove react-helmet from src/html.js fixes #1443 #1474 @KyleAMathews
- Updates add-custom-webpack-config.md to fix broken links #1420 @marcustisater
- Fix source-wordpress npmignore #1476 @KyleAMathews

## [1.0.0] - 2017-07-06

### Added

- Adds Material Blog starter to the list of starters. #1344 @Vagr9K committed
  with KyleAMathews 4 days ago
- Continuation: WIP update home page with new design #1355 @fk
- WordPress source plugin and example site #1321 @sebastienfi
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
- Add TypeScript example #1319 @kyleamathews
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
- Add friendly webpack output #1240 @craig-mulligan
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

- Fix graphql compiler on TypeScript #949 @fabien0102
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
  https://gatsbyjs.netlify.app/. PRs welcome!
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
- webpack needs the help of an obscure setting `recordsPath` to preserve module
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
  the webpack validation as `node_modules/gatsby/node_modules` doesn't now
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

- Disable extracting the webpack chunk manifest until understand why this breaks
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
