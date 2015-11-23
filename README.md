[![npm package](https://img.shields.io/npm/v/gatsby.svg?style=flat-square)](https://www.npmjs.org/package/gatsby)
[![gatsby channel on discord](https://img.shields.io/badge/discord-gatsby%40reactiflux-738bd7.svg?style=flat-square)](https://discord.gg/0ZcbPKXt5bVoxkfV)

# Gatsby
Transform plain text into dynamic blogs and websites using the latest
web technologies. A React.js static site generator.

Build sites like it's 1995. Files are translated into HTML pages at the
same position within the file system. Add a markdown file at `/docs/index.md` and
it'll be converted to `/docs/index.html`.

Supports Markdown, HTML, and React.js components out of the box. Easy to add
support for additional files types.

Leverages [React Router's "nested component
hierarchy"](https://github.com/rackt/react-router/blob/master/docs/Introduction.md)
to make templating incredibly intuitive.

All templates, css, and content are hot reloadable.

![live-reloading example](http://zippy.gfycat.com/UltimateWeeklyBarebirdbat.gif)

### Goals
* No-reload page transitions
* Hot reload editing. Tweak your pages, templates, and styles and see changes in
  real time.
* Make React.js component model and ecosystem available for building static sites
* Intuitive directory-based URLs. The URL of a page is derived from its
  spot on the file system.
* Support "Starters" — install starter sites directly from Github. Use open sourced
  starters or build your own.

### Demos
* [Documentation site](http://gatsbyjs.github.io/gatsby-starter-documentation/)
* [Blog](http://gatsbyjs.github.io/gatsby-starter-blog/)

### Why use Gatsby instead of other Static Site Generators
* No-refresh page transitions
* The awesome React.js component model
* Live editing on every part of your site. Dramatically speed development.

### I'm already building a server-rendered React.js site, is Gatsby a good fit?
If your site falls closer to the site end of the app<---->site spectrum
then yes.

Gatsby is an excellent fit for blogs, marketing sites, docs sites, etc. Proper web
apps should probably remain as normal web apps (though I'd love to be
proved wrong!).

### Warning!
Gatsby is very new. APIs will break. Functionality is missing. It's
usable but if you plan on building with it, expect a rocky road for some time.

Contributions welcome!

## Getting started

### Install
`npm install -g gatsby`

### Usage
1. Create new Gatsby site `gatsby new my-test-gatsby-site` This creates the
   directory for your Gatsby project and adds the minimal files
   needed.
2. `cd my-test-gatsby-site`
3. `gatsby develop` — Gatsby will start a hot-reloading development
   server accessible at [localhost:8000](http://localhost:8000)
4. See the tutorial below for more.

### Gatsby Starters
The Gatsby cli tool lets you install "starters". These are
partially built sites preconfigured to help you get moving faster on
creating a certain type of site.

When creating a new site, you can optionally specify a starter to
base your new site on e.g. `gatsby new [SITE_DIRECTORY] [URL_OF_STARTER]`

For example, to quickly create a blog using Gatsby, you could install
the Gatsby Starter Blog by running:

`gatsby new blog https://github.com/gatsbyjs/gatsby-starter-blog`

This downloads the files and initializes the site by running `npm
install`

If you don't specify a custom starter, your site will created
from the [minimal default
starter](https://github.com/gatsbyjs/gatsby-starter-default).

There are several starters that have been created. Create a PR to
include yours!

* https://github.com/gatsbyjs/gatsby-starter-blog
* https://github.com/gatsbyjs/gatsby-starter-documentation

### Tutorial: Building a documentation site from the Gatsby Documentation Starter
1. Install gatsby `npm install -g gatsby`
1. Install documentation site starter `gatsby new docs-site
   gh:gatsbyjs/gatsby-starter-documentation`
2. type `cd docs-site`
2. type `gatsby develop`
3. Open site in browser at [localhost:8000](http://localhost:8000). Verify clicking on links works.
4. Try editing the site's config file `config.toml`.
   Change the `siteTitle` key. The site's title should change shortly
   after saving.
5. Next try editing a doc page. Open
   `/pages/docs/getting-started/index.md` and edit it. Again any saved
   changes should load without refreshing in the browser.
6. Add a new markdown page to the documentation. Copy the `getting-started`
   directory to `some-additional-steps`. Then edit the markdown file
   within the new directory. If you're familiar with other static site
   generation software, you'll be familiar with the "frontmatter" at the
   top of the file. Edit the title there + change the order to "5". Save
   this. Ideally this new file would be hot reloaded like other changes
   but I haven't figured out how to make this happen yet ([help
   appreciated here](https://github.com/webpack/webpack/issues/1162)).
   So to see your new page, restart `gatsby develop` and then refresh your
   browser.
7. Build your site `gatsby build`. The site is built to the `/public`
   directory. Serve the site by going into the public directory and
   typing `python -m SimpleHTTPServer`

## How Gatsby works

### How files become pages
The process is file --> Webpack loader --> React.js wrapper component
--> static html page.

Gatsby leverages [Webpack](http://webpack.github.io/) extensively.
 Webpack is a sophisticated module bundler that can turn any sort of
file into a commonjs module. Webpack uses "Loaders" to convert a file
into a module. These loaded modules are then wrapped inside a react.js
component that's specific to a given file type. Gatsby then generates a
static html page from this component.

Gatsby ships with default loaders and wrappers for HTML, Markdown, and
JSX/CJSX but for most projects you'll want to write your own loaders and
wrappers (very easy to do).

As an example of how this process works, let's walk quickly through
converting a markdown file into an html page.

The [default Gatsby markdown
loader](https://github.com/gatsbyjs/gatsby/blob/master/lib/loaders/markdown-loader/index.js)
 parses the markdown into HTML and uses [Highlight.js](https://highlightjs.org/)
 to syntax highlight code blocks.

Our markdown file.

```markdown
---
title: This is a title
---

# Hi friends.
This is a markdown file.
```

When loaded and required, the resulting javascript object looks like the
following.

```javascript
{
  file: {
    // Information about file on disk e.g. extension, directory path, etc.
  },
  data: {
    title: "This is a title",
    body: "<h1>Hi friends.</h1><p>This is a markdown file</p>"
  }
}

```
Now Gatsby wraps the markdown file in this very simple React.js component.

```javascript
module.exports = React.createClass({
  displayName: "MarkdownWrapper",

  render: function() {
    post = @props.page.data

    <div className="markdown">
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{__html: post.body}}/>
    </div>
  }
})
```

### How to write your own loaders/wrappers
* Coming...

### Structure of a Gatsby site
* `/pages` — All pages go here. Everything is turned into a page except
files which start with an underscore
* `_template` files — coming...

## Sites built with Gatsby
* [bricolage.io](http://bricolage.io?utm_source=github.com)
* [relaterocket.co](https://relaterocket.co?utm_source=github.com)
* [reindex.io](https://www.reindex.io)
* [syncano.io](https://www.syncano.io)
* [fixt.co](https://www.fixt.co)
* [Add yours!](https://github.com/gatsbyjs/gatsby/issues/new)

## FAQ

### Configuring Babel

Configuring babel-loader is as easy as creating a
[.babelrc](https://babeljs.io/docs/usage/babelrc/) in the root of the
project. To enable stage 0 transforms, the following `.babelrc` could
be used:

```javascript
{
  "stage": 0
}
```

### Deploying to Github Pages (and other hosts where your site's links need prefixes)
Gatsby supports automatically prefixing links with its `link` helper function.

To use simply import the function and run all links in your site
thorough it e.g.

```javascript
import { link } from 'gatsby-helpers'

link('/')
// During development this will return "/"
// When deployed to example.github.io/your-project/ this will return "/your-project/"
```

Set the prefix in your config file e.g. `linkPrefix = '/your-project'`

Then finally when building your site run `gatsby build --prefix-links`

The built site is now in `/public`. These files need copied to your
`gh-pages` branch and committed and pushed. You can do this manually or
use the handy `[gh-pages](https://www.npmjs.com/package/gh-pages)` cli tool.

Both the sample sites are deployed to github pages and use link
prefixing. Read their source for more help:
[documentation](https://github.com/gatsbyjs/gatsby-starter-documentation)/[blog](https://github.com/gatsbyjs/gatsby-starter-blog).
