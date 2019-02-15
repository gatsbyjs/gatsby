---
title: Preparing your images to be processed by plugin-sharp
---

While gatsby takes care of optimizing your images for each device size and screen resolution you need to note that those operations can have significant impact on your build's duration and resources consumption.

Images that are of several MBs of size or of big dimensions will exponentially increase the load to optimize your images. This is why it is important to prepare and pre-optimize your images.

Taking as an example a website with 150 images all ranging from 1-3MB and with a width of 3000 pixels, gatsby takes about 15 minutes to create fluid images with a maximum width of 1000 pixels. Same amount of pictures takes only minute to be processed when they weight no more than 300kb and are already resized to 1000 pixels of width.

Here's an example script to pre-optimize your pictures:

```js
const sharp = require(`sharp`)
const glob = require(`glob`)
const fs = require(`fs-extra`)

const matches = glob.sync(`src/images/**/*.{png,jpg,jpeg}`)
const MAX_WIDTH = 1000
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

The default values of maximum width and quality are to be tuned with regards to your website. As a rule of thumb the maximum width set should be the same as in your `gatsby-plugin-sharp` transformations and the quality should normally not be less than 60.
