<p align="center">
  <a href="https://gatsbyjs.org">
    <img alt="Gatsby" src="https://www.gatsbyjs.org/monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Gatsby Starters
</h1>

<h3 align="center">
  ⚛️ 📄 :rocket:
</h3>
<p align="center">
  <strong>Blazing fast modern site generator for React</strong><br>
  Go beyond static sites: build blogs, e-commerce sites, full-blown apps, and more with Gatsby.
</p>
<p align="center">
  <a href="https://github.com/gatsbyjs/gatsby/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Gatsby is released under the MIT license." />
  </a>
  <a href="https://circleci.com/gh/DSchau/starters">
    <img src="https://circleci.com/gh/DSchau/starters.svg?style=shield" alt="Current CircleCI build status." />
  </a>
  <a href="https://www.npmjs.org/package/gatsby">
    <img src="https://img.shields.io/npm/v/gatsby.svg" alt="Current npm package version." />
  </a>
  <a href="https://npmcharts.com/compare/gatsby?minimal=true">
    <img src="https://img.shields.io/npm/dm/gatsby.svg" alt="Downloads per month on npm." />
  </a>
  <a href="https://gatsbyjs.org/docs/how-to-submit-a-pr/">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" />
  </a>
</p>

<h3 align="center">
  <a href="https://gatsbyjs.org/docs/">Quickstart</a>
  <span> · </span>
  <a href="https://gatsbyjs.org/tutorial/">Tutorial</a>
  <span> · </span>
  <a href="https://gatsbyjs.org/plugins/">Plugins</a>
  <span> · </span>
  <a href="https://gatsbyjs.org/docs/gatsby-starters/">Starters</a>
  <span> · </span>
  <a href="https://gatsbyjs.org/showcase/">Showcase</a>
  <span> · </span>
  <a href="https://gatsbyjs.org/docs/how-to-contribute/">Contribute</a>
  <span> · </span>
  Support: <a href="https://spectrum.chat/gatsby-js">Spectrum</a>
  <span> & </span>
  <a href="https://discord.gg/0ZcbPKXt5bVoxkfV">Discord</a>
</h3>

Gatsby is a modern framework for blazing fast websites. This repository is our monorepo for managing all the great GatsbyJS starters for the community.

## What's a starter?

A starter is a simplified example to get up and running with Gatsby quickly and easily. These starters are directly integrated with the Gatsby Command Line Interface (CLI).

## Official Starters

<!-- AUTO-GENERATED-CONTENT:START (LIST_STARTERS) -->

|                                 Name                                  | Demo                                                                                                | Description                                                   |
| :-------------------------------------------------------------------: | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
|        [blog](https://github.com/gatsbyjs/gatsby-starter-blog)        | [gatsby-starter-blog-demo.netlify.com](https://gatsby-starter-blog-demo.netlify.com/)               | A starter for a blog powered by Gatsby and Markdown           |
|     [default](https://github.com/gatsbyjs/gatsby-starter-default)     | [gatsby-starter-default-demo.netlify.com](https://gatsby-starter-default-demo.netlify.com/)         | A simple starter to get up and developing quickly with Gatsby |
| [hello-world](https://github.com/gatsbyjs/gatsby-starter-hello-world) | [gatsby-starter-hello-world-demo.netlify.com](https://gatsby-starter-hello-world-demo.netlify.com/) | A simplified bare-bones starter for Gatsby                    |

<!-- AUTO-GENERATED-CONTENT:END -->

## 🚀 Get Up and Running in 5 Minutes

```sh
# install the Gatsby CLI globally
npm install -g gatsby-cli

# create a new Gatsby site using the default starter
gatsby new my-blazing-fast-site
```

e.g. `gatsby new blog my-blazing-fast-site` or `gatsby new hello-world my-blazing-fast-site` to use a specific starter!

This will clone the starter of specified name into the folder `my-blazing-fast-site` and get you up and running in under 5 minutes with Gatsby and a fantastic starter. We can't wait to see what you build!

## 🤝 How to Contribute

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd love to have you as part of the Gatsby community! :muscle: :purple_heart:

Check out our [**Contributing Guide**][contributing-guide] for ideas on contributing and setup steps for getting our repositories up and running on your local machine.

### Code of Conduct

Gatsby is dedicated to building a welcoming, diverse, safe community. We expect everyone participating in the Gatsby community to abide by our [**Code of Conduct**][code-of-conduct]. Please read it. Please follow it. In the Gatsby community, we work hard to build each other up and create amazing things together. :muscle: :purple_heart:

### A note on how this repository is organized

This repository is a [monorepo][monorepo] managed using [Lerna][lerna]. This means there are [multiple packages--starters!!--][starters] managed in this codebase that are independently versioned but co-exist within this repository.

We have set-up read-only clones of all of the [starters][starters] in the official gatsbyjs organization. For example, the [`default` starter](starters/default) is available as a read-only clone at [`gatsbyjs/gatsby-starter-default`][gatsby-starter-default]. Please open PRs versus **this** repository rather than the read-only clones. Upon merge any starters that have been modified will be tagged and released.

[code-of-conduct]: https://gatsbyjs.org/docs/code-of-conduct/
[contributing-guide]: https://gatsbyjs.org/docs/how-to-contribute/
[monorepo]: https://trunkbaseddevelopment.com/monorepos
[lerna]: https://github.com/lerna/lerna
[starters]: /starters
[gatsby-starter-default]: https://github.com/gatsbyjs/gatsby-starter-default
