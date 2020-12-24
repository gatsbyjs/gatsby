---
title: Why Gatsby's Automatic Image Optimizations Matter
---

The web has come a long way since 1995, when `<img src="....">` syntax was invented. Our visual standards for what we've come to expect have risen -- a lot. 

Especially when visiting unfamiliar pages for the first time, like a company website or an e-commerce site, users expect pages to load near-instantly, with a smooth experience. A delay of 100ms is associated with a 3% increased bounce rate.

Today, users have come to expect a better loading experience -- a gradual fade-in rather than a jarring frame-to-fame switch from empty background to present image. And they expect images to load quickly, which tends to mean a number of things: sending different sizes of image depending on the page width and device type, using the best compression format the user's browser supported, and starting fetching immediately like a vanilla HTML site, even if the site is built with React.

You can build all of this on your own; the standards and libraries exist. But creating and maintain a custom image processing pipeline tends to be expensive in terms of developer time and sometimes financial cost. And it tends to be a ton more complex than `img src`.

Part of Gatsby's vision is to construct [new, higher-level building blocks for the web](https://www.gatsbyjs.com/docs/conceptual/gatsby-core-philosophy/#construct-new-higher-level-web-building-blocks). Part of what that means for images is to get all the richness we've come to expect, with the API simplicity we love.

Gatsby Image gives you these benefits out of the box, with a simple API and without tedious engineering work.

While the how-to is a practical guide on how to use Gatsby Image, and the reference guide provides canonical information on its API, this conceptual guide walks through why it matters -- explaining the emerging expectations for images on the web and how Gatsby supports each one.
### Better image loading: preventing reflows, gradual fade-in

One of the challenges when images load alongside text is preventing what's known as "browser reflow". That is the jankiness that results when an image appears next to text, bumping the text to the right, or above text, bumping it below. 

When a browser doesn't know how big an image is going to be, either because the width and height haven't been defined, or because it's variable due to responsive images, reflow can happen, which both impacts performance (by blocking the main thread of execution), and results in a jarring visual effect.

In addition, when an image appears, it goes from blank background to fully there from one frame to another. This can also be visually jarring. Like css has a `transition` prop to help position shifts feel gradual, images feel more aesthetically pleasing when they have placeholders.

Gatsby Image's will hold the spot for your image automatically when you specify `width` prop, and depending on your preference, will provide a background -- blurred, a background color, or traced SVG, while the image loads.

![../images/gatsby-image-gif.gif]
### Cropping and compressing overly large images

A common problem in larger projects is that images are uploaded into a CMS by content operations personnel by teams that may be less aware of appropriate web image sizes and formats. 

For example, a support staff member may take a 1600x2000 pixel screenshot, save it as a PNG, and upload it alongside a helpdesk article. While this is a quite reasonable action, it may degrade page performance significantly. If the article has a 800px maximum width, a 640 x 800 pixel JPG would have displayed at the same quality but a tenth of the size; the extra weight may delay page load by a second or two. 

By using the `width` prop, Gatsby Image will automatically resize that image if it's larger. That's right, not just display a smaller image, but resize the underlying asset that is being loaded into a user's browser/
### Generating "responsive images" for different device sizes

Different devices have different screen sizes and resolutions, which means it may make sense to send smaller (or larger) objects. 

Sending an image with a width of 800px to a  mobile phone with a 400px wide screen means that you are sending unnecessary data over the wire that will, again, delay page load, cause visitors to bounce, and hurt conversions. 

Conversely, some laptops, like Macbook Pros, have a higher pixel-to-density ratio, so need "2x"-size images. 

In order to support responsive images, you need to do the image processing beforehand, as well as generate the markup necessary. Gatsby Image has a `fluid` option that will transform images with a relatively straightforward API.
### Better compression and more well-scheduled work

The new [WebP image](https://developers.google.com/speed/webp) standard reduces image size by 25-35% for modern browsers. It's possible to support this standard, but the challenge is to also fall back for older browsers that don't support this.

A similar technique is to defer loading of offscreen images. In other words, don't block page load to do work that isn't visible when the page loads. If an image, eg, a few hundred pixels "below the fold", load the page first, then load that image later. 

Browsers have begun to support lazy loading natively in HTML tags, but right now, [almost 30% of users are on browsers](https://caniuse.com/loading-lazy-attr) that don't support it.

Gatsby generates the native component for use in browsers that can use it, and creates the same effect manually for browsers than haven't yet implemented lazy loading via the IntersectionObserver API. 
### Avoid hydration lag for React apps

A client-side React app, where the browser needs to parse React before executing the app, is blocked on all other work until it can evaluate React, so it can traverse the DOM React is giving. 

This may mean a 200ms or 500s delay in, for example, fetching an image relative to vanilla HTML. 

Because Gatsby server-renders pages at build-time and spits out vanilla HTML, it gives you the advantages of immediate image fetching while also enabling you to continue to build in React. 
### Build-time vs runtime

Some of these tasks can be handled client-side, that is, in the browser. Gatsby takes the approach that these should be handled in advance, we don’t make users wait for the images to be optimised.