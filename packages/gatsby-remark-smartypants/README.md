# gatsby-remark-smartypants

Replaces “dumb” punctuation marks with “smart” punctuation marks using
the [retext-smartypants](https://github.com/wooorm/retext-smartypants)
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

### Options
Valid `remark-smartypants` options may passed to the plugin. For more on vaild options refer to the [remark-smartypants API](https://github.com/wooorm/retext-smartypants#api) .

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: "gatsby-remark-smartypants",
          options: {
            dashes: 'oldschool',
          }
        }
      ]
    }
  }
]
```