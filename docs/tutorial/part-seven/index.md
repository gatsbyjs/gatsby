---
title: Programmatically create pages from data
typora-copy-images-to: ./
---

## What's in this tutorial?

In the previous tutorial, we created a nice index page that queries Markdown
files and produces a list of blogpost titles and excerpts. But we don't want to just see excerpts, we want actual pages for our
Markdown files.

We could continue to create pages by placing React components in `src/pages`. However, we'll
now learn how to _programmatically_ create pages from _data_. Gatsby is _not_
limited to making pages from files like many static site generators. Gatsby lets
you use GraphQL to query your _data_ and _map_ the data to _pages_—all at build
time. This is a really powerful idea. We'll be exploring its implications and
ways to use it for the remainder of the tutorial.

Let's get started.

## Creating slugs for pages

Creating new pages has two steps:

1.  Generate the "path" or "slug" for the page.
2.  Create the page.

To create our Markdown pages, we'll learn to use two Gatsby APIs
[`onCreateNode`](/docs/node-apis/#onCreateNode) and
[`createPages`](/docs/node-apis/#createPages). These are two workhorse APIs
you'll see used in many sites and plugins.

We do our best to make Gatsby APIs simple to implement. To implement an API, you export a function
with the name of the API from `gatsby-node.js`.

So let's do that. In the root of your site, create a file named
`gatsby-node.js`. Then add to it the following. This function will be called by
Gatsby whenever a new node is created (or updated).

```javascript
exports.onCreateNode = ({ node }) => {
  console.log(node.internal.type);
};
```

Stop and restart the development server. As you do, you'll see quite a few newly
created nodes get logged to the terminal console.

Let's use this API to add the slugs for our Markdown pages to `MarkdownRemark`
nodes.

Change our function so it now is only looking at `MarkdownRemark` nodes.

```javascript{2-4}
exports.onCreateNode = ({ node }) => {
  if (node.internal.type === `MarkdownRemark`) {
    console.log(node.internal.type)
  }
};
```

We want to use each Markdown file name to create the page slug. So
`pandas-and-bananas.md"` will become `/pandas-and-bananas/`. But how do we get
the file name from the `MarkdownRemark` node? To get it, we need to _traverse_
the "node graph" to its _parent_ `File` node, as `File` nodes contain data we
need about files on disk. To do that, modify our function again:

```javascript{1,3-4}
exports.onCreateNode = ({ node, getNode }) => {
  if (node.internal.type === `MarkdownRemark`) {
    const fileNode = getNode(node.parent)
    console.log(`\n`, fileNode.relativePath)
  }
};
```

There in your terminal you should see the relative paths for our two Markdown
files.

![markdown-relative-path](markdown-relative-path.png)

Now let's create slugs. As the logic for creating slugs from file names can get
tricky, the `gatsby-source-filesystem` plugin ships with a function for creating
slugs. Let's use that.

```javascript{1,5}
const { createFilePath } = require(`gatsby-source-filesystem`);

exports.onCreateNode = ({ node, getNode }) => {
  if (node.internal.type === `MarkdownRemark`) {
    console.log(createFilePath({ node, getNode, basePath: `pages` }))
  }
};
```

The function handles finding the parent `File` node along with creating the
slug. Run the development server again and you should see logged to the terminal
two slugs, one for each Markdown file.

Now lets add our new slugs directly onto the `MarkdownRemark` nodes. This is
powerful, as any data we add to nodes is available to query later with GraphQL.
So it'll be easy to get the slug when it comes time to create the pages.

To do so, we'll use a function passed to our API implementation called
[`createNodeField`](/docs/bound-action-creators/#createNodeField). This function
allows us to create additional fields on nodes created by other plugins. Only
the original creator of a node can directly modify the node—all other plugins
(including our `gatsby-node.js`) must use this function to create additional
fields.

```javascript{3,4,6-11}
const { createFilePath } = require(`gatsby-source-filesystem`);

exports.onCreateNode = ({ node, getNode, boundActionCreators }) => {
  const { createNodeField } = boundActionCreators
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` })
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }
};
```

Restart the development server and open or refresh Graph_i_QL. Then run this
query to see our new slugs.

```graphql
{
  allMarkdownRemark {
    edges {
      node {
        fields {
          slug
        }
      }
    }
  }
}
```

Now that the slugs are created, we can create the pages.

## Creating pages

In the same `gatsby-node.js` file, add the following. Here we tell Gatsby about
our pages—what are their paths, what template component do they use, etc.

```javascript{15-34}
const { createFilePath } = require(`gatsby-source-filesystem`);

