---
title: Sourcing from Prismic
---
In this guide, you’ll set up a site using [Prismic](https://prismic.io/) and the Gatsby Hello World starter. 

Prismic is a Headless CMS with a web app for creating and publishing content: the “Writing Room” + a fully-fledged GraphQL API
It’s suitable for marketers and developers as it offers features like a components-based page builder, image optimization, previewing, scheduling, content versioning, and multi-language support.

In addition to written instructions, this guide also includes videos for more complex steps. You can find all of them in a [YouTube playlist](https://www.youtube.com/playlist?list=PLB-cmN3u7PHJCG-phPyiydhHfiosyd0VC) provided by [LekoArts].(https://www.youtube.com/channel/UCbxFBnrkEMExO_QX8tkJ76Q)  

Interesting reads:
- [Official Prismic documentation on Gatsby](https://prismic.io/docs/gatsby/getting-started/home).
- [Sample Blog with Prismic & Gatsby.js](https://user-guides.prismic.io/en/articles/2933292-sample-blog-with-api-based-cms-gatsby-js).
- [Multi-language website example](https://user-guides.prismic.io/en/articles/3601217-multi-language-website-example-with-gatsby-js).
[Prismic Official documentation](https://prismic.io/docs).


## Setup

### Prismic

1. Sign up on [Prismic.io](https://prismic.io/). The free plan is a perfect fit for personal or smaller projects.

2. Create a new repository and two first Custom types: One (Repeatable Type) with the name `Post` and another one (Single Type) with the name `Homepage`. Then, in the [Writing room](https://user-guides.prismic.io/en/articles/2518323-discover-the-writing-room), create one document for each Custom type (`Post` and `Homepage`). Fill out the fields and publish them.

https://youtu.be/yrOYLNiYtBQ

https://youtu.be/bvDAUEaJXrM

### Gatsby

1. Open a new terminal window and run the following command to create a new site:

```shell
gatsby new prismic-tutorial https://github.com/gatsbyjs/gatsby-starter-hello-world
```
Sometimes the Gatsby starter will not work properly if some packages are outdated. [Read this NPM article on how to update local packages](https://docs.npmjs.com/updating-packages-downloaded-from-the-registry)

This will create a new directory called `prismic-tutorial` that contains the starters site, but you can change `prismic-tutorial` in the command above to whatever name you prefer. Now move into the newly created directory and install:
  - gatsby-source-prismic-graphql, the Gatsby plugin for Prismic 
  - prismic-reactjs, to be able to work with Rich Text fields
  - gatsby-cli, to enable [Gatsby commands](https://www.gatsbyjs.org/docs/gatsby-cli/)

```shell
cd prismic-tutorial
npm install --save gatsby-source-prismic-graphql
npm install --save prismic-reactjs
npm install -g gatsby-cli
```

2. Open your code editor and configure the plugin. (See all [available options](https://prismic.io/docs/gatsby/getting-started/prismic-gatsby-source-plugin)). The `repositoryName` is the name you have entered at the creation of the repository (you'll also find it as the subdomain in the URL. In this example we're dinamically creating pages for all the documents of the type `Post` and one `Homepage`:

```javascript:title=gatsby-config.js
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-prismic-graphql`,
      options: {
        repositoryName: `your-repository-name`,
        accessToken: `${process.env.API_KEY}`,
        pages: [
          {
            type: 'Homepage',
            match: '/:lang',
            path: '/',
            component: require.resolve('./src/templates/home.js')
          },  
          {
            type: 'Post',
            match: '/post/:uid',
            path: '/',
            component: require.resolve('./src/templates/post.js')
          }
        ]
      }
    },
  ],
}
```

The best way to create and test your queries is to first develop them in the [GraphQL Playground](https://www.gatsbyjs.org/docs/using-graphql-playground/) and then paste them into your files. You can access to it when running your project in dev mode at `http://localhost:8000/__graphql`. Run the following command to start the local development server and experiment a bit with the available queries:

```
gatsby develop
```

3. Create your page templates

### Single Type

Because you defined a custom type as `Homepage` the query after the `prismic` key is called `allHomepages` or just `homepage`. You can also see the API IDs (from the field names) you created earlier. Your Homepage template could look something like this:

```jsx:title=src/templates/home.js

import React from "react"
import { graphql } from "gatsby"
import { RichText } from "prismic-reactjs"

export const query = graphql`
 query($lang: String!, $uid: String!) {
  prismic {
    homepage(lang: $lang, uid: $uid){
      title
      content
    }
  }
 }
`
const Homepage = props => {
  const document = props.data.prismic.homepage
  if (!document) return null

  return (
    <div>
      <RichText render={document.title} />
      <RichText render={document.content} />
    </div>
  )
}

export default Homepage
```

### Repeatable Type

Because you defined a custom type as `Post` the query after the `prismic` key is called `allPosts` (and `Post`). You can also see the API IDs (from the field names) you created earlier.

```js:title=src/templates/post.js
import React from "react"
import { graphql } from "gatsby"
import { RichText } from "prismic-reactjs"

export const query = graphql`
  query PostQuery($uid: String) {
    prismic {
      allPosts(uid: $uid){
        edges {
          node {
            _meta {
              uid
            }
            title
            content
          }
        }
      }
    }
  }
`
const Post = props => {
  const prismicContent = props.data.prismic.allPosts.edges[0]
  if (!prismicContent) return null

  const document = prismicContent.node

  return (
    <div>
      <RichText render={document.title} />
      <RichText render={document.content} />
    </div>
  )
}

export default Post
```

The best way to create and test your queries is to first develop them in the [GraphQL Playground](https://www.gatsbyjs.org/docs/using-graphql-playground/) and then paste them into your files. You can access to it when running your project in dev mode at `http://localhost:8000/__graphql`. Run the following command to start the local development server and experiment a bit with the available queries:

```
gatsby develop
```

## Deploying to Netlify

Netlify is able to automatically start builds on pushes to a repository and accepts [webhooks](https://www.netlify.com/docs/webhooks/) to do so. Fortunately, Prismic can [trigger webhook](https://user-guides.prismic.io/webhooks/webhooks) URLs when publishing content. With those features set up, new content will automatically appear on your Netlify site. 

Setup your Netlify project and afterwards go to the `Build hooks` setting at `Settings → Build & deploy`. You'll receive a URL of the format <https://api.netlify.com/build_hooks/-randomstring-> after clicking `Add build hook`. On your Prismic project, visit the `Webhooks` setting and insert the copied URL into the respective field. Confirm with `Add this webhook`. Every time you publish a new document, Netlify will re-build your site.

### Categories

Prismic offers a [Content Relationship](https://user-guides.prismic.io/content-modeling-and-custom-types/field-reference/content-relationship) field which is used to link to another document in your Prismic repository. 

You can use that in combination with a custom type to create a tagging system (in this example _categories_). And what's cool about that? You can edit your entries any time and they'll update in every post! Read the [official docs](https://user-guides.prismic.io/how-to-guides/create-a-custom-tagging-system) on that or watch the video:

https://youtu.be/67yir-jQrFk

The video shows the usage of a Group field and Content Relationship field — if you only want to have one category, skip the group field. Similar as to the `Post` custom type the `Category` one can also be queried. Furthermore, the `allPosts` query also has the `categories` node available.

The `linkResolver` function is used to process links in your content. Fields with rich text formatting or links to internal content use this function to generate the correct link URL. The document node, field key (i.e. API ID), and field value are provided to the function. This allows you to use different [link resolver logic](https://prismic.io/docs/reactjs/beyond-the-api/link-resolving) for each field if necessary.


## Other resources

This was an example meant to help you understand how Prismic works with Gatsby. 

- [Create a Prismic repository and setup the Gatsby plugin](https://prismic.io/docs/gatsby/getting-started/prismic-gatsby-source-plugin)
- [Query data from Prismic](https://prismic.io/docs/gatsby/query-basics/anatomy-of-a-query)
- [Deploy the site in Netlify](https://prismic.io/docs/gatsby/misc-topics/deployment)
- [Content Relationship links between documents.](https://prismic.io/docs/gatsby/arguments-and-filtering/query-by-content-relationship-or-link)
