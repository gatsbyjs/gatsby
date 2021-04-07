# gatsby-remark-responsive-iframe

Wraps iframes or objects (e.g. embedded YouTube videos) within markdown files in
a responsive elastic container with a fixed aspect ratio. This ensures that the
iframe or object will scale proportionally and to the full width of its
container.

## Install

`npm install gatsby-remark-responsive-iframe`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [`gatsby-remark-responsive-iframe`],
    },
  },
]
```

### Usage in Markdown

This plugin requires both `width` and `height` attributes to be set on the
iframe or object tag so that the correct aspect ratio can be calculated. Both
unitless and pixel values are supported. If any other value is detected (for
example a percentage width), the wrapper will not be applied.

Example usage:

    This is a beautiful iframe:

    <iframe src="http://www.example.com/" width="600" height="400"></iframe>
