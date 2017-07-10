# gatsby-remark-images

Processes images in markdown so they can be used in the production build.

In the processing, it make images responsive by:

* Adding an elastic container to hold the size of the image while it
  loads to avoid layout jumps.
* Generating multiple versions of images at different widths and sets the
  `srcset` and `sizes` of the `img` element so regardless of the width of the
  device, the correct image is downloaded.
* Useing the "blur up" technique popularized by [Medium][1] and [Facebook][2]
  where a small 20px wide version of the image is shown as a placeholder
  until the actual image is downloaded.

## Install

`npm install --save gatsby-remark-images`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: `gatsby-remark-images`,
          options: {
            // It's important to specify the maxWidth (in pixels) of
            // the content container as this plugin uses this as the
            // base for generating different widths of each image.
            maxWidth: 590,
            // Remove the default behavior of adding a link to each
            // image.
            linkImages: false,
          },
        },
      ]
    }
  }
]
```

[1]: https://jmperezperez.com/medium-image-progressive-loading-placeholder/
[2]: https://code.facebook.com/posts/991252547593574/the-technology-behind-preview-photos/
