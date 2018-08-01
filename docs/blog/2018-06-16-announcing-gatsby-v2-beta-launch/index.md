---
title: Announcing Gatsby v2 beta launch!
date: "2018-06-16"
author: "Mike Allanson"
tags: ["v2", "gatsby"]
image: 'astronaut-v2.jpg'
---

We’re excited to announce that today we shipped the first beta for Gatsby v2! 36 contributors have made over 300 commits to v2 since Gatsby v1 was released in July 2017.

## What's coming in v2?

Gatsby v2 builds on the foundations of v1 to introduce a range of improvements:

- Out With Gatsby Layout Components, In With StaticQuery

  Gatby's special layout components were a common source of confusion in v1. After an RFC and [informative community discussion](https://github.com/gatsbyjs/rfcs/blob/master/text/0002-remove-special-layout-components.md), we decided to remove them and create `StaticQuery` which allows GraphQL queries to be added to any component. For more information on migrating your layouts, check out our [Life After Layouts post](/blog/2018-06-08-life-after-layouts/).

- Improve APIs

  We’ve renamed `sizes` and `resolutions` to `fluid` and `fixed`, `boundActionCreators` to `actions`, as well as other changes intended to make API names more consistent and prevent common gotchas.

  To see the full list of renamings, take a look at the upgrade guide for [image queries](https://next.gatsbyjs.org/docs/migrating-from-v1-to-v2/#rename-responsive-image-queries), [actions](https://next.gatsbyjs.org/docs/migrating-from-v1-to-v2/#rename-boundactioncreators-to-actions) and the [babel](https://next.gatsbyjs.org/docs/migrating-from-v1-to-v2/#change-modifybabelrc-to-oncreatebabelconfig) and [webpack](https://next.gatsbyjs.org/docs/migrating-from-v1-to-v2/#change-modifywebpackconfig-to-oncreatewebpackconfig) API hooks.

- Hotter Hot Reloading

  Previously, hot reloading of code and data had been dependent on new webpack builds. On larger sites, that could take ten or fifteen seconds -- more like lukewarm reloading, really. With [_ludicrous mode_](https://twitter.com/gatsbyjs/status/974507205121617920) we’ve decoupled data updates from webpack so changes you make to your content show up on your site at blistering speeds.

- Upgraded Dependencies

  Gatsby is built on top of amazing JavaScript libraries. In this beta, we're delighted to ship the latest improvements from webpack, Babel, and React to you.

  Key upgrades include:

  - [Babel to v7](https://medium.freecodecamp.org/were-nearing-the-7-0-babel-release-here-s-all-the-cool-stuff-we-ve-been-doing-8c1ade684039)
  - [React to v16](https://reactjs.org/blog/2017/09/26/react-v16.0.html)
  - [webpack to v4](https://medium.com/webpack/webpack-4-released-today-6cdb994702d4)

  These updates allow Gatsby to take advantage of the [performance](https://medium.com/webpack/webpack-4-released-today-6cdb994702d4) [improvements](https://reactjs.org/blog/2017/09/26/react-v16.0.html#better-server-side-rendering) and [new features](https://github.com/gatsbyjs/gatsby/pull/5709) of these tools.

## Can I upgrade now to v2?

Yes! We’ve built [gatsbyjs.com](https://www.gatsbyjs.com) with v2 and the Gatsby community is [converting over the example sites](https://github.com/gatsbyjs/gatsby/issues/5598). While the effort to migrate individual sites may vary, we’ve noticed significant build speedups in Gatsby v2 versus v1 and would love you to dig in and try it. We're working hard on refining Gatsby v2 for full release and would love your help!

## What's coming next?

The [v2 roadmap](https://github.com/gatsbyjs/gatsby/projects/2) details everything else we're planning for v2. Improvements include:

- Additional build optimisations
- Better error messaging
- PostCSS configuration updates

## Getting involved

We ❤️ your feedback. Try out the [migration guide](/docs/migrating-from-v1-to-v2/) and let us know how you get on. [Issues](https://github.com/gatsbyjs/gatsby/issues) and [pull requests](https://github.com/gatsbyjs/gatsby/pulls) are welcome (for real).

Finally a big thank you to all of [Gatsby's contributors](https://github.com/gatsbyjs/gatsby/graphs/contributors) for their time and effort on every version of Gatsby. Special thanks in particular to everyone who's helped with v2 so far: [@ajayns](https://github.com/ajayns) [@brizzoli](https://github.com/brizzoli) [@calcsam](https://github.com/calcsam) [@CanRau](https://github.com/CanRau) [@chmac](https://github.com/chmac) [@danielfarrell](https://github.com/danielfarrell) [@davidluhr](https://github.com/davidluhr) [@daydream05](https://github.com/daydream05) [@dennari](https://github.com/dennari) [@Drew-Slagter](https://github.com/Drew-Slagter) [@dvonlehman](https://github.com/dvonlehman) [@flipactual](https://github.com/flipactual) [@hsribei](https://github.com/hsribei) [@jlengstorf](https://github.com/jlengstorf) [@jquense](https://github.com/jquense) [@Khaledgarbaya](https://github.com/Khaledgarbaya) [@kkemple](https://github.com/kkemple) [@kripod](https://github.com/kripod) [@KyleAMathews](https://github.com/KyleAMathews) [@LeKoArts](https://github.com/LeKoArts) [@lettertwo](https://github.com/lettertwo) [@m-allanson](https://github.com/m-allanson) [@mathieudutour](https://github.com/mathieudutour) [@mottox2](https://github.com/mottox2) [@mquandalle](https://github.com/mquandalle) [@nihgwu](https://github.com/nihgwu) [@noelebrun](https://github.com/noelebrun) [@pieh](https://github.com/pieh) [@piotrkwiecinski](https://github.com/piotrkwiecinski) [@resir014](https://github.com/resir014) [@ryanditjia](https://github.com/ryanditjia) [@syndia](https://github.com/syndia) [@ThatOtherPerson](https://github.com/ThatOtherPerson) [@thebigredgeek](https://github.com/thebigredgeek) [@thescientist13](https://github.com/thescientist13) [@tsriram](https://github.com/tsriram)
