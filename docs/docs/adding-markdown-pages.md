---
title: Adding Markdown Pages
---

Gatsby can easily integrate with Markdown pages.
It provides plugins to read and understand folders with markdown files. 
Using Gatsby's node api, you can create a page at particular path links for each of the markdown files automatically.
Here's how you do it step by step.

Read files from the filesystem
Understand Markdown syntax.Convert metadata to api and content to html.
Create a page template from above data with styling.
Create static pages using Gatsby's node api at desired path pattern.

### Read files from the filesystem - `gatsby-source-filesystem`

Use `gatsby-source-filesystem`[https://www.gatsbyjs.org/packages/gatsby-source-filesystem/#gatsby-source-filesystem] to read files off of defined paths in your codebase.

`npm i --save gatsby-file-resource`

Now open up your `gatsby-config.js` to add this plugin as a dependency.

The plugin list accepts either a string which is the plugin name or an object with any options you may want to pass.
Here we add an object with the path as an option to the plugin

```
{
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/path/for/markdown/files`,
        name: 'markdownpages'
      }
}
```
The output of this plugin can be consumed by 'transformer' plugins.

### Understand markdown syntax. - `gatsby-transformer-remark`

Use `gatsby-transformer-remark`(https://www.gatsbyjs.org/packages/gatsby-transformer-remark/) to recognise files which are markdown and read it's content. It will convert the slug part of your markdown file as `frontmatter` and the content part as html.

`npm i --save gatsby-transformer-remark`

Add this to `gatsby-config.js`. Since there are no options needed,

```
 plugins: [`gatsby-transformer-remark`]
```

#### Note on creating markdown files.

As explained above, gatsby can convert the "slug" in your markdown files to an api. It will provide them in a json under `frontmatter`. A simple recommendation for this, and the rest of the guide is to add the following at the top of every markdown file.

```
---
path: "/blog/my-first-post"
date: "2017-11-07"
title: My first blog post"
---
```

###Create a page template for the markdown data.

Create a folder in the `/src` directory called `templates`.
Now create a `blogTemplate.js` with the following content.

```
import React from "react"

export default function Template({
  data, // this prop will be injected by the GraphQL query we'll write in a bit
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

The above is React component. You could style the component with any of the recommended styling systems.
You could further customise the `frontmatter` data by adding/changing the slug of your markdown files.

###Create static pages using Gatsby's node api.

Lets use the above template and Gatsby's node api to create static pages.

```
const path = require('path');

exports.createPages = ({ boundActionCreators, graphql }) => {
  const { createPage } = boundActionCreators;

  const blogPostTemplate = path.resolve(`src/templates/blog-post.js`);

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



