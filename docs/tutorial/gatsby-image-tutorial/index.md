---
title: Using Gatsby-Image With Your Site
---

## What’s contained in this tutorial?

By the end of this tutorial, you’ll have done the following:

- learned how to use `gatsby-image` for responsive images
- queried for a single image with GraphQL
- sourced multiple images through YAML files
- learned how to troubleshoot common errors

## Prerequisites

This tutorial assumes you already have a Gatsby project up and running as well as images you'd like to render on your page. To set up a Gatsby site, check out the [main tutorial](/tutorial/) or the [quick start](/docs/quick-start/).

In this tutorial you'll learn how to set up `gatsby-image`, a React component that optimizes responsive images using GraphQL and Gatsby's data layer. You'll be informed of a number of ways to use `gatsby-image` and some gotchas.

> _Note: this tutorial uses examples of static content stored in YAML files, but similar methods can be used for Markdown files._

## Getting started

Image optimization in Gatsby is provided by a plugin called `gatsby-image` which is incredibly performant.

### Step 1

Start by using npm to install the `gatsby-image` plugin and its associated dependencies.

```bash
npm install gatsby-image gatsby-transformer-sharp gatsby-plugin-sharp
```

### Step 2

Add the newly installed plugins to your `gatsby-config.js` file. The config file ends up looking like this (other plugins already in use have been removed from this snippet for simplicity).

> _Note: once `gatsby-image` has been installed, it does not need to be included in the `gatsby-config.js` file._

```javascript:title=gatsby-config.js
plugins: [`gatsby-transformer-sharp`, `gatsby-plugin-sharp`]
```

## Gatsby-image configuration

Now you're set up to use `gatsby-image`.

### Step 3

Determine where your image files are located. In this example they're in `src/data`.

If you haven't already, make sure that your project is set up to see content inside that directory. That means doing two things:

1.  Install `gatsby-source-filesystem`. Note: If you created your project using `gatsby new <name>`, this first step should already be done for you via the default starter.

```bash
npm install gatsby-source-filesystem
```

2. The next step is to make sure your `gatsby-config.js` file specifies the correct folder. In this example it would look like this:

```javascript:title=gatsby-config.js
plugins: [
  `gatsby-transformer-sharp`,
  `gatsby-plugin-sharp`,
  { resolve: `gatsby-source-filesystem`, options: { path: `./src/data/` },
]
```

Now you're ready to start working with `gatsby-image`!

## Step 4

The next step can vary depending on what you're trying to accomplish.

## Querying data for a single image

Use `graphql` to query an image file directly. You can include the relative path to the image file and determine how you want `gatsby-image` to process the file.

