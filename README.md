<p align="center">
  <a href="https://gatsbyjs.org">
    <img alt="Gatsby" src="https://www.gatsbyjs.org/monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Gatsby v2
</h1>

<h3 align="center">
  ⚛️ 📄 🚀
</h3>
<h3 align="center">
  Fast in every way that matters
</h3>
<p align="center">
  Gatsby is a free and open source framework based on React that helps developers build blazing fast websites and apps
</p>
<p align="center">
  <a href="https://github.com/gatsbyjs/gatsby/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Gatsby is released under the MIT license." />
  </a>
  <a href="https://circleci.com/gh/gatsbyjs/gatsby">
    <img src="https://circleci.com/gh/gatsbyjs/gatsby.svg?style=shield" alt="Current CircleCI build status." />
  </a>
  <a href="https://www.npmjs.org/package/gatsby">
    <img src="https://img.shields.io/npm/v/gatsby.svg" alt="Current npm package version." />
  </a>
  <a href="https://npmcharts.com/compare/gatsby?minimal=true">
    <img src="https://img.shields.io/npm/dm/gatsby.svg" alt="Downloads per month on npm." />
  </a>
  <a href="https://npmcharts.com/compare/gatsby?minimal=true">
    <img src="https://img.shields.io/npm/dt/gatsby.svg" alt="Total downloads on npm." />
  </a>
  <a href="https://gatsbyjs.org/contributing/how-to-contribute/">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=gatsbyjs">
    <img src="https://img.shields.io/twitter/follow/gatsbyjs.svg?label=Follow%20@gatsbyjs" alt="Follow @gatsbyjs" />
  </a>
</p>

<h3 align="center">
  <a href="https://gatsbyjs.org/docs/">Quickstart</a>
  <span> · </span>
  <a href="https://gatsbyjs.org/tutorial/">Tutorial</a>
  <span> · </span>
  <a href="https://gatsbyjs.org/plugins/">Plugins</a>
  <span> · </span>
  <a href="https://gatsbyjs.org/starters/">Starters</a>
  <span> · </span>
  <a href="https://gatsbyjs.org/showcase/">Showcase</a>
  <span> · </span>
  <a href="https://gatsbyjs.org/contributing/how-to-contribute/">Contribute</a>
  <span> · </span>
  Support: <a href="https://spectrum.chat/gatsby-js">Spectrum</a>
  <span> & </span>
  <a href="https://gatsby.dev/discord">Discord</a>
</h3>

Gatsby is a modern web framework for blazing fast websites.

- **Go Beyond Static Websites.** Get all the benefits of static websites with none of the
  limitations. Gatsby sites are fully functional React apps so you can create high-quality,
  dynamic web apps, from blogs to e-commerce sites to user dashboards.

- **Use a Modern Stack for Every Site.** No matter where the data comes from, Gatsby sites are
  built using React and GraphQL. Build a uniform workflow for you and your team, regardless of
  whether the data is coming from the same backend.

- **Load Data From Anywhere.** Gatsby pulls in data from any data source, whether it’s Markdown
  files, a headless CMS like Contentful or WordPress, or a REST or GraphQL API. Use source plugins
  to load your data, then develop using Gatsby’s uniform GraphQL interface.

- **Performance Is Baked In.** Ace your performance audits by default. Gatsby automates code
  splitting, image optimization, inlining critical styles, lazy-loading, prefetching resources,
  and more to ensure your site is fast — no manual tuning required.

- **Host at Scale for Pennies.** Gatsby sites don’t require servers so you can host your entire
  site on a CDN for a fraction of the cost of a server-rendered site. Many Gatsby sites can be
  hosted entirely free on services like GitHub Pages and Netlify.

