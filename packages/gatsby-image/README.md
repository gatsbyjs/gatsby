# gatsby-image

Speedy, optimized images without the work.

`gatsby-image` is a React component specially designed to work seamlessly with Gatsby's GraphQL queries. It combines [Gatsby's native image processing](https://image-processing.gatsbyjs.org/) capabilities with advanced image loading techniques to easily and completely optimize image loading in your sites.

**[Demo](https://using-gatsby-images.gatsbyjs.org)**

## Problem

Huge, unoptimized images dramatically slow down your site.

Creating optimized images for websites has long been a thorny problem. Ideally you would:

* Resize large images to the size needed by your design
* Generate multiple smaller images so smartphones and tablets don't download desktop-sized images
* Strip all unnecessary metadata and optimize JPEG and PNG compression
* Efficiently lazy load images to speed initial page load and save bandwidth
* Use the "blur-up" technique to show a preview of the image while it loads
* Hold the image position so your page doesn't jump while images load

Doing this consistantly across a site feels like sisyphean labor. You manually optimize your images and then… several images are swapped in at the last minute or a design-tweak shaves 100px of width off your images.

Most solutions involve a lot of manual labor and bookkeeping to ensure every image is optimized.

This isn't ideal. Optimized images should be the default and very easy.

## Solution

With Gatsby, we can make images way *way* better.

`gatsby-image` is designed to work seamlessly with Gatsby's native image processing capabilities powered by GraphQL and Sharp. To produce
perfect images, you only need to:

1) Import `gatsby-image` and use it in place of the built-in `img`
2) Write a simple GraphQL query using one of the included GraphQL "fragments" which specify the fields needed by `gatsby-image`.

This is what a component using `gatsby-images` looks like.

```jsx
import React from 'react
import Img from 'gatsby-image'

export default ({ data }) => (
  <div>
    <h1>Hello gatsby-image</h1>
    <Img resolutions={data.file.childImageSharp.resolutions} />
  </div>
)

export const query = graphql`
  query GatsbyImageSampleQuery {
    file(relativePath: { eq: "blog/avatars/kyle-mathews.jpeg"}) {
      childImageSharp {
        # Specify the image processing steps right in the query
        # Makes it trivial to update as your page's design changes.
        resolutions(width: l25, height: 125) {
          ...GatsbyImageSharpResolutions
        }
      }
    }
  }
`
```

## Two types of responsive images

There are two types of responsive images supported by gatsby-image.

1) Images that have a *fixed* width and height
2) Images that stretch across a fluid container

In the first scenario, you want to vary the image's size for different screen resolution -- in other words, create retina images.

For the second scenario, you want to create multiple thumbnails for devices with widths stretching from smartphone to wide desktop monitors and give the browser "hints" about how to choose the right image.

If that sounds complicated, well, it is. But luckily Gatsby does the work, so you don't have to.

Just ask yourself "do I know what size this image will be?" If yes, it's the first type. If no, or you're setting a `max-width: 100%;` on your image, then it's the second type.

In Gatsby's GraphQL implementation, you query for the first type by querying a child object of an image called "resolutions" — which you can see in the sample component above. For the second type, you do a similar query but for a child object called "sizes".

## Fragments

GraphQL includes a concept called "query fragments". Which, as the name suggests, are parts of queries that can be reused in multiple queries. To ease building with `gatsby-image`, Gatsby image processing plugins which support `gatsby-image` ship with fragments which you can easily include in your queries. Note, [due to a limitation of GraphiQL](https://github.com/graphql/graphiql/issues/612), you can not currently use these fragments in the GraphiQL IDE.

Plugins supporting `gatsby-image` currently include [gatsby-transformer-sharp](/packages/gatsby-transformer-sharp/) and [gatsby-source-contentful](/packages/gatsby-source-contentful/).

Their fragments are:

### gatsby-transformer-sharp

* `GatsbyImageSharpResolutions`
* `GatsbyImageSharpResolutions_noBase64`
* `GatsbyImageSharpSizes`
* `GatsbyImageSharpSizes_noBase64`

### gatsby-source-contentful

* `GatsbyContentfulResolutions`
* `GatsbyContentfulResolutions_noBase64`
* `GatsbyContentfulSizes`
* `GatsbyContentfulSizes_noBase64`

If you don't want to use the blur-up effect, choose the fragment with `noBase64` at the end.

## "Resolutions" queries

### Component

Pass in the data returned from the `resolutions` object in your query via the `resolutions` prop. e.g. `<Img resolutions={resolutions} />`

### Query

```graphql
{
  imageSharp {
    # Other options include height (set both width and height to crop),
    # grayscale, duotone, rotate, etc.
    resolutions(width: 400) {
      # Choose either the fragment including a small base64ed image or one without.
      ...GatsbyImageSharpResolutions
    }
  }
}
```

## "Sizes" queries

### Component

Pass in the data returned from the `sizes` object in your query via the `sizes` prop. e.g. `<Img sizes={sizes} />`

### Query

```graphql
{
  imageSharp {
    # i.e. the max width of your container is 700 pixels.
    #
    # Other options include maxHeight (set both maxWidth and maxHeight to crop),
    # grayscale, duotone, rotate, etc.
    sizes(maxWidth: 700) {
      # Choose either the fragment including a small base64ed image or one without.
      ...GatsbyImageSharpSizes_noBase64
    }
  }
}
```

## Component props

* `resolutions` — PropTypes.object
* `sizes` — PropTypes.object
* `fadeIn` — PropTypes.bool // Defaults to fading in the image on load
* `title` — PropTypes.string
* `alt` — PropTypes.string
* `className` — PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // Support Glamor's css prop
* `style` — PropTypes.object
* `backgroundColor` — PropTypes.oneOfType([PropTypes.string, PropTypes.bool]) // Set a colored background placeholder. If set to true, uses `lightgray` as the color. You can pass in any valid color string.
