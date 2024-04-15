# gatsby-source-contentful v9

`gatsby-source-contentful` is a powerful Gatsby plugin that brings [Contentful's rich content management capabilities](https://www.contentful.com/) into the Gatsby ecosystem. It enables developers to seamlessly integrate Contentful's Content Delivery API with their Gatsby sites, allowing for efficient content retrieval and dynamic site generation based on Contentful's structured content.

<details>
<summary><strong>Table of contents</strong></summary>

- [gatsby-source-contentful v9](#gatsby-source-contentful-v9)
  - [Core Features](#core-features)
    - [What's New in Version v9](#whats-new-in-version-v9)
  - [Restrictions and Limitations](#restrictions-and-limitations)
  - [Installation](#installation)
  - [Migration](#migration)
  - [Configuration Instructions](#configuration-instructions)
    - [Using Delivery API](#using-delivery-api)
    - [Using Preview API](#using-preview-api)
  - [Get Started Guide](#get-started-guide)
    - [Step 0: Our Contentful Data Model](#step-0-our-contentful-data-model)
    - [Step 1: Creating a Gatsby Page with Contentful Data](#step-1-creating-a-gatsby-page-with-contentful-data)
    - [Step 2: Dynamic Page Creation with `gatsby-node.js`](#step-2-dynamic-page-creation-with-gatsby-nodejs)
    - [Step 3: Using Markdown to Render the Content](#step-3-using-markdown-to-render-the-content)
    - [Further Tutorials and Documentation](#further-tutorials-and-documentation)
  - [Advanced configuration](#advanced-configuration)
    - [Offline Mode](#offline-mode)
  - [Querying Contentful Data in Gatsby](#querying-contentful-data-in-gatsby)
    - [Overview of Querying Nodes](#overview-of-querying-nodes)
    - [Querying All Nodes](#querying-all-nodes)
    - [Querying Single Nodes](#querying-single-nodes)
    - [Handling Long Text Fields](#handling-long-text-fields)
    - [Addressing Duplicated Entries Caused by Internationalization](#addressing-duplicated-entries-caused-by-internationalization)
    - [Querying Assets and Tags within ContentType Nodes](#querying-assets-and-tags-within-contenttype-nodes)
    - [Advanced Queries with Contentful and Gatsby](#advanced-queries-with-contentful-and-gatsby)
  - [Working with Images and Contentful](#working-with-images-and-contentful)
    - [Displaying Responsive Images with `gatsby-plugin-image`](#displaying-responsive-images-with-gatsby-plugin-image)
    - [Building Images on the Fly with `useContentfulImage`](#building-images-on-the-fly-with-usecontentfulimage)
  - [Leveraging Contentful Rich Text with Gatsby](#leveraging-contentful-rich-text-with-gatsby)
    - [Querying Rich Text Content](#querying-rich-text-content)
    - [Basic Rich Text Rendering](#basic-rich-text-rendering)
    - [Embedding Images in Rich Text with Gatsby Plugin Image](#embedding-images-in-rich-text-with-gatsby-plugin-image)
    - [Embedding Entries in Rich Text](#embedding-entries-in-rich-text)
    - [Further Contentful Rich Text resources](#further-contentful-rich-text-resources)
  - [Downloading Assets for Static Distribution](#downloading-assets-for-static-distribution)
    - [Benefits of `downloadLocal`](#benefits-of-downloadlocal)
    - [Trade-offs](#trade-offs)
    - [Enabling `downloadLocal`](#enabling-downloadlocal)
    - [Updating GraphQL Queries](#updating-graphql-queries)
    - [Troubleshooting](#troubleshooting)
  - [Multi-Space Sourcing: Example for Sourcing from Multiple Contentful Spaces](#multi-space-sourcing-example-for-sourcing-from-multiple-contentful-spaces)
    - [Current Limitations](#current-limitations)

</details>

## Core Features

- **Comprehensive Content Integration**: Easily connect your Contentful space with Gatsby, ensuring all content types, references, and custom fields are handled effectively.
- **Advanced Contentful Features Support**: Harness the full power of Contentful's offerings, including the Image API for creating responsive images and the comprehensive Rich Text feature for versatile content representation.
- **Efficient Content Synchronization**: Utilizes Contentful's Sync API for incremental updates, significantly speeding up build times.
- **Aligned Data Structure**: Data in Gatsby closely mirrors the structure of Contentful's GraphQL API, with minimal discrepancies, for a consistent development experience.
- **Preview API Support**: Leverage Contentful's Preview API for content previews before publishing, with some limitations due to incremental sync constraints. Refer to [Restrictions & Limitations](#restrictions-and-limitations) for more details.

### What's New in Version v9

The v9 release of `gatsby-source-contentful` brings significant improvements, focusing on stability and enhancing the developer experience.

- **Dynamic Schema Generation**: Schema types are now dynamically generated based on the Contentful content model, eliminating site breakages due to empty content fields.
- **Rich Text and JSON Field Enhancements**: Improved handling of Rich Text and JSON fields for more accurate processing, querying, and rendering.
- **Schema and Performance Optimizations**: An optimized, leaner schema reduces node count and improves build times, especially for larger projects.
- **Contentful GraphQL API Alignment**: Enhanced alignment with Contentful's GraphQL API enables more intuitive and consistent querying.
- **Removed Content Type Name Restrictions**: New naming patterns now allow all content type names, including previously restricted names like `entity` and `reference`.
- **Updated Field Name Restrictions**: Fields can now be named `contentful_id`, with restrictions now applied to names like `sys`, `contentfulMetadata`, and `linkedFrom`.
- **Refined Backlinks**: Backlinks/references are now located in the `linkedFrom` field, aligning with Contentful's GraphQL API structure.
- **Expanded Configuration Options**: Additional [configuration options](#advanced-configuration) provide greater control and customization for your specific project needs.
- **Updated @link Directive Usage**: The new version of the "gatsby-source-contentful" plugin adopts the @link directive, eliminating the warnings in the build log about the deprecated \_\_\_NODE convention in Gatsby v5.

For a detailed migration guide and to leverage these improvements, refer to the [Migration Guide](./MIGRATION.md) section.

## Restrictions and Limitations

Please note the following limitations when using `gatsby-source-contentful`:

1. **Environment Access**: Your access token must have permissions for both your desired environment and the `master` environment.
2. **Preview API Usage**: While using Contentful's Preview API, content may become out-of-sync over time as incremental syncing is not officially supported. Regular cache clearing is recommended.
3. **Restricted Content Type Names**: Content type names such as `entity` and `reference` are not allowed.
4. **Field Name Prefixes**: Certain field names are restricted and will be automatically prefixed for consistency, including `id`, `children`, `parent`, `fields`, `internal`, `sys`, `contentfulMetadata`, and `linkedFrom`.

Your revisions to the installation section are clear and informative, effectively guiding users through the initial setup process. The emphasis on `gatsby-plugin-image` for leveraging Gatsby and Contentful's image capabilities is a valuable recommendation. Here's a slightly refined version for clarity and flow:

## Installation

To install the plugin, run the following command in your Gatsby project:

```shell
npm install gatsby-source-contentful gatsby-plugin-image
```

While `gatsby-plugin-image` is optional, it is highly recommended to fully utilize the benefits of [Gatsby's Image Plugin](https://www.gatsbyjs.com/plugins/gatsby-plugin-image/) and [Contentful's Images API](https://www.contentful.com/developers/docs/references/images-api/), enhancing your site's image handling and performance.

## Migration

Please see our [Migration Guide](./MIGRATION.md)

## Configuration Instructions

### Using Delivery API

To use Contentful's Delivery API, which retrieves published content, follow these steps:

1. **Set Environment Variables**: Create a file named `.env.development` in your project's root with the following variables:

```sh
# .env.development
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_delivery_api_access_token
CONTENTFUL_ENVIRONMENT=master  # or your custom environment
```

Replace `your_space_id` and `your_delivery_api_access_token` with your actual Contentful Space ID and Delivery API access token. To create access tokens, open the Contentful [UI](https://app.contentful.com/), click `Settings` in the top right corner, and select `API keys`. 2. **Production Environment Variables**: Duplicate the `.env.development` file and rename it to `.env.production`. This ensures your Gatsby site connects to Contentful's Delivery API in both development and production builds.

3. **Plugin Configuration**: In your `gatsby-config.js`, add the `gatsby-source-contentful` plugin with the necessary options:

```javascript
// gatsby-config.js
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: process.env.CONTENTFUL_SPACE_ID,
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
        environment: process.env.CONTENTFUL_ENVIRONMENT,
      },
    },
    `gatsby-plugin-image`,
    // ... other plugins ...
  ],
}
```

### Using Preview API

To configure the plugin for Contentful's Preview API, which allows you to see unpublished content. This will configure the plugin for Contentful's Preview API for development mode, while maintaining the Contentful Content API for production builds.

1. **Update Environment Variables**: In your `.env.development` file, update `CONTENTFUL_ACCESS_TOKEN` to use an access token for the Contentful Preview API.

2. **Adjust Plugin Configuration**: Modify your `gatsby-config.js` to conditionally set the host based on the environment:

```javascript
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-contentful`,
      options: {
        // ... other plugin options ...
        host:
          process.env.NODE_ENV === `production`
            ? `cdn.contentful.com`
            : `preview.contentful.com`,
      },
    },
    // ... other plugins ...
  ],
}
```

## Get Started Guide

This guide is a straightforward path to see how Gatsby and Contentful can bring your content to life, ideal for those just starting out.

### Step 0: Our Contentful Data Model

Before we jump into Gatsby, let's define our Contentful data model. We're working with a Page content type, which includes the following fields:

- **Title**: The headline of your page.
- **Slug**: A unique URL segment based on the page's title.
- **Content**: The primary content or body of your page.

### Step 1: Creating a Gatsby Page with Contentful Data

Begin by fetching data from a single entry of our `Page` content type and displaying it on a Gatsby page.

1. **Create a Page Component**: In your `src/pages` directory, add a new file, such as `contentful-page.js`.
2. **Load data with GraphQL**: Use Gatsby's page query to retrieve data from Contentful. For a `Page` content type with `title`, `slug`, and `content` fields.
3. **Render data with Gatsby**: The result of the page query is available through the `data` prop.

   Your file should look like this:

   ```jsx
   // src/pages/contentful-page.js
   import React from "react"
   import { graphql } from "gatsby"

   export default function ContentfulPage({ data }) {
     return (
       <div>
         <h1>{data.contentfulPage.title}</h1>
         <p>{data.contentfulPage.content.raw}</p>
       </div>
     )
   }

   export const pageQuery = graphql`
     query {
       contentfulPage(slug: { eq: "your-slug" }) {
         title
         content {
           raw
         }
       }
     }
   `
   ```

   **Important:** Replace `"your-slug"` with the actual slug of the page you want to display. At this stage, the content will be displayed as raw text.

### Step 2: Dynamic Page Creation with `gatsby-node.js`

Now, create a subpage for each `Page` content type entry.

1. **Rename and Move Page Component**: Rename `src/pages/contentful-page.js` to `src/templates/contentful-page-template.js`. This file becomes your template for dynamically created pages.

2. **Implement Dynamic Page Creation**: In your `gatsby-node.js`, use the `createPages` API to dynamically generate pages for each entry of the `Page` content type from Contentful.

   ```javascript
   // gatsby-node.js
   const path = require("path")

   exports.createPages = async ({ graphql, actions }) => {
     const { createPage } = actions

     // Query data of all Contentful pages
     const result = await graphql(`
       query {
         allContentfulPage {
           edges {
             node {
               slug
             }
           }
         }
       }
     `)

     // Dynamically create a page for each Contentful entry, passing the slug for URL generation
     result.data.allContentfulPage.edges.forEach(({ node }) => {
       createPage({
         path: node.slug,
         component: path.resolve(`./src/templates/contentful-page-template.js`),
         context: {
           slug: node.slug,
         },
       })
     })
   }
   ```

   This code will create a new page for each `Page` entry in Contentful, using the slug as the page path.

3. **Update Template with Slug Filter**: In your template file (`src/templates/contentful-page-template.js`), update the GraphQL query to filter by the provided slug.

   ```jsx
   // src/templates/contentful-page-template.js
   import React from "react"
   import { graphql } from "gatsby"

   export default function ContentfulPageTemplate({ data }) {
     return (
       <div>
         <h1>{data.contentfulPage.title}</h1>
         <p>{data.contentfulPage.content.raw}</p>
       </div>
     )
   }

   export const pageQuery = graphql`
     query contentfulPageQuery($slug: String!) {
       contentfulPage(slug: { eq: $slug }) {
         title
         content {
           raw
         }
       }
     }
   `
   ```

   **Hint:** The `$slug` variable is provided via the context in `gatsby-node.js`.

### Step 3: Using Markdown to Render the Content

> **Note on Markdown**: Markdown is a lightweight markup language that allows you to write content using an easy-to-read, easy-to-write plain text format, which is then converted into HTML. The `gatsby-transformer-remark` plugin enables this transformation within Gatsby. [Learn more about Markdown](https://www.markdownguide.org/getting-started/).

To add Markdown rendering to your Contentful content:

1. **Install `gatsby-transformer-remark`**: Run `npm install gatsby-transformer-remark`.

2. **Update Gatsby Config**: Add the `gatsby-transformer-remark` plugin to your `gatsby-config.js`.

   ```javascript
   // gatsby-config.js
   module.exports = {
     plugins: [
       // ... other plugins ...
       `gatsby-transformer-remark`,
     ],
   }
   ```

3. **Adjust the Template for Markdown**: Modify your template (`src/templates/contentful-page-template.js`) to render the markdown content. Update the GraphQL query and rendering logic to handle the transformed markdown.

   ```jsx
   // src/templates/contentful-page-template.js
   import React from "react"
   import { graphql } from "gatsby"

   export default function ContentfulPageTemplate({ data }) {
     return (
       <div>
         <h1>{data.contentfulPage.title}</h1>
         {/* Here we render the generated HTML */}
         <div
           dangerouslySetInnerHTML={{
             __html: data.contentfulPage.content.childMarkdownRemark.html,
           }}
         />
       </div>
     )
   }

   export const pageQuery = graphql`
     query contentfulPageQuery($slug: String!) {
       contentfulPage(slug: { eq: $slug }) {
         title
         content {
           # The childMarkdownRemark is created by gatsby-transformer-remark
           childMarkdownRemark {
             html
           }
         }
       }
     }
   `
   ```

You now have a foundational grasp of `gatsby-source-contentful` and its potential to power your Gatsby projects with Contentful's dynamic content.

### Further Tutorials and Documentation

For more in-depth exploration and advanced concepts, check out these valuable resources:

- **Contentful Gatsby Starter Guide**: A comprehensive guide to kickstart your Gatsby projects with Contentful. [Explore the guide](https://www.contentful.com/gatsby-starter-guide/).
- **Contentful Blog Example**: An example Gatsby project integrated with Contentful, ideal for blog-like websites. [View on GitHub](https://github.com/contentful/starter-gatsby-blog).
- **Contentful & Gatsby in 5 Minutes**: A quick tutorial for setting up a Gatsby site with Contentful. [Start learning](https://www.contentful.com/help/gatsbyjs-and-contentful-in-five-minutes/).
- **Gatsby's Quick Guide to Contentful**: Gatsby's own guide to integrating Contentful for content management. [Read the guide](https://www.gatsbyjs.com/blog/a-quick-start-guide-to-gatsby-and-contentful/).
- **Video Tutorial by Khaled and Jason**: Though a bit dated, this informative video remains a great resource for understanding Gatsby and Contentful integration. [Watch on YouTube](https://www.youtube.com/watch?v=T9hLWjIN-pY).

## Advanced configuration

Here's the revised table for the `gatsby-source-contentful` configuration options, including the suggested updates and corrections:

| Option                             | Type    | Default Value        | Description                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------- | ------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spaceId`                          | string  | (required)           | Your Contentful space ID.                                                                                                                                                                                                                                                                                                                |
| `accessToken`                      | string  | (required)           | Access token for the Content Delivery API. Use the Preview API key for the Contentful Preview API.                                                                                                                                                                                                                                       |
| `host`                             | string  | `cdn.contentful.com` | Base host for API requests. Default is for the Delivery API; use `preview.contentful.com` for the Preview API. Custom hosts can be used for debugging/testing.                                                                                                                                                                           |
| `environment`                      | string  | `master`             | The environment in Contentful to pull content from. [Guide](https://www.contentful.com/developers/docs/concepts/multiple-environments/)                                                                                                                                                                                                  |
| `downloadLocal`                    | boolean | `false`              | Downloads and caches `ContentfulAsset` to the local filesystem. Use `localFile` to access the local files. See [Download assets for static distribution](#download-assets-for-static-distribution)                                                                                                                                       |
| `useNameForId`                     | boolean | `true`               | Determines whether the content's `name` or internal ID is used for generating GraphQL schema types. Using `name` can make type names more readable but can be unstable if names change. Using the internal ID ensures stability as IDs are less likely to change, but may result in less readable types, especially when auto-generated. |
| `enforeRequiredFields` (New in v9) | boolean | `true`               | Fields required in Contentful will also be required in Gatsby. If you are using Contentfuls Preview API (CPA), you may want to disable this conditionally.                                                                                                                                                                               |

| `enableMarkdownDetection` (New in v9) | boolean | `true` | Assumes all long text fields in Contentful are markdown fields. Requires `gatsby-transformer-remark`. Can be a performance issue in large projects. Set to `false` and use `markdownFields` to specify markdown fields. |
| `markdownFields` (New in v9) | array | `[]` | Specify which fields contain markdown content. Effective only when `enableMarkdownDetection` is `false`. Format: array of pairs (content type ID and array of field IDs). Example: `[["product", ["description", "summary"]], ["otherContentTypeId", ["someMarkdownFieldId"]]]` |
| `contentTypePrefix` (Renamed in v9) | string | `ContentfulContentType` | Prefix for the generated GraphQL types. Formerly known as `typePrefix`. |
| `localeFilter` | function | `() => true` | Function to filter which locales/nodes are created in GraphQL, reducing memory usage by limiting nodes. |
| `contentTypeFilter` | function | `() => true` | Function to filter which contentType/nodes are created in GraphQL, reducing memory usage by limiting nodes. |
| `pageLimit` | number | `1000` | Number of entries to retrieve from Contentful at a time. Adjust if the payload size exceeds 7MB. |
| `assetDownloadWorkers` | number | `50` | Number of workers to use when downloading Contentful assets. Adjust to prevent stalled downloads due to too many concurrent requests. |
| `proxy` | object | (none) | Axios proxy configuration. See the [axios request config documentation](https://github.com/mzabriskie/axios#request-config) for further information about the supported values. |
| `contentfulClientConfig` | object | `{}` | Additional config passed to Contentful's JS SDK. Use with caution to avoid overriding plugin-set values. |

### Offline Mode

For development without internet access, you can enable the Offline Mode of `gatsby-source-contentful`. Simply set the environment variable `GATSBY_CONTENTFUL_OFFLINE`, for example by adding `GATSBY_CONTENTFUL_OFFLINE=true` to your `.env.development`. This mode uses cached data from previous builds.

**Note:** Changing `gatsby-config.js` or `package.json` will clear the cache, requiring internet access for the next build.

## Querying Contentful Data in Gatsby

### Overview of Querying Nodes

In Gatsby, Contentful provides three primary node types for querying: `Asset`, `ContentType`, and `Tag`. These nodes allow you to access various types of content from your Contentful space:

- `Asset` nodes are accessible under `contentfulAsset` and `allContentfulAsset`.
- `ContentType` nodes, following the new naming pattern, are available as `contentfulContentType${entryTypeName}` and `allContentfulContentType${entryTypeName}`.
- `Tag` nodes are found under `contentfulTag` and `allContentfulTag`.

Querying `contentfulX` retrieves a single node, while `allContentfulX` fetches all nodes of that type.

### Querying All Nodes

To query all nodes of a specific type:

```graphql
{
  allContentfulAsset {
    nodes {
      sys {
        id
      }
      title
      description
    }
  }
}
```

### Querying Single Nodes

For querying a single node:

```graphql
{
  contentfulAsset(title: { eq: "foo" }) {
    sys {
      id
    }
    title
    description
    // ... other fields ...
  }
}

{
  contentfulContentTypeCaseStudy(slug: { eq: "example-slug" }) {
    title
    slug
    // ... other fields ...
  }
}
```

### Handling Long Text Fields

Long text fields often use Markdown. For Markdown processing, use `gatsby-transformer-remark`. See [Step 3 in the Getting Started Guide](#step-3-using-markdown-to-render-the-content).

```graphql
{
  contentfulContentTypeCaseStudy {
    body {
      raw # Raw Markdown
      childMarkdownRemark {
        html # HTML from Markdown
      }
    }
  }
}
```

### Addressing Duplicated Entries Caused by Internationalization

Due to Contentful's data retrieval process, each localization creates a new node, potentially leading to duplicates. Include the `node_locale` in queries to avoid this:

```graphql
{
  allContentfulContentTypeCaseStudy(
    filter: { node_locale: { eq: "en-US" } }
  ) {
    # ... query fields ...
  }
}
```

### Querying Assets and Tags within ContentType Nodes

Assets and tags are typically queried alongside ContentType nodes:

```graphql
{
  allContentfulContentTypeCaseStudy {
    edges {
      node {
        sys {
          id
        }
        slug
        title
        subtitle
        body {
          body
        }
        # Asset
        heroImage {
          title
          description
          gatsbyImageData(layout: CONSTRAINED)
        }
        # Tags
        contentfulMetadata {
          tags {
            name
          }
        }
      }
    }
  }
}
```

### Advanced Queries with Contentful and Gatsby

Explore your GraphQL schema and data with GraphiQL, a browser-based IDE available at http://localhost:8000/\_\_\_graphql during Gatsby development. This tool is essential for experimenting with queries and understanding the Contentful data structure in your project.

## Working with Images and Contentful

Contentful and Gatsby together provide a powerful combination for managing and displaying images. Leveraging Contentful's Images API and Gatsby's image handling capabilities, you can create responsive, optimized images for your site. Here's how to get the most out of this integration:

Please check out the [Readme](https://www.gatsbyjs.com/plugins/gatsby-plugin-image/) and [Reference Guide](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/) of `gatsby-plugin-image` for more detailed information about the possibilities of it.

### Displaying Responsive Images with `gatsby-plugin-image`

1.  **Install Required Plugins**: If you haven't already, install `gatsby-plugin-image`:

    ```shell
    npm install gatsby-plugin-image
    ```

2.  **Configure Gatsby**: If you haven't already, add it to your `gatsby-config.js`:

    ```javascript
    module.exports = {
      plugins: [
        `gatsby-plugin-image`,
        // ... other plugins ...
      ],
    }
    ```

3.  **Querying Images**: Use the `gatsbyImageData` resolver in your GraphQL queries to fetch image data on any Contentful Asset you have linked in a Contentful Field:

    ```graphql
    query contentfulPageQuery($slug: String!) {
      contentfulPage(slug: { eq: $slug }) {
        # Your other fields
        heroImage {
          gatsbyImageData(layout: FULL_WIDTH)
        }
      }
    }
    ```

4.  **Rendering Images**: Use the `<GatsbyImage>` component from `gatsby-plugin-image` to display the images in your components:

        ```jsx
        export default function ContentfulPageTemplate({ data }) {
          return (
            <div>
              {/* Render logic of the rest of your content type */}
              <GatsbyImage image={data.heroImage} alt="Your alt text" />
            </div>
          )
        }
        ```

        Replace `imageData` with the image data fetched from your GraphQL query.

    Certainly! Here's a rephrased version of the fifth step for using images with `gatsby-plugin-image`, aligned with the style and tone of the other steps:

5.  **Optimize Image Delivery Speed**: To enhance the performance of images served from Contentful's Image CDN, consider adding `preconnect` and `dns-prefetch` metatags to your website. These tags help accelerate the process of connecting to the CDN, leading to faster image rendering.

    Implement this optimization using Gatsby's [Head API](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/) in your global layout component:

    ```jsx
    export const Head = () => (
      <>
        <link
          rel="preconnect"
          href="https://images.ctfassets.net"
          crossorigin
        />
        <link rel="dns-prefetch" href="https://images.ctfassets.net" />
      </>
    )
    ```

    By incorporating these tags, you ensure a quicker DNS resolution and connection establishment with the Contentful Image CDN.

### Building Images on the Fly with `useContentfulImage`

For more dynamic image handling, `useContentfulImage` allows you to build images on the fly using Contentful's Image API:

1. **Use the Hook**: In your component, use the `useContentfulImage` hook to create an image dynamically:

   ```jsx
   import { useContentfulImage } from "gatsby-source-contentful"

   const MyComponent = () => {
     const dynamicImage = useContentfulImage({
       image: {
         url: "URL_of_the_image_on_Contentful",
         width: 800,
         height: 600,
       },
     })

     return <GatsbyImage image={dynamicImage} />
   }
   ```

   Replace `URL_of_the_image_on_Contentful` with the actual URL of the image you want to display. The hook accepts the same parameters as the `gatsbyImageData` field in your GraphQL queries.

2. **Customizing Images**: You can customize the images using various options such as `width`, `height`, `format`, `quality`, etc. These options align with [Contentful's Image API parameters](https://www.contentful.com/developers/docs/references/images-api/#/reference).

Can you help me to improve this section of my readme for a new version of the gatsby plugin gatsby-source-contentful?

## Leveraging Contentful Rich Text with Gatsby

The integration of Contentful's Rich Text fields in the `gatsby-source-contentful` plugin allows for a dynamic and rich content experience in Gatsby projects. This feature supports a variety of content compositions, including text, assets, and embedded entries, offering a powerful tool for developers and content creators alike.

The latest `gatsby-source-contentful` updates enhance this integration, closely aligning with Contentful's GraphQL API and the `@contentful/rich-text-react-renderer`.

### Querying Rich Text Content

The Rich Text field in Gatsby reflects the structure provided by Contentful's API.

Example GraphQL query for a Rich Text field:

```graphql
# This is a extended example, see below for a step-by-step introduction
{
  allContentfulContentTypePage {
    nodes {
      content {
        json
        links {
          assets {
            block {
              sys {
                id
              } # Required for link resolution
              gatsbyImageData(width: 200)
            }
            # There is also hyperlink {}
          }
          entries {
            block {
              # Generic props and fields
              __typename
              sys {
                id
                type
              } # Required for link resolution
              # Content Type specific fields
              ... on ContentfulContentTypeSomethingElse {
                body
              }
            }
            # Include inline and hyperlink as needed
          }
        }
      }
    }
  }
}
```

This query retrieves Rich Text JSON content (`json`) along with linked assets and entries, now organized under `assets` and `entries` within the `links` object.

### Basic Rich Text Rendering

To render Rich Text, use `gatsby-source-contentful`'s `renderRichText` function with a custom rendering setup for various embedded entries and assets:

```jsx
// src/templates/contentful-page-template.js
import { renderRichText } from "gatsby-source-contentful"
import { BLOCKS, MARKS } from "@contentful/rich-text-types"

// This factory provides a dynamic configuration for each rich text rendering
const makeOptions = ({ assetBlockMap, entryBlockMap, entryInlineMap }) => ({
  renderMark: {
    [MARKS.BOLD]: text => <strong>{text}</strong>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => <p>{children}</p>,
  },
})

export default function ContentfulPageTemplate({ data }) {
  return (
    <div>
      {/* Your other fields */}
      <div>{renderRichText(data.content, makeOptions)}</div>
    </div>
  )
}

export const pageQuery = graphql`
  query contentfulPageQuery($slug: String!) {
    contentfulPage(slug: { eq: $slug }) {
      title
      content {
        json
      }
    }
  }
`
```

### Embedding Images in Rich Text with Gatsby Plugin Image

For optimal image display, use `gatsby-plugin-image` to render embedded images:

```jsx
// src/templates/contentful-page-template.js
import { GatsbyImage } from "gatsby-plugin-image"

const makeOptions = ({ assetBlockMap, entryBlockMap, entryInlineMap }) => ({
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: node => {
      const asset = assetBlockMap.get(node?.data?.target?.sys.id)
      if (asset.gatsbyImageData) {
        return <GatsbyImage image={asset.gatsbyImageData} />
      }
    },
  },
})

// No changes are required to the ContentfulPageTemplate page component

export const pageQuery = graphql`
  query contentfulPageQuery($slug: String!) {
    contentfulPage(slug: { eq: $slug }) {
      title
      content {
        json
        links {
          assets {
            block {
              sys {
                # Make sure to query the id for link resolution
                id
              }
              # You have full access to gatsby-plugin-image
              gatsbyImageData(width: 200)
            }
          }
        }
      }
    }
  }
`
```

### Embedding Entries in Rich Text

Enhance the renderer to include other entries within Rich Text:

```jsx
// src/templates/contentful-page-template.js
import { GatsbyImage } from "gatsby-plugin-image"

const makeOptions = ({ assetBlockMap, entryBlockMap, entryInlineMap }) => ({
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: node => {
      const asset = assetBlockMap.get(node?.data?.target?.sys.id)
      if (asset.gatsbyImageData) {
        return <GatsbyImage image={asset.gatsbyImageData} />
      }
    },
    [BLOCKS.EMBEDDED_ENTRY]: node => {
      const entry = entryBlockMap.get(node?.data?.target?.sys.id)
      if (entry.__typename === "ContentfulContentTypeSomethingElse") {
        return <CustomComponent data={entry} />
      }
      // Add more conditions for other content types
    },
  },
})

// No changes are required to the ContentfulPageTemplate page component

export const pageQuery = graphql`
  query contentfulPageQuery($slug: String!) {
    contentfulPage(slug: { eq: $slug }) {
      title
      content {
        json
        links {
          assets {
            block {
              sys {
                id
              }
              gatsbyImageData(width: 200)
            }
          }
          entries {
            block {
              __typename
              sys {
                # These two fields are required,
                # make sure to include them in your sys
                id
                type
              }
              ... on ContentfulContentTypeSomethingElse {
                body
              }
            }
          }
        }
      }
    }
  }
`
```

### Further Contentful Rich Text resources

1. [Contentful Rich Text Field Documentation](https://www.contentful.com/developers/docs/concepts/rich-text/): A comprehensive guide to understanding and utilizing Rich Text fields in Contentful.
2. [Contentful Rich Text Rendering Library](https://github.com/contentful/rich-text): Explore the official Contentful library for rendering Rich Text content.
3. [Using Rich Text Fields in Gatsby](https://www.contentful.com/developers/docs/javascript/tutorials/rendering-contentful-rich-text-with-javascript/): An in-depth tutorial on rendering Rich Text fields with JavaScript, easily adaptable for Gatsby projects.

## Downloading Assets for Static Distribution

The `downloadLocal` feature is a valuable addition for managing Contentful assets, enabling local storage and access. This option can significantly enhance your project’s performance and flexibility in handling media files.

### Benefits of `downloadLocal`

1. **Improved Performance**: By caching assets locally, you reduce the dependency on external network requests to Contentful's CDN, potentially speeding up load times.
2. **Enhanced Image Processing**: Local assets allow for more control over image processing, enabling the use of advanced features in `gatsby-plugin-image`, such as generating AVIF formats.

### Trade-offs

However, consider the following trade-offs when enabling this feature:

- **Increased Build Times**: Downloading all assets during build time can increase the duration of your build process.
- **Larger Build Output Size**: The local storage of assets will increase the size of your build output.
- **Higher Bandwidth Usage**: Since images are not served from Contentful's CDN, your CDN might experience increased bandwidth usage.

### Enabling `downloadLocal`

To activate this feature, set the `downloadLocal` option to `true` in your `gatsby-config.js`:

```javascript
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: `your_space_id`,
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
        downloadLocal: true,
      },
    },
    // ... other plugins ...
  ],
}
```

### Updating GraphQL Queries

Once `downloadLocal` is enabled, your GraphQL queries will need adjustment to work with the locally downloaded assets:

- Query the `localFile` field on `ContentfulAsset` to access the local file.
- Utilize `gatsby-plugin-image` to process and display images.

Example Query:

```graphql
query MyQuery {
  contentfulContentTypePage {
    myContentfulAssetField {
      localFile {
        childImageSharp {
          gatsbyImageData(formats: AVIF)
        }
      }
    }
  }
}
```

### Troubleshooting

- **Cache Clearing**: If you encounter issues with this feature, start by clearing the Gatsby cache by executing `npx gatsby clear` in your root directory. This ensures fresh data from Contentful and re-downloads assets.

## Multi-Space Sourcing: Example for Sourcing from Multiple Contentful Spaces

To source content from multiple Contentful spaces within a Gatsby project, you can define multiple instances of the `gatsby-source-contentful` plugin in your `gatsby-config.js`. Each instance should be configured with its respective Contentful space ID and access token. Here's an example:

```javascript
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: `first_space_id`,
        accessToken: process.env.FIRST_SPACE_ACCESS_TOKEN,
      },
    },
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: `second_space_id`,
        accessToken: process.env.SECOND_SPACE_ACCESS_TOKEN,
      },
    },
    // ... additional plugin instances for other spaces ...
  ],
}
```

### Current Limitations

As of now, the `gatsby-source-contentful` plugin does not support the [Contentful feature for linking content across multiple spaces](https://www.contentful.com/help/link-content-across-multiple-spaces/). This means that while you can source content from different spaces, any links or references to content residing in separate spaces won't be resolved automatically. It's important to plan your content architecture accordingly, keeping this limitation in mind.
