# gatsby-typegen-remark-responsive-image

Make images in markdown responsive by:

* Adding an elastic container to hold the size of the image while it
  loads to avoid layout jumps as images load.
* Generates multiple verions of images at different widths and sets the `srcset` and `sizes`
  of the `img` element so regardless of the width of the device, the correct
  image is downloaded.
* Uses the "blur up" technique popularized by
  [Medium](https://jmperezperez.com/medium-image-progressive-loading-placeholder/)
and
[Facebook](https://code.facebook.com/posts/991252547593574/the-technology-behind-preview-photos/)
where a small 20px wide version of the image is shown as a placeholder
until the actual image is downloaded.

## Install

`npm install --save gatsby-typegen-remark-responsive-image`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-typegen-remark`,
    options: {
      plugins: [
        {
          resolve: `gatsby-typegen-remark-responsive-image`,
          options: {
            // It's important to specify the maxWidth (in pixels) of
            // the content container as this plugin uses this as the
            // base for generating different widths of each image.
            maxWidth: 590,
          },
        },
      ]
    }
  }
]
```
