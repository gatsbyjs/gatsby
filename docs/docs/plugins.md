---
title: Plugins
---

Plugins are Node.js packages that implement Gatsby APIs. They enable you to
easily solve common website build problems e.g. setup Sass, add markdown
support, process images, etc.

For larger / complex sites, they let you modularize your site customizations
into site-specific plugins.

Gatsby has a large and growing set of plugins. See below for the
[list of official plugins](#official-plugins). We'll eventually add support here
for searching and browsing both official plugins and community plugins published
on NPM.

## How to use?

Plugins are just Node.js packages meaning you install them like anything else in
node using NPM.

For example, `gatsby-transformer-json` is a package which adds support for JSON
files to the Gatsby data layer.

To install it, in the root of your site you run:

`npm install --save gatsby-transformer-json`

Then in your site's `gatsby-config.js` you add `gatsby-transformer-json`
to the plugins array like:

```javascript
module.exports = {
  plugins: [`gatsby-transformer-json`],
};
```

Plugins can take options. See each plugin page below for more detailed
documentation on using each plugin.

## Locally defined plugins

When you want to work on a new plugin, or maybe write one that is only relevant
to your specific use-case, a locally defined plugin is more convenient than
having to create an NPM package for it.

You can place the code in the `plugins` folder in the root of your project like
this:

```
plugins
└── my-own-plugin
    ├── gatsby-node.js
    └── package.json
```

You still need to add the plugin to your `gatsby-config.js` like for plugins
installed from NPM.

Each plugin requires a package.json file, but the minimum content is just an
empty object `{}`. The `name` and `version` fields are read from the package
file. The name is used to identify the plugin when it mutates the GraphQL data
structure. The version is used to clear the cache when it changes.

For local plugins it is best to leave the version field empty. Gatsby will
generate an md5-hash from all gatsby-\* file contents and use that as the
version. This way the cache is automatically flushed when you change the code of
your plugin.

If the name is empty it is inferred from the plugin folder name.

Like all gatsby-\* files, the code is not being processed by Babel. If you want
to use JavaScript syntax which isn't supported by your version of Node.js, you
can place the files in a `src` subfolder and build them to the plugin folder
root.

## Official plugins

* [gatsby-plugin-aphrodite](/packages/gatsby-plugin-aphrodite/)
* [gatsby-plugin-canonical-urls](/packages/gatsby-plugin-canonical-urls/)
* [gatsby-plugin-catch-links](/packages/gatsby-plugin-catch-links/)
* [gatsby-plugin-coffeescript](/packages/gatsby-plugin-coffeescript/)
* [gatsby-plugin-create-client-paths](/packages/gatsby-plugin-create-client-paths/)
* [gatsby-plugin-cxs](/packages/gatsby-plugin-cxs/)
* [gatsby-plugin-emotion](/packages/gatsby-plugin-emotion/)
* [gatsby-plugin-feed](/packages/gatsby-plugin-feed/)
* [gatsby-plugin-glamor](/packages/gatsby-plugin-glamor/)
* [gatsby-plugin-glamorous](/packages/gatsby-plugin-glamorous/)
* [gatsby-plugin-google-analytics](/packages/gatsby-plugin-google-analytics/)
* [gatsby-plugin-google-tagmanager](/packages/gatsby-plugin-google-tagmanager/)
* [gatsby-plugin-jss](/packages/gatsby-plugin-jss/)
* [gatsby-plugin-less](/packages/gatsby-plugin-less/)
* [gatsby-plugin-lodash](/packages/gatsby-plugin-lodash/)
* [gatsby-plugin-manifest](/packages/gatsby-plugin-manifest/)
* [gatsby-plugin-netlify-cms](/packages/gatsby-plugin-netlify-cms/)
* [gatsby-plugin-netlify](/packages/gatsby-plugin-netlify/)
* [gatsby-plugin-no-sourcemaps](/packages/gatsby-plugin-no-sourcemaps/)
* [gatsby-plugin-nprogress](/packages/gatsby-plugin-nprogress/)
* [gatsby-plugin-offline](/packages/gatsby-plugin-offline/)
* [gatsby-plugin-postcss-sass](/packages/gatsby-plugin-postcss-sass)
* [gatsby-plugin-preact](/packages/gatsby-plugin-preact/)
* [gatsby-plugin-react-css-modules](/packages/gatsby-plugin-react-css-modules/)
* [gatsby-plugin-react-helmet](/packages/gatsby-plugin-react-helmet/)
* [gatsby-plugin-react-next](/packages/gatsby-plugin-react-next/)
* [gatsby-plugin-remove-trailing-slashes](/packages/gatsby-plugin-remove-trailing-slashes/)
* [gatsby-plugin-sass](/packages/gatsby-plugin-sass/)
* [gatsby-plugin-sharp](/packages/gatsby-plugin-sharp/)
* [gatsby-plugin-sitemap](/packages/gatsby-plugin-sitemap/)
* [gatsby-plugin-styled-components](/packages/gatsby-plugin-styled-components/)
* [gatsby-plugin-styled-jsx](/packages/gatsby-plugin-styled-jsx/)
* [gatsby-plugin-styletron](/packages/gatsby-plugin-styletron/)
* [gatsby-plugin-stylus](/packages/gatsby-plugin-stylus/)
* [gatsby-plugin-twitter](/packages/gatsby-plugin-twitter/)
* [gatsby-plugin-typescript](/packages/gatsby-plugin-typescript/)
* [gatsby-plugin-typography](/packages/gatsby-plugin-typography/)
* [gatsby-remark-autolink-headers](/packages/gatsby-remark-autolink-headers/)
* [gatsby-remark-code-repls](/packages/gatsby-remark-code-repls/)
* [gatsby-remark-copy-linked-files](/packages/gatsby-remark-copy-linked-files/)
* [gatsby-remark-custom-blocks](/packages/gatsby-remark-custom-blocks/)
* [gatsby-remark-embed-snippet](/packages/gatsby-remark-embed-snippet/)
* [gatsby-remark-images](/packages/gatsby-remark-images/)
* [gatsby-remark-katex](/packages/gatsby-remark-katex/)
* [gatsby-remark-prismjs](/packages/gatsby-remark-prismjs/)
* [gatsby-remark-responsive-iframe](/packages/gatsby-remark-responsive-iframe/)
* [gatsby-remark-smartypants](/packages/gatsby-remark-smartypants/)
* [gatsby-source-contentful](/packages/gatsby-source-contentful/)
* [gatsby-source-drupal](/packages/gatsby-source-drupal/)
* [gatsby-source-faker](/packages/gatsby-source-faker/)
* [gatsby-source-filesystem](/packages/gatsby-source-filesystem/)
* [gatsby-source-hacker-news](/packages/gatsby-source-hacker-news/)
* [gatsby-source-lever](/packages/gatsby-source-lever/)
* [gatsby-source-medium](/packages/gatsby-source-medium/)
* [gatsby-source-mongodb](/packages/gatsby-source-mongodb/)
* [gatsby-source-wordpress-com](/packages/gatsby-source-wordpress-com/)
* [gatsby-source-wordpress](/packages/gatsby-source-wordpress/)
* [gatsby-transformer-csv](/packages/gatsby-transformer-csv/)
* [gatsby-transformer-documentationjs](/packages/gatsby-transformer-documentationjs/)
* [gatsby-transformer-docx](/packages/gatsby-transformer-docx/)
* [gatsby-transformer-excel](/packages/gatsby-transformer-excel/)
* [gatsby-transformer-hjson](/packages/gatsby-transformer-hjson/)
* [gatsby-transformer-javascript-static-exports](/packages/gatsby-transformer-javascript-static-exports/)
* [gatsby-transformer-json](/packages/gatsby-transformer-json/)
* [gatsby-transformer-pdf](/packages/gatsby-transformer-pdf/)
* [gatsby-transformer-pdfimages](/packages/gatsby-transformer-pdfimages/)
* [gatsby-transformer-react-docgen](/packages/gatsby-transformer-react-docgen/)
* [gatsby-transformer-remark](/packages/gatsby-transformer-remark/)
* [gatsby-transformer-sharp](/packages/gatsby-transformer-sharp/)
* [gatsby-transformer-toml](/packages/gatsby-transformer-toml/)
* [gatsby-transformer-xml](/packages/gatsby-transformer-xml/)
* [gatsby-transformer-yaml](/packages/gatsby-transformer-yaml/)

## Official components

* [gatsby-image](/packages/gatsby-image/)
* [gatsby-link](/packages/gatsby-link/)

## Community Plugins

* [gatsby-plugin-accessibilityjs](https://github.com/alampros/gatsby-plugin-accessibilityjs)
* [gatsby-plugin-antd](https://github.com/bskimball/gatsby-plugin-antd)
* [gatsby-plugin-bugherd](https://github.com/indigotree/gatsby-plugin-bugherd)
* [gatsby-plugin-copy](https://github.com/aquilio/gatsby-plugin-copy)
* [gatsby-plugin-elasticlunr-search](https://github.com/andrew-codes/gatsby-plugin-elasticlunr-search)
* [gatsby-plugin-fastclick](https://github.com/escaladesports/gatsby-plugin-fastclick)
* [gatsby-plugin-favicon](https://github.com/Creatiwity/gatsby-plugin-favicon)
* [gatsby-plugin-fela](https://github.com/mmintel/gatsby-plugin-fela)
* [gatsby-plugin-google-fonts](https://github.com/didierfranc/gatsby-plugin-google-fonts)
* [gatsby-plugin-gosquared](https://github.com/jongold/gatsby-plugin-gosquared)
* [gatsby-plugin-hotjar](https://github.com/pavloko/gatsby-plugin-hotjar)
* [gatsby-plugin-i18n-readnext](https://github.com/angeloocana/gatsby-plugin-i18n-readnext)
* [gatsby-plugin-i18n-tags](https://github.com/angeloocana/gatsby-plugin-i18n-tags)
* [gatsby-plugin-i18n](https://github.com/angeloocana/gatsby-plugin-i18n)
* [gatsby-plugin-intercom-spa](https://github.com/toriihq/gatsby-plugin-intercom-spa)
* [gatsby-plugin-klipse](https://github.com/ahmedelgabri/gatsby-plugin-klipse)
* [gatsby-plugin-mixpanel](https://github.com/thomascarvalho/gatsby-plugin-mixpanel)
* [gatsby-plugin-protoculture](https://github.com/atrauzzi/gatsby-plugin-protoculture)
* [gatsby-plugin-purify-css](https://github.com/rongierlach/gatsby-plugin-purify-css)
* [gatsby-plugin-segment-js](https://github.com/benjaminhoffman/gatsby-plugin-segment-js)
* [gatsby-plugin-stripe-checkout](https://github.com/njosefbeck/gatsby-plugin-stripe-checkout)
* [gatsby-plugin-stripe-elements](https://github.com/njosefbeck/gatsby-plugin-stripe-elements)
* [gatsby-plugin-svg-sprite](https://github.com/marcobiedermann/gatsby-plugin-svg-sprite)
* [gatsby-plugin-svgr](https://github.com/zabute/gatsby-plugin-svgr)
* [gatsby-plugin-typescript-css-modules](https://github.com/jcreamer898/gatsby-plugin-typescript-css-modules)
* [gatsby-plugin-yandex-metrika](https://github.com/viatsko/gatsby-plugin-yandex-metrika)
* [gatsby-plugin-pathdata](https://github.com/barskern/gatsby-plugin-pathdata)
* [gatsby-remark-emoji](https://github.com/Rulikkk/gatsby-remark-emoji)
* [gatsby-remark-external-links](https://github.com/JLongley/gatsby-remark-external-links)
* [gatsby-remark-flowchart](https://github.com/liudonghua123/gatsby-remark-flowchart)
* [gatsby-remark-graph](https://github.com/konsumer/gatsby-remark-graph)
* [gatsby-remark-sequence](https://github.com/liudonghua123/gatsby-remark-sequence)
* [gatsby-source-airtable](https://github.com/kevzettler/gatsby-source-airtable)
* [gatsby-source-behance](https://github.com/LeKoArts/gatsby-source-behance)
* [gatsby-source-datocms](https://github.com/datocms/gatsby-source-datocms)
* [gatsby-source-directus](https://github.com/iKonrad/gatsby-source-directus)
* [gatsby-source-github](https://github.com/mosch/gatsby-source-github)
* [gatsby-source-google-sheets](https://github.com/brandonmp/gatsby-source-google-sheets)
* [gatsby-source-graphcms](https://github.com/GraphCMS/gatsby-source-graphcms)
* [gatsby-source-mesh](https://github.com/gentics/gatsby-source-mesh)
* [gatsby-source-soundcloud](https://github.com/jedidiah/gatsby-source-soundcloud)
* [gatsby-source-stripe](https://github.com/njosefbeck/gatsby-source-stripe)
* [gatsby-source-twitch](https://github.com/jedidiah/gatsby-source-twitch)
* [gatsby-source-unsplash](https://github.com/vacas5/gatsby-source-unsplash)
* [gatsby-source-workable](https://github.com/tumblbug/gatsby-source-workable)

## Community Library

* [gatsby-node-helpers](https://github.com/angeloashmore/gatsby-node-helpers)
* [gatsby-paginate](https://github.com/pixelstew/gatsby-paginate)
* [gatsby-pagination](https://github.com/infinitedescent/gatsby-pagination)
