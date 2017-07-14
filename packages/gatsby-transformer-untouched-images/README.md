# gatsby-transformer-untouched-image

Creates `ImageUntouched` nodes from images and leaves them alone. This is a much faster alternative to Sharp processing every image.

## Install

`npm install --save gatsby-transformer-untouched-images`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-transformer-untouched-images`,
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

Each image file is parsed into a node of type `ImageUntouched`.
