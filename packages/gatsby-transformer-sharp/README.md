# gatsby-transformer-sharp

Creates `ImageSharp` nodes from image types that are supported by the
[Sharp][sharp] image processing library and provides
fields in their GraphQL types for processing your images in a variety of ways
including resizing, cropping, and creating responsive images.

[Live demo](https://image-processing.gatsbyjs.org/)
([source](https://github.com/gatsbyjs/gatsby/tree/master/examples/image-processing))

## Install

`npm install --save gatsby-transformer-sharp gatsby-plugin-sharp`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [`gatsby-plugin-sharp`, `gatsby-transformer-sharp`],
}
```

### Configure default quality

By default, all image operations presume a default quality threshold passed to [sharp][sharp] (currently configured to `50`). To set a default quality for all image operations, do so with a configurable threshold passed to the plugin like so:

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-transformer-sharp`,
      options: {
        defaultQuality: 60 // 60% of the time it works every time
      }
    }
  ]
}
```

## Parsing algorithm

It recognizes files with the following extensions as images.

- jpeg
- jpg
- png
- webp
- tif
- tiff

Each image file is parsed into a node of type `ImageSharp`.

[sharp]: (https://github.com/lovell/sharp)
