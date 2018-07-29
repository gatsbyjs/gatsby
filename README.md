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
  <a href="https://next.gatsbyjs.org/showcase/">Showcase</a>
  <span> · </span>
  <a href="https://next.gatsbyjs.org/docs/how-to-contribute/">Contribute</a>
  <span> · </span>
  Support: <a href="https://spectrum.chat/gatsby-js">Spectrum</a>
  <span> & </span>
  <a href="https://discord.gg/0ZcbPKXt5bVoxkfV">Discord</a>
</h3>

## Table of Contents

-   [Get Up and Running in 5 Minutes](#-get-up-and-running-in-5-minutes)
-   [Learning Gatsby](#-learning-gatsby)
-   [Migration Guides](#-migration-guides)
-   [For Advanced Developers: Code Samples & Recipes](#-code-samples-and-recipes)
-   [How to Contribute](#-how-to-contribute)
-   [Thanks to Our Contributors and Sponsors](#-thanks-to-our-contributors-and-sponsors)


## 🚀 Get Up and Running in 5 Minutes

You can get a new Gatsby site up and running on your local dev environment in 5 minutes with these three steps:

1.  **Create a Gatsby site from a Gatsby starter.**

    Get your Gatsby blog set up in a single command:

    ```sh
    # install the Gatsby CLI globally
    npm install -g gatsby-cli
    
    # create a new Gatsby site using the default starter
    gatsby new my-blazing-fast-site https://github.com/gatsbyjs/gatsby-starter-default#v2
    ```

2.  **Start the site in `develop` mode.**

    Next, move into your new site’s directory and start it up:

    ```sh
    cd my-blazing-fast-site/
    gatsby develop
    ```

    > **NOTE:** If you prefer npm, you can also run `npm run develop` to start the site.

3.  **Open the source code and start editing!**

    Your site is now running at `http://localhost:8000`. Open the the `my-blazing-fast-site` directory in your code editor of choice and edit `src/pages/index.js`. Save your changes and the browser will update in real time!

At this point, you’ve got a fully functional Gatsby website. For additional information on how you can customize your Gatsby site, see our [plugins](https://next.gatsbyjs.org/plugins/) and [the official tutorial](https://next.gatsbyjs.org/tutorial/).

## 🎓 Learning Gatsby

For most developers, we recommend starting with our [in-depth tutorial for creating a site with Gatsby](https://next.gatsbyjs.org/tutorial/). It starts with zero assumptions about your level of ability and walks through every step of the process, from [setting up your site](https://next.gatsbyjs.org/tutorial/part-one/), to [handling styles](https://next.gatsbyjs.org/tutorial/part-two/) and [layouts](https://next.gatsbyjs.org/tutorial/part-three/), to [querying for data in pages](https://next.gatsbyjs.org/tutorial/part-four/) and [adding data from external sources](https://next.gatsbyjs.org/tutorial/part-five/), to more advanced topics like [transforming data](https://next.gatsbyjs.org/tutorial/part-six/), [programmatically creating pages](https://next.gatsbyjs.org/tutorial/part-seven/), and [prepping your site for deployment](https://next.gatsbyjs.org/tutorial/part-eight/).

#### [Follow the Tutorial](https://next.gatsbyjs.org/tutorial/)

## 💼 Migration Guide

Already have a Gatsby site? These handy guides will help you add the improvements of Gatsby v2 to your site without starting from scratch!

- [Migrate a Gatsby site from v1 to v2](https://next.gatsbyjs.org/docs/migrating-from-v1-to-v2/)
- Still on v0? Start here: [Migrate a Gatsby site from v0 to v1](https://next.gatsbyjs.org/docs/migrating-from-v0-to-v1/)

## 👩‍💻 Code Samples and Recipes

For more advanced developers who just want to dig in and see how Gatsby handles various patterns and workflows, this section is full of code samples and links through to specialized docs.

> **NOTE:** This section is full of abbreviated examples. If you don’t see what you need here, [see the “Guides” section of the docs](https://next.gatsbyjs.org/docs/) to see these examples (and more!) in additional detail.

<details>
  <summary><strong>Create a Gatsby project without a starter</strong></summary>

  <span><!-- don’t remove this; it prevents the text below from smashing into the summary text --></span>
  
  If you prefer the “start from scratch” approach, setting up a Gatsby site requires three dependencies to start:
  ```sh
  # create a new project and move into it
  mkdir my-new-gatsby-site
  cd my-new-gatsby-site
  
  # initialize the project
  npm init
  
  # add the required dependencies
  npm install gatsby@next react react-dom
  ```
</details>

<details>
  <summary><strong>Add global styles to your site</strong></summary>

  <span><!-- don’t remove this; it prevents the text below from smashing into the summary text --></span>
  
  To add a global stylesheet, require the stylesheet in `gatsby-browser.js`:
  ```jsx
  require('./src/stylesheets/global.css');
  
  exports.onClientEntry = () => {/* other custom config here */}
  ```
  
  #### Read the full guide: [creating global styles](https://next.gatsbyjs.org/docs/creating-global-styles/)

</details>

<details>
  <summary><strong>Customize your Babel configuration</strong></summary>

  <span><!-- don’t remove this; it prevents the text below from smashing into the summary text --></span>
  
  If you add a `.babelrc` in the root of your project, it overrides the default Gatsby config entirely. We recommend starting with our config and modifying as needed.

  Gatsby’s default `.babelrc`:
  ```json
  {
    "cacheDirectory": true,
    "babelrc": false,
    "presets": [
      [
        "@babel/preset-env",
        {
          "loose": true,
          "modules": false,
          "useBuiltIns": "usage",
          "shippedProposals": true,
          "targets": {
            "browsers": [">0.25%", "not dead"],
          },
        },
      ],
      [
        "@babel/preset-react",
        {
          "useBuiltIns": true,
          "pragma": "React.createElement",
        },
      ],
      "@babel/preset-flow",
    ],
    "plugins": [
      [
        "@babel/plugin-proposal-class-properties",
        {
          "loose": true,
        },
      ],
      "@babel/plugin-syntax-dynamic-import",
      [
        "@babel/plugin-transform-runtime",
        {
          "helpers": true,
          "regenerator": true,
          "polyfill": false,
        },
      ],
    ],
  }
  ```
  
  #### Read the full guide: [customize your Babel config](https://next.gatsbyjs.org/docs/babel/)

</details>

## 🤝 How to Contribute

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd love to have you as part of the Gatsby community! :muscle::purple_heart:

Check out our [contributor onboarding docs](https://next.gatsbyjs.org/docs/how-to-contribute/) for ideas on contributing and setup steps for getting our repos up and running on your local machine.

#### [Read the Contributing Guide](https://next.gatsbyjs.org/docs/how-to-contribute/)

### A note on how this repository is organized

This repository is a [monorepo](https://trunkbaseddevelopment.com/monorepos/) managed using [Lerna](https://github.com/lerna/lerna). This means there are [multiple packages](/packages) managed in this codebase, even though we publish them to NPM as separate packages.

## 💜 Thanks to Our Contributors and Sponsors

Thanks to our many contributors and sponsors as well as the companies sponsoring
our testing and hosting infrastructure: [Travis CI](https://travis-ci.com/), [Appveyor](https://www.appveyor.com/), and [Netlify](https://www.netlify.com/).
