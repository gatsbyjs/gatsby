---
title: Using Gatsby Image With Your Site
---

## What’s contained in this tutorial?

By the end of this tutorial, you’ll have done the following:

- learned how to use `gatsby-plugin-image` for responsive images
- queried for a single image with GraphQL
- sourced multiple images through YAML files
- learned how to troubleshoot common errors

## Prerequisites

This tutorial assumes you already have a Gatsby project up and running as well as images you'd like to render on your page. To set up a Gatsby site, check out the [main tutorial](/docs/tutorial/) or the [quick start](/docs/quick-start/).

In this tutorial you'll learn how to set up `gatsby-plugin-image`, a Gatsby package that exposes components for using optimized responsive images. You'll be informed of a number of ways to use `gatsby-plugin-image` and some gotchas.

> _Note: this tutorial uses examples of static content stored in YAML files, but similar methods can be used for Markdown files._

## Getting started

Image optimization in Gatsby is provided by a plugin called `gatsby-plugin-image` which is incredibly performant.

### Step 1

Start by using npm to install the `gatsby-plugin-image` plugin and its associated dependencies.

```shell
npm install gatsby-plugin-image gatsby-transformer-sharp gatsby-plugin-sharp
```

### Step 2

Add the newly installed plugins to your `gatsby-config.js` file. The config file ends up looking like this (other plugins already in use have been removed from this snippet for simplicity).

```javascript:title=gatsby-config.js
plugins: [
  `gatsby-transformer-sharp`,
  `gatsby-plugin-sharp`,
  `gatsby-plugin-image`,
]
```

## Gatsby-image configuration

Now you're set up to use `gatsby-plugin-image`.

### Step 3

Determine where your image files are located. In this example they're in `src/data`. Note, this is only necessary when you're querying multiple images at once.

If you haven't already, make sure that your project is set up to see content inside that directory. That means doing two things:

1. Install `gatsby-source-filesystem`.

```shell
npm install gatsby-source-filesystem
```

2. The next step is to make sure your `gatsby-config.js` file specifies the correct folder. In this example it would look like this:

```javascript:title=gatsby-config.js
plugins: [
  `gatsby-transformer-sharp`,
  `gatsby-plugin-sharp`,
  `gatsby-plugin-image`,
  { resolve: `gatsby-source-filesystem`, options: { path: `./src/data/` } },
]
```

Now you're ready to start working with `gatsby-plugin-image`!

## Step 4

The next step can vary depending on what you're trying to accomplish.

## Querying data for a single image

`gatsby-plugin-image` includes a component specifically designed for use when you have a single specific image you want to display. You can use it to reference an image file in your project, using a relative path, or an external image, using a URL.

```jsx:title=src/pages/index.js
import React from "react"
import { StaticImage } from "gatsby-plugin-image"
import Layout from "../components/layout"

const HomePage = ({ data }) => {
  return (
    <Layout>
      <StaticImage src="../images/headshot.jpg" alt="" />
    </Layout>
  )
}
export default HomePage
```

## Querying for multiple images

Another way to source images is dynamically, based on a reference to where the image files are. This example will use YAML, but markdown (or another source plugin) would work just as well. This example uses the `gatsby-transformer-yaml` plugin to query the YAML files. More information about that plugin can be found in the [Gatsby plugin library](/plugins/gatsby-transformer-yaml/?=gatsby-transformer-yaml).

Here's an example of a query from a list of conferences in a YAML file with an image for each one:

```graphql
{
  allSpeakingYaml {
    edges {
      node {
        conference
        year
        image {
          childImageSharp {
            gatsbyImageData
          }
        }
      }
    }
  }
}
```

In this case the query starts with `allSpeakingYaml` to direct `graphql` to look for this data in the `speaking.yaml` file in your `src/data` folder referenced in `gatsby-config.js`. If you want to query a file named `blog.yaml`, for example, you'd start the query with `allBlogYaml`.

## Rendering images sourced from YAML

In order to reference your images in YAML make sure that the relative paths are accurate. The path to each image should be relative to the location of the `.yaml` file pointing to it. And all of these files need to be in a directory visible to the `gatsby-source-filesystem` plugin configured in `gatsby-config.js`.

The inside of the YAML file would look something like this:

```yaml
- image: speaking/kcdc.jpg
```

Now, you can create the query. You can use `gatsby-plugin-sharp` inside the query to generate images based on the image file path. When the query runs, the relative path will point to the location of the image file and the resulting query processes the file as an image for display.

```graphql
{
  allSpeakingYaml {
    edges {
      node {
        image {
          childImageSharp {
            gatsbyImageData
          }
        }
      }
    }
  }
}
```

Since the images are stored as part of an array, they can be accessed using the JavaScript `map` function in JSX. You'll want to import the `GatsbyImage` component from `gatsby-plugin-image`. Note that this is a different component than the `StaticImage` component you used for the single image example.

```jsx
import { GatsbyImage } from "gatsby-plugin-image"
;<GatsbyImage
  image={node.image.childImageSharp.gatsbyImageData}
  alt={node.conference}
/>
```

## Aspect ratio

`gatsby-plugin-image` has a feature that gives you the ability to set an aspect ratio to constrain image proportions. When used with `StaticImage` it's passed as a prop.

```jsx
<StaticImage
  image={data.file.childImageSharp.gatsbyImageData}
  aspectRatio={21 / 9}
/>
```

When you're processing multiple images, it's part of the GraphQL query and needs to be a decimal.

```graphql
{
  allSpeakingYaml {
    edges {
      node {
        image {
          childImageSharp {
            gatsbyImageData(aspectRatio: 2.33)
          }
        }
      }
    }
  }
}
```

## The end

So that's it. This post included a number of different possible use cases, so don't feel as if you need to explore them all. Pick the examples and tips that apply to your implementation.

## Other resources

- [Using gatsby-plugin-image](/docs/how-to/images-and-media/using-gatsby-plugin-image/)
