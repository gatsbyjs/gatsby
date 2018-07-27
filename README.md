<p align="center">
  <a href="https://next.gatsbyjs.org">
    <img alt="Gatsby" src="https://www.gatsbyjs.org/monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Gatsby v2 [beta] · (see <a href="https://github.com/gatsbyjs/gatsby/tree/v1">v1</a>)
</h1>

<h3 align="center">
  ⚛️ 📄 :rocket:
</h3>
<p align="center">
  <strong>Blazing fast site generator for React</strong><br>
  Go beyond static sites: build blogs, ecommerce sites, full-blown apps, and more with Gatsby.
</p>
<p align="center">
  <a href="https://github.com/gatsbyjs/gatsby/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Gatsby is released under the MIT license." />
  </a>
  <a href="https://travis-ci.org/gatsbyjs/gatsby">
    <img src="https://travis-ci.org/gatsbyjs/gatsby.svg?branch=master" alt="Current TravisCI build status." />
  </a>
  <a href="https://www.npmjs.org/package/gatsby">
    <img src="https://img.shields.io/npm/v/gatsby.svg?style=flat-square" alt="Current npm package version." />
  </a>
  <a href="https://npmcharts.com/compare/gatsby?minimal=true">
    <img src="https://img.shields.io/npm/dm/gatsby.svg" alt="Downloads per month on npm." />
  </a>
  <a href="https://spectrum.chat/gatsby-js">
    <img src="https://withspectrum.github.io/badge/badge.svg" alt="Gatsby support community on Spectrum." />
  </a>
  <a href="https://next.gatsbyjs.org/docs/how-to-submit-a-pr/">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" />
  </a>
</p>

<h3 align="center">
  <a href="https://next.gatsbyjs.org/docs/">Quickstart</a>
  <span> · </span>
  <a href="https://next.gatsbyjs.org/tutorial/">Tutorial</a>
  <span> · </span>
  <a href="https://next.gatsbyjs.org/plugins/">Plugins</a>
  <span> · </span>
  <a href="https://next.gatsbyjs.org/docs/gatsby-starters/">Starters</a>
  <span> · </span>
  <a href="https://spectrum.chat/gatsby-js">Get Support</a>
  <span> · </span>
  <a href="https://next.gatsbyjs.org/docs/how-to-contribute/">Contribute</a>
</h3>

## Table of Contents

