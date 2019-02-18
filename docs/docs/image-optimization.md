---
title: Optimizing your images before processing them with plugin-sharp
---

While gatsby takes care of optimizing your images for each device size and screen resolution you need to note that those operations can have significant impact on your build's duration and resources consumption.

By default `plugin-sharp` when running with the fluid option will try to create 5 images based on the original one using the following multipliers `*1.5 *2 *3 /2 /4`. These resolutions will then get filtered based on the `maxWidth` value you set in your `gatsby-config.js` file or in your queries. The multipliers ensure that your images are ready for higher DPI screens while the dividers ensure you do not load a big images on smaller screens.

If you happen to have dozens of images of high quality and your build takes several minutes to process them then it might be time to re-think about your configuration.
An example would be to resize down your image into the multiplier you think it satisfactory based on your website's **layout** and leverage the `srcSetBreakpoints` option of `plugin-sharp` in order to manually set the resolutions you need.

Taking for example a layout that allows your images to be of maximum 600px then the highest resolution you will need is 1800px to account for 3x pixel density. If your current images is of 3000 width then you could resize your image already to 1800px gaining 1 resize job per image during your build time. You could then set up your breakpoints to include the following values `[300, 600, 1200]`.

An additional detail to consider is that images of several MBs or of big dimensions will exponentially increase the load to optimize your images. Resizing an image from 3000px down to 600px takes longer than resizing the same image with an initial size of 1800px. Taking also into account that the image of 3000px is considerably heavier then the gains of time over multiple images are of serious consideration.

Here's an example script to pre-optimize your pictures both in size and dimensions to account for the details mentioned above!

```js
const sharp = require(`sharp`)
const glob = require(`glob`)
const fs = require(`fs-extra`)

const matches = glob.sync(`src/images/**/*.{png,jpg,jpeg}`)
const MAX_WIDTH = 1800
const QUALITY = 70

Promise.all(
  matches.map(async match => {
    const stream = sharp(match)
    const info = await stream.metadata()

    if (info.width < MAX_WIDTH) {
      return
    }

    const optimizedName = match.replace(
      /(\..+)$/,
      (match, ext) => `-optimized${ext}`
    )

    await stream
      .resize(MAX_WIDTH)
      .jpeg({ quality: QUALITY })
      .toFile(optimizedName)

    return fs.rename(optimizedName, match)
  })
)
```

The default value of maximum width is to be tuned with regards to your website's layout. Concerning the image quality it should normally not be less than 60 in order to avoid visible differences between the original and optimized image.
