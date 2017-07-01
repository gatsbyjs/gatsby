# gatsby-plugin-sharp

Exposes several image processing functions built on the [Sharp image
processing library](https://github.com/lovell/sharp). This is a
low-level helper plugin generally used by other Gatsby plugins. You
generally shouldn't be using this directly but might find it helpful if
doing very custom image processing.

It aims to provide excellent out-of-the box settings for processing
common web image formats.

For JPEGs it generates progressive images with a default quality level
of 50.

For PNGs it uses [pngquant](https://github.com/pornel/pngquant) to
compress images. By default it uses a quality setting of [50-75].

## Install

`npm install --save gatsby-plugin-sharp`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-plugin-sharp`,
]
```

## Methods

### resize

#### Parameters

* `width` (int, default: 400)
* `height` (int)
* `quality` (int, default: 50)
* `jpegProgressive` (bool, default: true)
* `pngCompressionLevel` (int, default: 9)
* `base64`(bool, default: false)

#### Returns

* `src` (string)
* `width` (int)
* `height` (int)
* `aspectRatio` (float)

### responsiveResolution

Automatically create sizes for different resolutions — we do 1x, 1.5x, 2x,
and 3x.

#### Parameters

* `width` (int, default: 400)
* `height` (int)
* `quality` (int, default: 50)

#### Returns

* `base64` (string)
* `aspectRatio` (float)
* `width` (float)
* `height` (float)
* `src` (string)
* `srcSet` (string)

### responsiveSizes

Create sizes (in width) for the image. If the max width of the container for the
rendered markdown file is 800px, the sizes would then be: 200, 400, 800, 1200,
1600, 2400 – enough to provide close to the optimal image size for every device
size / screen resolution.

On top of that, responsiveSizes returns everything else (namely aspectRatio and
a base64 image to use as a placeholder) you need to implement the "blur up"
technique popularized by Medium and Facebook (and also available as a Gatsby
plugin for Markdown content as gatsby-remark-images).

#### Parameters

* `maxWidth` (int, default: 800)
* `maxHeight` (int)
* `quality` (int, default: 50)

#### Returns

* `base64` (string)
* `aspectRatio` (float)
* `src` (string)
* `srcSet` (string)
* `sizes` (string)
* `originalImg` (string)

### Shared Options

In addition to their individual parameters, all methods above share the
following:

* `grayscale` (bool, default: false)
* `duotone` (bool|obj, default: false)
* `toFormat` (string, default: '')
* `cropFocus` (string, default: '[sharp.strategy.attention][6]')

#### toFormat

Convert the source image to one of the following available options:
`NO_CHANGE`, `JPG`, `PNG`, `WEBP`.

#### cropFocus

Change the cropping focus. Available options: `CENTER`, `NORTH`, `NORTHEAST`,
`EAST`, `SOUTHEAST`, `SOUTH`, `SOUTHWEST`, `WEST`, `NORTHWEST`, `ENTROPY`,
`ATTENTION`. See Sharp's [crop][6].

#### rotate

Rotate the image (after cropping). See Sharp's [rotate][7].

#### grayscale

Uses Sharp's [greyscale][8] to convert the source image to 8-bit greyscale,
256 shades of grey, e.g.

```javascript
allImageSharp {
  edges {
    node {
      ... on ImageSharp {
        resize(width: 150, height: 150, grayscale: true) {
          src
        }
      }
    }
  }
}
```

#### duotone

Applys a "duotone" effect (see [I][1], [II][2], [III][3]) to the source image if
 given two hex colors `shadow` and `highlight` defining start and end color of
 the duotone gradient, e.g.

```javascript
responsiveResolution(
  width: 800,
  duotone: {
    highlight: "#f00e2e",
    shadow: "#192550"
  }
) {
  src
  srcSet
  base64
}
```

the source image colors will be converted to match a gradient color chosen based
on each pixel's [relative luminance][4].  
Logic is borrowed from [react-duotone][5].

[1]: https://alistapart.com/article/finessing-fecolormatrix
[2]: http://blog.72lions.com/blog/2015/7/7/duotone-in-js
[3]: https://ines.io/blog/dynamic-duotone-svg-jade
[4]: https://en.wikipedia.org/wiki/Relative_luminance
[5]: https://github.com/nagelflorian/react-duotone
[6]: http://sharp.dimens.io/en/stable/api-resize/#crop
[7]: http://sharp.dimens.io/en/stable/api-operation/#rotate
[8]: http://sharp.dimens.io/en/stable/api-colour/#greyscale
