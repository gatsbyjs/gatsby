# gatsby-remark-images

Processes images in markdown so they can be used in the production build.

In the processing, it make images responsive by:

* Adding an elastic container to hold the size of the image while it loads to
  avoid layout jumps.
* Generating multiple versions of images at different widths and sets the
  `srcset` and `sizes` of the `img` element so regardless of the width of the
  device, the correct image is downloaded.
* Using the "blur up" technique popularized by [Medium][1] and [Facebook][2]
  where a small 20px wide version of the image is shown as a placeholder until
  the actual image is downloaded.

## Install

`npm install --save gatsby-remark-images gatsby-plugin-sharp`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-plugin-sharp`,
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
          },
        },
      ],
    },
  },
];
```

## Options

| Name                   | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxWidth`             | `650`   | The `maxWidth` in pixels of the div where the markdown will be displayed. This value is used when deciding what the width of the various responsive thumbnails should be.                                                                                                                                                                                                                                                              |
| `linkImagesToOriginal` | `true`  | Add a link to each image to the original image. Sometimes people want to see a full-sized version of an image e.g. to see extra detail on a part of the image and this is a convenient and common pattern for enabling this. Set this option to false to disable this behavior.                                                                                                                                                        |
| `showCaptions`         | `false` | Add a caption to each image with the contents of the title attribute, when this is not empty. Set this option to true to enable this behavior.                                                                                                                                                                                                                                                                                         |
| `sizeByPixelDensity`   | `false` | Analyze images' pixel density to make decisions about target image size. This is what GitHub is doing when embedding images in tickets. This is a useful setting for documentation pages with a lot of screenshots. It can have unintended side effects on high pixel density artworks.<br/><br/>Example: A screenshot made on a retina screen with a resolution of 144 (e.g. Macbook) and a width of 100px, will be rendered at 50px. |
| `wrapperStyle`         |         | Add custom styles to the div wrapping the responsive images. Use the syntax for the style attribute e.g. `margin-bottom:10px; background: red;`                                                                                                                                                                                                                                                                                        |
| `backgroundColor`      | `white` | Set the background color of the image to match the background image of your design                                                                                                                                                                                                                                                                                                                                                     |

[1]: https://jmperezperez.com/medium-image-progressive-loading-placeholder/
[2]: https://code.facebook.com/posts/991252547593574/the-technology-behind-preview-photos/
