---
title: Working With Images In Gatsby
---

# Working With Images In Gatsby

Gatsby has several useful [plugins](/docs/plugins/) that work together for adding and optimizing images for [page components](/docs/building-with-components/#page-components)


The recommend approach is to 
* GraphQL to query image files
* Sharp, an image processing library, to transform images
* The Gat


## Access Your Images With GraphQL

[GraphQL can access image files](docs/querying-with-graphql/#images) with the [`gatsby-source-filesystem`](/packages/gatsby-source-filesystem/) plugin. 

Once you have this installed you should be able to query the files as shown in the our tutorial on [writing queries](tutorial/part-four/#build-a-page-with-a-graphql-query). 



## Formatting Images With Sharp

[Sharp](https://github.com/lovell/sharp) is a high-performance image processing library. The [`gatsby-transformer-sharp`](/packages/gatsby-transformer-sharp/) and [`gatsby-plugin-sharp`](/packages/gatsby-plugin-sharp) plugins allow GraphQL queries to not only query images, but transform them.


Common transformations include `size` and `resolution` which are key for optimizing images. See [tocumentation for `gatsby-plugin-sharp`](/packages/gatsby-plugin-sharp/) to view all the transformation methods you can use.

This also gives you access to special queries called [fragments](/packages/gatsby-image/#fragments) that automatically query a bunch of field's we'll want to use later including width, height, and src. 

## Optimizing Images With Gatsby Image

[`gatsby-image`](/packages/gatsby-image/) is a plugin that automatically creates React components for optimized images that:


> * Loads the optimal size of image for each device size and screen resolution
> * Holds the image position while loading so your page doesn't jump around as images load
> * Uses the "blur-up" effect i.e. it loads a tiny version of the image to show while the full image is loading
> * Alternatively provides a "traced placeholder" SVG of the image.
> * Lazy loads images which reduces bandwidth and speeds the initial load time
> * Uses [WebP](https://developers.google.com/speed/webp/) images if browser supports the format

### Chosing The Right Approach

Which methods and fragments you use will depend on what type of responsive image you have. See the [Gatsby Image documentation for more information](/packages/gatsby-image/#two-types-of-responsive-images) . In general for fixed size images use resolution, for images you want to stretch use size. 

This example is for an image gallery where images stretch when the page is resized. It uses the `sizes` method and the size fragment to grab the right props to use in `gatsby-image` components
```jsx
export const query = graphql`
  query indexQuery {
    fileName:file(relativePath: { eq: "images/myimage.jpg" }) {
      childImageSharp {
        sizes(maxWidth: 400, maxHeight: 250) {
          ...GatsbyImageSharpSizes
        }
      }
    }
  }
`;
```

Like all graphql queries, it can be placed in bottom of the the page component file. 

Then import the base Img component from `gatsby-image`

```
import Img from 'gatsby-image'

```

And start using this component with the queried image as prop

```
<Img sizes={data.fileName.childImageSharp.sizes}  />
```


## Using Fragments To Standardize Formatting

What if you have a bunch of images and you want them all to us the same formatting? For a gallery and many other instances it is useful to have all images formatted the same. 

A custom fragment is an easy way to standardize formatting and re-use it on multiple images.

```
export const squareImage = graphql`
fragment squareImage on File {
      childImageSharp {
        sizes(maxWidth: 200, maxHeight: 200) {
          ...GatsbyImageSharpSizes
        }
      }
}
`;
```

The fragment can then be referenced in the image query

```

export const query = graphql`
  query imageGallery {
    image1:file(relativePath: { eq: "images/image1.jpg" }) {
      ...squareImage
    }

    image2:file(relativePath: { eq: "images/image2.jpg" }) {
      ...squareImage
    }

   image3:file(relativePath: { eq: "images/image3.jpg" }) {
      ...squareImage
    }
  }
`;

```


