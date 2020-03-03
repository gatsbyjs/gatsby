---
title: Porting a Jekyll Site to Gatsby
---

# Jekyll

[Jekyll](https://jekyllrb.com/) is a static site generator for your websites. Think of it like a file-based CMS. It takes your content, renders Markdown, Liquid templates, and spits out a complete, static website ready to be served by [Apache](https://www.apache.org/), [Nginx](https://www.nginx.com/) or another web server. In Jekyll if you write a markdown file in the root folder under `_site` thay will considered `pages`, meanwhile if you write `.md` files in `_posts` folder they will considered `posts` that's how jekyll works.

## What changes need to be made?

In order to transition your codebase over to using Gatsby, a few things need to be taken care of to account for the differences between how the projects are set up. First of all Gatsby want to know where to read `markdown` files by using the plugin [`gatsby-source-filesystem`](https://www.gatsbyjs.org/packages/gatsby-source-filesystem/) `( source plugin for sourcing data into your Gatsby application)` but how does it understand markdown format for this we need to use the plugin [`gatsby-transformer-remark`](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/) to transform markdown files into something like gatsby can understand. This plugin is the responsible to read `markdown` files a extract information like the `frontmatter`, the excerpt and convert the `text` into `HTML` ready to be rendered.

<!-- The plugin gatsby-transformer-remark is really usefull and also has many plugins to use within it.   -->

## Development environment

Gatsby generates websites and web applications for production through a compilation and build process, and it also has tools optimized for local development. To set up the Gatsby [CLI](/docs/glossary#cli) and development environment (if you haven't already) check out [Part Zero of the Gatsby tutorial](/tutorial/part-zero/).

## Transition to Gatsby

Gatsby can help you set up an application and removes much of the configuration headache. However, Gatsby offers some additional advantages like performance optimizations with static rendering and a thriving ecosystem of plugins, To get things set up and running we need to structure our jekyll-site files like this.

```
jekyll-site
  ├── _includes
  │    ├── footer.html
  │    └── header.html
  ├── _layouts
  │    ├── default.html
  │    └── post.html
  ├── _posts
  │    ├── 2007-10-29-why-every-programmer-should-play-nethack.md
  │    └── 2009-04-26-barcamp-boston-4-roundup.md
  ├── _sass
  ├── _drafts
  │    ├── begin-with-the-crazy-ideas.md
  │    └── on-simplicity-in-technology.md
  ├── _site
  │    ├── about.md
  │    └── blah-blah.md
  ├── script
  ├── .jekyll-metadata
  ├── _config.yml
  └── index.md
```

### Migrating the markdown / Liquid templates pages

Create a new folder in Gatsby project under the `src/pages-markdown` for those pages written in markdown format. I left the `src/pages` as default so in future we need it for some javaScript files. Now its time to transfer all markdown files to `src/pages-markdown` like this.

```
  src
  └── pages-markdown
      ├── footer.md
      └── header.md
```

In addition, these pages must be have next properties within the `frontmatter` section:

```md
---
layout: page
title: About
date: 2010-11-23 14:48
path: /about
---
```

Now its time to make Gatsby engine take account into these files to inform where to read them:

```json
// gatsby-config.js
{
  "resolve": `gatsby-source-filesystem`,
  "options": {
    "name": `markdown-pages`,
    "path": `${__dirname}/src/pages-markdown/`
  }
}
```

For each file found at `src/pages-markdown` Gatsby will create a `node`. We can extend the `createPages` method and make Gatsby create a new page for each `node`. The steps can be summarized as:
In addition, these pages must be have next properties within the `frontmatter` section:

- Query for all the markdown nodes read by gatsby
- Filter those nodes with `layout=page`
- Create a new page invoking `action.createPage` method and using the template file src/templated/page.js

```js
// gatsby-node.js
exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  const pageTemplate = path.resolve(`src/templates/page.js`)

  return graphql(
    `
      {
        allMarkdownRemark {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                path
                layout
              }
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors)
    }

    const markdownItems = result.data.allMarkdownRemark.edges

    // Create pages and blog post pages
    markdownItems.forEach(({ node }) => {
      if (node.frontmatter.layout === "page") {
        createPage({
          path: node.frontmatter.path,
          component: pageTemplate,
        })
      }
    })
  })
}
```

### Migrating blog posts

Now its time to transfer all the blog posts in to `src/content` folder.

```
  src
  └── content
      ├── 2007-10-29-why-every-programmer-should-play-nethack.md
      └── 2009-04-26-barcamp-boston-4-roundup.md
