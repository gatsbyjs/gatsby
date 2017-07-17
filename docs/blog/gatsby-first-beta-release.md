---
title: Gatsby's first beta release
date: "2017-06-15"
author: "Kyle Mathews"
image: 'images/cargo-ship.jpg'
excerpt: "We shipped today Gatsby's first beta for 1.0! Gatsby is a modern blazing-fast static site generator for React.js..."
---

![Container ship loading containers](images/cargo-ship.jpg)*Image by Pedro Corrêa http://bit.ly/2sfX4TG*

We shipped today Gatsby's first beta for 1.0! Gatsby is a modern blazing-fast static
site generator for React.js.

Ten months and one day ago [I announced I was now working full-time on
Gatsby](https://www.bricolage.io/gatsby-open-source-work/) followed a month
later by posting [an issue kickstarting the rewrite of Gatsby for a 1.0
release](https://github.com/gatsbyjs/gatsby/issues/419)

Since then 40 contributors have pushed 723 commits contributing to 23 alpha releases
before today's first beta release. It's been a really enjoyable experience watching
Gatsby v1 take form and helping shape that and the growing community around it.

### What's part of v1

From Gatsby's initial release just over two years ago, Gatsby has let you build
static websites using React.js components as well as markdown, JSON,
and YAML.

Building on this strong foundation, v1 adds:

* New plugin architecture (to date 45+ plugins have been written)
* New data layer which lets you integrate data from both remote (CMSs, APIs, etc.) and local sources
* Progressive web app features such as automatic code and data splitting (by route), prefetching, and service worker and offline-first support

## Special thanks to

Getting to this point wouldn't have happened without the help of many individuals
and companies.

### Individuals
* [Thijs Koerselman](https://github.com/0x80)
* [Jason Quense](https://github.com/jquense)
* [Fabien Bernard](https://github.com/fabien0102)
* [Scotty Eckenthal](https://github.com/scottyeck)
* [Nicholas Young](https://github.com/nicholaswyoung)
* [Florian Kissling](https://github.com/fk)
* [Jacob Bolda](https://github.com/jbolda)
* [Noah Lange](https://github.com/noahlange)
* [Daniel Farrell](https://github.com/danielfarrell)
* [Marcus Ericsson](https://github.com/mericsson)
* [Sacha Greif](https://github.com/SachaG)
* [Guten Ye](https://github.com/gutenye)
* [Rico Sta. Cruz](https://github.com/rstacruz)

### Companies who sponsored time working on Gatsby v1.

* [Thinkmill](https://www.thinkmill.com.au/)
* [Expo](https://expo.io/)
* [Sourcegraph](https://about.sourcegraph.com/)
* [Segment](https://segment.com)
* [Meetfabric](https://meetfabric.com/)
* [X-Team](https://x-team.com/)
* [Contentful](https://www.contentful.com/)

### Our open source hosting/testing infastructure providers

It'd be impossible to write open source code without the generous support
of these infrastructure providers.

* [Netlify](https://www.netlify.com/) *Awesome static site continuous delivery & hosting*
* [Travis CI](https://travis-ci.org) *Test runner in the cloud*
* [Appveyor](https://www.appveyor.com/) *Windows test runner in the cloud*

## Changelog since 1.0.0-alpha.20

### Added
* Allow for gatsby-remark-smartypants options [#1166](https://github.com/gatsbyjs/gatsby/pull/1166) @mitchejj
* New design (for gatsbyjs.org) + new home page [#1170](https://github.com/gatsbyjs/gatsby/pull/1170) @kyleamathews
* Add ability to locally define plugins [#1126](https://github.com/gatsbyjs/gatsby/pull/1126) @0x80
* Add rough draft for docs for creating source plugins [#1159](https://github.com/gatsbyjs/gatsby/pull/1159) @kyleamathews
* Optimizations around prefetching page resources [#1133](https://github.com/gatsbyjs/gatsby/pull/1133) @kyleamathews
* Redux example site [#1081](https://github.com/gatsbyjs/gatsby/pull/1081) @scottyeck
* Sitemap Generator Plugin [#1115](https://github.com/gatsbyjs/gatsby/pull/1115) @nicholaswyoung
* Add documentation to gatsby-remark-prism @kyleamathews

### Changed
* Move all filter operators for connections under a top-level "filter" field [#1177](https://github.com/gatsbyjs/gatsby/pull/1177) @kyleamathews
* Change `linkPrefix` to `pathPrefix` and add an example site [#1155](https://github.com/gatsbyjs/gatsby/pull/1155) @kyleamathews
* Make the plugin options for remark plugins the second argument (like everywhere else) [#1167](https://github.com/gatsbyjs/gatsby/pull/1167) @kyleamathews
* Start using next instead of canary in example sites for package versions @kyleamathews

### Fixed
* Fix graphql compiler on typescript [#949](https://github.com/gatsbyjs/gatsby/pull/949) @fabien0102
* Replace react.createClass with ES6 classes in examples html.js, add PropTypes [#1169](https://github.com/gatsbyjs/gatsby/pull/1169) @abachuk
* Fix windows build pull [#1158](https://github.com/gatsbyjs/gatsby/pull/1158) @kyleamathews
* Use custom delimiter when flattening example values for enum fields so easy to convert back @kyleamathews
* gatsby-remark-responsive-image: use span instead of div [#1151](https://github.com/gatsbyjs/gatsby/pull/1151) @rstacruz
* Add check that we can actually find a linked image file node @kyleamathews
* Ignore SVGs in gatsby-remark-responsive-image [#1157](https://github.com/gatsbyjs/gatsby/pull/1157) @fk
* Replace using levelup for caching with lowdb to avoid native dependency [#1142](https://github.com/gatsbyjs/gatsby/pull/1142) @kyleamathews
* Fix Appveyor bug regarding build all examples on release [#1118](https://github.com/gatsbyjs/gatsby/pull/1118) @jbolda


