---
title: Creating tags pages for blog posts
---

Creating tag pages for your blog post is a way to let visitors browse related content.

To add tags to your blog posts, you will first want to have your site set up to turn your markdown pages into blog posts. To get your blog pages set up, see the [tutorial on Gatsby's data layer](/tutorial/part-four/) and [Adding Markdown Pages](/docs/adding-markdown-pages/).

The process will essentially look like this:

1. Add tags to your `markdown` files
2. Write a query to get all tags for your posts
3. Make a tags page template (for `/tags/{tag}`)
4. Modify `gatsby-node.js` to render pages using that template
5. Make a tags index page (`/tags`) that renders a list of all tags
6. _(optional)_ Render tags inline with your blog posts

## Add tags to your `markdown` files

You add tags by defining them in the `frontmatter` of your Markdown file. The `frontmatter` is the area at the top surrounded by dashes that includes post data like the title and date.

```md
---
title: "A Trip To the Zoo"
---

I went to the zoo today. It was terrible.
```

Fields can be strings, numbers, or arrays. Since a post can usually have many tags, it makes sense to define it as an array. Here we add our new tags field:

```md
---
title: "A Trip To the Zoo"
tags: ["animals", "Chicago", "zoos"]
---

I went to the zoo today. It was terrible.
```

If `gatsby develop` is running, restart it so Gatsby can pick up the new fields.

## Write a query to get all tags for your posts

Now these fields are available in the data layer. To use field data, query it using `graphql`. All fields are available to query inside `frontmatter`

Try running in Graph<em>i</em>QL (`localhost:8000/___graphql`) the following query

```graphql
{
  allMarkdownRemark(
    sort: { order: DESC, fields: [frontmatter___date] }
    limit: 1000
  ) {
    edges {
      node {
        frontmatter {
          path
          tags
        }
      }
    }
  }
}
```

The resulting data includes the `path` and `tags` frontmatter for each post, which is all the data we'll need to create pages for each tag which contain a list of posts under that tag. Let's make the tag page template now:

## Make a tags page template (for `/tags/{tag}`)

If you followed the tutorial for [Adding Markdown Pages](/docs/adding-tags-and-categories-to-blog-posts/), then this process should sound familiar: we'll make a tag page template, then use it in `createPages` in `gatsby-node.js` to generate individual pages for the tags in our posts.

First, we'll add a tags template at `src/templates/tags.js`:

```jsx
import React from 'react';
import PropTypes from 'prop-types';

// Components
import Link from 'gatsby-link';

const Tags = ({ pathContext, data }) => {
  const { tag } = pathContext;
  const { edges, totalCount } = data.allMarkdownRemark;
  const tagHeader = `${totalCount} post${totalCount === 1 ? '' : 's'} tagged with "${tag}"`;

  return (
    <div>
      <h1>{tagHeader}</h1>
      <ul>
        {edges.map(({ node }) => {
          const { path, title } = node.frontmatter;
          return (
            <li key={path}>
              <Link to={path}>{title}</Link>
            </li>
          );
        })}
      </ul>
      {/*
        This links to a page that does not yet exist.
        We'll come back to it!
      */}
      <Link to="/tags">All tags</Link>
    </div>
  );
==== BASE ====
}
```

Now we'll instruct Gatsby to create the tag pages. In the site's `gatsby-node.js` file we'll call the the [`createPages`](/docs/node-apis/#createPages) API to make a page for every tag.

First create a function called `createTagPages`:

```javascript
const path = require("path");

const createTagPages = (createPage, edges) => {
  // Tell it to use our tags template.
  const tagTemplate = path.resolve(`src/templates/tags.js`);
  // Create an empty object to store the posts.
  const posts = {};
  console.log("creating posts");
==== BASE ====

==== BASE ====
  // Loop through all nodes (our markdown posts) and add the tags to our post object.
==== BASE ====

==== BASE ====
  edges.forEach(({ node }) => {
    if (node.frontmatter.tags) {
      node.frontmatter.tags.forEach(tag => {
        if (!posts[tag]) {
          posts[tag] = [];
==== BASE ====
        }
==== BASE ====
        posts[tag].push(node);
      });
==== BASE ====
    }
==== BASE ====
  });
==== BASE ====

==== BASE ====
  // Create the tags page with the list of tags from our posts object.
  createPage({
    path: "/tags",
    component: tagTemplate,
    context: {
      posts,
    },
  });
==== BASE ====

==== BASE ====
  // For each of the tags in the post object, create a tag page.

  Object.keys(posts).forEach(tagName => {
    const post = posts[tagName];
    createPage({
      path: `/tags/${tagName}`,
      component: tagTemplate,
      context: {
        posts,
        post,
        tag: tagName,
      },
    });
  });
};
```

```js
const path = require("path");

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  const blogPostTemplate = path.resolve('src/templates/blog.js');
  const tagTemplate = path.resolve('src/templates/tags.js');

  return graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 2000
      ) {
        edges {
          node {
            frontmatter {
              path
              tags
            }
          }
        }
==== BASE ====
      }
==== BASE ====
    `).then(result => {
      console.log(result);
      const posts = result.data.allMarkdownRemark.edges;

      // call createTagPages with the result of posts
      createTagPages(createPage, posts);

      // this is the original code used to create the pages from markdown posts
      result.data.allMarkdownRemark.edges.map(({ node }) => {
        createPage({
          path: node.fields.slug,
          component: path.resolve(`./src/templates/blog-post.js`),
          context: {
            slug: node.fields.slug,
          },
        });
==== BASE ====
      });
    });
  });
};
```
Some notes:

* Our graphql query only looks for data we need to generate these pages. Anything else can be queried again later (and, if you notice, we do this above in the tags template for the post title).
* While making the tag pages, note that we pass `tag` through in the `context`. This is the value that gets used in the `TagPage` query to limit our search to only posts tagged with the tag in the URL.

## Make a tags index page (`/tags`) that renders a list of all tags

Our `/tags` page will simply list out all tags, followed by the number of posts with that tag:

```jsx
import React from 'react';
import PropTypes from 'prop-types';

// Utilities
import kebabCase from 'lodash/kebabcase';

// Components
import Helmet from 'react-helmet';
import Link from 'gatsby-link';

const TagsPage = ({ data: { allMarkdownRemark: { group }, site: { siteMetadata: { title }} } }) =>
  <div>
    <Helmet title={title} />
    <div>
      <h1>Tags</h1>
      <ul>
        {group.map(tag => (
          <li key={tag.fieldValue}>
            <Link to={`/tags/${kebabCase(tag.fieldValue)}/`}>
              {tag.fieldValue} ({tag.totalCount})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
;

TagsPage.propTypes = {
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.shape({
      group: PropTypes.arrayOf(
        PropTypes.shape({
          fieldValue: PropTypes.string.isRequired,
          totalCount: PropTypes.number.isRequired,
        }).isRequired,
      ),
    }),
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        title: PropTypes.string.isRequired,
      }),
    }),
  }),
};

export default TagsPage;

export const pageQuery = graphql`
  query TagsQuery {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      limit: 2000
      filter: { frontmatter: { published: { ne: false } } }
    ) {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
  }
`;
```

## _(optional)_ Render tags inline with your blog posts

The home stretch! Anywhere else you'd like to render your tags, simply add them to the `frontmatter` section of your `graphql` query and access them in your component like any other prop.