```

We need to tell gatsby where to find blog posts.

```js
// gatsby-config.js
{
  resolve: 'gatsby-source-filesystem',
  options: {
    name: 'blog',
    path: `${__dirname}/blog/`,
  },
},
```

In Jekyll when we create a new blog post we create something like that `YYYY-MM-DD-some-title.md` so we need to create that `slug` from the file name. The way we can do is using the `onCreateNode` method

```js
exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const filename = createFilePath({ node, getNode, basePath: `blog` })

    // Blog files must have format name YYYY-MM-DD-title.md
    if (node.frontmatter.layout === "post") {
      const match = filename.match(/^\/([\d]{4}-[\d]{2}-[\d]{2})-{1}(.+)\/$/)
      if (match) {
        const [, date, title] = match
        if (!date || !title) {
          console.error(
            `Invalid filename ${filename}. Change name to start with a valid date and title`
          )
        } else {
          const slug = `blog/${slugify(date, "/")}/${title}/`
          createNodeField({
            node,
            name: `slug`,
            value: slug,
          })
        }
      }
    }
  }
}
```

Now we need to tell gatsby to create a page for each blog post `node`. We can do it extending a bit previous `createPages` method

```js
exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  const blogPostTemplate = path.resolve(`src/templates/blog-post.js`)
  const pageTemplate = path.resolve(`src/templates/
  page.js`)

  return graphql(`...`).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors)
    }

    const markdownItems = result.data.allMarkdownRemark.edges

    // Create pages and blog post pages
    markdownItems.forEach(({ node }) => {
      if (node.frontmatter.layout === "page") {
        createPage({
          path: node.frontmatter.path,
          component: pageTemplate,
        })
      } else if (node.frontmatter.layout === "post") {
        createPage({
          path: node.fields.slug,
          component: blogPostTemplate,
          context: {
            slug: node.fields.slug,
          },
        })
      }
    })
  })
}
```

### Pagination with the blog posts

What we desire is a blog section that lists all posts, really a paginated list of posts, and then let user select one to be read. The previous section creates a page for each post so we need to create the pages that list the posts. Again, we only need to update a bit the `createPages` method to create a new page for each set of six posts

```js
exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  const blogListTemplate = path.resolve("./src/templates/blog-list.js")
  const blogPostTemplate = path.resolve(`src/templates/blog-post.js`)
  const pageTemplate = path.resolve(`src/templates/page.js`)

  return graphql(`...`).then(result => {
    if(result.errors) {
      return Promise.reject(result.errors)
    }

    const markdownItems = result.data.allMarkdownRemark.edges

    // Create blog-list pages
    const posts = markdownItems.filter(item => item.node.frontmatter.layout === 'post')
    const postsPerPage = 6
    const numPages = Math.ceil(posts.length / postsPerPage)
    Array.from({ length: numPages }).forEach((_, i) => {
      createPage({
        path: i === 0 ? `/blog` : `/blog/${i + 1}`,
        component: blogListTemplate,
        context: {
          limit: postsPerPage,
          skip: i * postsPerPage,
          numPages,
          currentPage: i + 1,
        },
      })
    })

    // Create pages and blog post pages
    ...
  })
}
```

In Jekyll we used the text <!--more--> to mark the excerpt of the post. We can easily set up by configuring the plugin `gatsby-transformer-remark`:

```
{
  resolve: `gatsby-transformer-remark`,
  options: {
    excerpt_separator: `<!--more-->`
  }
}
```
