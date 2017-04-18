# gatsby-transformer-sharp

Creates `ImageSharp` nodes from image types that are supported by the
[Sharp](https://github.com/lovell/sharp) image processing library.

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

It recongnizes files with the following extensions as images.

* jpeg
* jpg
* png
* webp
* tif
* tiff
* svg

Each image file is parsed into a node of type `ImageSharp`.

This plugin is generally installed alongside
[`gatsby-typegen-sharp`](/docs/packages/gatsby-typegen-sharp/)
which adds a number of ways to process your images including resizing,
cropping, and creating responsive images.
