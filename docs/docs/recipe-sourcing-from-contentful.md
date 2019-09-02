---
title: Sourcing from Contentful
---

This recipe

### Prerequisites

- A [Contentful account](https://www.contentful.com/)
- A Contentful space
- One [Content model](https://www.contentful.com/developers/docs/concepts/data-model/)
- One or more pieces of published content
- The [space ID and content delivery API key](https://www.contentful.com/developers/docs/concepts/apis/#content-delivery-api) for your space

For the screenshots and examples in this recipe, we have set up a new Contentful space with a **News** content model that includes **Title** and **Body** fields.

**Note:** Per [this issue](https://github.com/gatsbyjs/gatsby/issues/15344#issuecomment-520151776), you should create and publish at least one piece of media in your Contentful space to avoid build errors.

### Directions

#### Install and setup the Contentful plugin

Install the `gatsby-source-contentful` plugin in your Gatsby site:

```shell
npm install --save gatsby-source-contentful
```

Add the following plugin entry to your `gatsby-config.js` file. Use your own space ID and access token from the API keys section of your Contentful space. You may also use [environment variables](https://www.gatsbyjs.org/docs/environment-variables/) to store your space and token.

```javascript:title=gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-contentful`,
    options: {
      spaceId: `your_space_id`,
      accessToken: `your_access_token`,
    },
  },
]
```

Run `gatsby develop` and make sure the site compiled successfully.

#### Querying your data

Open the [Gatsby GraphiQL editor](https://www.gatsbyjs.org/docs/introducing-graphiql/) by visiting `https://localhost:8000/___graphql`. The Contentful plugin adds several new node types to your site, including a node type for every content type in your Contentful website. For our example site with a `News` content type and two fields, we get an `allContentfulNews` node type in GraphQL:

![the graphql interface, with a sample query outlined below](./images/recipe-sourcing-contentful-graphql.png)

To query all our news article from Contentful, we can use the following GraphQL query. Note that the `body` field is an object. [Long-text field types in Contentful are returned as objects](https://www.gatsbyjs.org/packages/gatsby-source-contentful/#a-note-about-longtext-fields) instead strings.

```graphql
{
  allContentfulNews {
    edges {
      node {
        body {
          body
        }
        title
      }
    }
  }
}
```

Contentful nodes also include several metadata fields like `createdAt` or `node_locale`.

#### Using Contentful data in your site

You can use Contentful data like any other data source. A simple page listing news articles from our sample space would look like this:

```javascript
import React from "react"
import { graphql } from "gatsby"

const NewsPage = ({ data }) => (
  <div>
    <h1>News</h1>
    {data.allContentfulNews.edges.map(({ node }) => (
      <>
        <h2>{node.title}</h2>
        <p>
          <strong>{node.createdAt}</strong>
          {" — "}
          {node.body.body}
        </p>
      </>
    ))}
  </div>
)

export default NewsPage

export const query = graphql`
  {
    allContentfulNews(sort: { fields: [updatedAt] }) {
      edges {
        node {
          title
          body {
            body
          }
          createdAt(formatString: "MMMM DD YYYY")
        }
      }
    }
  }
```

### Additional resources

- [Building a Site with React and Contentful](https://www.gatsbyjs.org/blog/2018-1-25-building-a-site-with-react-and-contentful/)
- [More on Sourcing from Contentful](https://www.gatsbyjs.org/docs/sourcing-from-contentful/)
- [Contentful source plugin](https://www.gatsbyjs.org/packages/gatsby-source-contentful/)

#### Live example

- [Example website](http://kevee.net/gatsby-source-contentful-recipe/)
- [Code for the example](https://github.com/kevee/gatsby-source-contentful-recipe)
