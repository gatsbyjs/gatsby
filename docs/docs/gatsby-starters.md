---
title: 'Gatsby Starters'
---

The Gatsby CLI tool lets you install "starters". These are
partially built sites preconfigured to help you get moving faster on
creating a certain type of site.

When creating a new site, you can optionally specify a starter to
base your new site on e.g.

`gatsby new [SITE_DIRECTORY] [URL_OF_STARTER_GITHUB_REPO]`

For example, to quickly create a blog using Gatsby, you could install
the Gatsby Starter Blog by running:

`gatsby new blog https://github.com/gatsbyjs/gatsby-starter-blog`

This downloads the files and initializes the site by running `npm
install`

If you don't specify a custom starter, your site will be created
from the [default starter](https://github.com/gatsbyjs/gatsby-starter-default).

There are several starters that have been created. Create a PR to
include yours!

Official:

* [gatsby-starter-default](https://github.com/gatsbyjs/gatsby-starter-default) [(demo)](http://gatsbyjs.github.io/gatsby-starter-default/)
* [gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog) [(demo)](http://gatsbyjs.github.io/gatsby-starter-blog/)
* [gatsby-starter-hello-world](https://github.com/gatsbyjs/gatsby-starter-hello-world) [(demo)](https://aberrant-fifth.surge.sh/)

Community:

* [gatsby-starter-blog-no-styles](https://github.com/noahg/gatsby-starter-blog-no-styles) [(demo)](http://capricious-spring.surge.sh/)

  Features:
  * Same as official gatsby-starter-blog but with all styling removed

* [gatsby-material-starter](https://github.com/Vagr9K/gatsby-material-starter) [(demo)](https://vagr9k.github.io/gatsby-material-starter/)

  Features:
  * React-MD for Material design
  * SASS/SCSS
  * Tags
  * Categories
  * Google Analytics
  * Disqus
  * Offline support
  * Web App Manifest
  * SEO
  * [Full list here!](https://github.com/Vagr9K/gatsby-material-starter#features)

* [gatsby-typescript-starter](https://github.com/fabien0102/gatsby-starter) [(demo)](https://github.com/fabien0102/gatsby-starter)

  Features:
  * Semantic-ui for styling
  * TypeScript
  * Offline support
  * Web App Manifest
  * Jest/Enzyme testing
  * Storybook
  * Markdown linting
  * [Full list here!](https://github.com/fabien0102/gatsby-starter#whats-inside)

* [gatsby-starter-bootstrap](https://github.com/jaxx2104/gatsby-starter-bootstrap) [(demo)](https://jaxx2104.github.io/gatsby-starter-bootstrap/)

  Features:
  * Bootstrap CSS framework
  * Single column layout
  * Simple components: SiteNavi, SitePost, SitePage

* [gatsby-blog-starter-kit](https://github.com/dschau/gatsby-blog-starter-kit)

  Features:
  * Blog post listing with previews for each blog post
  * Navigation between posts with a previous/next post button
  * Tags and tag navigation

* [gatsby-advanced-starter](https://github.com/Vagr9K/gatsby-advanced-starter) [(demo)](https://vagr9k.github.io/gatsby-advanced-starter/)

  Features:
  * Great for learning about advanced features and their implementations
  * Does not contain any UI frameworks
  * Provides only a skeleton
  * Tags
  * Categories
  * Google Analytics
  * Disqus
  * Offline support
  * Web App Manifest
  * SEO
  * [Full list here!](https://github.com/Vagr9K/gatsby-advanced-starter#features)

* [glitch-gatsby-starter-blog](https://github.com/100ideas/glitch-gatsby-starter-blog/) ([demo](https://gatsby-starter-blog.glitch.me))

  Features:
  * [live-edit](https://glitch.com/edit/#!/remix/gatsby-starter-blog) a temp, anon copy of app
  * same code as [gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog) (mostly)
  * free hosting & web IDE on glitch.com
  * HMR working w/ glitch IDE (see [note](https://github.com/100ideas/glitch-gatsby-starter-blog/blob/5fce8999bd952087ecdc74c9787a0cb3cb884371/README.md#enabling-hmr))
  * caution:
    * app running in **develop** mode
    * glitch serves assets over CDN, API unclear
    * virtual server container provides [**128MB** for app](https://glitch.com/faq#restrictions) (512MB for assets)
    * server can't install certain gatsby plugins (`sharp`-based; out of mem?)

* [gatsby-starter-grommet](https://github.com/alampros/gatsby-starter-grommet) [(demo)](https://alampros.github.io/gatsby-starter-grommet/)

  Features:
  * Barebones configuration for using the [Grommet](https://grommet.github.io/) design system
  * Uses SASS (with CSS modules support)

* [gatsby-starter-basic](https://github.com/PrototypeInteractive/gatsby-react-boilerplate) [(demo)](https://prototypeinteractive.github.io/gatsby-react-boilerplate/)

  Features:
  * Basic configuration and folder structure
  * Uses postcss and sass (with autoprefixer and pixrem)
  * Uses boostrap 4 grid
  * Leaves the styling to you
  * Uses data from local json files
  * Contains Node.js server code for easy, secure, and fast hosting

* [gatsby-starter-default-i18n](https://github.com/angeloocana/gatsby-starter-default-i18n) [(demo)](https://gatsby-starter-default-i18n.netlify.com)

  Features:
  * localization (Multilanguage)

* [gatsby-starter-gatsbythemes](https://github.com/saschajullmann/gatsby-starter-gatsbythemes) [(demo)](https://themes.gatsbythemes.com/gatsby-starter/)

  Features:
  * CSS-in-JS via [Emotion](https://github.com/emotion-js/emotion).
  * Jest and Enzyme for testing.
  * Eslint in dev mode with the airbnb config and prettier formatting rules.
  * React 16.
  * A basic blog, with posts under src/pages/blog. There's also a script which creates a new Blog entry (post.sh).
  * Data per JSON files.
  * A few basic components (Navigation, Footer, Layout).
  * Layout components make use of [Styled-System](https://github.com/jxnblk/styled-system).
  * Google Analytics (you just have to enter your tracking-id).
  * Gatsby-Plugin-Offline which includes Service Workers.
  * [Prettier](https://github.com/prettier/prettier) for a uniform codebase.
  * [Normalize](https://github.com/necolas/normalize.css/) css (7.0).
  * [Feather](https://feather.netlify.com/) icons.
  * Font styles taken from [Tachyons](http://tachyons.io/).

* [gatsby-starter-netlify-cms](https://github.com/AustinGreen/gatsby-starter-netlify-cms) [(demo)](https://gatsby-netlify-cms.netlify.com/)

  Features:
  * A simple blog built with Netlify CMS 
  * Basic directory organization
  * Uses [Bulma](https://bulma.io/) for styling
  * Visit [the repo](https://github.com/AustinGreen/gatsby-starter-netlify-cms) to learn how to set up authentication, and begin modeling your content.
