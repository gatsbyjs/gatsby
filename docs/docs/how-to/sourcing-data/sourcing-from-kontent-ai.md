---
title: Sourcing from Kontent.ai
---

In this guide, you'll go through how to quickly source content for your Gatsby site from [Kontent.ai](https://kontent.ai/).

Kontent.ai is a hosted CMS that offers you Content as a Service (CaaS) for all your content needs. Using CaaS ensures that your content will be future-proof and reusable, so you can add a mobile app that uses the same content as your Gatsby site without worrying about how it will fit. Kontent.ai offers CaaS with an easy-to-use editing interface and excellent collaboration features, so all your work on content can happen in one place without requiring technical help for each user.

You can also take advantage of Kontent.ai ability to deliver content in multiple languages and create relationships among various content with linked items. However you structure your content in Kontent.ai, the [source plugin](https://github.com/kontent-ai/gatsby-packages/tree/master/packages/gatsby-source) will ensure the proper nodes are created for your Gatsby site.

Note: For this guide, you'll work from scratch from the [Gatsby default starter](https://github.com/gatsbyjs/gatsby-starter-default) to get a feel for how sourcing from Kontent.ai works. If you'd like to look at an example of a complete basic site, have a look at the [Kontent.ai Gatsby starter site](https://github.com/kontent-ai/gatsby-starter), which includes working examples for querying content.

## Setup

### Kontent.ai

The first thing to do, if you haven't already done so, is [sign up for a Kontent.ai account](https://app.kontent.ai/sign-up?utm_medium=gatsbyjsorg&utm_source=guide). This will automatically start a free 30-day trial with all Kontent.ai features. At any point during the trial or after, you can switch to a Developer plan (which always starts as free) or a higher plan with more features.

Once you have a subscription to Kontent.ai, you need some content to retrieve. If you know what you want, you can set up your own content types (templates for your content) and then create content items (the actual content) based on them. If you'd like to take a shortcut and see some example content, you can use [Sample Project generator](https://app.kontent.ai/sample-project-generator) to generate project "Sample Project" and import sample content. This guide will continue with the example of the "Sample Project".

The created Sample Project is a comprehensive presentation of a fictional coffee company named Dancing Goat that showcases various Kontent.ai features. It can be displayed in various channels, as you can see by going to the [Quickstart page in Kontent.ai](https://app.kontent.ai/quickstart) from within that project.

For this guide, you don't have to worry about most of the features. You'll pull some data to display within the Gatsby site you'll create in the next step. The only thing you need to get is your Project ID, which you can find in Kontent.ai under **"Project settings"** -> **"API keys"**.

### Gatsby

Now that you have some content to pull, you can create a basic Gatsby site to display the content. Assuming you have the [Gatsby CLI installed](/docs/quick-start/#install-the-gatsby-cli), create a new site and navigate to it in your terminal:

```shell
gatsby new kontent-guide
cd kontent-guide
```

Next, install the [Kontent.ai source plugin](https://github.com/kontent-ai/gatsby-packages/tree/master/packages/gatsby-source):

```shell
npm install @kontent-ai/gatsby-source
```

Once that's done, you need to add the plugin to `gatsby-config`:

```js:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    // ...
  },
  plugins: [
    // ...
    {
      resolve: `@kontent-ai/gatsby-source`,
      options: {
        projectId: `<YourProjectID>`, // Fill in your Project ID
        // Please note that with the Sample Project generated above, `en-US` is the default language for the project and this config. For a blank project, this needs to be `default`.
        languageCodenames: [
          `en-US`, // Or the languages in your project (Project settings -> Localization)
        ],
      },
    },
    // ...
  ],
}
```

And that's enough for you to be able to access content from Kontent.ai in your site. You can see this by starting Gatsby in development mode:

```shell
gatsby develop
```

To see all the content that's available from Kontent.ai, you can test out GraphQL queries in [GraphiQL](/docs/how-to/querying-data/running-queries-with-graphiql/) at `http://localhost:8000/___graphql`. The queries generated from Kontent.ai will be prefixed with `kontentItem` (for single nodes) or `allKontentItem`.

## Using the plugin

### Adding content to existing pages

To see how to put that data into your site, first go to `http://localhost:8000/`. Notice that the default title for the site is "Gatsby Default Starter". You can change that by pulling the title for your site from Kontent.ai.

The title here is generated in the layout from the site metadata. By default, the Kontent.ai Sample Project has a single item named "Home" that is the only item of the Home type. So you can change the layout component to query the metadata of that item and then use that data to populate your title.

```jsx:title=src/components/layout.js
// ...
const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery{
      kontentItemHome {
        elements {
          metadata__meta_title {
            value
          }
        }
      }
    }
  `)

  return (
    <>
      <Header siteTitle={data.kontentItemHome.elements.metadata__meta_title.value} />
// ...
```

If you look at `http://localhost:8000/`, you'll notice the title is now "Dancing Goat–Freshest coffee on the block!". You can change this title in Kontent.ai to whatever you want and rerun `gatsby develop` to rebuild the site ([see below about automatic builds](#continuous-deployment)).

So you've seen how to add content to existing pages in Gatsby using Kontent.ai. Next, you will start creating new pages of your own.

### Creating new pages

It's great to be able to add content to existing static pages, but one of the great benefits of using CaaS is being able to define pages in Kontent.ai and having them generated automatically. To see how, you'll add pages based on content from the Sample Project in the Article type (feel free to explore how these are structured in Kontent.ai).

Start by making use of the URL pattern in the Article type to generate slugs for your Article nodes:

```js:title=gatsby-node.js
exports.onCreateNode = ({ node, actions: { createNodeField } }) => {
  if (node.internal.type === `kontent_item_article`) {
    createNodeField({
      node,
      name: `slug`,
      value: node.elements.url_pattern.value,
    })
  }
}
```

Now that you have a pretty way to define the path for your pages, you can create the pages programmatically:

```js:title=gatsby-node.js
const path = require(`path`) // highlight-line

exports.onCreateNode = ({ node, actions: { createNodeField } }) => {
  if (node.internal.type === `kontent_item_article`) {
    createNodeField({
      node,
      name: `slug`,
      value: node.elements.url_pattern.value,
    })
  }
}

// highlight-start
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  // Query data from Kontent
  const result = await graphql(`
    {
      allKontentItemArticle {
        nodes {
          fields {
            slug
          }
        }
      }
    }
  `)

  // Create pages
  result.data.allKontentItemArticle.nodes.forEach((node) => {
    createPage({
      path: node.fields.slug,
      component: path.resolve(`src/templates/article.js`),
      context: {
        slug: node.fields.slug,
      },
    })
  })
}
// highlight-end
```

Now create a basic template to display each article with a title and the body that you pull with a GraphQL query:

```jsx:title=src/templates/article.js
import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"

const Article = ({ data }) => {
  const item = data.kontentItemArticle.elements

  return (
    <Layout>
      <h1>{item.title.value}</h1>
      <div dangerouslySetInnerHTML={{ __html: item.body_copy.value }} />
    </Layout>
  )
}

export default Article

export const query = graphql`
  query articleQuery($slug: String!) {
    kontentItemArticle(fields: { slug: { eq: $slug } }) {
      fields {
        slug
      }
      elements {
        body_copy {
          value
        }
        title {
          value
        }
      }
    }
  }
`
```

When you rerun `gatsby develop`, you'll be able to see each article as a page with content pulled from Kontent.ai. To see a list of all pages, visit `http://localhost:8000/asdf` (or any other url that generates a 404).

The body copy for this article comes from a rich text element in Kontent.ai. Links and inline linked items (e.g., embedded videos) are not resolved by default for rich text elements. If you want to resolve them, you can query the required data in structured form for resolution and create your own React components. You could use [Rich text element component](https://github.com/kontent-ai/gatsby-packages/tree/master/packages/gatsby-components#rich-text-element-component) that is a part of the [@kontent-ai/gatsby-components](https://github.com/kontent-ai/gatsby-packages/tree/master/packages/gatsby-components) package.

Since the Kontent.ai source plugin is defining the GraphQL schema for data from Kontent.ai, you could use this schema and extend it according to your needs. There are [some examples](https://github.com/kontent-ai/gatsby-packages/tree/master/site#examples) of what you could do in your application.

Now you know how to create pages programmatically and pull their content from Kontent.ai. To get the most out of your CaaS, you'll want to also make sure your site builds automatically whenever published content changes inside Kontent.ai.

### Continuous deployment

To keep your site static but always up to date with the latest content from Kontent.ai, it helps to set up automatic deployment whenever your published content changes. Read the [Gatsby Cloud](https://support.gatsbyjs.com/hc/en-us/articles/360052324654-Connecting-to-Kontent) instructions to learn more.

For automatic deployment from Netlify you'll want to [create a new build hook](https://docs.netlify.com/configure-builds/build-hooks/) with a name like "Change in Kontent.ai content" and copy the URL. Then go to Kontent.ai. Under **"Project settings"**, choose **"Webhooks"** and create a new webhook. Give it a name like "Netlify build", paste the URL into the **"URL address"** field and choose the [events to trigger the webhook](https://docs.kontent.ai/reference/webhooks-reference#a-events-to-trigger-a-webhook), you want to select just "DELIVERY API TRIGGERS" for content item events: "Publish" and "Unpublish". And that's it. Now whenever published content changes, your webhook will trigger a build in Netlify to ensure your static content is updated to the latest version.

## What's next?

You've seen how to set up a Gatsby site that sources content from Kontent.ai and is automatically redeployed on any change to the content. Kontent.ai is capable of creating many other kinds of relationships, including taxonomies for categorization, multiple languages, and linking items together. Want to do more?

- See [more about what the Kontent.ai source plugin can do](https://github.com/kontent-ai/gatsby-packages/tree/master/packages/gatsby-source#available-options).
- Read the [Kontent.ai documentation](https://docs.kontent.ai) to see what's possible.
- Explore the [Kontent.ai Gatsby starter](https://github.com/kontent-ai/gatsby-starter) to see a sample site.
