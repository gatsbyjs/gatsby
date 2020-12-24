---
title: Using Gatsby Image
---

Images are are one of the best parts for the web. But one of the key challenges of images comes in cases, like marketing sites and e-commerce, where page performance is crucial for the business. These pages often use rich images to showcase their organization. But these images can come at the cost of page loading -- and when users wait, they often bounce. 

<!---[Would recommend starting with a quick numerical comparison, eg: “if you have a page with text and 10 images that are 300kb each, using Gatsby image increases your load time from around 2 seconds to around 1 second on a typical desktop connection, and 5 seconds to 2 seconds on a typical US 4G connection” ]--->

It's easy to use images: just drop in `<img src="....">`. 

But creating optimized images? That's complex. 

An optimized image experience would have a better loading experience rather than jarringly go from 0 to 100%. It would never send unnecessary data over the wire to slow down the page; no matter what size of image is in the system, this would send the right size of image depending on the page width and device type. It would use the best compression format the user's browser supported. And it would start fetching immediately like a vanilla HTML site, even if it was built with React.

You can build all of this on your own; the standards and libraries exist. But creating and maintain a custom image processing pipeline tends to be expensive in terms of developer time and sometimes financial cost.

Gatsby's image plugin gives you these benefits out of the box, without tedious engineering work; it has simple APIs that support these.
### Better image loading: preventing reflows, gradual fade-in

One of the challenges when images load alongside text is preventing what's known as "browser reflow". That is the jankiness that results when an image appears next to text, bumping the text to the right, or above text, bumping it below. 

When a browser doesn't know how big an image is going to be, either because the width and height haven't been defined, or because it's variable due to responsive images, reflow can happen, which both impacts performance (by blocking the main thread of execution), and results in a jarring visual effect.

In addition, when an image appears, it goes from blank background to fully there from one frame to another. This can also be visually jarring. Like css has a `transition` prop to help position shifts feel gradual, images feel more aesthetically pleasing when they have placeholders.

Gatsby's image plugin both holds the spot for your image (whether it's a fixed or fluid size), and provides a background -- blurred, a background color, or traced SVG.

![../images/gatsby-image-gif.gif]
### Cropping and compressing overly large images

A common problem in larger projects is that images are uploaded into a CMS by content operations personnel by teams that may be less aware of appropriate web image sizes and formats. 

For example, a support staff member may take a 1600x2000 pixel screenshot, save it as a PNG, and upload it alongside a helpdesk article. While this is a quite reasonable action, it may degrade page performance significantly. If the article has a 800px maximum width, a 640 x 800 pixel JPG would have displayed at the same quality but a tenth of the size; the extra weight may delay page load by a second or two. 

When you specify the width any "templated" image should have, Gatsby image automatically resizes that image if it's larger.
### Generating "responsive images" for different device sizes

Different devices have different screen sizes and resolutions, which means it may make sense to send smaller (or larger) objects. 

Sending an image with a width of 800px to a  mobile phone with a 400px wide screen means that you are sending unnecessary data over the wire that will, again, delay page load, cause visitors to bounce, and hurt conversions. 

Conversely, some laptops, like Macbook Pros, have a higher pixel-to-density ratio, so need "2x"-size images. 

In order to support responsive images, you need to do the image processing beforehand, as well as generate the markup necessary. Gatsby will do this with a relatively straightforward API.
### Better compression and more well-scheduled work

The new [WebP image](https://developers.google.com/speed/webp) standard reduces image size by 25-35% for modern browsers. It's possible to support this standard, but the challenge is to also fall back for older browsers that don't support this.

A similar technique is to defer loading of offscreen images. In other words, don't block page load to do work that isn't visible when the page loads. If an image, eg, a few hundred pixels "below the fold", load the page first, then load that image later. 

Browsers have begun to support lazy loading natively in HTML tags, but right now, [almost 30% of users are on browsers](https://caniuse.com/loading-lazy-attr) that don't support it.

Gatsby generates the native component for use in browsers that can use it, and creates the same effect manually for browsers than haven't yet implemented lazy loading. 
### Avoid hydration lag for React apps

A client-side React app, where the browser needs to parse React before executing the app, is blocked on all other work until it can evaluate React, so it can traverse the DOM React is giving. 

This may mean a 200ms or 500s delay in, for example, fetching an image relative to vanilla HTML. 

Because Gatsby server-renders pages at build-time and spits out vanilla HTML, it gives you the advantages of immediate image fetching while also enabling you to continue to build in React. 
### Build-time vs runtime

Some of these tasks can be handled client-side, that is, in the browser. Gatsby takes the approach that these should be handled in advance, we don’t make users wait for the images to be optimised.