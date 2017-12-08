---
title: Adding Tags and Categories to Blog Posts
---

Adding tags on your blog post is a simple way to organize related content together. 

To add tags to your blog posts, you will first want to have your site set up to automatically turn your markdown pages into blog posts. To get your blog pages set up, see the [tutorial on Gatsby's data layer](tutorial/part-four/) and [Adding Markdown Pages](docs/adding-markdown-pages/). 

## Adding `fields` to your blog post

You add `fields` by putting them in the `frontmatter` of your Markdown files, which is the section at the top surrounded by dashes. You may already have a field like title. 
```
---
title: "A Trip To the Zoo"

---

I went to the zoo today. It was terrible.
```

But instead of just having a string, you want your new `fields` to be arrays with comma seperated strings inside them. Here I've added two new `fields`: category and tags. 

```
---
title: "A Trip To the Zoo"
category: ["travel"]
tags: ["animals", "Chicago", "zoos"]
---

I went to the zoo today. It was terrible.
```
## Querying your fields
Once your fields exist you can query them in `graphql` where they will be accessible inside frontmatter


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
Using this query you start utilizing your fields in your component. This lists all posts and their tags
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
It is nice to have the tags listed next to posts, but it's even more useful to have a tag go to a tag post where all the other posts with that tag are listed. 

First you will need a tag page template, this one is tags.js and is placed in `src/templates/tags.js`. It creates a page at tags that lists all tags as well as individual pages for each tag
```jsx{4}
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
      <Link to="/">
        All posts
      </Link>
    </div>
  );
}
```

But we also need to tell Gatsby to create the tag pages themselves, this just provides the template. To do that we head to `gatsby-node.js` to implement the the [`createPages`](/docs/node-apis/#createPages) API.
```javascript
const path = require('path');
const { createFilePath } = require(`gatsby-source-filesystem`)


const createTagPages = (createPage, edges) => {
  const tagTemplate = path.resolve(`src/templates/tags.js`);
  const posts = {};
  console.log("creating posts");

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

  createPage({
    path: '/tags',
    component: tagTemplate,
    context: {
      posts
    }
  });

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
