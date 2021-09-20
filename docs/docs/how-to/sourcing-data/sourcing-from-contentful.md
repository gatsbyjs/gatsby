---
title: Sourcing from Contentful
examples:
  - label: Using Contentful
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-contentful"
---

## What is Contentful? Why choose it?

[Contentful](https://www.contentful.com/) is a headless Content Management System (CMS) that lets you organize your content into what could be called “modules,” or little bits of data that can be rearranged to appear nicely on mobile devices, tablets, computers, virtual reality devices (maybe someday?) and more.

Actually, the way Contentful handles bits of content means that you can push content out when new technology develops without having to redesign, rewrite, or rethink all of it for a new format.

## Prerequisites

This guide assumes that you have a Gatsby project set up. If you need to set up a project, head to the [Quick Start guide](/docs/quick-start), then come back.

## Pulling data in and pushing data out

If you have a JSON file with content in it, you could pull it into Contentful using [contentful-import](https://github.com/contentful/contentful-import). If you are creating new content, you don't need this and can create content straight in Contentful.

If you do create content directly in Contentful, make sure to name your fields in a way you can remember when you create GraphQL queries. If you use GraphiQL, it can suggest fields to you, but this will only help if the field names are clear and memorable.

As far as pushing data out to your site goes, we suggest to you to use this fantastic plugin [gatsby-source-contentful](https://www.npmjs.com/package/gatsby-source-contentful), to use it, you'd need to have the `spaceId` and the `accessToken` from Contentful.

## Install

```shell
npm install gatsby-source-contentful
```

## How to use

### With the Delivery API

```javascript:title=gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-contentful`,
    options: {
      spaceId: `your_space_id_grab_it_from_contentful`,
      accessToken: `your_token_id_grab_it_from_contentful`,
    },
  },
]
```

### With the Preview API

```javascript:title=gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-contentful`,
    options: {
      spaceId: `your_space_id_grab_it_from_contentful`,
      accessToken: `your_token_id_grab_it_from_contentful`,
      host: `preview.contentful.com`,
    },
  },
]
```

## Examples of Gatsby + Contentful websites

The Gatsby blog has [several examples of individuals and companies](/blog/tags/contentful) that chose to build with Gatsby and Contentful.

<CloudCallout>
  For an automatic integration using Contentful with Gatsby:
</CloudCallout>
