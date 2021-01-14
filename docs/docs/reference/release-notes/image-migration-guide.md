---
title: Migrating from gatsby-image to gatsby-plugin-image
---

This document is provided to help users of gatsby-image migrate to using gatsby-plugin-image.

Note that you can use both packages at the same time and may need to in situations where you're using a gatsby-image compatible CMS as a data source and that CMS plugin has not yet updated to a version compatible with the new API.

If you're looking for other documentation on the new plugin, see:

- How to guide: //todo
- Reference guide: //todo

## Install

1. Install and update dependencies

```shell
npm install gatsby-plugin-image gatsby-plugin-sharp gatsby-transformer-sharp
```

2. Configure plugins

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
  ],
}
```

3. Update code to new syntax, see next section

## New Syntax

The new plugin requires significant syntax changes. We've provided a [codemod](#codemod-instructions) to help you migrate, but this section will explain the changes.

### Import change

Previously, `GatsbyImage` was the default export from `gatsby-image`. This is no longer the case.

```javascript
// import Img from "gatsby-image"
import { GatsbyImage } from "gatsby-plugin-image"
```

### GraphQL changes

This is one of the bigger changes. There are no more fragments to use, instead things like layout and format are passed as arguments to the resolver.

This is the previous syntax.

```javascript
import { graphql } from "gatsby"

export const query = graphql`
  {
    file(relativePath: { eq: "images/example.jpg" }) {
      childImageSharp {
        fixed {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`
```

The new syntax looks like this.

```javascript
import { graphql } from "gatsby"

export const query = graphql`
  {
    file(relativePath: { eq: "images/example.jpg" }) {
      childImageSharp {
        gatsbyImageData(layout: FIXED)
      }
    }
  }
`
```

There are other changes to the available argument structure in the section on [API changes](#api-changes).

### Component changes

The last change is to the JSX component. The import name is potentially different and the query result is also different.

```javascript
// import Img from "gatsby-image"
import { GatsbyImage } from "gatsby-plugin-image"

const HomePage = ({ data }) => {
  return (
    // <Img fixed={data.file.childImageSharp.fixed} />
    <GatsbyImage image={data.file.childImageSharp.gatsbyImageData} />
  )
}
```

## API Changes

In addition to the syntax changes for using gatsby-plugin-image, there are also changes to the API that affect the resolver arguments (and StaticImage).

## fluid

The `fluid` image type has been deprecated in favor of two alternatives.

The first is an image type called `fullWidth`. This image is designed to be used for things like hero images and generates image sizes accordingly. Instead of passing something like `maxWidth`, it takes an array called `breakpoints` that will generate images designed for those screen sizes. Note that `fullWidth` images will expand to fit the width of their container, even if that width is larger than the source image.

The second is a responsive image type called `constrained` that generates smaller images, but nothing larger than the original image source size. Additionally, you can pass `width` and/or `height` to limit the largest image generated to that size.

## maxWidth

`maxWidth` and `maxHeight` are deprecated for all image types.

## aspectRatio

`aspectRatio` is a new argument that takes a number (or fraction). If you pass it on its own, it will default to using the source image width, and then adjusting the height to the correct aspect ratio. Alternatively you can pass your own width or height and it will set the other dimension. Passing both `height` and `width` will cause `aspectRatio` to be ignored in favor of the inferred aspect ratio.

## formats

Previously, images generated their own type, e.g. jpg, png, etc. You could also generate webp images when using the appropriate fragment. This is now controlled using the `formats` argument. This field takes an array, `["AUTO", "WEBP"]` by default, `"AVIF"` is also valid.

## options nested inside objects

Previously, transformations like `grayscale` and quality options such as `pngQuality` were top level query arguments. This has changed.

See the [how to guide] for specifics, but `grayscale` now exists within the `transformOptions` argument, and `pngQuality` inside `pngOptions`.

## Codemod Instructions

Due to the syntax changes, there is a codemod available to update your site to be compatible with `gatsby-plugin-image`. It does not cover every single usage of the existing plugin, but should cover the majority of users. See [codemod assumptions](#codemod-assumptions) section to understand the various decisions it makes.

Note that if you're trying to do a partial migration because some uses of `gatsby-image` are relying on CMS data that isn't compatible yet, you'll want to run the codemod on individual files rather than your whole project.

There are two ways to run the codemod. Most users will want to use the `npx` version.

```shell
npx gatsby-codemods gatsby-plugin-image <optional-path>

```

Without a path, the codemod will run against all the files in your current directory, so running it in root is recommended. It will ignore `node_modules`, `.cache` and `public` automatically. It will also respect any local Babel configuration in your project. The codemod is designed to run against files with the extensions `.ts, .js, .tsx, .jsx`. If this does not cover your project, or you require other customizations, you'll want to run the codemod using jscodeshift.

1. Install jscodeshift

```shell
npm install --global jscodeshift
```

2. Install the codemods package in your project

```shell
npm install gatsby-codemods
```

3. Run the codemod

```shell
jscodeshift -t node_modules/gatsby-codemods/transforms/gatsby-plugin-image.js .
```

See the [jscodeshift docs](https://github.com/facebook/jscodeshift) for all the available flags.

### Codemod Assumptions

Due to the API changes, the codemod is not a pure 1:1 mapping. There are some changes introduced.

1. Fluid images will map to either fullWidth or constrained images. This decision is made based on the existence of maxWidth and its value. If maxWidth does not exist, it will be a fullWidth image. If it does, and the maxWidth is less than 1000, it will be a constrained image, otherwise a fullWidth image. fullWidth images do not retain their maxWidth or maxHeight fields, constrained images do, as width and height.
2. All images will generate Webp

The API change to options is not currently codemoded. TODO: should this be?

The codemod will warn the user in a number of different scenarios and point you to the file in question so you can inspect the changes manually.

### Recommended Changes

For images using static query, you should move to use the `StaticImage` component instead. This component takes `src` which can be a remote image URL or a relative path to an image. Make sure you've installed `gatsby-source-filesystem` if you're going to use this component.

The plugin also includes helper functions as the structure of the gatsbyImageData object is considered an implementation detail.

```javascript
import { getImage, getSrc, GatsbyImage } from "gatsby-plugin-image"

const HomePage = ({ data }) => {
  const image = getImage(data.file)
  const imagePath = getSrc(data.file)
  return (
    <div>
      <GatsbyImage image={image} alt="please include an alt" />
      <SEO imageSrc={imagePath} />
    </div>
  )
}
```

### Unsupported gatsby-image usage

Due to the changes to gatsby-plugin-image, there is some functionality that is no longer supported.

1. GatsbyImage is no longer a class component and therefore cannot be extended
2. Fluid images no longer exist, and the fullWidth replacement does not take maxWidth or maxHeight
3. Art direction is no longer supported
4. The component no longer takes a decomposed object and the following code is not valid

```javascript
// THIS IS NOT VALID
<GatsbyImage image={{ src: example.src, srcSet: ``, width: 100 }} />
```
