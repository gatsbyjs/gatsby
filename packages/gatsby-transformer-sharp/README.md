# gatsby-transformer-sharp

Creates `ImageSharp` nodes from image types that are supported by the
[Sharp](https://github.com/lovell/sharp) image processing library and provides
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

Please note that you must have a source plugin (which brings in images) installed in your project. Otherwise no `ImageSharp` nodes can be created for your files. Examples would be [`gatsby-source-filesystem`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-filesystem) or source plugins for (headless) CMSs like [`gatsby-source-wordpress`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-wordpress).

## Parsing algorithm

It recognizes files with the following extensions as images.

- jpeg
- jpg
- png
- webp
- tif
- tiff

Each image file is parsed into a node of type `ImageSharp`.
