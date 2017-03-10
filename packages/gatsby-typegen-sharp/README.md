# gatsby-typegen-sharp

Creates GraphQL fields for images of type `ImageSharp` that make it easy
to resize, crop, and create responsive versions of images using the
popular image processing library [Sharp](https://github.com/lovell/sharp).

Uses the shared Gatsby library
[gatsby-plugin-sharp](https://www.gatsbyjs.org/docs/packages/gatsby-plugin-sharp/)
to do the actual image processing.

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
