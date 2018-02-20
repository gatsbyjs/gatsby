---
title: Optimizing IMages
---

# Optimizing Images

Gatsby has several tools that are ideal for managing images. These allow you to query your image files and then easily optimize them for the web. 


The recommend approach is to 
* Query your images with GraphQL
* Use Sharp, an image processing library, to transform images
* Use the Gatsby image plugin to optimize for the web


## Query Your Images With GraphQL

GraphGL is how Gatsby recognizes files and allows you to use them on pages. [See the Querying With GrapgQL sectino on images to learn how this works](docs/querying-with-graphql/#images).

You'll need the `gatsby-source-filesystem` in order to be able to query files like images. 


`npm install --save gatsby-source-filesystem`

Once you have this installed you should be able to query the files as shown in the our tutorial on [writing queries](tutorial/part-four/#build-a-page-with-a-graphql-query). 

For example, here I query an image in my images directory. The query can give me some basic info (size, extension) about the image now. 

```jsx
export const query = graphql`
  query indexQuery {
    {
        fileName:file(relativePath: { eq: "images/myimage.jpg"}) 
    }
  }
`;
```

So at this point you can grab your images with GraphQL, but we want our queries to also format them. 

## Formatting Images With Sharp

[Sharp](https://github.com/lovell/sharp) is a high-performance image processing library. The gatsby-transformer-sharp installs everything that's needed to format your images responsively

`npm install --save gatsby-transformer-sharp`

and install it in your gatsby-config.js

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [`gatsby-transformer-sharp`],
};
```

To view all the methods you can use with sharp the [Documentation](/packages/gatsby-plugin-sharp/).

This also gives you access to special queries called [fragments](/packages/gatsby-image/#fragments) that automatically query a bunch of field's we'll want to use later including width, height, and src. 


### How to chose the right formatting

Which methods and fragments you use will depend on what type of responsive image you have. See the [Gatsby Image documentation for more information](/packages/gatsby-image/#two-types-of-responsive-images) . In general for fixed size images use resolution, for images you want to stretch use size. 


A thing to remember about fragments [is they do not work in Graph_i_QL.](/packages/gatsby-image/#fragments)




In this case, I want the image to stretch so I use the resolution method with the parameters I want (a maxwidth of 400 pixels, max height of 250) and the  resolution fragment to grab the right fields
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


## Formatting Images In React Components With Gatsby Image

[Gatsby Image](/packages/gatsby-image/) is a plugin that automatically creates React components for the image that are fully responsive and have other high performance features.


`npm install --save gatsby-image`

Now I can import it at the top of my page component

```
import Img from 'gatsby-image'

```

And start using this component with my queried image as a prop

```
     <Img sizes={data.fileName.childImageSharp.sizes}  />
```


## Using Fragments To Standardize Formatting

What if you have a bunch of images and you want them all to us the same formatting? Like a gallery of square images. It's annoying to have to write the queries over and over again.

You can make your own fragment, like 

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

Then my query can use the fragment

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


