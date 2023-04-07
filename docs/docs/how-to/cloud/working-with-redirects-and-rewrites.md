---
title: "Working with Redirects and Rewrites"
description: "Learn how to leverage redirects, rewrites, and reverse proxies in Gatsby Cloud"
---

## Introduction

Redirects are settings in the network layer that allow you to route traffic from one url path to another with little to no disruption.

For instance, while rebuilding your cooking blog, you might want to move all of your recipes from their old path of `blog/recipes` to a new path of recipes. To make sure that all the existing links to your recipes still work, you would need a way to redirect your users from `blog/recipes/mouthwatering-lasagna` to `recipes/mouthwatering-lasagna`. No one wants to lose access to such a, well, mouthwatering recipe.

## Prerequisites

- If your Gatsby project doesn't already have a `gatsby-node` file, add one at that top level of your project (alongside your `gatsby-config`).

## Directions

1. In `gatsby-node.js`, export the `createPages` method and use the `createRedirects` action to generate any redirects that you want to add. Here's an example showing the lasagna recipe above:

```js:title=gatsby-node.js
exports.createPages = async ({ graphql, actions }) => {
  const { createRedirect } = actions

  createRedirect({
    fromPath: `/blog/recipes/mouthwatering-lasagna`,
    toPath: `/recipes/mouthwatering-lasagna`,
  })
}
```

2. Once you've made these changes and deployed the changes through Gatsby Cloud, you should be able to test your changes once the CDN cache has been purged.

**Please note:** Most of the examples below will omit the `createPages` wrapper for the sake of brevity. However, the `createRedirect` examples will still always need to be wrapped with it like shown above.

## Advanced use cases

### Wildcard Path Redirects

In the example above, you've explicitly redirected one of your recipe urls, and after adding a few others, you realize that you won't have time to get all the old urls. So you decide that any other url that uses your old path `blog/recipes/*` should just be redirected to the new `/recipes` path. Here's how you'd handle that:

