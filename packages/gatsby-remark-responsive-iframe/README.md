# gatsby-remark-responsive-iframe

Wraps iframes (e.g. embedded YouTube videos) in markdown files in a
responsive elastic container so the iframes always span 100% of
the width of their container.

## Install

`npm install --save gatsby-remark-responsive-iframe`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        `gatsby-remark-responsive-iframe`,
      ]
    }
  }
]
```

### Usage in Markdown

This plugin requires a `width` and `height` attribute on the iframe for setting the aspect ratio. Example usage: 

    This is a beautiful iframe:

    &lt;iframe url=&quot;http://www.example.com/&quot; width=&quot;600&quot; height=&quot;400&quot;&gt;&lt;/iframe&gt;
