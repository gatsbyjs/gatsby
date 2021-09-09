---
title: Using Server Side Rendering (SSR)
---

## Introduction

Server Side Rendering (SSR) is one of [Gatsby's rendering options](#link-to-rendering-options-doc) and allows you to pre-render a page with data that is fetched when a user visits the page. While it is recommended to use [Static Site Generation (SSG)](#link) or [Deferred Static Generation (DSG)](#) over SSR you might have use cases that require it, e.g. dynamic personalization, authenticated data, A/B testing, configurability based on location or user data. If you don't need to pre-render the page you can use [client-only routes](/docs/how-to/routing/client-only-routes-and-user-authentication/).

In this guide, you'll learn how to use `getServerData`, fetch an image from a dog API, and display it dynamically on the page.

For full documentation on all options, see [the reference guide](#shared-rendering-options-guide).

## Prerequisites

Before you begin, you should already have:

- An existing Gatsby site. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))

## Directions

The general process for using SSR looks like this:

1. Adding `getServerData` function
2. Requesting data inside `getServerData` & displaying it

To follow this guide, create a new page at `src/pages/ssr.js`.

### Step 1: Adding `getServerData` function

By adding a `getServerData` function to your page you tell Gatsby to choose the SSR rendering option. The function can be async. Add it to your new page:

```js:title=src/pages/ssr.js
import * as React from "react"

const SSRPage = () => (
  <main>
    <h1>SSR Page with Dogs</h1>
  </main>
)

export default SSRPage

export async function getServerData() {} // highlight-line
```

### Step 2: Requesting data inside `getServerData` & displaying it

Inside the `getServerData` function you can execute anything you want but you need to return an object containing `props`. You then can (similarily to `data` for page queries) access the data as a `serverData` prop inside your page component.

Use `fetch` to pull data from the [dog.ceo API](https://dog.ceo/):

```js:title=src/pages/ssr.js
// The rest of the page

export async function getServerData() {
  try {
    const res = await fetch(`https://dog.ceo/api/breeds/image/random`)

    if (!res.ok) {
      throw new Error(`Response failed`)
    }

    return {
      props: await res.json(),
    }
  } catch (error) {
    return {
      headers: {
        status: 500,
      },
      props: {}
    }
  }
}
```

Every time a user visits the page now the URL `https://dog.ceo/api/breeds/image/random` is requested and the response available as `serverData` to the page. The API gives back the response in the shape of `{ "message": "img-url", "status": "" }`.

Display the image using the data from the API now:

```js:title=src/pages/ssr.js
import * as React from "react"

const SSRPage = ({ serverData }) => ( // highlight-line
  <main>
    <h1>SSR Page with Dogs</h1>
    {/* highlight-next-line */}
    <img alt="Happy dog" src={serverData.message} />
  </main>
)

export default SSRPage

export async function getServerData() {
  try {
    const res = await fetch(`https://dog.ceo/api/breeds/image/random`)

    if (!res.ok) {
      throw new Error(`Response failed`)
    }

    return {
      props: await res.json(),
    }
  } catch (error) {
    return {
      headers: {
        status: 500,
      },
      props: {}
    }
  }
}
```

If you haven't already, start `gatsby develop` and visit `http://localhost:8000/ssr`. Refreshing the page should give you a new dog image on every refresh.

## Additional Resources

- [API Reference guide](#shared-rendering-options-guide)
- [Link to GatsbyCamp Video?](#)
