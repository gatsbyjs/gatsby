---
title: Sourcing from Seams-CMS
---

## Overview

[Seams-CMS](https://seams-cms.com) is a headless CMS system that allows you to easily manage content and data with either simple or complex structures and supports localization.

Creating a Seams-CMS account is free for hobby or small sites. For this tutorial, we will be using the demo workspace that is automatically generated when you create a new account. Make sure you add an API key to this workspace in the API key settings. We will be needing your workspace ID and the (read-only) API key shortly.

## Setup

Create a new Gatsby site with the [default starter](https://github.com/gatsbyjs/gatsby-starter-default):

Run this in your terminal:

```shell
gatsby new seamscms-site
cd seamscms-site
```

### Install the source plugin

Next, we will be installing the Seams-CMS Gatsby source plugin:

```shell
npm install --save  seams-cms-gatsby-source
```

### Adding configuration

When you have installed the plugin, it's time to configure it. Add the following code to the `gatsby-config.js` file found in the root of your project.

```javascript:title=gatsby-config.js
module.exports = {
  ...
  plugins: [
    ...
    {
      // Seams-CMS source plug
      resolve: 'seams-cms-gatsby-source',
      options: {
        workspace: <WORKSPACE_ID>,
        apiKey: <API_KEY>,
        contentTypes: ['blogpost'],
      },
    }
    ...
  ],
  ...
}
```

You have to change `<WORKSPACE_ID>` and `<API_KEY>` into the ID of the workspace from your own Seams-CMS account and the newly generated API key inside that workspace. Within the `contentTypes` array, we define all the ID's of the content types we like to import from Seams-CMS into Gatsby, in this case we only want to import the `blogpost` content.

### Run and check our connection

Next, we can run Gatsby and let it fetch our blogposts from Seams-CMS:

```shell
gatsby develop
```

To check if it worked, we can log into the GraphQL admin at `http://localhost:8000/___graphql` and look for an `allSeamsCmsBlogpost` section. If found, it means that blogposts are correctly fetched and stored in the GraphQL layer of Gatsby, ready to be consumed.

To see what kind of data it holds, try running the following query:

```graphql
query MyQuery {
  allSeamsCmsBlogpost {
    edges {
      node {
        content {
          title {
            value
          }
          content {
            value
          }
          author {
            value {
              content {
                name {
                  value
                }
              }
            }
          }
          categories {
            value {
              content {
                name {
                  value
                }
              }
            }
          }
        }
      }
    }
  }
}
```

This will return the blogposts title, content, author name and category name in which the blogpost was posted.

### Generate the blog post page

Now we can create a simple site with just one page holding all blogposts. We do this by creating a template blog index file at `src/templates/blog-index.js` with the following content:

```javascript:title=src/templates/blog-index.js
import React from "react"

import Layout from "../components/layout"

const BlogIndex = ({ pageContext: { blogPosts } }) => (
  <Layout>
    {blogPosts.map(blogPost => (
      <>
        <h4>Title: {blogPost.node.content.title.value}</h4>
        <h4>
          Author: {blogPost.node.content.author.value[0].content.name.value}
        </h4>
        <p>{blogPost.node.content.content.value}</p>
        <hr />
      </>
    ))}
  </Layout>
)

export default BlogIndex
```

It fetches our blog posts from the `pageContext` (we pass our data along with this variable), and we iterate over all the posts. For each post we print the title, the author's name and the content and whatever you like to add that is present in the GraphQL data. For instance, at our Seams-CMS blog, we also fetch things like tags, categories, snippets, image headers, etc.

Once we have created our template, we will be connecting our data to the template. We can do this inside the `gatsby-node.js` found in our root directory. Note that we will be needing a GraphQL query that we can generate automatically through the web interface. Select all the fields you want to use in your template and copy/paste the query into the new file:

```javascript:title=gatsby-node.js
const blogQuery = `
   query MyQuery {
     allSeamsCmsBlogpost {
       edges {
         node {
           content {
             title {
               value
             }
             content {
               value
             }
             author {
               value {
                 content {
                   name {
                     value
                   }
                 }
               }
             }
             categories {
               value {
                 content {
                   name {
                     value
                   }
                 }
               }
             }
           }
         }
       }
     }
   }
`
```

Finally, we create and export a `createPages` function in the same `gatsby-node.js` file that will create our page:

```javascript:title=gatsby-node.js
exports.createPages = async ({ graphql, actions: { createPage } }) => {
  const query = await graphql(blogQuery)

  createPage({
    path: `/blogs`,
    component: require.resolve("./src/templates/blog-index.js"),
    context: {
      blogPosts: query.data.allSeamsCmsBlogpost.edges,
    },
  })
}
```

Finally, when we rerun `gatsby develop` again, it should generate a `/blogs` page with our content. You can visit this at `http://localhost:8000/blogs`.

## More info

More detailed info about setting up Seams-CMS with Gatsby can be found on our [blog](https://blog.seams-cms.com/entry/using-seams-cms-with-gatsbyjs/).
