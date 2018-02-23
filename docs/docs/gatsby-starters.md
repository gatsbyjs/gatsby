---
title: 'Gatsby Starters'
---

The Gatsby CLI tool lets you install "starters". These are partially built sites
preconfigured to help you get moving faster on creating a certain type of site.

When creating a new site, you can optionally specify a starter to base your new
site on e.g.

`gatsby new [SITE_DIRECTORY] [URL_OF_STARTER_GITHUB_REPO]`

For example, to quickly create a blog using Gatsby, you could install the Gatsby
Starter Blog by running:

`gatsby new blog https://github.com/gatsbyjs/gatsby-starter-blog`

This downloads the files and initializes the site by running `npm install`

If you don't specify a custom starter, your site will be created from the
[default starter](https://github.com/gatsbyjs/gatsby-starter-default).

There are several starters that have been created. Create a PR to include yours!

Official:

* [gatsby-starter-default](https://github.com/gatsbyjs/gatsby-starter-default)
  [(demo)](http://gatsbyjs.github.io/gatsby-starter-default/)
* [gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog)
  [(demo)](http://gatsbyjs.github.io/gatsby-starter-blog/)
* [gatsby-starter-hello-world](https://github.com/gatsbyjs/gatsby-starter-hello-world)
  [(demo)](https://aberrant-fifth.surge.sh/)

Community:

* [gatsby-starter-blog-no-styles](https://github.com/noahg/gatsby-starter-blog-no-styles)
  [(demo)](http://capricious-spring.surge.sh/)

  Features:

  * Same as official gatsby-starter-blog but with all styling removed

* [gatsby-material-starter](https://github.com/Vagr9K/gatsby-material-starter)
  [(demo)](https://vagr9k.github.io/gatsby-material-starter/)

  Features:

  * React-MD for Material design
  * Sass/SCSS
  * Tags
  * Categories
  * Google Analytics
  * Disqus
  * Offline support
  * Web App Manifest
  * SEO
  * [Full list here!](https://github.com/Vagr9K/gatsby-material-starter#features)

* [gatsby-typescript-starter](https://github.com/fabien0102/gatsby-starter)
  [(demo)](https://fabien0102-gatsby-starter.netlify.com/)

  Features:

  * Semantic-ui for styling
  * TypeScript
  * Offline support
  * Web App Manifest
  * Jest/Enzyme testing
  * Storybook
  * Markdown linting
  * [Full list here!](https://github.com/fabien0102/gatsby-starter#whats-inside)

* [gatsby-starter-bootstrap](https://github.com/jaxx2104/gatsby-starter-bootstrap)
  [(demo)](https://jaxx2104.github.io/gatsby-starter-bootstrap/)

  Features:

  * Bootstrap CSS framework
  * Single column layout
  * Basic components: SiteNavi, SitePost, SitePage

* [gatsby-blog-starter-kit](https://github.com/dschau/gatsby-blog-starter-kit)
  [(demo)](https://dschau.github.io/gatsby-blog-starter-kit/)

  Features:

  * Blog post listing with previews for each blog post
  * Navigation between posts with a previous/next post button
  * Tags and tag navigation

* [gatsby-starter-casper](https://github.com/haysclark/gatsby-starter-casper)
  [(demo)](https://haysclark.github.io/gatsby-starter-casper/)

  Features:

  * Page pagination
  * CSS
  * Tags
  * Google Analytics
  * Offline support
  * Web App Manifest
  * SEO
  * [Full list here!](https://github.com/haysclark/gatsby-starter-casper#features)

* [gatsby-advanced-starter](https://github.com/Vagr9K/gatsby-advanced-starter)
  [(demo)](https://vagr9k.github.io/gatsby-advanced-starter/)

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

* [glitch-gatsby-starter-blog](https://github.com/100ideas/glitch-gatsby-starter-blog/)
  ([demo](https://gatsby-starter-blog.glitch.me))

  Features:

  * [live-edit](https://glitch.com/edit/#!/remix/gatsby-starter-blog) a temp,
    anon copy of app
  * same code as
    [gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog)
    (mostly)
  * free hosting & web IDE on glitch.com
  * HMR working w/ glitch IDE (see
    [note](https://github.com/100ideas/glitch-gatsby-starter-blog/blob/5fce8999bd952087ecdc74c9787a0cb3cb884371/README.md#enabling-hmr))
  * caution:
    * app running in **develop** mode
    * glitch serves assets over CDN, API unclear
    * virtual server container provides
      [**128MB** for app](https://glitch.com/faq#restrictions) (512MB for
      assets)
    * server can't install certain gatsby plugins (`sharp`-based; out of mem?)

* [gatsby-starter-grommet](https://github.com/alampros/gatsby-starter-grommet)
  [(demo)](https://alampros.github.io/gatsby-starter-grommet/)

  Features:

  * Barebones configuration for using the [Grommet](https://grommet.github.io/)
    design system
  * Uses Sass (with CSS modules support)

* [gatsby-starter-basic](https://github.com/PrototypeInteractive/gatsby-react-boilerplate)
  [(demo)](https://prototypeinteractive.github.io/gatsby-react-boilerplate/)

  Features:

  * Basic configuration and folder structure
  * Uses PostCSS and Sass (with autoprefixer and pixrem)
  * Uses Bootstrap 4 grid
  * Leaves the styling to you
  * Uses data from local json files
  * Contains Node.js server code for easy, secure, and fast hosting

* [gatsby-starter-typescript](https://github.com/haysclark/gatsby-starter-typescript)
  [(demo)](https://haysclark.github.io/gatsby-starter-typescript/)

  Features:

  * TypeScript

* [gatsby-starter-default-i18n](https://github.com/angeloocana/gatsby-starter-default-i18n)
  [(demo)](https://gatsby-starter-default-i18n.netlify.com)

  Features:

  * localization (Multilanguage)

* [gatsby-starter-contentful-i18n](https://github.com/mccrodp/gatsby-starter-contentful-i18n) [(demo)](https://gatsby-starter-contentful-i18n.netlify.com/)

  Features:

  * Localization (Multilanguage)
  * Dynamic content from Contentful CMS
  * Integrates [i18n plugin starter](https://github.com/angeloocana/gatsby-starter-default-i18n) and [using-contentful](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-contentful) repos

* [gatsby-starter-gatsbythemes](https://github.com/saschajullmann/gatsby-starter-gatsbythemes)
  [(demo)](https://themes.gatsbythemes.com/gatsby-starter/)

  Features:

  * CSS-in-JS via [Emotion](https://github.com/emotion-js/emotion).
  * Jest and Enzyme for testing.
  * Eslint in dev mode with the airbnb config and prettier formatting rules.
  * React 16.
  * A basic blog, with posts under src/pages/blog. There's also a script which
    creates a new Blog entry (post.sh).
  * Data per JSON files.
  * A few basic components (Navigation, Footer, Layout).
  * Layout components make use of
    [Styled-System](https://github.com/jxnblk/styled-system).
  * Google Analytics (you just have to enter your tracking-id).
  * Gatsby-Plugin-Offline which includes Service Workers.
  * [Prettier](https://github.com/prettier/prettier) for a uniform codebase.
  * [Normalize](https://github.com/necolas/normalize.css/) css (7.0).
  * [Feather](https://feather.netlify.com/) icons.
  * Font styles taken from [Tachyons](http://tachyons.io/).

* [gatsby-starter-netlify-cms](https://github.com/AustinGreen/gatsby-starter-netlify-cms)
  [(demo)](https://gatsby-netlify-cms.netlify.com/)

  Features:

  * A simple blog built with Netlify CMS
  * Basic directory organization
  * Uses [Bulma](https://bulma.io/) for styling
  * Visit [the repo](https://github.com/AustinGreen/gatsby-starter-netlify-cms)
    to learn how to set up authentication, and begin modeling your content.

* [gatsby-starter-portfolio-emma](https://github.com/LeKoArts/gatsby-starter-portfolio-emma)
  [(demo)](https://portfolio-emma.netlify.com/)

  The target audience are designers and photographers.

  Features:

  * Full-width photo grid-layout (with [gatsby-image](https://using-gatsby-image.gatsbyjs.org/))
  * Minimalistic light theme with large images
  * Create your projects in Markdown
  * Styling with SCSS and
    [Typography.js](https://kyleamathews.github.io/typography.js/)
  * Easily configurable
  * And other good stuff (SEO, Offline Support, WebApp Manifest Support)

* [gatsby-starter-portfolio-emilia](https://github.com/LeKoArts/gatsby-starter-portfolio-emilia)
  [(demo)](https://portfolio-emilia.netlify.com/)

  The target audience are designers and photographers.

  Features:

  * Focus on big images (with [gatsby-image](https://using-gatsby-image.gatsbyjs.org/))
  * Dark Theme with HeroPatterns Header
  * CSS Grid and Styled Components
  * One-Page layout with sub-pages for projects
  * Easily configurable
  * React Overdrive transitions
  * Create your projects in Markdown
  * And other good stuff (SEO, Offline Support, WebApp Manifest Support)

* [gatsby-starter-bootstrap-netlify](https://github.com/konsumer/gatsby-starter-bootstrap-netlify)
  [(demo)](https://gatsby-starter-bootstrap-netlify.netlify.com)

  Features:

  * Very similar to
    [gatsby-starter-netlify-cms](https://github.com/AustinGreen/gatsby-starter-netlify-cms),
    slightly more configurable (eg set site-title in `gatsby-config`) with
    Bootstrap/Bootswatch instead of bulma

* [open-crowd-fund](https://github.com/rwieruch/open-crowd-fund)
  [(demo)](https://www.roadtolearnreact.com/)

  Features:

  * Open source crowdfunding for your own ideas
  * Alternative for Kickstarter, GoFundMe, etc.
  * Secured Credit Card payments with Stripe
  * Storing of funding information in Firebase

* [gatsby-starter-dimension](https://github.com/ChangoMan/gatsby-starter-dimension)
  [(demo)](http://gatsby-dimension.surge.sh/)

  Features:

  * Based off of the Dimension site template. Designed by
    [HTML5 UP](https://html5up.net/dimension)
  * Simple one page site that's perfect for personal portfolios
  * Fully Responsive
  * Styling with SCSS

* [gatsby-starter-docs](https://github.com/ericwindmill/gatsby-starter-docs)
  [(demo)](https://gatsby-docs-starter.netlify.com/)

  Features:

  * All the features from
    [gatsby-advanced-starter](https://github.com/Vagr9K/gatsby-advanced-starter),
    plus:
  * Designed for Documentation / Tutorial Websites
  * 'Table of Contents' Component: Auto generates ToC from posts - just follow
    the file frontmatter conventions from markdown files in 'lessons'.
  * Styled Components w/ ThemeProvider
  * Basic UI
  * A few extra components
  * Custom prismjs theme
  * React Icons

* [gatsby-styled-blog-starter](https://github.com/greglobinski/gatsby-styled-blog-starter)
  [(demo)](https://gsbs.greglobinski.com/)

  Features:

  * sidebar navigation
  * look like an app
  * page transitions
  * pwa
  * styling with styled-components
  * easily restyled through theme object
  * [README](https://github.com/greglobinski/gatsby-styled-blog-starter)

* [gatsby-starter-deck](https://github.com/fabe/gatsby-starter-deck)
  [(demo)](https://gatsby-deck.netlify.com/)

  Features:

  * Create presentations/slides using Gatsby.
  * Offline support.
  * Page transitions.

* [gatsby-starter-forty](https://github.com/ChangoMan/gatsby-starter-forty)
  [(demo)](http://gatsby-forty.surge.sh/)

  Features:

  * Based off of the Forty site template. Designed by
    [HTML5 UP](https://html5up.net/forty)
  * Colorful homepage, and also includes a Landing Page and Generic Page components.
  * Many elements are available, including buttons, forms, tables, and pagination.
  * Styling with SCSS

* [gatsby-firebase-authentication](https://github.com/rwieruch/gatsby-firebase-authentication) [(demo)](https://react-firebase-authentication.wieruch.com/)

  Features:

  * Sign In, Sign Up, Sign Out
  * Password Forget
  * Password Change
  * Protected Routes with Authorization
  * Realtime Database with Users

* [gatsby-starter-ceevee](https://github.com/amandeepmittal/gatsby-starter-ceevee) [(demo)](http://gatsby-starter-ceevee.surge.sh/)

  Features:

  * Based on the Ceevee site template, design by [Styleshout](https://www.styleshout.com/)
  * Single Page Resume/Portfolio site
  * Target audience Developers, Designers, etc.
  * Used CSS Modules, easy to manipulate
  * FontAwsome Library for icons
  * Responsive Design, optimized for Mobile devices

- [gatsby-starter-product-guy](https://github.com/amandeepmittal/gatsby-starter-product-guy) [(demo)](http://gatsby-starter-product-guy.surge.sh/)

  Features:

  * Single Page
  * A portfolio Developers and Product launchers alike
  * Using [Typography.js](https://kyleamathews.github.io/typography.js/) easy to switch fonts
  * All your Project/Portfolio Data in Markdown, server by GraphQL
  * Responsive Design, optimized for Mobile devices

* [gatsby-starter-strata](https://github.com/ChangoMan/gatsby-starter-strata)
  [(demo)](http://gatsby-strata.surge.sh/)

  Features:

  * Based off of the Strata site template. Designed by
    [HTML5 UP](https://html5up.net/strata)
  * Super Simple, single page portfolio site
  * Lightbox style React photo gallery
  * Fully Responsive
  * Styling with SCSS

* [verious](https://github.com/cpinnix/verious-boilerplate)
  [(demo)](https://www.verious.io/)

  Features:

  * Components only. Bring your own data, plugins, etc.
  * Bootstrap inspired grid system with Container, Row, Column components.
  * Simple Navigation and Dropdown components.
  * Baseline grid built in with modular scale across viewports.
  * Abstract measurements utilize REM for spacing.
  * One font to rule them all: Helvetica.

* [gatsby-starter-lumen](https://github.com/alxshelepenok/gatsby-starter-lumen)
  [(demo)](https://lumen.netlify.com/)

  Features:

  * Lost Grid.
  * Beautiful typography inspired by [matejlatin/Gutenberg](https://github.com/matejlatin/Gutenberg).
  * [Mobile-First](https://medium.com/@mrmrs_/mobile-first-css-48bc4cc3f60f) approach in development.
  * Stylesheet built using Sass and [BEM](http://getbem.com/naming/)-Style naming.
  * Syntax highlighting in code blocks.
  * Sidebar menu built using a configuration block.
  * Archive organized by tags and categories.
  * Automatic RSS generation.
  * Automatic Sitemap generation.
  * Offline support.
  * Google Analytics support.
  * Disqus Comments support.

* [gatsby-starter-strict](https://github.com/kripod/gatsby-starter-strict)
  [(demo)](https://gatsby-starter-strict.netlify.com)

  Features:

  * A set of strict linting rules (based on the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript))
    * `lint` script
  * Encourage automatic code formatting
    * `format` script
  * Prefer using [Yarn](https://yarnpkg.com) for package management
  * Use [EditorConfig](http://editorconfig.org) to maintain consistent coding styles between different editors and IDEs
  * Integration with [Visual Studio Code](https://code.visualstudio.com)
    * Pre-configured auto-formatting on file save
  * Based on [gatsby-starter-default](https://github.com/gatsbyjs/gatsby-starter-default)

* [gatsby-hampton-theme](https://github.com/davad/gatsby-hampton-theme)
  [(demo)](http://dmwl.net/gatsby-hampton-theme)

  Features:

  * Eslint in dev mode with the airbnb config and prettier formatting rules
  * [Emotion](https://github.com/emotion-js/emotion) for CSS-in-JS
  * A basic blog, with posts under src/pages/blog
  * A few basic components (Navigation, Layout, Link wrapper around `gatsby-link`))
  * Based on [gatsby-starter-gatsbytheme](https://github.com/saschajullmann/gatsby-starter-gatsbythemes)

* [gatsby-wordpress-starter](https://github.com/ericwindmill/gatsby-starter-wordpress)
  [(demo)](https://gatsby-wordpress-starter.netlify.com/)

  Features:

  * All the features from
    [gatsby-advanced-starter](https://github.com/Vagr9K/gatsby-advanced-starter),
    plus:
  * Leverages the [WordPress plugin for Gatsby](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-wordpress) for data
  * Configured to work with WordPress Advanced Custom Fields
  * Auto generated Navigation for your Wordpress Pages
  * Minimal UI and Styling -- made to customize.
  * Styled Components

* [gatsby-starter-simple-landing](https://github.com/greglobinski/gatsby-starter-simple-landing)
  [(demo)](https://gssl.greglobinski.com/)

  Features:

  * CSS-in-JS via [JSS](https://github.com/cssinjs/jss)
  * easily restyled through theme object
  * text content via Markdown files
  * auto-generated sizes and types (png, webp) for background and hero images
  * favicons generator
  * webfonts with [webfontloader](https://github.com/typekit/webfontloader)

* [gatsby-orga](https://github.com/xiaoxinghu/gatsby-orga)
  [(demo)](https://xiaoxinghu.github.io/gatsby-orga/)

  Features:

  * Parses [org-mode](http://orgmode.org) files with [Orga](https://github.com/xiaoxinghu/orgajs).

* [gatsby-starter-minimal-blog](https://github.com/LeKoArts/gatsby-starter-minimal-blog)
  [(demo)](https://minimal-blog.netlify.com/)

  Features:

  * Minimal and clean white layout
  * Offline Support, WebApp Manifest, SEO
  * Automatic Favicons
  * Typography.js
  * Part of a german tutorial series on Gatsby. The starter will change over time to use more advanced stuff (feel free to express your ideas)

* [gatsby-starter-redux](https://github.com/caki0915/gatsby-starter-redux)
  [(demo)](https://caki0915.github.io/gatsby-starter-redux/)

  Features:

  * [Redux](https://github.com/reactjs/redux) and [Redux-devtools](https://github.com/gaearon/redux-devtools).
  * [Emotion](https://github.com/emotion-js/emotion) with a basic theme and SSR
  * [Typography.js](https://kyleamathews.github.io/typography.js/)
  * Eslint rules based on [Prettier](https://prettier.io/) and [Airbnb](https://www.npmjs.com/package/eslint-config-airbnb)

* [gatsby-contentful-starter](https://github.com/contentful-userland/gatsby-contentful-starter) [(demo)](https://contentful-userland.github.io/gatsby-contentful-starter/)

  Features:

  * Based on the [Gatsby Starter Blog](https://github.com/gatsbyjs/gatsby-starter-blog)
  * [Includes Contentful Delivery API for production build](https://www.contentful.com/developers/docs/references/content-delivery-api/)
  * [Includes Contentful Preview API for development](https://www.contentful.com/developers/docs/references/content-preview-api/)

* [gatsby-starter-gcn](https://github.com/ryanwiemer/gatsby-starter-gcn) [(demo)](https://gcn.netlify.com/)

  Features:

  * Inspired by [gatsby-contentful-starter](https://github.com/contentful-userland/gatsby-contentful-starter)
  * Contentful integration with ready to go placeholder content
  * Netlify integration including a pre-built contact form
  * Minimal responsive design - made to customize or tear apart
  * Styled components
  * SEO friendly
