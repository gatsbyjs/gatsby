---
title: Moving from create-react-app to Gatsby.js
date: 2018-06-18
author: Khaled Garbaya
canonicalLink: https://khaledgarbaya.net/articles/moving-from-create-react-app-to-gatsby-js
publishedAt: Khaled Garbaya Blog
excerpt: How to Move from create-react-app to Gatsby.js
tags: [contentful, react]
---

_This blog post was originally posted on the [Khaled Garbaya Blog](https://khaledgarbaya.net/articles/moving-from-create-react-app-to-gatsby-js)_

![Man moving boxes](https://images.ctfassets.net/4x6byznv2pet/B8BpyFB720SAM8qW68qgY/0b2020576a2d44640a9de1302b6e9ff8/businessman-2108029_1280.jpg)

[create-react-app](https://github.com/facebook/create-react-app) is a build cli, it helps you bootstrap a new react app without the need to configure tools. Like [Webpack](https://github.com/webpack/webpack) or [Babel](https://github.com/babel/babel).

> They are preconfigured and hidden so that you can focus on the code.

If you came across [gatsby](https://github.com/gatsbyjs/gatsby) you will notice that there is a lot of similarity between them. In this Blog post I will explain the key difference between the two.

## What is Gatsby?

![gatsby-logo](https://images.ctfassets.net/4x6byznv2pet/4OW1X9ex1mImko8G4w4WAK/a16fceab310b718c7f375a760c4e1e16/logo-gatsby-0603eb9dd6bdfec9599dbc7590f891be-347ea.jpg)

Gatsby is a blazing fast static site generator for [React.](https://github.com/facebook/react) Actually, it is more than that. Think of it as a PWA (Progressive Web App) Framework with best practices backed in. For example: you get code and data splitting out-of-the-box.

## Why Moving to Gatsby?

![tools-picture](https://images.ctfassets.net/4x6byznv2pet/3KWkbincyQaSCOE2SIkS88/4e89a683e737c99688d662cd7786468d/tools-864983_1280.jpg)

Gatsby.js let's use modern web stack without the setup headache. With its flexible plugin system it let's you bring your own data source. Like [Contentful](https://contentful.com), Databases or your filesystem.

When you build your Gatsby.js website you will end up with static files. They are easy to deploy on a lot of services like [Netlify](https://netlify.com), [Amazon S3](https://aws.amazon.com/s3/) and more.

Gatsby.js provides code and data splitting out-of-the-box. It loads first your critical HTML and CSS. Once that loaded it prefetches resources for other pages. That way clicking around feels so fast.

Gatsby.js uses React component as a view layer so you can share and reuse them across pages/projects. Once it loads the page's javascript code, your website becomes a full React app.

Gatsby.js uses [GraphQL](https://graphql.org/learn/) to share data across pages. You only get the data you need in the page. At build time Gatsby will resolve the query and embed it in your page.

## Gatsby.js project folder structure



```sh

├── LICENSE
├── README.md
├── gatsby-config.js
├── gatsby-node.js
├── node_modules
├── package-lock.json
├── package.json
├── src
│   ├── layouts
│   ├── pages
│   └── templates
└── static

```

## From React Routes to Gatsby Pages

![road-601871 1280](https://images.ctfassets.net/4x6byznv2pet/3PdoKQ8J1uscaW0s2IMuEo/8bce2e060e4a6ec7791c9fe8d6e2cfb6/road-601871_1280.jpg)

There are 2 types of routes, static when you know all the part that will define your route like `/home`. And dynamic  when part of your route is only know at runtime like `blog/:slug`. 

Let's assume you have the following static routes in our create-react-app project:

```js

<Route exact path='/' component={Home}/>
<Route path='/blog' component={Blog}/>
<Route path='/contact' component={Contact}/>

```

In Gatsby.js, to have these routes you need to create a component with the name like the route path in the pages folder. It create the routes for you. The good news is the react components are already created so it is a matter of copying/pasting them. Except for the home page you need to name it index.js.  You will end up with something like this

```sh

├── LICENSE
├── README.md
├── gatsby-config.js
├── gatsby-node.js
├── node_modules
├── package-lock.json
├── package.json
├── src
│   ├── layouts
│   ├── pages
│   │    ├──  index.js
│   │    ├──  blog.js
│   │    ├──  contact.js
│   └── templates
└── static

```

Now that you converted your static routes let's tackle the dynamic routes.

I will take an example of blog posts in this case loaded from Contentful. Every blog post has a uniq slug used to load its content.

In a normal react app the route will look something like this.

```js

<Route path='/blog/:slug' component={BlogPost}/>

```

And your `BlogPost` component will look something like this:

```js
// a function that request a blog post from the Contentful's API
import { getBlogPost } from './contentful-service'
import marked from 'marked'

class BlogPost extends Component {

  constructor(...args) {
    super(args)
    this.state = { status: 'loading', data: null }
  }
  componentDidMount() {
    getBlogPost(this.props.match.slug)
      .then((data) => this.setState({ data }))
      .catch((error) => this.setState({ state: 'error' }))
  }
  render() {
    if (!this.state.status === 'error') {
      return <div>Sorry, but the blog post was not found</div>
    }
    return (
      <div>
        <h1>{this.state.data.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: marked(this.state.data.content) }} />
      </div>
    )
  }
}

```

To create pages dynamically in Gatsby.js you need to write some logic in the `gatsby-node.js`  file. To get an idea on what is possible to do at build time checkout the Gatsb.js Node.js API [docs.](https://www.gatsbyjs.org/docs/node-apis)

We will use the [createPages](https://www.gatsbyjs.org/docs/node-apis/#createPages) function.

Following out Contentful example we need to create a page for each article. To do that first we need to get a list of all blog posts and create pages for them based on their uniq slug.

The code will look like this:

```js
const path = require("path");

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators
  return new Promise((resolve, reject) => {
    const blogPostTemplate = path.resolve(`src/templates/blog-post.js`)
    // Query for markdown nodes to use in creating pages.
    resolve(
      graphql(
        `
     {
       allContentfulBlogPost(limit: 1000) {
         edges {
           node {
               slug
           }
         }
       }
     }
   `
      ).then(result => {
        if (result.errors) {
          reject(result.errors)
        }

        // Create blog post pages.
        result.data.allContentfulBlogPost.edges.forEach(edge => {
          createPage({
            path: `${edge.node.slug}`, // required
            component: blogPostTemplate,
            context: {
              slug: edge.node.slug // in react this will be the `:slug` part
            },
          })
        })

        return
      })
    )
  })
}
```

Since you already have the BlogPost component, form your react project. Move it to `src/template/blog-post.js`.

Your Gatbsy project will look like this:

```sh

├── LICENSE
├── README.md
├── gatsby-config.js
├── gatsby-node.js
├── node_modules
├── package-lock.json
├── package.json
├── src
│   ├── layouts
│   ├── pages
│   │    ├──  index.js
│   │    ├──  blog.js
│   │    ├──  contact.js
│   └── templates
│   │    ├──  blog-post.js
└── static

```

You need to make some slight modification to your Blogpost component.

```js

import React from "react";

class BlogPost extends React.Component {
  render() {
    const post = this.props.data.contentfulBlogPost;

    return (
      <div>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content.childMarkdownRemark.html }} />
      </div>
    );
  }
}

export default BlogPost

export const pageQuery = graphql`
 query BlogPostBySlug($slug: String!) {
   contentfulBlogPost(fields: { slug: { eq: $slug } }) {
     title

      content {

        childMarkdownRemark {

          html

       }

      }
   }
 }
`

```

note the `$slug` part that's passed through the context when creating the page to be able to use it in the GraphQL query.

Gatsby.js will pick the exported `pageQuery` const and will know it's a GraphQL query string by the `graphql` tag.

## From the React state to GraphQL

![files-1614223 1280](https://images.ctfassets.net/4x6byznv2pet/xodXA1B5OCGKW6eAkqi8e/47789915812c2ab95512f97efb1fcb79/files-1614223_1280.jpg)

I will not go in depth with how to manage a React state since there is a lot of ways to achieve that. There is the new [React 16 Context API](https://reactjs.org/docs/context.html) or using [Redux](https://github.com/reduxjs/react-redux) etc... Using Gatsby.js you can request the data you need using the GraphQL data layer as shown in the previous example. this option is only available in the root components. This will change in v2 using static queries feature. You can still use [Redux with Gatsby.js](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-redux) depends on your use if GraphQL is not enough.

## Deployment

![server-2160321 1280](https://images.ctfassets.net/4x6byznv2pet/2xjoMXpIKoAwAM4sqeOCcA/721945e76b4b5861476a9ce8781a326c/server-2160321_1280.jpg)

Since Gatsby.js builds "static" files you can host them on tons of services. One of my favourites is [Netlify.](https://www.netlify.com/) There is also [AWS S3](https://aws.amazon.com/s3/)  and more.

## Resources

* [Contentful tutorials](https://howtocontentful.com/)
* [Contentful's Gatsby video series](https://www.contentful.com/blog/2018/02/28/contentful-gatsby-video-tutorials/)
* [Gatsby Getting Started docs](https://www.gatsbyjs.org/docs/)
