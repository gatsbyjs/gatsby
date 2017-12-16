---
title: Creating tags pages for blog posts
---

Creating tag pages for your blog post is a simple way to let vistors browse releated content.

To add tags to your blog posts, you will first want to have your site set up to turn your markdown pages into blog posts. To get your blog pages set up, see the [tutorial on Gatsby's data layer](tutorial/part-four/) and [Adding Markdown Pages](docs/adding-markdown-pages/).

## Add a tags field to your blog posts

You add tags by defining them in the `frontmatter` of your Markdown file. The `frontmatter` is the area at the top surrounded by dashes that includes post data like the title and date.

```
---
title: "A Trip To the Zoo"

---

I went to the zoo today. It was terrible.
```

Fields can be strings, numbers, or arrays. Since a post can usually have many tags, it makes sense to define it as an array. Here we add our new tags field:

```
---
title: "A Trip To the Zoo"
tags: ["animals", "Chicago", "zoos"]
---

I went to the zoo today. It was terrible.
```

If `gatsby develop` is running, restart it so Gatsby can pick up the new fields.

## Query your fields

Now these fields are available in the data layer. To use field data, query it using `graphql`. All fields are available to query inside `frontmatter`

Try running in Graph_i_QL the following query

```graphql
query IndexQuery {
  allMarkdownRemark {
    totalCount
    edges {
      node {
        frontmatter {
          title
          tags
        }
      }
    }
  }
}
```

The query fetches the title and tags for every blog post.

Using this query, we can create an component for a blog front page that lists all posts and their tags.

```jsx
const IndexPage = ({ data }) => (
  <div>
    <h1>My Travel Blog</h1>
    {data.allMarkdownRemark.edges.map(({ node }) => (
      <div key={node.id}>
        <h3>
          {node.frontmatter.title}
          <span>— {node.frontmatter.tags.join(`, `)}</span>
        </h3>
      </div>
    ))}
  </div>
);

export const query = graphql`
  query IndexQuery {
    allMarkdownRemark {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            tags
          }
        }
      }
    }
  }
`;
```

## Create tag pages

Tag pages list all the tags or all items with a certain tag and are a great tool for organizing content and making your site easy to browse.

First you will need a tag page component. In this example, we add a tags component in `src/templates/tags.js` which we'll use to create an index tags page at `/tags` and individual tag pages.

```jsx
import React from "react";
import GatsbyLink from "gatsby-link";

export default function Tags({ pathContext }) {
  const { posts, post, tag } = pathContext;
  if (tag) {
    return (
      <div>
        <h1>
          {post.length} post{post.length === 1 ? "" : "s"} tagged with {tag}
        </h1>
        <ul>
          {post.map(({ id, frontmatter, excerpt, fields }) => {
            return (
              <li key={id}>
                <h1>
                  <GatsbyLink to={fields.slug}>{frontmatter.title}</GatsbyLink>
                </h1>
                <p>{excerpt}</p>
              </li>
            );
          })}
        </ul>
        <GatsbyLink to="/tags">All tags</GatsbyLink>
      </div>
    );
  }
  return (
    <div>
      <h1>Tags</h1>
      <ul className="tags">
        {Object.keys(posts).map(tagName => {
          const tags = posts[tagName];
          return (
            <li key={tagName}>
              <GatsbyLink to={`/tags/${tagName}`}>{tagName}</GatsbyLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
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

  // Loop through all nodes (our markdown posts) and add the tags to our post object.

  edges.forEach(({ node }) => {
    if (node.frontmatter.tags) {
      node.frontmatter.tags.forEach(tag => {
        if (!posts[tag]) {
          posts[tag] = [];
        }
        posts[tag].push(node);
      });
    }
  });

  // Create the tags page with the list of tags from our posts object.
  createPage({
    path: "/tags",
    component: tagTemplate,
    context: {
      posts,
    },
  });

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

Then in the `createPages` API function, query using `graphql` for your fields and use that to call the new `createTagPages` function.

```javascript
exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators;
  // add the tags to the query
  return new Promise((resolve, reject) => {
    graphql(`
      {
        allMarkdownRemark {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                tags
                title
              }
            }
          }
        }
      }
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
      });
      resolve();
    });
  });
};
```

## Adding Tags To Your Blog Front Page

The blog front page we created previously doesn't link to the tag pages. One way to add this is by creating a tag component at `src/components/tags.js`

```jsx
import React from "react";
import Link from "gatsby-link";

export default function Tags({ list = [] }) {
  return (
    <ul className="tag-list">
      {list.map(tag => (
        <li key={tag}>
          <Link to={`/tags/${tag}`}>{tag}</Link>
        </li>
      ))}
    </ul>
  );
}
```

We can now use this new component on the blog home page by passing in our tags from the data layer:

```jsx
import React from "react";
import Tags from "../components/tags";

const IndexPage = ({ data }) => (
  <div>
    <h1>My Travel Blog</h1>
    {data.allMarkdownRemark.edges.map(({ node }) => (
      <div key={node.id}>
        <h3>{node.frontmatter.title}</h3>
        <Tags list={node.frontmatter.tags || []} />
      </div>
    ))}
  </div>
);
```
