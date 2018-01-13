---
title: Adding Markdown Pages
---

Gatsby can use markdown files to create pages in your site.
You add plugins to read and understand folders with markdown files and from them create pages automatically.

Here's the steps Gatsby follows for making this happen.

1. Read files into Gatsby from the filesystem
2. Transform markdown to HTML and frontmatter to data
3. Create a page component for the markdown files
4. Programmatically create pages using Gatsby's node.js `createPage` API

### Read files into Gatsby from the filesystem - `gatsby-source-filesystem`

Use the plugin [`gatsby-source-filesystem`](/packages/gatsby-source-filesystem/#gatsby-source-filesystem) to read files.

#### Install

`npm i --save gatsby-source-filesystem`

Now open `gatsby-config.js` to add this plugin to the plugin array.

To add a plugin, add either a string (the plugin name) or to pass options, an object.
For `gatsby-source-filesystem` we pass an object so we can set the file system path:

```javascript
plugins: [
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      path: `${__dirname}/path/to/markdown/files`,
      name: "markdown-pages",
    },
  },
];
```

Now that we've "sourced" the markdown files from the filesystem, we can now "transform" the markdown to HTML and the YAML frontmatter to JSON.

### Transforming markdown — `gatsby-transformer-remark`

We'll use the plugin [`gatsby-transformer-remark`](/packages/gatsby-transformer-remark/) to recognise files which are markdown and read its content. It will convert the frontmatter metadata part of your markdown file as `frontmatter` and the content part as HTML.

`npm i --save gatsby-transformer-remark`

Add this to `gatsby-config.js` after the previously added `gatsby-source-filesystem`.

```javascript
plugins: [
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      path: `${__dirname}/path/to/markdown/files`,
      name: "markdown-pages",
    },
  },
  `gatsby-transformer-remark`,
];
```

#### Note on creating markdown files.

When you create a Markdown file, at the top of the file, add the block below. You can have different key value pairs that are relevant to your website. This block will be parsed by `gatsby-transformer-remark` as `frontmatter`. The GraphQL API will provide this data in our React components.

```
---
path: "/blog/my-first-post"
date: "2017-11-07"
title: "My first blog post"
---
```

### Create a page template for the markdown data.

Create a folder in the `/src` directory of your Gatsby application called `templates`.
Now create a `blogTemplate.js` inside it with the following content.

```jsx
import React from "react";

export default function Template({
  pathContext: { // this prop will be injected by the GraphQL query in the next section
    excerpt,
    id,
    html,
    frontmatter: { date, path, title },
  },
}) {
  return (
    <div className="blog-post-container">
      <div className="blog-post">
        <h1>{title}</h1>
        <h2>{date}</h2>
        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
```

Something to note in the file above:
The data received by the component comes directly from the query we will see in the section below. We can use it to construct a template for our blogpost view. Since it's a React component, you could style it with any of the recommended styling systems in Gatsby.

### Create static pages using Gatsby's Node API.

Gatsby exposes a powerful Node.js API, which allows for functionality such as creating dynamic pages. This API is available in the `gatsby-node.js` file in the root directory of your project, at the same level as `gatsby-config.js`. Each export found in this file will be run by Gatsby, as detailed in its [Node API specification](/docs/node-apis/). However, we only care about one particular API in this instance, `createPages`.

Gatsby calls the `createPages` API (if present) at build time with injected parameters, `boundActionCreators` and `graphql`. Use the `graphql` to query Markdown file data as below. Next use `createPage` action creator to create a page for each of the Markdown files using the `blogTemplate.js` we created in the previous step.

```javascript
const path = require("path");

exports.createPages = ({ boundActionCreators, graphql }) => {
  const { createPage } = boundActionCreators;

  const blogPostTemplate = path.resolve(`src/templates/blogTemplate.js`);

  return graphql(`
    {
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
              date(formatString: "MMMM DD, YYYY")
              path
              title
            }
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors);
    }

    result.data.allMarkdownRemark.edges.forEach(({ node: { excerpt, html, id, frontmatter } }) => {
      createPage({
        path: frontmatter.path,
        component: blogPostTemplate,
        context: {
          excerpt,
          html,
          id,
          frontmatter,
        },
      });
    });
  });
};
```

This should get you started on some basic markdown power in your Gatsby site. You can further customise the `frontmatter` and the template file to get desired effects!

## Other tutorials

Check out tutorials listed on the [Awesome Gatsby](/docs/awesome-gatsby/#gatsby-tutorials) page for more looks at building Gatsby sites with markdown.

## Gatsby markdown starters

There are a number of [Gatsby starters](/docs/gatsby-starters/) that come preconfigured to work with markdown.