-   [Get Up and Running in 5 Minutes](#get-up-and-running-in-5-minutes)


## Get Up and Running in 5 Minutes

You can get a new Gatsby site up and running on your local dev environment in 5 minutes with these three steps:

1.  **Create a Gatsby site from a Gatsby starter.**

    Get your Gatsby blog set up in a single command:

    ```sh
    npx gatsby-cli new my-blazing-fast-site https://github.com/gatsbyjs/gatsby-starter-default#v2
    ```

2.  **Start the site in `develop` mode.**

    Next, move into your new site’s directory and start it up:

    ```sh
    cd my-blazing-fast-site/
    yarn develop
    ```

    > **NOTE:** If you prefer npm, you can also run `npm run develop` to start the site.

3.  **Open the source code and start editing! 💪💜**

    Your site is now running at `http://localhost:8000`. Open the the `my-blazing-fast-site` directory in your code editor of choice and edit `src/pages/index.js`. Save your changes and the browser will update in real time!

At this point, you’ve got a fully functional Gatsby website. For additional information on how you can customize your Gatsby site, see our [plugins](https://next.gatsbyjs.org/plugins/) and [the official tutorial](https://next.gatsbyjs.org/tutorial/).

---

## Previous README

**NOTE:** This branch is the beta version of Gatsby v2. You can find documentation at [next.gatsbyjs.org](https://next.gatsbyjs.org/).

For `gatsby@1`, please see [the v1 branch](https://github.com/gatsbyjs/gatsby/tree/v1).

**Are you using v1 and want to upgrade to the Gatsby v2 Beta? Check out [our v1 => v2 migration guide](https://next.gatsbyjs.org/docs/migrating-from-v1-to-v2/).**

**Starting a new project with Gatsby v2**
If you'd like to start a new project with Gatsby v2 you can use the v2 edition of any offical starter. Install your favourite one with the Gatsby CLI.

`gatsby-starter-default` with v2:

```
gatsby new my-default-project https://github.com/gatsbyjs/gatsby-starter-default#v2
```

`gatsby-starter-hello-world` with v2:

```
gatsby new my-hello-world https://github.com/gatsbyjs/gatsby-starter-hello-world#v2
```

`gatsby-starter-blog` with v2:

```
gatsby new my-blog https://github.com/gatsbyjs/gatsby-starter-blog#v2
```

If you're a _start from scratch_ kind of person, you can install the Gatsby beta and React like this: `npm install gatsby@next react react-dom`

**How are pull requests being handled during the v2 beta?**

The following policy will be in place during the v2 beta:

- We will only accept _bug fixes_ for Gatsby v1. Any PRs opened against v1 that are not bug fixes will be closed

- If the bug fix is applicable to v2, we will open an additional issue to track porting the change to v2

- All _new features_ should be opened as pull requests against v2 (the `master` branch)

We're using this policy as the Gatsby team currently spends a significant amount of time maintaining two active branches - the v1 branch and the v2 branch - we'd like to limit this work to focus on getting v2 released and start working on oft-requested new features like schema snapshots and schema stitching.

## Docs

**[View the docs on gatsbyjs.org](https://www.gatsbyjs.org/docs/)**

[Migrating from v1 to v2?](https://next.gatsbyjs.org/docs/migrating-from-v1-to-v2/)

[Migrating from v0 to v1?](https://www.gatsbyjs.org/docs/migrating-from-v0-to-v1/)

[v0 docs](https://github.com/gatsbyjs/gatsby/blob/v0.12.48/docs/index.md)

## Packages

This repository is a monorepo managed using
[Lerna](https://github.com/lerna/lerna). This means that we publish
[many packages](/packages) to NPM from the same codebase.

## Thanks

Thanks to our many contributors and sponsors as well as the companies sponsoring
our testing and hosting infrastructure: Travis CI, Appveyor, and Netlify.

### Backers

Support us with a monthly donation and help us continue our activities.
[[Become a backer](https://opencollective.com/gatsby#backer)]

<a href="https://opencollective.com/gatsby/backer/0/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/1/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/2/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/3/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/4/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/5/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/6/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/7/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/8/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/9/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/10/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/10/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/11/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/11/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/12/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/12/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/13/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/13/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/14/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/14/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/15/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/15/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/16/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/16/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/17/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/17/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/18/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/18/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/19/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/19/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/20/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/20/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/21/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/21/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/22/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/22/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/23/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/23/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/24/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/24/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/25/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/25/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/26/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/26/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/27/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/27/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/28/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/28/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/backer/29/website" target="_blank"><img src="https://opencollective.com/gatsby/backer/29/avatar.svg"></a>

### Sponsors

Become a sponsor and get your logo on our README on GitHub with a link to your
site. [[Become a sponsor](https://opencollective.com/gatsby#sponsor)]

<a href="https://opencollective.com/gatsby/sponsor/0/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/1/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/2/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/3/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/4/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/5/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/6/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/7/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/8/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/9/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/10/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/11/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/12/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/12/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/13/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/13/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/14/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/14/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/15/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/15/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/16/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/16/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/17/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/17/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/18/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/18/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/19/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/19/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/20/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/20/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/21/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/21/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/22/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/22/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/23/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/23/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/24/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/24/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/25/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/25/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/26/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/26/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/27/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/27/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/28/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/28/avatar.svg"></a>
<a href="https://opencollective.com/gatsby/sponsor/29/website" target="_blank"><img src="https://opencollective.com/gatsby/sponsor/29/avatar.svg"></a>
