Using gatsby-image to prevent image bloat
====

I recently introduced a new Gatsby/React component called [gatsby-image](https://www.gatsbyjs.org/packages/gatsby-image/).

It has some nice tricks that you’d expect from a modern image component. It uses the new [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to cheaply lazy load images. It holds an image’s position so your page doesn’t jump around as images load. It makes it easy to add a placeholder—either a gray background or a blurry version of the image.

Here’s what a really simple Gatsby page component using gatsby-image would look like:
```js
import React from "react";
import Img from "gatsby-image";

export default ({ data }) => (
  <div>
    <h1>Hello gatsby-image</h1>
    <Img resolutions={data.file.childImageSharp.resolutions} />
  </div>
);
```
So this is all very nice and it’s far better to be able to use this from NPM vs. implementing it yourself or cobbling together several standalone libraries.
