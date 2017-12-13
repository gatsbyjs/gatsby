---
title: Adding Tags and Categories to Blog Posts
---

Adding tags on your blog post is a simple way to organize related content together. 

To add tags to your blog posts, you will first want to have your site set up to  turn your markdown pages into blog posts. To get your blog pages set up, see the [tutorial on Gatsby's data layer](tutorial/part-four/) and [Adding Markdown Pages](docs/adding-markdown-pages/). 

## Adding `fields` to your blog post

Add `fields` by defining them in the `frontmatter` of your Markdown file. The `frontmatter` is the area at the top surrounded by dashes that includes post data like the title and date. 
```
---
title: "A Trip To the Zoo"

---

I went to the zoo today. It was terrible.
```

Fields can be strings, numbers, or arrays. Since a post can usually have many tags, it makes sense to define it as an array. Here there are two new `fields`: category and tags. 

```
---
title: "A Trip To the Zoo"
category: ["travel"]
tags: ["animals", "Chicago", "zoos"]
---

I went to the zoo today. It was terrible.
```
If `gatsby develop` is running, restart it so Gatsby can pick up the new fields.

## Querying your fields
Now these fields are available in the data layer. To use field data, query it using `graphql`. All fields are available to query inside `frontmatter`

```jsx
export const query = graphql`
  query IndexQuery {
    allMarkdownRemark {
      totalCount
      edges {
        node {
          id
          frontmatter {
            tags
            category
          } 
        }
      }
    }
  }
`
```
The query exposes the field data to the component. This example creates a blog front page that lists all posts and their tags.

```jsx
const IndexPage = ({ data }) => (
  <div>
    <h1>My Travel Blog</h1>
      {data.allMarkdownRemark.edges.map(({ node }) =>
        <div key={node.id}>
          <h3>
            {node.frontmatter.title}
            <span>— {node.frontmatter.tags}</span>
          </h3>
        </div>
      )}
  </div>
)
```

## Creating Tag Pages
Tag pages list all the tags or all items with a certain tag and are a great tool for organizing content. 

First you will need a tag page template. In this example a tags template in `src/templates/tags.js` creates tags page at /tags and individual tag pages.

```jsx
import React from 'react';
import GatsbyLink from 'gatsby-link';

export default function Tags({ pathContext }) {
  const { posts, post, tag } = pathContext;
  if (tag) {
    return (
      <div>
        <h1>
          {post.length} post{post.length === 1 ? '' : 's'} tagged with {tag}
        </h1>
        <ul>
          {post.map(({ id, frontmatter, excerpt, fields }) => {
            return (
              <li key={id}>
                <h1> 
                  <GatsbyLink to={fields.slug}>
                    {frontmatter.title}
                  </GatsbyLink>
                </h1>
                <p>
                  {excerpt}
                </p>
              </li>
            );
          })}
        </ul>
        <GatsbyLink to="/tags">
          All tags
        </GatsbyLink>
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
              <GatsbyLink to={`/tags/${tagName}`}>
                {tagName}
              </GatsbyLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

But we also need to tell Gatsby to create the tag pages themselves.  In `gatsby-node.js`  call the the [`createPages`](/docs/node-apis/#createPages) API to make a page for every tag. First create a function called `createTagPages`:  

```javascript
const path = require('path');

const createTagPages = (createPage, edges) => {
  // tell it to use our tags template
  const tagTemplate = path.resolve(`src/templates/tags.js`);
  // create an empty object to store the posts
  const posts = {};
  console.log("creating posts");

  // run through all nodes (our markdown posts) and add the tags to our post object

  edges
    .forEach(({ node }) => {
      if (node.frontmatter.tags) {
        node.frontmatter.tags
          .forEach(tag => {
            if (!posts[tag]) {
              posts[tag] = [];
            }
            posts[tag].push(node);
          });
      }
    });

  // create the tags page with the list of tags from our posts object
  createPage({
    path: '/tags',
    component: tagTemplate,
    context: {
      posts
    }
  });

  // for each of the tags in the post object, create a tag page

  Object.keys(posts)
    .forEach(tagName => {
      const post = posts[tagName];
      createPage({
        path: `/tags/${tagName}`,
        component: tagTemplate,
        context: {
          posts,
          post,
          tag: tagName
        }
      })
    });
}
```

Then in `createPages` query using `graphql` for your fields and use that to call the new `createTagPages` function.
```javascript
exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators
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
        })
      })
      resolve()
    })
  })
}
```
This only creates tags pages, but the same method can be used for categories as well.

## Adding Tags To Your Blog Front Page
The blog front page in the example, but it doesn't link to the tag pages. One way to to do this is by creating a tag component at `src/components/tags.js`


```jsx
import React from 'react';
import Link from 'gatsby-link';

export default function Tags({ list = [] }) {
  return (
    <ul className="tag-list">
      {list.map(tag =>
        <li key={tag}>
          <Link to={`/tags/${tag}`}>
            {tag}
          </Link>
        </li>
      )}
    </ul>
  );
}
```

We can now use this new component on the blog home page by passing in our tags from the data layer: 
```jsx
const IndexPage = ({ data }) => (
  <div>
    <h1>My Travel Blog</h1>
      {data.allMarkdownRemark.edges.map(({ node }) =>
        <div key={node.id}>
          <h3>
            {node.frontmatter.title}
          </h3>
          <Tags list={node.frontmatter.tags || []} />
        </div>
      )}
  </div>
)
```
