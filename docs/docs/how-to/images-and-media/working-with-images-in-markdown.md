---
title: Working with Images in Markdown & MDX
---

When building Gatsby sites composed primarily of [markdown](/docs/how-to/routing/adding-markdown-pages/) or [MDX](/docs/how-to/routing/mdx/), insertion of images can enhance the content. You can add images in multiple ways which will be explained below. If you're new to Gatsby we recommend checking out the [main tutorial](/docs/tutorial/getting-started/) first. The instructions also assume that you already have an existing Gatsby site running with either markdown or MDX.

## Prerequisites

- A Gatsby project set up. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))
- Either markdown or MDX support added to your site. Follow the [MDX instructions](/docs/how-to/routing/mdx/) or [markdown instructions](/docs/how-to/routing/adding-markdown-pages/).

## Featured images with frontmatter metadata

In sites like a blog, you may want to include a featured image that appears at the top of a page. One way to do this is to grab the image filename from a frontmatter field and then transform it with `gatsby-plugin-sharp` in a GraphQL query.

If you want to have a very detailed explanation of this, head to [part 7 of the Gatsby tutorial](/docs/tutorial/getting-started/part-7/). The tutorial uses MDX, the instructions below will use markdown for the most part. It more or less behaves the same though.

To start out, install the necessary plugins for [gatsby-plugin-image](/docs/how-to/images-and-media/using-gatsby-plugin-image/).

```shell
npm install gatsby-plugin-image gatsby-plugin-sharp gatsby-source-filesystem gatsby-transformer-sharp
```

Then, configure the various plugins in the `gatsby-config` file.

### Configuring for images and posts in the same directory

If your images are in the same directory as the markdown files, sourcing and resolving the images can be done in one configuration. For example, if your markdown files and images are located together in a `src/content` directory, both content types will be automatically picked up by GraphQL as part of Gatsby's data layer.

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-transformer-remark`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/content`, // highlight-line
      },
    },
  ],
}
```

Then, in an example markdown file, add a field called `featuredImage`:

```markdown:title=src/content/my-favorite-doggos.md
---
title: My Favorite Doggos
featuredImage: pupperino.png
---

Content goes here!
```

The next step will be to incorporate the data into a template with a GraphQL query, which can be found later in this guide.

### Configuring for images and posts in different directories

There are also occasions when you may want to source images from a different directory than where your markdown posts or pages are located, such as in an external `/images` folder. You can set this up by specifying two distinct sources, one for the markdown files and the other for images:

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-transformer-remark`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/content`, // highlight-line
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/images`, // highlight-line
      },
    },
  ],
}
```

Then, in a markdown file, the path to a `featuredImage` would be relative to the page file (in this case, in an `/images` directory up a level):

```markdown:title=src/content/about.md
---
title: About
featuredImage: ../images/team-cat.png
---

Content goes here!
```

### Querying for images from frontmatter

Now that you've sourced markdown and image data, you can query for featured images in GraphQL. If a filepath points to an actual image, it will be transformed into a `File` node in GraphQL and then you can get the image data out of it by using the `childImageSharp` field.

This can be added to the GraphQL query in a markdown template file. In this example, a [Dynamic image](/docs/how-to/images-and-media/using-gatsby-plugin-image/#dynamic-images) is used to make a responsive image. The query below might be different to what you have in your blog post template, however the highlighted section will be relevant nevertheless:

```jsx:title=src/templates/blog-post.jsx
export const query = graphql`
  query PostQuery($id: String) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        title
        // highlight-start
        featuredImage {
          childImageSharp {
            gatsbyImageData(width: 800)
          }
        }
        // highlight-end
      }
    }
  }
`
```

In the blog post template, import the `gatsby-plugin-image` package and pass the results of the GraphQL query into an `<GatsbyImage />` component.

```jsx:title=src/templates/blog-post.jsx
import * as React from "react"
import { graphql } from "gatsby"
// highlight-start
import { GatsbyImage, getImage } from "gatsby-plugin-image"
// highlight-end

export default function BlogPost({ data }) {
  let post = data.markdownRemark

  // highlight-start
  let featuredImg = getImage(post.frontmatter.featuredImage?.childImageSharp?.gatsbyImageData)
  // highlight-end

  return (
    <main>
      <h1>{post.frontmatter.title}</h1>
      // highlight-start
      <GatsbyImage image={featuredImg} />
      // highlight-end
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </main>
  )
}

export const query = graphql`
  query PostQuery($id: String) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        title
        featuredImage {
          childImageSharp {
            gatsbyImageData(width: 800)
          }
        }
      }
    }
  }
`
```

The code example above is just an example, adjust the `<GatsbyImage />` portion to how you'd want to use it in your template.

## Inline images with `gatsby-remark-images`

You may also include images in the markdown/MDX body itself. The plugin [gatsby-remark-images](/plugins/gatsby-remark-images) comes in handy for this.

Start out by installing `gatsby-remark-images`:

```shell
npm install gatsby-remark-images
```

Configure the plugins in your `gatsby-config` file. As with the previous example, either markdown or MDX can be used.

### Using `gatsby-transformer-remark`

Put the `gatsby-remark-images` plugin within the `plugins` option field of `gatsby-transformer-remark`.

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    // Rest of the plugins...
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 800,
            },
          },
        ],
      },
    },
  ],
}
```

### Using `gatsby-plugin-mdx`

`gatsby-remark-images` needs to be a sub-plugin of `gatsby-plugin-mdx`, included in the `gatsbyRemarkPlugins` array.

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    // Rest of your plugins...
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
  ],
}
```

With the configurations above, you can use the default markdown syntax for images. They will be processed by sharp and appear as if you placed them in a `gatsby-plugin-image` component.

```markdown
![Hopper The Rabbit](./rabbit-friend.png)
```

## Additional Resources

- [Using gatsby-plugin-image](/docs/how-to/images-and-media/using-gatsby-plugin-image/)
- [Adding MDX pages](/docs/how-to/routing/mdx/)
- [Adding markdown pages](/docs/how-to/routing/adding-markdown-pages/)
