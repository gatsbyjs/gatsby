# Using gatsby-image to prevent image bloat

`gatsby-image` is a React component designed to work seamlessly with Gatsby’s GraphQL queries ([`gatsby-image` plugin READme](/packages/gatsby-image/)). It combines [Gatsby’s native image processing](https://image-processing.gatsbyjs.org/) capabilities with advanced image loading techniques to easily and completely optimize image loading for your sites. `gatsby-image` uses [gatsby-plugin-sharp](/packages/gatsby-plugin-sharp/) to power its image transformations.

_Warning: gatsby-image is **not** a drop-in replacement for `<img />`. It’s optimized for fixed width/height images and images that stretch the full-width of a container. Some ways you can use `<img />` won’t work with gatsby-image._

[Demo](https://using-gatsby-image.gatsbyjs.org/)

`gatsby-image` includes the tricks you’d expect from a modern image component. It:

- uses the new [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to cheaply lazy load images
- holds an image’s position so your page doesn’t jump around as images load
- makes it easy to add a placeholder—either a gray background or a blurry version of the image.

## Problem

Large, unoptimized images dramatically slow down your site.

But creating optimized images for websites has long been a thorny problem. Ideally you would:

- Resize large images to the size needed by your design
- Generate multiple smaller images so smartphones and tablets don’t download desktop-sized images
- Strip all unnecessary metadata and optimize JPEG and PNG compression
- Efficiently lazy load images to speed initial page load and save bandwidth
- Use the “blur-up” technique or a ”traced placeholder” SVG to show a preview of the image while it loads
- Hold the image position so your page doesn’t jump while images load

Doing this consistently across a site feels like sisyphean labor. You manually optimize your images and then… several images are swapped in at the last minute or a design-tweak shaves 100px of width off your images.

Most solutions involve a lot of manual labor and bookkeeping to ensure every image is optimized.

This isn’t ideal. Optimized images should be easy and the default.

## Solution

With Gatsby, we can make images way way better.

`gatsby-image` is designed to work seamlessly with Gatsby’s native image processing capabilities powered by GraphQL and Sharp. To produce perfect images, you only need to:

1. Install `gatsby-image` and its peer dependencies. The `gatsby-config.json` needs to include the following:

```js:title=src/gatsby-config.js
module.exports = {
  plugins: [
    // highlight-start
    `gatsby-image`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    // highlight-end
  ],
}
```

2. Configure the peer dependencies to load images from a folder. In order to use GraphQL to query the image files, the files need to be in a location that is known to Gatsby. This requires another update to `gatsby-config.json`. Any path can replace `src/data` in this example, but whatever the path is the image file being queried needs to be placed within the scope of this path.

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-image`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`
    // highlight-start
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/data/`,
      }
    }
    // highlight-end
  ],
}
```

3. Write a GraphQL query using one of the included GraphQL “fragments” which specify the fields needed by `gatsby-image`. There are numerous fragments that can be used and the choice is based on the type of responsive image desired. This example will use `GatsbyImageSharpFluid`. An example of a GraphQL query is below where the path listed is the path relative to the location specified in the `gatsby-source-filesystem` configuration.

```graphql
file(relativePath: { eq: "images/default.jpg" }) {
      childImageSharp {
        # Specify the image processing specifications right in the query.
        fluid {
          ...GatsbyImageSharpFluid
        }
      }
}
```

4. Import `Img` to display the fragment in JSX. There are additional features available with the `Img` tag as well.

```jsx
import Img from "gatsby-image"

export default ({ data }) => (
  <div>
    <h1>Hello gatsby-image</h1>
    <Img fluid={data.file.childImageSharp.fluid} />
  </div>
)
```

The GraphQL query creates multiple thumbnails with optimized JPEG and PNG compression. The `gatsby-image` component automatically sets up the “blur-up” effect as well as lazy loading of images further down the screen.

So this is all very nice and it’s far better to be able to use this from NPM vs. implementing it yourself or cobbling together several standalone libraries.

### References:

- [Plugin READme file](/packages/gatsby-image/)
- [Source code for an example site using gatsby-image](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-gatsby-image)
- [Blog articles about gatsby-image](/blog/tags/gatsby-image/)
- [Starters that use gatsby-image](/starters/?d=gatsby-image&v=2)
- [Other image plugins](/plugins/?=image)
- ["Ridiculously easy image optimization with gatsby-image" by Kyle Gill](https://medium.com/@kyle.robert.gill/ridiculously-easy-image-optimization-with-gatsby-js-59d48e15db6e)
