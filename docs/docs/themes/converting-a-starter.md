---
title: Converting a Starter to a Theme
---

Gatsby themes are designed to be easy to create from an existing starter. Here we will walk you through the main steps of converting your theme to a starter.

## Prepare your `package.json`

To start converting your starter to a library, get started by updating your `package.json` to use the `gatsby-theme-*` naming convention. If your starter is `gatsby-starter-awesome-blog` you can update the name key to `gatsby-theme-awesome-blog` (and double check that it's available on [npm](https://npmjs.com).

Specify `gatsby`, `react`, and `react-dom` as `devDependencies` . It's preferable to add them as `peerDependencies` as well. This is needed so that end users can determine which versions they want and npm/yarn will be able to resolve them properly.

In addition to updating your dependencies you will need to declare a `main` that points to `gatsby-config.js`. This is needed so that when Gatsby attempts to resolve the theme it is pointed to the correct file by Node.

## Handling path resolution

One of the key difference between themes and starters is that a theme is no longer executed where the Gatsby CLI is being run since it's now a dependency. This often results in errors sourcing content and finding templates since they will look in the end user's directory.

In order to fix this, consider the following code that works as a starter:

```js
const createPosts = (createPage, createRedirect, edges) => {
  edges.forEach(({ node }, i) => {
    // ...

    createPage({
      path: pagePath,
      component: path.resolve(`./src/templates/post.js`),
      context: {
        id: node.id,
        prev,
        next,
      },
    })
  })
}
```

Since `path.resolve` is being used we result in `src/templates/post.js` rather than `node_modules/gatsby-theme-awesome-blog/src/templates/post.js`. In order to fix this we can use `require.resolve` which will look relative to the theme so the correct template is found.

```js
const createPosts = (createPage, createRedirect, edges) => {
  edges.forEach(({ node }, i) => {
    // ...

    createPage({
      path: pagePath,
      component: require.resolve(`./src/templates/post.js`),
      context: {
        id: node.id,
        prev,
        next,
      },
    })
  })
}
```

There may be other locations where you will need to update the path resolution like your `gatsby-config.js` as well.

## Move content to the starter and source from the theme
