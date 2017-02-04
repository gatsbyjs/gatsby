# gatsby-typegen-remark-smartypants

Replaces “dumb” punctuation marks with “smart” punctuation marks using
the [remark-smartypants](https://github.com/wooorm/retext-smartypants)
plugin.

## Install

`npm install --save gatsby-typegen-remark-smartypants`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-typegen-remark`,
    options: {
      plugins: [
        `gatsby-typegen-remark-smartypants`,
      ]
    }
  }
]
```

