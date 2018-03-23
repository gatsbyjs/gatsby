---
title: Babel
---

Gatsby uses the phenomenal project [Babel](https://babeljs.io/) to enable
support for writing modern JavaScript — while still supporting older browsers.

## How to specify which browsers to support

Gatsby supports by default the last two versions of major browsers, IE 9+, as well as
any browser that still as 1%+ browser share.

This means we automatically compile your JavaScript to ensure it works on older browsers.
We also automatically add polyfills as needed — no more shipping code which mysteriously
breaks on older browsers!

If you only target newer browsers, see the [Browser
Support](/docs/browser-support/) docs page for how to instruct Gatsby on which
browsers you support and then Babel will start compiling for only these
browsers.

## How to use a custom .babelrc file

Gatsby ships with a default .babelrc setup that should work for most sites. If you'd like
to add custom Babel presets or plugins, we recommend copying our default .bablerc below
to root of your site and modifying it per your needs.

```json5
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
        "sourceType": "unambiguous",
        "shippedProposals": true,
        "targets": {
          "browsers": ["> 1%", "IE >= 9", "last 2 versions"]
        }
      }
    ],
    [
      "@babel/preset-react",
      {
        "useBuiltIns": true,
        "pragma": "React.createElement"
      }
    ],
    "@babel/preset-flow"
  ],
  "plugins": [
    [
      "@babel/plugin-proposal/class-properties",
      {
        "loose": true
      }
    ],
    "@babel/plugin-syntax-dynamic-import",
    [
      "@babel/plugin-transform-runtime",
      {
        "helpers": true,
        "regenerator": true,
        "polyfill": false
      }
    ]
  ]
}
```
