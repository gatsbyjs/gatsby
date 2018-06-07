---
title: Build a Gatsby Blog using the Cosmic JS source plugin
date: "2018-06-07"
author: "Tony Spiro"
---

![Cosmic JS Gatsby](./gatsby-cosmic.jpg)

> _This article originally appears on [the Cosmic JS website](https://cosmicjs.com/articles/build-a-gatsby-blog-using-the-cosmic-js-source-plugin-jhzwvr45)_.

In this tutorial, I'm going to show you how to create a simple but blazing fast blog using React, Gatsby, and [Cosmic JS](https://cosmicjs.com). Let’s get started.

## TL;DR
[Download the GitHub repo.](https://github.com/cosmicjs/gatsby-blog-cosmicjs)

[Check out the demo.](https://cosmicjs.com/apps/gatsby-blog)

## Prerequisites
You will be required to install Node.js, npm, and Gastby CLI before starting. Make sure you already have them installed.

## What is Gatsby?
![Gatsby](./gatsby.jpg)
[Gatsby](https://www.gatsbyjs.org/) is a blazing-fast website framework for React. It allows developers to build React based websites within minutes. Whether you want to develop a blog or a business website, Gatsby will be a good option.

Because it is based on React, the website pages are never reloaded and also it will generate static pages which make the generated website super fast.  

## Blog Development
We have to set up the environment in order to start working on the blog.

#### Install Gatsby
First, install Gatsby CLI:

```bash
npm install --global gatsby-cli
```

Scaffold a Gatsby Template
```bash
gatsby new gatsby-blog-cosmicjs
```
Enter in your project's folder:
```bash
cd gatsby-blog-cosmicjs
```
Start the server:
```bash
gatsby develop
```
At this point, you should already be able to get access to your Gatsby JS blog website at this address: [http://localhost:8000](http://localhost:8000).


## Install the Cosmic JS Source Plugin
In Static Blog, your data can be consumed from different sources: Markdown files, HTML files, External API (WordPress, Cosmic JS, etc).

Therefore, Gatsby implemented independent layer: the data layer. Which is powered by GraphQL. Very exciting stuff!

To connect this Data Layer with different Data Providers, you need to integrate a Source Plugin. Fortunately, there are many Source Plugins available to fulfill most of the needs.

In our case, we are using [Cosmic JS](https://cosmicjs.com). Obviously, we need to integrate the Source Plugin for Cosmic JS. Good news: Cosmic JS has implemented [their Source Plugin](https://github.com/cosmicjs/gatsby-source-cosmicjs)!

Let's install:
```bash
npm install --save gatsby-source-cosmicjs
```
We need to install some other plugins also. Let's do that also
```bash
npm install --save gatsby-plugin-offline gatsby-source-filesystem
```
These plugins need some configurations. So, replace the content of `gatsby-config.js` with:

```javascript
module.exports = {
  plugins: [
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
        name: 'pages',
      },
    },
    {
      resolve: 'gatsby-source-cosmicjs',
      options: {
        bucketSlug: 'gatsby-blog-cosmic-js', // Bucket Slug
        objectTypes: ['posts','settings'], // List of the Object Types you want to be able to request from Gatsby.
        apiAccess: {
          read_key: '',
        }
      }
    },
  ],
}
```

Then, restart the server to let Gatsby consider these updates.

Posts List & Settings
First, we want to display the list of posts on the homepage. To do so, add the following content to the existing homepage file:

Path: `src/pages/index.js`
```javascript
import React from 'react'
import Link from 'gatsby-link'
import get from 'lodash/get'
import Helmet from 'react-helmet'

import Bio from '../components/Bio'
import { rhythm } from '../utils/typography'

class BlogIndex extends React.Component {
  render() {
    const siteTitle = get(this, 'props.data.cosmicjsSettings.metadata.site_title')
    const posts = get(this, 'props.data.allCosmicjsPosts.edges')
    const author = get(this, 'props.data.cosmicjsSettings.metadata')

    return (
      <div>
        <Helmet title={siteTitle} />
        <Bio settings={author}/>
        {posts.map(({ node }) => {
          const title = get(node, 'title') || node.slug
          return (
            <div key={node.slug}>
              <h3
                style={{
                  marginBottom: rhythm(1 / 4),
                }}
              >
                <Link style={{ boxShadow: 'none' }} to={`posts/${node.slug}`}>
                  {title}
                </Link>
              </h3>
              <small>{node.created}</small>
              <p dangerouslySetInnerHTML={{ __html: node.metadata.description }} />
            </div>
          )
        })}
      </div>
    )
  }
}

export default BlogIndex

export const pageQuery = graphql`
  query IndexQuery {
    allCosmicjsPosts(sort: { fields: [created], order: DESC }, limit: 1000) {
      edges {
        node {
          metadata{
            description
          }
          slug
          title
          created(formatString: "DD MMMM, YYYY")
        }
      }
    }
    cosmicjsSettings(slug: {eq: "general"}){
      metadata{
        site_title
        author_name
        author_bio
        author_avatar {
          imgix_url
        }
      }
    }
  }
`
```

Explanation:
At the end of `index.js` file, we exported `pageQuery`. These are GraphQL queries which are used to fetch important information about settings and list of posts.

Then, we pass the `{ data }` destructed object as parameter of `IndexPage` and loop on its `allCosmicjsPosts` & `cosmicjsSettings` object to display the data.
![Gatsby Cosmic Screenshot](./gatsby-cosmic-screenshot-1.png)


## Single Post Layout
Till now we have integrated Cosmic JS source plugin with Gatsby and it's look like a Blog. Now we will work on blog post's details page.

Let's create the template:

Path: `src/templates/blog-post.js`
```javascript
import React from 'react'
import Helmet from 'react-helmet'
import Link from 'gatsby-link'
import get from 'lodash/get'

import Bio from '../components/Bio'
import { rhythm, scale } from '../utils/typography'
import { relative } from 'path';

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.cosmicjsPosts
    const siteTitle = get(this.props, 'data.cosmicjsSettings.metadata.site_title')
    const author = get(this, 'props.data.cosmicjsSettings.metadata')
    const { previous, next } = this.props.pathContext

    return (
      <div>
        <style>{`
          .post-content {
            text-align: justify;
          }
          .post-hero {
            width: calc(100% + ${rhythm(8)});
            margin-left: ${rhythm(-4)};
            height: ${rhythm(18)};
          }
          @media (max-width: ${rhythm(32)}) {
            .post-hero {
              width: calc(100% + ${rhythm((3/4) * 2)});
              margin-left: ${rhythm(-3/4)};
              height: ${rhythm(13)};
            }
          }
        `}
        </style>
        <Helmet title={`${post.title} | ${siteTitle}`} />
        <div
          style={{
            marginTop: rhythm(1.4),
          }}
        >
          <Link
            to="/">
            ← Back to Posts
          </Link>
        </div>
        <h1
          style={{
            marginTop: rhythm(1),
          }}
        >
          {post.title}
        </h1>
        <p
          style={{
            ...scale(-1 / 5),
            display: 'block',
            marginBottom: rhythm(0.6),
            marginTop: rhythm(-0.6),
          }}
        >
          {post.created}
        </p>
        <div
          className="post-hero"
          style={{
            backgroundColor: "#007ACC",
            backgroundImage: `url("${post.metadata.hero.imgix_url}?w=2000")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            marginBottom: rhythm(0.6),
            position: 'relative',
          }}
        ></div>
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />
        <Bio settings={author} />

        <ul
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            listStyle: 'none',
            padding: 0,
          }}
        >
          {previous && (
            <li>
              <Link to={previous.slug} rel="prev">
                ← {previous.title}
              </Link>
            </li>
          )}

          {next && (
            <li>
              <Link to={next.slug} rel="next">
                {next.title} →
              </Link>
            </li>
          )}
        </ul>
      </div>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    cosmicjsPosts(slug: { eq: $slug }) {
      id
      content
      title
      created(formatString: "MMMM DD, YYYY")
      metadata{
        hero{
          imgix_url
        }
      }
    }
    cosmicjsSettings(slug: {eq: "general"}){
      metadata{
        site_title
        author_name
        author_bio
        author_avatar {
          imgix_url
        }
      }
    }
  }
`
```

That looks fine, but at this point, Gatsby does not know when this template should be displayed. Each post needs a specific URL. So, we are going to inform Gatsby about the new URLs we need thanks to the `createPage` function.

Path: `gatsby-node.js`

```javascript
const _ = require('lodash')
const Promise = require('bluebird')
const path = require('path')

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators
  const indexPage = path.resolve('./src/pages/index.js')
  createPage({
    path: `posts`,
    component: indexPage,
  })

  return new Promise((resolve, reject) => {
    const blogPost = path.resolve('./src/templates/blog-post.js')
    resolve(
      graphql(
        `
          {
            allCosmicjsPosts(sort: { fields: [created], order: DESC }, limit: 1000) {
              edges {
                node {
                  slug,
                  title
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }

        // Create blog posts pages.
        const posts = result.data.allCosmicjsPosts.edges;

        _.each(posts, (post, index) => {
          const next = index === posts.length - 1 ? null : posts[index + 1].node;
          const previous = index === 0 ? null : posts[index - 1].node;

          createPage({
            path: `posts/${post.node.slug}`,
            component: blogPost,
            context: {
              slug: post.node.slug,
              previous,
              next,
            },
          })
        })
      })
    )
  })
}
```

Restart the Gatsby server.

From now on, you should be able to visit the detail page by clicking on URLs displayed on the homepage.
![Gatsby Cosmic Screenshot](./gatsby-cosmic-screenshot-2.png)

### Extra Stuff!
In addition to this, We also implemented `src/components/Bio.js` to display Author information & `src/layouts/index.js` to create a generic layout for the blog. 

The source code is available [on GitHub](https://github.com/cosmicjs/gatsby-blog-cosmicjs). To see it live, clone the repository, and run (`cd gatsby-blog-cosmicjs && npm i && npm run develop`).

Finally, restart the server and visit the website. It will look awesome!

The static website generated by Gatsby can easily be published on storage providers: Netlify, S3/Cloudfront, GitHub pages, GitLab pages, Heroku, etc.

Note: Check out the [demo is deployed on Netlify](https://gatsby-blog-cosmicjs.netlify.com/).

![Gatsby Cosmic Screenshot](./gatsby-cosmic-screenshot-3.png)






### Conclusion 
Congrats! You’ve successfully built a super fast and easy-to-maintain blog! Feel free to continue this project to discover both Gatsby and Cosmic JS advantages. 