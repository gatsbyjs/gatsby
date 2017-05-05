# gatsby-remark-prismjs

Adds syntax highlighting to code blocks in markdown files using
[PrismJS](http://prismjs.com/).

## Install

`npm install --save gatsby-remark-prismjs`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        `gatsby-remark-prismjs`,
      ]
    }
  }
]
```

## PrismJS themes
You'll also need to add a PrismJS theme. Prism ships with a number of
themes you can try or you can build your own by copying and modifying an
example (what we've done on [gatsbyjs.org](https://gatsbyjs.org)).

To load a theme, simply require its CSS file in your
`layouts/default.js` file.

E.g.

```javascript
// layouts/default.js
require('prismjs/themes/prism-solarizedlight.css')
```