[**Learn how to use Gatsby for your next project.**](https://gatsbyjs.org/docs/)

## What’s In This Document

- [Get Up and Running in 5 Minutes](#-get-up-and-running-in-5-minutes)
- [Learning Gatsby](#-learning-gatsby)
- [Migration Guides](#-migration-guides)
- [How to Contribute](#-how-to-contribute)
- [License](#memo-license)
- [Thanks to Our Contributors and Sponsors](#-thanks)

## 🚀 Get Up and Running in 5 Minutes

You can get a new Gatsby site up and running on your local dev environment in 5 minutes with these four steps:

1. **Install the Gatsby CLI.**

   ```shell
   npm install -g gatsby-cli

   ```

2. **Create a Gatsby site from a Gatsby starter.**

   Get your Gatsby blog set up in a single command:

   ```shell
   # create a new Gatsby site using the default starter
   gatsby new my-blazing-fast-site
   ```

3. **Start the site in `develop` mode.**

   Next, move into your new site’s directory and start it up:

   ```shell
   cd my-blazing-fast-site/
   gatsby develop
   ```

4. **Open the source code and start editing!**

   Your site is now running at `http://localhost:8000`. Open the `my-blazing-fast-site` directory in your code editor of choice and edit `src/pages/index.js`. Save your changes, and the browser will update in real time!

At this point, you’ve got a fully functional Gatsby website. For additional information on how you can customize your Gatsby site, see our [plugins](https://gatsbyjs.org/plugins/) and [the official tutorial](https://gatsbyjs.org/tutorial/).

## 🎓 Learning Gatsby

Full documentation for Gatsby lives [on the website](https://gatsbyjs.org/).

- **For most developers, we recommend starting with our [in-depth tutorial for creating a site with Gatsby](https://gatsbyjs.org/tutorial/).** It starts with zero assumptions about your level of ability and walks through every step of the process.

- **To dive straight into code samples head [to our documentation](https://gatsbyjs.org/docs/).** In particular, check out the “<i>Guides</i>”, “<i>API Reference</i>”, and “<i>Advanced Tutorials</i>” sections in the sidebar.

We welcome suggestions for improving our docs. See the [“how to contribute”](https://gatsbyjs.org/contributing/how-to-contribute/) documentation for more details.

**Start Learning Gatsby: [Follow the Tutorial](https://gatsbyjs.org/tutorial/) · [Read the Docs](https://gatsbyjs.org/docs/)**

## 💼 Migration Guides

Already have a Gatsby site? These handy guides will help you add the improvements of Gatsby v2 to your site without starting from scratch!

- [Migrate a Gatsby site from v1 to v2](https://gatsbyjs.org/docs/migrating-from-v1-to-v2/)
- Still on v0? Start here: [Migrate a Gatsby site from v0 to v1](https://gatsbyjs.org/docs/migrating-from-v0-to-v1/)

## ❗ Code of Conduct

Gatsby is dedicated to building a welcoming, diverse, safe community. We expect everyone participating in the Gatsby community to abide by our [**Code of Conduct**](https://gatsbyjs.org/contributing/code-of-conduct/). Please read it. Please follow it. In the Gatsby community, we work hard to build each other up and create amazing things together. 💪💜

## 🤝 How to Contribute

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd love to have you as part of the Gatsby community! :muscle::purple_heart:

Check out our [**Contributing Guide**](https://gatsbyjs.org/contributing/how-to-contribute/) for ideas on contributing and setup steps for getting our repositories up and running on your local machine.

### A note on how this repository is organized

This repository is a [monorepo](https://trunkbaseddevelopment.com/monorepos/) managed using [Lerna](https://github.com/lerna/lerna). This means there are [multiple packages](/packages) managed in this codebase, even though we publish them to NPM as separate packages.

### Contributing to Gatsby v1

We are currently only accepting bug fixes for Gatsby v1. No new features will be accepted.

## :memo: License

Licensed under the [MIT License](./LICENSE).

## 💜 Thanks

Thanks to our many contributors and to [Netlify](https://www.netlify.com/) for hosting [gatsbyjs.org](https://gatsbyjs.org) and our example sites.
