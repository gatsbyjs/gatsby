# Kentico Cloud & Gatsby web template

[![Preview](https://img.shields.io/badge/-Preview-brightgreen.svg)](https://cloud-template-gatsby.surge.sh/)

Kentico cloud web template using Gatsby and [Kentico Cloud](https://kenticocloud.com)

## Get started

### Prerequisites

* [Node.js](https://nodejs.org/en/download/)

### Run

1. [Clone](https://git-scm.com/docs/git-clone) or [fork](https://hub.github.com/hub-fork.1.html) this repository. Once it's done install the packages:

    ```sh
    npm install
    ```

1. Install gatsby as a global tool

    ```sh
    npm install -g gatsby
    ```

1. Run development environment using globally installed gatsby package

    ```sh
    gatsby develop
    ```

    * Or Run development environment by npm using dev dependency gatsby package

        ```sh
        npm run develop
        ```

🚀 Your site is now running at http://localhost:8000!

## Features

* [GatsbyJS](https://www.gatsbyjs.org/) static site generator
* Data source - Kentico Cloud (using [Gatsby source plugin for Kentico Cloud](https://www.gatsbyjs.org/packages/gatsby-source-kentico-cloud/))
* Styling using SCSS
* [Font awesome + Material Icons](#Icons)
* [CSS Grid](#CSS-Grid)

### Gatsby plugins

* gatsby-plugin-react-helmet - for setting HTML tags
* gatsby-source-kentico-cloud - loading data from [Kentico Cloud](https://kenticocloud.com)
* gatsby-plugin-manifest + gatsby-plugin-offline - setting up the [PWA](https://developers.google.com/web/progressive-web-apps/) capabilities
* gatsby-plugin-sass - for compiling scss styles

### Color palette

To define color pallette - change values of variables stored in [_vars.scss](https://github.com/Simply007/cloud-template-gatsby/blob/master/source/src/assets/scss/libs/_vars.scss#L32).

### Icons

It is possible to use two sets of font icons (`src/assets/css`) - [Material Icons](https://material.io/tools/icons/) as well as [Font Awesome](https://fontawesome.com/).

Format Example:

* Material icons: `<i className="material-icons">face</i>` (`face` - icon code)
* Font Awesome : `<li><span  className="fa-code"></span></li>` (`fa-code` - icon code)

### CSS Grid

The grid on this site was replaced with a custom version, built using CSS Grid. It's a very simple 12 column grid that is disabled on mobile. To start using the grid, wrap the desired items with `grid-wrapper`. Items inside the `grid-wrapper` use the class `col-` followed by a number, which should add up to 12.

Here is an example of using the grid, for a 3 column layout:

```html
<div className="grid-wrapper">
    <div className="col-4">
        <p>Adipiscing a commodo ante nunc accumsan et interdum mi ante adipiscing. A nunc lobortis non nisl amet vis sed volutpat aclacus nascetur ac non. Lorem curae et ante amet sapien sed tempus adipiscing id accumsan.</p>
    </div>
    <div className="col-4">
        <p>Content Here</p>
    </div>
    <div className="col-4">
        <p>Adipiscing a commodo ante nunc accumsan et interdum mi ante adipiscing. A nunc lobortis non nisl amet vis sed volutpat aclacus nascetur ac non. Lorem curae et ante amet sapien sed tempus adipiscing id accumsan.</p>
    </div>
</div>
```

## Thanks

 © 2019, Built with Gatsby using [Gatsby starter Photon](https://www.gatsbyjs.org/starters/codebushi/gatsby-starter-photon/)