```js:title=gatsby-node.js
createRedirect({
  fromPath: `/blog/recipes/mouthwatering-lasagna`,
  toPath: `/recipes/mouthwatering-lasagna`,
})

// All your other redirects

createRedirect({
  fromPath: `/blog/recipes/*`,
  toPath: `/recipes`,
})
```

### Splat redirects

Extending the wildcard example above, you may have a high degree confidence that all of your old recipes that lived at `/blog/recipes` have been migrated to `/recipe`. In that case, you can use a `*` marker in the toPath to indicate that you want the redirect to include everything after the base url. In that case `/blog/recipes/any-awesome-url-path` would become `/recipes/any-awesome-url-path`. Here's how you'd handle that:

```js:title=gatsby-node.js
createRedirect({
  fromPath: `/blog/recipes/*`,
  toPath: `/recipes/*`,
})
```

### Country based redirects

If your site has multi-national pages, Gatsby provides the ability of redirecting based in the country that the request is made. We use a Two-letter country code based on the regional indicator symbol standard to define the country you might want to redirect. If you would like a certain page redirected to its language equivalent you can use the conditions: `{ country: ""}` key in `createRedirect`. `country` can either be a string or an array of strings.

```js:title=gatsby-node.js
createRedirect({
  fromPath: `/blog`,
  toPath: `/italian/blog`,
  conditions: {
    country: `it`
  }
})

createRedirect({
  fromPath: `/blog`,
  toPath: `/english/blog`,
  conditions: {
    country: [`us`, `gb`]
  }
})
```

You can also return status's 404,403,451,500 if you would like to have non redirect pages returned.
The example below will return a 404 page for all users located in the United States (us).

```js:title=gatsby-node.js
createRedirect({
  fromPath: `/*`,
  toPath: `/`,
  statusCode: 404,
  conditions: {
    country: `us`
  }
})
```

The next example will return 451 page users located in the United States (us) and Canada (ca) from all paths. Essentially, all hits from US and CA will be sent to a 451.

```js:title=gatsby-node.js
createRedirect({
  fromPath: `/*`,
  toPath: `/`,
  statusCode: 451,
  conditions: {
    country: [`us`, `ca`],
  }
})
```

If you have defined a custom status page: 404, 403, 451, 500, that custom page will be rendered and sent to your users. If you haven’t defined a custom status page, Gatsby Cloud will return a generic status page. Only if you give `createRedirect` a redirect statusCode: 3XX will it return a redirect to the user.

## Query param redirects

Query params allows you to further control URL matches. For example, `/param?id=7redirects` to `/gatsby_file.pdf`

```js:title=gatsby-node.js
createRedirect({
  fromPath: `/param?id=7`,
  toPath: `/gatsby_file.pdf`,
})
```

A more complex example is described here, where we will redirect from `/param?id=id` to `/param/:id`

```js:title=gatsby-node.js
createRedirect({
  fromPath: `/param?id=:id`,
  toPath: `/param/:id`,
})
```

### Language based redirects

Language based redirects use the Accept-Language header in a request to match a route and perform a redirect. This allows you to redirect your site to the site that will match your user's language. We use the Two-letter code identifier defined by ISO 639-1. The example below will redirect users with en `Accept-Language` header to `/en/book_list` and users with zh to `/zh/book_list` when they reach out to `/book_list`

```js:title=gatsby-node.js
createRedirect({
  fromPath: `/book_list`,
  toPath: `/en/book_list`,
  conditions: {
    language: [`en`],
  },
})

createRedirect({
  fromPath: `/book_list/*`,
  toPath: `/zh/book_list/*`,
  conditions: {
    language: [`zh`],
  },
})
```

### Tip: Using a static file to manage redirects

You might want to simplify managing your redirects by using a static file to store redirects. Storing that file in your Gatsby project can simplify your code and make it easier fo other contributors to add more redirects.

At Gatsby, we use a YAML file to store our redirects so that the whole team can easily add new redirects without having to change the gatsby-node file. You could also use a JSON file if your team is comfortable with that.

Here's how you could do it for our recipes site using a JSON file:

```json:title=redirects.json
[
  {
    "fromPath": "/blog/recipes/mouthwatering-lasagna",
    "toPath": "/recipes/mouthwatering-lasagna"
  },
  {
    "fromPath": "/blog/recipes/*",
    "toPath": "/recipes/"
  }
]
```

```js:title=gatsby-node.js
const redirects = require("./redirects.json")

exports.createPages = async ({ graphql, actions }) => {
  const { createRedirect } = actions

  redirects.forEach(redirect =>
    createRedirect({
      fromPath: redirect.fromPath,
      toPath: redirect.toPath,
    })
  )
}
```

### Rewrites and reverse proxies

Whenever you set a statusCode of 200 on createRedirect you create a rewrite or a reverse proxy. If your toPath is a page that already exists as part of your Gatsby site it will render that page. If the toPath is an external URL, then we will proxy that request. Maybe you have one site sitting in front of multiple other domains and you want to use rewrites to proxy the traffic. Imagine awesomesite.com was actually several different sites. Docs, dashboard, and marketing, for example. You could have all traffic start out routed to awesomesite.com and then rewrite to the other sites as needed. Such as:

```js:title=gatsby-node.js
exports.createPages = async ({ actions }) => {
  const { createRedirect } = actions

  createRedirect({
    fromPath: `/docs/*`,
    toPath: `https://www.awesomesite.com/docs/*`,
    statusCode: 200,
  })
}
```

The important part here is that you have an external toPath with a complete URL and a statusCode of 200 to indicate the rewrite.

### Current limitations

- Infinitely looping rules, where the “from” and “to” resolve to the same location, are incorrect and will be ignored.
- We limit internal rewrites to one “hop” — you cannot proxy from Gatsby Site A to Gatsby Site B to Gatsby Site C in a single request.
- A proxy request will timeout after 20 seconds
