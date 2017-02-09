# FAQ

## I added a new page and it's not showing up!

[Webpack doesn't currently support hot-reloading new files added to a context](https://github.com/webpack/webpack/issues/1162). When you add a new file, restart the `gatsby develop` process and your new page will show up.

Make sure you also including the **trailing slash** in your URLs:

- Bad: `http://localhost:8000/foo`
- Good: `http://localhost:8000/foo/`

## Inline CSS

A neat performance feature supported by Gatsby is inlining your CSS in
the `<head>` of each HTML page. Not referencing external style sheets
significantly speeds up the initial render of your site by avoiding
another round trip to your server as the initial render of a page is
blocked by external CSS files. This is a best practice suggested by
many groups including [Google's AMP
project](https://www.ampproject.org/docs/guides/responsive/style_pages.html).

Each of [the official starters supports this pattern](https://github.com/gatsbyjs/gatsby-starter-default/blob/master/html.js).
 The code to make it happen is in brief:

```javascript
// In your html.js
let css
// In development, css is injected by Javascript by the Webpack style-loader.
if (process.env.NODE_ENV === 'production') {
  css = <style dangerouslySetInnerHTML={{ __html: require('!raw!./public/styles.css') }} />
}

// Then in your <head>
{css}
```
## CSS modules

[CSS modules](https://github.com/css-modules/css-modules) are support by default for all files with `.module.(css|less|scss|sass)` extension.

```javascript
// Uses CSS Modules
import './my-component.module.css'

// Doesn't use CSS Modules
import './main.css'
```

## Configuring Babel

You can modify Babel's behavior as normal by either providing a `.babelrc` in
your site's root directory or by adding a "babel" section in your site's
`package.json`. You can find out more about how to configure babel
[here](https://babeljs.io/docs/usage/babelrc/).

Gatsby by default will use your Babel configuration over the default if it can
find it. Gatsby will automatically add react-hmre to your Babel config during
development.

Note that if you want to use babel-plugin that is not provided by Gatsby, you
will have to also add it to your package.json. You can use any babel-plugin
that Gatsby packs as a dependency without having to add it to your own
package.json:

* babel-plugin-add-module-exports
* babel-plugin-transform-object-assign
* babel-preset-es2015
* babel-preset-react
* babel-preset-stage-0

If you need to change the loader to be something completely custom. You will
have to define your own webpack loader by following the steps [described
above](https://github.com/gatsbyjs/gatsby#how-to-use-your-own-webpack-loaders).

## Extending Markdown Syntax with Plugins

Gatsby uses [markdown-it](https://github.com/markdown-it/markdown-it) to parse 
markdown files into HTML. By default Gatsby ships with only basic markdown
support. You can extend the syntax (e.g. for mathematical equations) by installing 
[markdown-it plugins](https://www.npmjs.org/browse/keyword/markdown-it-plugin).

If you want to do this you will need to use a custom markdown loader. You can 
copy the one provided in the default starter [here](https://github.com/gatsbyjs/gatsby-starter-default/blob/master/loaders/markdown-loader/index.js).
Add the relevant packages to your dependencies, including the markdown-it
plugins that you want to use and enable them with `md.use(require('markdown-it-plugin-name'))`
within the markdown loader file.

## Deploying to Github Pages (and other hosts where your site's links need prefixes)
Gatsby supports automatically prefixing links with its `prefixLink` helper function.

First set the prefix in your config file e.g. `linkPrefix = '/your-project'`

Then simply import the function and run all links in your site
thorough it e.g.

```javascript
import { prefixLink } from 'gatsby-helpers'

prefixLink('/')
// During development this will return "/"
// When deployed to example.github.io/your-project/ this will return "/your-project/"
```

Then finally, when building your site, run `gatsby build --prefix-links`

The built site is now in `/public`. These files need copied to your
`gh-pages` branch and committed and pushed. You can do this manually or
use the handy [`gh-pages`](https://www.npmjs.com/package/gh-pages) CLI tool.

Both the sample sites are deployed to github pages and use link
prefixing. Read their source for more help:
[documentation](https://github.com/gatsbyjs/gatsby-starter-documentation)/[blog](https://github.com/gatsbyjs/gatsby-starter-blog).

## I have an existing site in (Wordpress|Drupal|Blogger|Tumblr|*), how do I convert it to Gatsby?
Jekyll has a [comprehensive import tool](http://import.jekyllrb.com/) for these and many other website tools.
Once your pages are converted to markdown, change the file extensions to
`.md` from the `.markdown` the tool outputs and then use them in your
site.
