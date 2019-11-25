---
title: Build Time and Client Runtime Data Fetching
---

import ClientDataExample from "../../www/src/components/client-data-example.js"

This guide demonstrates how to fetch data at both [_build time_](/docs/glossary#build) and [_runtime_](/docs/glossary#runtime) in Gatsby.

## The benefits of the hybrid nature of Gatsby apps

Because Gatsby is capable of generating content at build time as well as making calls to external services at runtime, you can make [hybrid pages](/docs/adding-app-and-website-functionality/#hybrid-app-pages) that take advantage of the benefits of static content as well as dynamic content. You can gather data ahead of time while the site builds so that when a user loads your page the data is already available. Then, for data that is of a more dynamic nature, you can request data from another service like an API with `fetch` or a library like `axios`.

This combination of static/dynamic is possible through React [hydration](/docs/glossary#hydration), which means that Gatsby (through React.js) builds static files to render server-side. When Gatsby's script bundle downloads and executes in the browser, it preserves the HTML markup built by Gatsby and turns the site into a full React web application that can manipulate the [DOM](/docs/glossary#dom). The result of this process creates fast loading pages and a nice user experience.

> To understand how statically generated content can turn into a React app, refer to the [Understanding React Hydration guide](/docs/react-hydration)

Compiling pages at build time is useful when your website content won't change often, or when triggering a build process to recompile works fine. However, some websites with more dynamic needs require a [client-side](/docs/glossary#client-side) runtime to handle constantly changing content after the page loads, like a chat widget, user upvotes, or an email client web application.

## Combining build time and client runtime data

To illustrate this combination of build time and runtime data, this guide uses code from a [small example site](https://gatsby-data-fetching.netlify.com). It uses the [`gatsby-source-graphql`](/packages/gatsby-source-graphql/) plugin to fetch data from the GitHub API at build time for static content like the name and url to a repository, and the [`fetch` API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to retrieve more dynamic data from the GitHub API on the [client-side](/docs/glossary#client-side) like star counts when the page loads in the browser.

> Check out the code from the [full example here](https://github.com/gatsbyjs/gatsby/tree/master/examples/data-fetching).

### Fetching data at build time

For fetching data at build time, you can create an integration with a third-party system by sourcing data in your `gatsby-node` file and creating nodes for the GraphQL layer that become queryable in pages. This is the same method that source plugins implement to [source data](/docs/content-and-data/) while the site builds. You can read about that process in the [Creating a Source Plugin guide](/docs/creating-a-source-plugin/).

> This process of fetching data at build time and creating pages from the data is [covered in more depth in the tutorial](/tutorial/part-five/) as well as the docs for [creatiing pages from data programmatically](/docs/programmatically-create-pages-from-data/).

#### Source data to be queried at build time

The simplest way to source data is to take advantage of an existing source plugin. To install the `gatsby-source-graphql`:

```shell
npm install --save gatsby-source-graphql
```

Then, add the plugin to your `gatsby-config`:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-graphql`,
      options: {
        typeName: `GitHub`,
        fieldName: `github`,
        url: `https://api.github.com/graphql`,
        headers: {
          Authorization: `Bearer your-github-token`,
        },
      },
    },
  ],
}
```

> Because the GitHub GraphQL API requires you to be authenticated to make requests, you need to create a token that you would replace in the header for Authorization that says "your-github-token". You can [secure your key using environment variables](/docs/environment-variables/) if you're pushing code to a public repository.

Source plugins take advantage of the [`sourceNodes` API](/docs/node-apis/#sourceNodes) and the [`createNode` action](/docs/actions/#createNode) provided by Gatsby to make your data queryable during the build process.

#### Writing a query to gather the static data needed for a page

With the source plugin installed and added to your config, you can write a [static query](/docs/use-static-query/) that will pull the data from GraphQL API and will retrieve the necessary data while building the site.

```jsx:title=src/pages/index.js
import React from "react"
import { graphql, useStaticQuery } from "gatsby" // highlight-line

const IndexPage = () => {
  // highlight-start
  const gatsbyRepoData = useStaticQuery(graphql`
    query {
      github {
        repository(name: "gatsby", owner: "gatsbyjs") {
          id
          nameWithOwner
          url
        }
      }
    }
  `)
  // highlight-end

  return (
    <section>
      <p>
        Build Time Data: Gatsby repo{` `}
        <a href="gatsbyRepoData.github.repository.nameWithOwner.url">
          {gatsbyRepoData.github.repository.nameWithOwner} // highlight-line
        </a>
      </p>
    </section>
  )
}

export default IndexPage
```

### Fetching data at runtime

For fetching data at runtime, you can use any method to retrieve data that you would use in a regular React app.

#### Retrieving data with the `fetch` API

The `fetch` API is a modern implementation of the older, well-supported `XMLHttpRequest`.

With the `useState` and `useEffect` hooks from React, you can query for the data once when the page loads, and save the data returned to a variable called `starsCount`. Every time the page is refreshed, `fetch` will go to the GitHub API to retrieve the most up-to-date version of the data.

```jsx:title=src/pages/index.js
import React, { useState, useEffect } from "react" // highlight-line
import { graphql, useStaticQuery } from "gatsby"

const IndexPage = () => {
  const gatsbyRepoData = useStaticQuery(graphql`
    query {
      github {
        repository(name: "gatsby", owner: "gatsbyjs") {
          id
          nameWithOwner
          url
        }
      }
    }
  `)
  // highlight-start
  const [starsCount, setStarsCount] = useState(0)
  useEffect(() => {
    const fetchData = async () => {
      // get data from GitHub api
      const result = await fetch(`https://api.github.com/repos/gatsbyjs/gatsby`)
      // parse JSON from request
      const resultData = await result.json()
      // set data for the number of stars
      setStarsCount(resultData.stargazers_count)
    }
    fetchData()
  }, [])
  // highlight-end

  return (
    <section>
      <p>
        Build Time Data: Gatsby repo{` `}
        <a href="gatsbyRepoData.github.repository.nameWithOwner.url">
          {gatsbyRepoData.github.repository.nameWithOwner}
        </a>
      </p>
      <p>Runtime Data: Star count for the Gatsby repo {starsCount}</p> // highlight-line
    </section>
  )
}

export default IndexPage
```

Here's an example of what this runtime example being used on this page (which is also a Gatsby app)!

<ClientDataExample />

## Other resources

You may be interested to check out other projects (both used in production and proof of concepts) that illustrate this usage:

- [Live example](https://gatsby-data-fetching.netlify.com) of the code used in this guide
- [Gatsby store](https://github.com/gatsbyjs/store.gatsbyjs.org): with static product pages at build time and client-side interactions for ecommerce features
- [Gatsby mail](https://github.com/DSchau/gatsby-mail): a client-side email application
- [Example repo fetching data using Apollo](https://github.com/jlengstorf/gatsby-with-apollo)
