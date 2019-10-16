---
title: Working With Images in Markdown Posts and Pages
---

When building Gatsby sites composed primarily of Markdown pages or posts, insertion of images can enhance the content. You can add images in multiple ways.

## Featured images with Frontmatter metadata

In sites like a blog, you may want to include a featured image that appears at the top of a page. One way to do this is to grab the image filename from a frontmatter field and then transform it with `gatsby-plugin-sharp` in a GraphQL query.

This solution assumes you already have programmatically generated pages from Markdown with renderers like `gatsby-transformer-remark` or `gatsby-plugin-mdx`. If not, take a read through up to [Part 7 of the Gatsby Tutorial](/tutorial/part-seven/). This will build upon the tutorial and as such, `gatsby-transformer-remark` will be used for this example.

> Note: This can be done similarly using [MDX](/docs/mdx/) as well. Instead of the `markdownRemark` nodes in GraphQL, `Mdx` can be swapped in and should work.

To start out, download the plugins for Gatsby-image as mentioned in [Using gatsby-image](/docs/using-gatsby-image/).

```shell
npm install --save gatsby-image gatsby-transformer-sharp gatsby-plugin-sharp
```

You will also want to have `gatsby-source-filesystem` installed. Then, configure the various plugins in the `gatsby-config` file.

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
      },
    },
  ],
}
```

Then, in an example markdown file, add a field called `featuredImage`:

```md:title=src/pages/example-post.md
---
title: My Amazing Post
featuredImage: ./awesome-image.png
---

Content goes here!
```

The `featuredImage` field should include the relative path to an image you want to use.

You can now query for the featured image in GraphQL. If the filepath points to an actual image, it will be transformed into a `File` node in GraphQL and then you can get the image data out of it by using the `childImageSharp` field.

This can be added to the GraphQL query in a Markdown template file. In this example, a [Fluid query](/docs/gatsby-image#images-that-stretch-across-a-fluid-container) is used to make a responsive image.

```jsx:title=src/templates/blog-post.js
export const query = graphql`
  query PostQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        // highlight-start
        featuredImage {
          childImageSharp {
            fluid(maxWidth: 800) {
              ...GatsbyImageSharpFluid
            }
          }
        }
        // highlight-end
      }
    }
  }
`
```

Also in the Markdown post template, import the `gatsby-image` package and pass the results of the GraphQL query into an `<Img />` component.

```jsx:title=src/templates/blog-post.js
import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
// highlight-start
import Img from "gatsby-image"
// highlight-end

export default ({ data }) => {
  let post = data.markdownRemark

  // highlight-start
  let featuredImgFluid = post.frontmatter.featuredImage.childImageSharp.fluid
  // highlight-end

  return (
    <Layout>
      <div>
        <h1>{post.frontmatter.title}</h1>
        // highlight-start
        <Img fluid={featuredImgFluid} />
        // highlight-end
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    </Layout>
  )
}

export const query = graphql`
  query PostQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        featuredImage {
          childImageSharp {
            fluid(maxWidth: 800) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
`
```

Your featured image should now appear on the generated page right below the main header. Tada!

## Inline images with `gatsby-remark-images`

You may also include images in the Markdown body itself. The plugin [gatsby-remark-images](/packages/gatsby-remark-images) comes in handy for this.

Start out by installing `gatsby-remark-images` and `gatsby-plugin-sharp`.

```shell
npm install --save gatsby-remark-images gatsby-plugin-sharp
```

Also make sure that `gatsby-source-filesystem` is installed and points at the directory where your images are located.

Configure the plugins in your `gatsby-config` file. As with the previous example, either `Remark` or `MDX` can be used; `gatsby-plugin-mdx` will be used in this case. Put the `gatsby-remark-images` plugin within the `gatsbyRemarkPlugins` option field of `gatsby-plugin-mdx`.

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1200,
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
      },
    },
  ],
}
```

With this configuration, you can use the default Markdown syntax for images. They will be processed by Sharp and appear as if you placed them in a `gatsby-image` component.

```md
![Awesome image](./my-awesome-image.png)
```
