# gatsby-plugin-subfont

[Subfont](https://github.com/Munter/subfont) is a command line tool that optimizes font delivery for HTML files.

`gatsby-plugin-subfont` wraps the tool and automatically runs in your site's homepage.

## Install

`npm install gatsby-plugin-subfont`

If you want the ability to run font subsetting locally you'l need Python and install fonttools with this command line:

`pip install fonttools brotli zopfli`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-subfont`,
      options: {
        silent: true,
        fallbacks: false,
        inlineFonts: true,
      },
    },
  ],
}
```

## Options

You can refer [README file of subfont](https://github.com/Munter/subfont) for detail. `inlineCss` and `inPlace` option is set as `true` in this plugin for convenience.

| Name          | Default                 | Description                                                                                               |
| ------------- | ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `root`        | `public`                | Path to your web root                                                                                     |
| `output`      | same as root            | Directory where results should be written to                                                              |
| `fallbacks`   | `true`                  | Include fallbacks so the original font will be loaded when dynamic content gets injected at runtime.      |
| `dynamic`     | `false`                 | Also trace the usage of fonts in a headless browser with JavaScript enabled                               |
| `inPlace`     | `true`                  | Modify HTML-files in-place. Only use on build artifacts                                                   |
| `inlineCss`   | `true`                  | Inline CSS that declares the @font-face for the subset fonts                                              |
| `fontDisplay` | `swap`                  | Injects a font-display value into the @font-face CSS. Valid values: auto, block, swap, fallback, optional |
| `formats`     | `['woff2', 'woff']`     | Font formats to use when subsetting. [choices: "woff2", "woff", "truetype"]                               |
| `recursive`   | `false`                 | Crawl all HTML-pages linked with relative and root relative links. This stays inside your domain          |
| `silent`      | `false`                 | Do not write anything to stdout                                                                           |
| `debug`       | `false`                 | Verbose insights into font glyph detection                                                                |
| `dryRun`      | `false`                 | Don't write anything to disk                                                                              |
| `inputFiles`  | `['${root}/**/*.html']` | htmlFile(s) or url(s)                                                                                     |
