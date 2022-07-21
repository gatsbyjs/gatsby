---
title: Adding an SEO Component
examples:
  - label: Using Gatsby Head
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-gatsby-head"
---

Adding metadata to pages (such as a title or description) is key in helping search engines like Google understand your content, and decide when to surface it in search results. This information also gets displayed when someone shares your website, e.g. on Twitter. Using the [Gatsby Head API](/docs/reference/built-in-components/gatsby-head/) you can change the [document head](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head) of your pages.

Gatsby automatically provides drop-in support for server rendering of metadata and it'll be added to the static HTML pages that Gatsby produces. This helps your site rank and perform better in search engines.

By the end of this guide you'll have a SEO component that you can use in your pages to define metadata.

## Prerequisites

- A Gatsby project set up with `gatsby@4.19.0` or later. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))

## Directions

### Add `siteMetadata`

The `siteMetadata` section of the `gatsby-config` file is available in the GraphQL datalayer. It's considered best practice to place your site metadata there. The `siteUrl` should be the URL of your deployed target (e.g. production domain) so that later metatags can point to absolute URLs.

Add the following keys to your configuration:

```js:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `Using Gatsby Head`,
    description: `Example project for the Gatsby Head API`,
    twitterUsername: `@gatsbyjs`,
    image: `/gatsby-icon.png`,
    siteUrl: `https://www.yourdomain.tld`,
  },
}
```

You can always extend the `siteMetadata` object and subsequently customize the `<SEO />` component to your liking. When defining the `image` like above, make sure that you have an image with the same name and file extension in the [`static` folder](/docs/how-to/images-and-media/static-folder/).

### Create a `useSiteMetadata` hook

Since you need to use the information that you just placed inside `siteMetadata` with the SEO component, you can create a custom React hook called `useSiteMetadata` to fetch that information. This way you can reference these values in other places, too.

Create a new file called `use-site-metadata.jsx` in `src/hooks`. Query the information from the `site` interface through a [useStaticQuery hook](/docs/how-to/querying-data/use-static-query/):

```jsx:title=src/hooks/use-site-metadata.jsx
import { graphql, useStaticQuery } from "gatsby"

export const useSiteMetadata = () => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          description
          twitterUsername
          image
          siteUrl
        }
      }
    }
  `)

  return data.site.siteMetadata
}
```

You'll be able to directly get `title`, `description`, etc. from this hook.

### SEO component

Create a new file called `seo.jsx` in `src/components`. Your SEO component will receive things like `title`, `description`, `children`, etc. as props and the information from your `useSiteMetadata` hook is used as a fallback if no props are passed. For things that won't change on a per-page basis (e.g. the Twitter username) the `useSiteMetadata` hook data is directly used.

Here's the complete SEO component:

```jsx:title=src/components/seo.jsx
import React from "react"
import { useSiteMetadata } from "../hooks/use-site-metadata"

export const SEO = ({ title, description, pathname, children }) => {
  const { title: defaultTitle, description: defaultDescription, image, siteUrl, twitterUsername } = useSiteMetadata()

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: `${siteUrl}${image}`,
    url: `${siteUrl}${pathname || ``}`,
    twitterUsername,
  }

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="twitter:creator" content={seo.twitterUsername} />
      <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>👤</text></svg>" />
      {children}
    </>
  )
}
```

All props are optional since each value has a default value or fallback. The `pathname` prop will be the relative path of the page so you need to construct an absolute URL with `siteUrl`.

You can extend the `seo` object with other keys, but it's recommended to follow the pattern of `prop || fallback` so that no value is `undefined`.

### Usage in pages

When you just want to use the default values of your SEO component (e.g. on the homepage) you can import it and render it without any props:

```jsx:title=src/pages/index.jsx
import React from "react"
import { SEO } from "../components/seo"

const IndexPage = () => {
  return (
    <main>
      Hello World
    </main>
  )
}

export default IndexPage

// highlight-start
export const Head = () => (
  <SEO />
)
// highlight-end
```

To override individual values use the defined props on the SEO component:

```jsx:title=src/pages/page-2.jsx
import React from "react"
import { SEO } from "../components/seo"

const SecondPage = () => {
  return (
    <main>
      Hello World
    </main>
  )
}

export default SecondPage

// highlight-start
export const Head = () => (
  <SEO title="Page Two" />
)
// highlight-end
```

To add one-off metatags to a page, provide `children` to the SEO component:

```jsx:title=src/pages/one-off.jsx
import React from "react"
import { SEO } from "../components/seo"

const OneOffPage = () => {
  return (
    <main>
      Hello World
    </main>
  )
}

export default OneOffPage

// highlight-start
export const Head = () => (
  <SEO title="One Off Page">
    <script type="application/ld+json">{JSON.stringify({})}</script>
  </SEO>
)
// highlight-end
```

## Additional Information

Data block `<script>` tags such as `<script type="application/ld+json">` can go in the `Head` function, but dynamic scripts are better loaded with the [Gatsby Script Component](/docs/reference/built-in-components/gatsby-script/) in your pages or components.

If you want to edit the `<html>` or `<body>`, please read the [Gatsby Head reference guide](/docs/reference/built-in-components/gatsby-head/#editing-html-and-body).

### Rich Snippets

Google uses structured data that it finds on the web to understand the content of the page, as well as to gather information about the web and the world in general.

For example, here is a structured data snippet in the [JSON-LD format](https://developers.google.com/search/docs/guides/intro-structured-data) (JavaScript Object Notation for Linked Data), that might appear on the contact page of a company called Spooky Technologies, describing their contact information:

```jsx
<script type="application/ld+json">
  {`
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "url": "https://www.spookytech.com",
      "name": "Spooky technologies",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+5-601-785-8543",
        "contactType": "Customer Support"
      }
    }
  `}
</script>
```

You can use the [Rich Results Test](https://search.google.com/test/rich-results) from Google during local development to check if you pass valid information.

After deployment, their [Rich result status reports](https://support.google.com/webmasters/answer/7552505?hl=en) may help to monitor the health of your pages and mitigate any templating or serving issues.

## Additional Resources

- [Using Gatsby Head with TypeScript](/docs/how-to/custom-configuration/typescript/#gatsby-head-api)
- [Gatsby Head Reference Guide](/docs/reference/built-in-components/gatsby-head/)
- [Gatsby Script Component](/docs/reference/built-in-components/gatsby-script/)
- [Blog posts about SEO in Gatsby](/blog/tags/seo/)
- [Audit with Lighthouse](/docs/how-to/performance/audit-with-lighthouse/)