exports.onCreateNode = ({ node, getNode, boundActionCreators }) => {
  const { createNodeField } = boundActionCreators
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` })
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }
};

exports.createPages = ({ graphql, boundActionCreators }) => {
  return new Promise((resolve, reject) => {
    graphql(`
      {
        allMarkdownRemark {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
      }
    `).then(result => {
      console.log(JSON.stringify(result, null, 4))
      resolve()
    })
  })
};
```

We've added an implementation of the
[`createPages`](/docs/node-apis/#createPages) API which Gatsby calls to add
pages. We're using the passed in `graphql` function to query for the Markdown
slugs we just created. Then we're logging out the result of the query which
should look like:

![query-markdown-slugs](query-markdown-slugs.png)

We need one other thing to create pages: a page template component. Like
everything in Gatsby, programmatic pages are powered by React components. When
creating a page, we need to specify which component to use.

Create a directory at `src/templates` and then add the following in a file named
`src/templates/blog-post.js`.

```jsx
import React from "react";

export default () => {
  return <div>Hello blog post</div>;
};
```

Then update `gatsby-node.js`

```javascript{1,17,32-41}
const path = require(`path`);
const { createFilePath } = require(`gatsby-source-filesystem`);

exports.onCreateNode = ({ node, getNode, boundActionCreators }) => {
  const { createNodeField } = boundActionCreators
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` })
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }
};

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators
  return new Promise((resolve, reject) => {
    graphql(`
      {
        allMarkdownRemark {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
      }
    `).then(result => {
      result.data.allMarkdownRemark.edges.forEach(({ node }) => {
        createPage({
          path: node.fields.slug,
          component: path.resolve(`./src/templates/blog-post.js`),
          context: {
            // Data passed to context is available in page queries as GraphQL variables.
            slug: node.fields.slug,
          },
        })
      })
      resolve()
    })
  })
};
```

Restart the development server and our pages will be created! An easy way to
find new pages you create while developing is to go to a random path where
Gatsby will helpfully show you a list of pages on the site. If you go to
<http://localhost:8000/sdf> you'll see the new pages we created.

![new-pages](new-pages.png)

Visit one of them and we see:

![hello-world-blog-post](hello-world-blog-post.png)

Which is a bit boring. Let's pull in data from our Markdown post. Change
`src/templates/blog-post.js` to:

```jsx
import React from "react";

export default ({ data }) => {
  const post = data.markdownRemark;
  return (
    <div>
      <h1>{post.frontmatter.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </div>
  );
};

export const query = graphql`
  query BlogPostQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
      }
    }
  }
`;
```

And…

![blog-post](blog-post.png)

Sweet!

The last step is to link to our new pages from the index page.

Return to `src/pages/index.js` and let's query for our Markdown slugs and create
links.

```jsx{3,18-19,29,47-49}
import React from "react";
import g from "glamorous";
import Link from "gatsby-link";

import { rhythm } from "../utils/typography";

export default ({ data }) => {
  return (
    <div>
      <g.H1 display={"inline-block"} borderBottom={"1px solid"}>
        Amazing Pandas Eating Things
      </g.H1>
      <h4>
        {data.allMarkdownRemark.totalCount} Posts
      </h4>
      {data.allMarkdownRemark.edges.map(({ node }) =>
        <div key={node.id}>
          <Link
            to={node.fields.slug}
            css={{ textDecoration: `none`, color: `inherit` }}
          >
            <g.H3 marginBottom={rhythm(1 / 4)}>
              {node.frontmatter.title}{" "}
              <g.Span color="#BBB">— {node.frontmatter.date}</g.Span>
            </g.H3>
            <p>
              {node.excerpt}
            </p>
          </Link>
        </div>
      )}
    </div>
  )
}

export const query = graphql`
  query IndexQuery {
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "DD MMMM, YYYY")
          }
          fields {
            slug
          }
          excerpt
        }
      }
    }
  }
`
```

And there we go! A working, albeit small, blog!

Try playing more with the site. Try adding some more Markdown files. Explore
querying other data from the `MarkdownRemark` nodes and adding them to the
frontpage or blog posts pages.

In this part of the tutorial, we've learned the foundations of building with
Gatsby's data layer. You've learned how to _source_ and _transform_ data using
plugins. How to use GraphQL to _map_ data to pages. Then how to build _page
template components_ where you query for data for each page.

## Challenge

The next step is to try the instructions above on your own with a new set of pages.

## What's coming next?

Now that you've built a Gatsby site, where do you go next?

* Share your Gatsby site on Twitter and see what other people have created by searching for #gatsbytutorial! Make sure to mention @gatsbyjs in your Tweet, and include the hashtag #gatsbytutorial :)
* You could take a look at some [example sites](https://github.com/gatsbyjs/gatsby/tree/master/examples#gatsby-example-websites)
* Explore more [plugins](/docs/plugins/)
* See what [other people are building with Gatsby](https://github.com/gatsbyjs/gatsby/#showcase)
* Check out the documentation on [Gatsby's APIs](/docs/api-specification/), [nodes](/docs/node-interface/) or [GraphQL](/docs/graphql-reference/)
