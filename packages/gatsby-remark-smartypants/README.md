# gatsby-remark-smartypants

Replaces “dumb” punctuation marks with “smart” punctuation marks using
the [remark-smartypants](https://github.com/wooorm/retext-smartypants)
plugin.

## Install

`npm install --save gatsby-remark-smartypants`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        `gatsby-remark-smartypants`,
      ]
    }
  }
]
```

