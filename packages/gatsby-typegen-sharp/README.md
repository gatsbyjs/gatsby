# gatsby-typegen-sharp

Creates GraphQL fields to images of type `ImageSharp` that make it easy
to resize, crop, and create responsive versions of images using the
popular image processing library [Sharp](https://github.com/lovell/sharp).

## Install

`npm install --save gatsby-typegen-sharp`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-typegen-sharp`,
]
```

## Fields

TODO: figure out how to auto-generate docs for these....

### `responsiveResolution`

* Arguments
  * `width` — GraphQLInt, defaultValue 400
