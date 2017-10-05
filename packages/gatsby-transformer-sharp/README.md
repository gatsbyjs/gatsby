# gatsby-transformer-sharp

Creates `ImageSharp` nodes from image types that are supported by the
[Sharp](https://github.com/lovell/sharp) image processing library and provides
fields in their GraphQL types for processing your images in a variety of ways
including resizing, cropping, and creating responsive images.

[Live demo](https://image-processing.gatsbyjs.org/) ([source](https://github.com/gatsbyjs/gatsby/tree/master/examples/image-processing))

## Install

`npm install --save gatsby-transformer-sharp`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-transformer-sharp`,
]
```

## Parsing algorithm

Per default it recognizes files with the following extensions as images:

* jpeg
* jpg
* png
* webp
* tif
* tiff

If you want to modify the extensions of files being parsed as images you can
use the `fileExtensions` option of the plugin as follows:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: 'gatsby-transformer-sharp',
    options: {
      // add support for SVG files as well
      fileExtensions: ['jpeg', 'jpg', 'png', 'webp', 'tif', 'tiff', 'svg']
    }
  },
]
```

Each image file is parsed into a node of type `ImageSharp`.