```jsx:title=src/pages/index.js
export const query = graphql`
  query {
    file(relativePath: { eq: "headers/headshot.jpg" }) {
      childImageSharp {
        fixed(width: 125, height: 125) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`
```

There are a couple of things to note here.

### Relative image paths and `gatsby-config.js`

You might expect the relative path to be relative to the file the code sits in, in this case that's index.js. However, that doesn't work. The relative path is actually based on the line of code you put in the `gatsby-source-filesystem` config, which points to `src/data`.

### Image fragments

Another thing to note about this query is how it uses the fragment `GatsbyImageSharpFixed` to return a fixed width and height image. You could also use the fragment `GatsbyImageSharpFluid` which produces scalable images that fill their container instead of fitting specific dimensions. In `gatsby-image`, _fluid_ images are meant for images that don’t have a finite size depending on the screen, where as other images are _fixed_.

The query will return a data object including the processed image in a format usable by the `gatsby-image` component. The returned result will be automatically passed into the component and attached to the `data` prop. You can then display the image using JSX to automatically output responsive, highly performant HTML.

To display the image, start by importing the component provided by `gatsby-image`.

```jsx
import Img from "gatsby-image"
```

Now you can use it. Note that the key for pointing to the image corresponds to the way in which the image was processed. In this example that is `fixed`.

```jsx
<Img
  className="headshot"
  fixed={data.file.childImageSharp.fixed}
  alt="headshot"
/>
```

Here is the query and usage all put together:

```jsx:title=src/pages/index.js
import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import Layout from "../components/layout"

const HomePage = ({ data }) => {
  return (
    <Layout>
      <Img
        className="headshot"
        fixed={data.file.childImageSharp.fixed}
        alt=""
      />
    </Layout>
  )
}

export const query = graphql`
  query {
    file(relativePath: { eq: "headers/headshot.jpg" }) {
      childImageSharp {
        fixed(width: 125, height: 125) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`
export default HomePage
```

## Querying for multiple images from YAML data

Another way to source images is through YAML (or Markdown). This example uses the `gatsby-transformer-yaml` plugin to query the YAML files. More information about that plugin can be found in the [Gatsby plugin library](/packages/gatsby-transformer-yaml/?=gatsby-transformer-yaml).

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
            fluid {
              ...GatsbyImageSharpFluid
            }
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

```
- image: speaking/kcdc.jpg
```

Now, you can create the query. Similar to the single use example above, you can use `gatsby-image` features inside the query. When the query runs, the relative path will point to the location of the image file and the resulting query processes the file as an image for display.

```graphql
{
  allSpeakingYaml {
    edges {
      node {
        image {
          childImageSharp {
            fluid {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
}
```

Since the images are stored as part of an array, they can be accessed using the JavaScript `map` function in JSX. As with the single image example, the actual processed image is at the `...GatsbyImageSharpFluid` level in the returned data structure.

```jsx
<Img
  className="selfie"
  fluid={node.image.childImageSharp.fluid}
  alt={node.conference}
/>
```

## Using Static Query

If your query is part of a reusable component you may want to use a Static Query hook. The code necessary to do this is almost the same as the single image use case above.

```javascript:title=src/components/header-image.js
export default () => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "headers/default.jpg" }) {
        childImageSharp {
          fixed(width: 125, height: 125) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  `)

  return <Img fixed={data.file.childImageSharp.fixed} />
}
```

Instead of a query constant and data that references the result like in the first section above, you can put the `useStaticQuery` hook directly in the JSX code and then reference it in the `Img` component. Note that the query language didn’t change and neither did the `Img` tag syntax; the only change was the location of the query and the usage of the `useStaticQuery` function to wrap it.

## Multiple queries and aliasing

The last use case you may come across is how to handle a situation where you have multiple queries in the same file/page.

This example is attempting to query for all the data in `speaking.yaml` and the direct file query in our first example. In order to do this you want to use aliasing in GraphQL.

The first thing to know is that an alias is assigning a name to a query. The second thing to know is that aliases are optional, but they can make your life easier! Below is an example.

```graphql
talks: allSpeakingYaml {
        edges {
            node {
                image {
                    childImageSharp {
                        fluid {
                            ...GatsbyImageSharpFluid
                        }
                    }
                }
            }
        }
    }
}
```

When you do that, you’ve changed the reference to the query object available in your JSX code. While it was previously referenced as this:

```jsx
{data.allSpeakingYaml.edges.map(({ node }) => (
   <Img fluid={node.image.childImageSharp.fluid} alt={node.alt}/>
))
```

Giving it an alias does not add a level of complexity to the response object, it just replaces it. So you end up with the same structure, referenced like this (note the alias `talks` in place of the longer `allSpeakingYaml`):

```jsx
{data.talks.edges.map(({ node }) => (
    <Img fluid={node.image.childImageSharp.fluid} alt={node.alt}/>
))
```

The top-level object name of `data` is implicit. This is important because when you conduct multiple queries as part of a single component, Gatsby still passes the entire result to the component.

Here's an example of data flowing into a component:

```jsx
const SpeakingPage = ({ data }) => {})
```

Everything else gets referenced from that top-level return name.

With that understanding, you can combine two queries referencing images and use aliasing to distinguish between them.

```graphql
{
  allSpeakingYaml {
    edges {
      node {
        image {
          childImageSharp {
            fluid {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
  banner: file(relativePath: { eq: "headers/default.jpg" }) {
    childImageSharp {
      fluid {
        ...GatsbyImageSharpFluid
      }
    }
  }
}
```

Notice that this example uses aliasing for one query and not the other. This is allowed; there is no requirement that all your queries use aliasing. In this case, the JSX would look like this to access the `speaking.yaml` content.

```jsx
{data.allSpeakingYaml.edges.map(({ node }) => (
     <Img fluid={node.image.childImageSharp.fluid} alt={node.alt}/>
))
```

And then like this to access the image using the alias name `banner`.

```jsx
<Img fluid={data.banner.childImageSharp.fluid} />
```

These examples should handle a fair number of use cases. A couple bonus things:

## Aspect ratio

`gatsby-image` has a feature that gives you the ability to set an aspect ratio to constrain image proportions. This can be used for fixed or fluid processed images; it doesn't matter.

```jsx
<Img sizes={{ ...data.banner.childImageSharp.fluid, aspectRatio: 21 / 9 }} />
```

This example uses the `sizes` option on the `Img` component to specify the `aspectRatio` option along with the fluid image data. This processing is made possible by `gatsby-plugin-sharp`.

## Bonus Error

Now for errors to watch out for. If you change your image processing from `fixed` to `fluid` you may see this error.

![In image cache error message.](./ErrorMessage.png)

Despite its appearance, solving this doesn't actually require flushing any kind of cache. In reality, it has to do with incompatible references. You likely triggered it because you changed the query to process the image as `fluid` but the JSX key was still set to `fixed`, or visa versa.

## The end

So that's it. This post included a number of different possible use cases, so don't feel as if you need to explore them all. Pick the examples and tips that apply to your implementation.

## Other resources

- [Gatsby Image API docs](/docs/gatsby-image/)
- [Using Gatsby Image](/docs/using-gatsby-image/)
- [Other image and media techniques in Gatsby](/docs/images-and-files/)
