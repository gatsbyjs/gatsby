---
title: Adding Markdown Pages
---

Gatsby can easily convert Markdown pages to static pages in your site.
It provides plugins to read and understand folders with Markdown files and 
Node API, which help you create static pages automatically.
Here's how you do it step by step.

1. Read files in Gatsby from the filesystem.
2. Understand Markdown syntax. Convert metadata to API and content to HTML.
3. Create a page template for above Markdown data and style it.
4. Create static pages using Gatsby's Node API at paths you like.

### Read files in Gatsby from the filesystem - `gatsby-source-filesystem`

Use the plugin [`gatsby-source-filesystem`](https://www.gatsbyjs.org/packages/gatsby-source-filesystem/#gatsby-source-filesystem) to read files off of defined file paths.

`npm i --save gatsby-source-filesystem`

Now open up your `gatsby-config.js` to add this plugin to the plugin list.

The plugin list accepts either a string which is the plugin name or an object with any options you may want to pass.
Here we add an object with the path as an option to the plugin:

```
plugins: [
    `...`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
            path: `${__dirname}/path/for/markdown/files`,
            name: 'markdownpages'
        }
    }
]
```
The output of this plugin can be consumed by 'transformer' plugins in Gatsby.

### Understand Markdown syntax. - `gatsby-transformer-remark`

Use the plugin [`gatsby-transformer-remark`](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/) to recognise files which are Markdown and read it's content. It will convert the frontmatter metadata part of your Markdown file as `frontmatter` and the content part as HTML.

`npm i --save gatsby-transformer-remark`

Add this to `gatsby-config.js`. Since there are no options needed,

```
 plugins: [`gatsby-transformer-remark`]
```

#### Note on creating Markdown files.

When you create a Markdown file, at the opt of the file, add the block below. You can have different key value pairs that are relevant to your website. This block will be parsed by `gatsby-transformer-remark` as `frontmatter`. The GraphQL API will provide this data in our React components.

```
---
path: "/blog/my-first-post"
date: "2017-11-07"
title: My first blog post"
---
```

### Create a page template for the Markdown data.

Create a folder in the `/src` directory of your Gatsby application called `templates`.
Now create a `blogTemplate.js` inside it with the following content.

```
import React from "react"

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { markdownRemark } = data // data.markdownRemark holds our post data
  const {frontMatter, html} = markdownRemark;
  return (
    <div className="blog-post-container">
      <div className="blog-post">
        <h1>{frontmatter.title}</h1>
        <h2>{frontmatter.date}</h2>
        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}

export const pageQuery = graphql`
  query BlogPostByPath($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        path
        title
      }
    }
  }
`
```

Two things are important in the file above.
1. A GraphQL query is made in the second half of the file to get the Markdown data. Gatsby has automagically given you all the Markdown metadata and HTML in this query's result.
    **Note: To learn more about GraphQL, consider this [excellent resource](https://www.howtographql.com/)**
2. The result of the query is injected by Gatsby into the `Template` component as `data`. `marksownRemark` is the property that we find has all the details of the Markdown file. We can use that to construct a template for our blogpost view. Since it's a React component, you could style it with any of the recommended styling systems in Gatsby.

### Create static pages using Gatsby's Node API.

Gatsby exposes a powerful Node API, which allows for functionality such as creating dynamic pages. This API is exposed in the `gatsby-node.js` file in the root directory of your project, at the same level as `gatsby-config.js`. Each export found in this file will be parsed by Gatsby, as detailed in its [Node API specification](https://www.gatsbyjs.org/docs/node-apis/). However, we only care about one particular API in this instance, `createPages`.

Gatsby calls the `createPages` API (if present) at build time with injected parameters, `boundActionCreators` and `graphql`. Use the `graphql` to query Markdown file data as below. Next use `createPage` action creator to create a page for each of the Markdown files using the `blogTemplate.js` we created in the previous step.

```
const path = require('path');

exports.createPages = ({ boundActionCreators, graphql }) => {
  const { createPage } = boundActionCreators;

  const blogPostTemplate = path.resolve(`src/templates/blogTemplate.js`);

  return graphql(`{
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: 1000
    ) {
      edges {
        node {
          excerpt(pruneLength: 250)
          html
          id
          frontmatter {
            date
            path
            title
          }
        }
      }
    }
  }`)
    .then(result => {
      if (result.errors) {
        return Promise.reject(result.errors);
      }

      result.data.allMarkdownRemark.edges
        .forEach(({ node }) => {
          createPage({
            path: node.frontmatter.path,
            component: blogPostTemplate,
            context: {} // additional data can be passed via context
          });
        });
    });
}
```

This should get you started on some basic Markdown power in your Gatsby site. You can further customise the `frontmatter` and the template file to get desired effects!



