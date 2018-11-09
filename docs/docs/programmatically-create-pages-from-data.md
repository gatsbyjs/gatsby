---
title: Programmatically create pages from data
---

Gatsby and its ecosystem of plugins provide all kinds of data through a
GraphQL interface. This guide will show how that data can be used to
programmatically create pages.

### Prerequisites

Though you can use any data source you'd like, this guide will show how to
create pages from markdown files (following after the example introduced in
[earlier guides](https://www.gatsbyjs.org/docs/adding-markdown-pages/)).

### Creating Pages

The Gatsby Node API provides the
[`createPages`](https://www.gatsbyjs.org/docs/node-apis/#createPages)
extension point which we'll use to add pages. This function will give us
access to the
[`createPage`](https://www.gatsbyjs.org/docs/actions/#createPage) action
which is at the core of programmatically creating a page.

```javascript{17-25}:title=gatsby-node.js
exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;
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
            slug: node.fields.slug,
          },
        });
      });
      resolve();
    });
  });
};
```

For each page we want to create we must specify the `path` for visiting that
page, the `component` template used to render that page, and any `context`
we need in the component for rendering. The `context` parameter is
_optional_ though often times it will include a unique identifier that can
be used to query for associated data that will be rendered to the page.

### Specifying A Template

The `createPage` action required that we specify the `component` template
that will be used to render the page. Here is an example of what the
referenced template could look like:

```javascript:title=gatsby-node.js
import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout';

export default ({ data }) => {
  const post = data.markdownRemark;
  return (
    <Layout>
      <div>
        <h1>
          {post.frontmatter.title}
        </h1>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    </Layout>
  );
};

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
      }
    }
  }
`;
```

Notice that the `slug` value we specified in the `createPage` context is
used in the template's GraphQL query. As a result we can provide the `title`
and `html` from the matching `markdownRemark` record to our component. The
context is also available as the `pageContext` prop in the template
component itself.

### Not Just Markdown

The
[`gatsby-transformer-remark`](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/)
plugin is just one of a multitude of Gatsby plugins that can provide data
through the GraphQL interface. Any of that data can be used to
programmatically create pages.

### Other Resources

- [Example Repository](https://github.com/jbranchaud/gatsby-programmatic-pages)
- [Using Unstructured Data](https://www.gatsbyjs.org/docs/using-unstructured-data/)
