---
title: Using Gatsby Image
---

Images are are one of the best parts for the web. But one of the key challenges of images comes in cases, like marketing sites and e-commerce, where page performance is crucial for the business. These pages often use rich images to showcase their organization. But these images can come at the cost of page loading -- and when users wait, they often bounce. 

<!---[Would recommend starting with a quick numerical comparison, eg: “if you have a page with text and 10 images that are 300kb each, using Gatsby image increases your load time from around 2 seconds to around 1 second on a typical desktop connection, and 5 seconds to 2 seconds on a typical US 4G connection” ]--->

In addition, the image loading experience can sometimes be odd; when they appear, they can sometimes cause the page layout to "reflow" with text moving around or bouncing down the screen. 

It's easy to use images: just drop in `<img src="....">`. 

But creating optimized images? That's complex. 

Some things an optimized image experience would do:

* Generates [WebP images](https://developers.google.com/speed/webp), which reduces image size by 25-35% for modern browsers, while allowing fallback for older browsers.
* Defer loading of offscreen images for the [almost 30% of users on browsers](https://caniuse.com/loading-lazy-attr) that don't support native lazy loading
* Blur-up images while they are loading for a pleasant initial viewer experience ([example](https://using-gatsby-image.gatsbyjs.org/blur-up/))
* Automatically resize images to the size needed by your design
* Generate multiple smaller images so smartphones and tablets don’t download desktop-sized images
* In React apps, pre-load images before React "hydrates" so the browser doesn't have to wait (typically 0.2s to 0.5s) for React to load before loading the image. 
* Hold the image position so your page doesn’t jump while the images load
* Strip all unnecessary metadata and optimize JPEG and PNG compression

These are all complex tasks, and doing this consistently across a site feels like it can never be completed. That's especially true when images are created or uploaded by teams that may be less aware of appropriate web image sizes and formats. 

### Build-time vs runtime

Some of these tasks can be handled client-side, that is, in the browser. Gatsby takes the approach that these should be handled in advance, we don’t make users wait for the images to be optimised.