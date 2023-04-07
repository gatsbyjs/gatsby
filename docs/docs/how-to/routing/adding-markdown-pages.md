---
title: Adding Markdown Pages
examples:
  - label: using-remark
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-remark"
---

Gatsby can use markdown files to create pages in your site. You add plugins to read and understand folders with markdown files and from them create pages automatically.

Here are the steps Gatsby follows for making this happen.

1. Read files into Gatsby from the filesystem
1. Transform markdown to HTML and [frontmatter](#frontmatter-for-metadata-in-markdown-files) to data
1. Add a markdown file
1. Create a collection route component for the markdown files

## Prerequisites

- A Gatsby project set up. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))

## Instructions

### Read files into Gatsby from the filesystem

Use the plugin [`gatsby-source-filesystem`](/plugins/gatsby-source-filesystem/#gatsby-source-filesystem) to read files and let Gatsby create `File` nodes in its GraphQL data layer. Install it like so:

```shell
npm install gatsby-source-filesystem
```

Open `gatsby-config` to add the `gatsby-source-filesystem` plugin. The `path` option is how you set the directory to search for files.

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/src/content`,
      },
    },
  ],
}
```

Create a folder in the `src` directory of your Gatsby application called `content`. Now create a markdown file inside it with the name `post-1.md`.

When you create a markdown file, you can include a set of key/value pairs that can be used to provide additional data relevant to specific pages in the GraphQL data layer. This data is called _frontmatter_ and is denoted by the triple dashes at the start and end of the block. This block will be parsed by `gatsby-transformer-remark` as YAML. You can then query the data through the GraphQL API from your React components.

```md:title=src/content/post-1.md
---
slug: "/my-first-blog-post"
date: "2022-11-24"
title: "My first blog post"
---
```

What is important in this step is the key pair `slug`. The value that is assigned to the key `slug` is used for the final URL of the post.

Completing the above step means that you've _sourced_ the markdown files from the filesystem. You can now _transform_ the markdown to HTML and the YAML frontmatter to JSON.

### Transform markdown to HTML and frontmatter to data using `gatsby-transformer-remark`

You'll use the plugin [`gatsby-transformer-remark`](/plugins/gatsby-transformer-remark/) to recognize files which are markdown and read their content. The plugin will convert the frontmatter metadata part of your markdown files as `frontmatter` and the content part as HTML. Install the plugin:

```shell
npm install gatsby-transformer-remark
```

Add this to `gatsby-config` after the previously added `gatsby-source-filesystem`.

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/src/content`,
      },
    },
    // highlight-next-line
    `gatsby-transformer-remark`,
  ],
}
```

## Create a collection route for the markdown files

Use the [File System Route API](/docs/reference/routing/file-system-route-api/) to create a collection route (you can learn all details in the linked document). Create `src/pages/blog/{markdownRemark.frontmatter__slug}.jsx` and add the following code:

```jsx:title=src/pages/blog/{markdownRemark.frontmatter__slug}.jsx
import * as React from "react"
import { graphql } from "gatsby"

export default function BlogPostTemplate({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { markdownRemark } = data // data.markdownRemark holds your post data
  const { frontmatter, html } = markdownRemark
  return (
    <div>
      <div>
        <h1>{frontmatter.title}</h1>
        <h2>{frontmatter.date}</h2>
        <div
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}

export const pageQuery = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        slug
        title
      }
    }
  }
`
```

When you now start `gatsby develop`, you should be able to navigate to `localhost:8000/blog/my-first-blog-post`.

Two things are important in the file above:

1. A GraphQL query is made in the second half of the file to get the markdown data. Gatsby has automagically given you all the markdown metadata and HTML in this query's result. You can learn more about [page queries](/docs/how-to/querying-data/page-query/) if you're interested.

1. The result of the query is injected by Gatsby into the component as the `data` prop. `props.data.markdownRemark` is the property that has all the details of the markdown file.

Next you could create a page component at `src/pages/blog/index.jsx` to serve as a listing page for all your blog posts.

This should get you started on some basic markdown functionality in your Gatsby site. You can further customize the frontmatter and the component file to get desired effects!

## Additional Resources

- [Working with images in markdown & MDX](/docs/how-to/images-and-media/working-with-images-in-markdown/)
- [Markdown syntax](/docs/reference/markdown-syntax/)
