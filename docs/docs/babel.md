---
title: Babel
---

Gatsby uses the phenomenal project [Babel](https://babeljs.io/) to enable
support for writing modern JavaScript — while still supporting older browsers.

## How to specify which browsers to support

Gatsby supports by default the last two versions of major browsers, IE 9+, as well as
any browser that still has 1%+ browser share.

This means we automatically compile your JavaScript to ensure it works on older browsers.
We also automatically add polyfills as needed — no more shipping code which mysteriously
breaks on older browsers!

If you only target newer browsers, see the [Browser
Support](/docs/browser-support/) docs page for how to instruct Gatsby on which
browsers you support and then Babel will start compiling for only these
browsers.

## How to use a custom .babelrc file

Gatsby ships with a default .babelrc setup that should work for most sites. If you'd like
to add custom Babel presets or plugins, you can create your own `.babelrc` at the root of your site, import [`babel-preset-gatsby`](https://github.com/gatsbyjs/gatsby/tree/master/packages/babel-preset-gatsby), and overwrite the `target` option.

```shell
npm install --save-dev babel-preset-gatsby
```

```json5:title=.babelrc
{
  presets: [
    [
      "babel-preset-gatsby",
      {
        targets: {
          browsers: [">0.25%", "not dead"],
        },
      },
    ],
  ],
}
```

For more advanced configurations, you can also copy the defaults from [`babel-preset-gatsby`](https://github.com/gatsbyjs/gatsby/tree/master/packages/babel-preset-gatsby) and customize them to suit your needs.
