---
title: Converting a Starter to a Theme
---

Gatsby themes are designed to be easy to create from an existing starter. Here we will walk you through the main steps of converting your starter to a theme.

## Prepare Your `package.json`

To start converting your starter to a library, get started by updating your `package.json` to use the `gatsby-theme-*` naming convention. If your starter is `gatsby-starter-awesome-blog` you can update the name key to `gatsby-theme-awesome-blog` (and double check that it's available on [npm](https://npmjs.com)).

Specify `gatsby`, `react`, and `react-dom` as `devDependencies` . It's preferable to add them as `peerDependencies` as well. This helps end users determine which versions they want and npm/yarn will be able to resolve them properly.

In addition to updating your dependencies, you will need to create an `index.js` file in the root of your project. This allows Gatsby to resolve the theme since Node automatically looks for `index.js`.

## Handling path resolution

One of the key differences between themes and starters is that a theme is no longer executed when the Gatsby CLI is being run since it's now a dependency. This often results in errors sourcing content and finding templates since they will look in the end user's directory.

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

Since `path.resolve` is being used the starter will resolve `src/templates/post.js` rather than `node_modules/gatsby-theme-awesome-blog/src/templates/post.js`. In order to fix this you can use `require.resolve` which will look relative to the theme so the correct template is found.

```js
const createPosts = (createPage, createRedirect, edges) => {
  edges.forEach(({ node }, i) => {
    // ...

    createPage({
      path: pagePath,
      component: require.resolve(`./src/templates/post.js`), // highlight-line
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

## Sourcing pages

If your theme provides pages for things like the blog post index and a homepage, you will need to source them.
Gatsby will only look in the relative `src/pages` directory when `gatsby develop` is run.
You will need to use the [`gatsby-plugin-page-creator`](/packages/gatsby-plugin-page-creator/).

```shell
npm install --save gatsby-plugin-page-creator
```

Then, tell the plugin to look in your theme's `src/pages` directory.

```js:title=gatsby-config.js
{
  resolve: `gatsby-plugin-page-creator`,
  options: {
    path: path.join(__dirname, `src`, `pages`),
  },
},
```

## Publishing to npm

In order to allow others to install your theme you will need to publish it to npm. If this is new for you, learn how [to publish to npm](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry).

From the root of your newly created theme run `npm publish`.

Once you've published, you can install the theme in your starter.

```shell
npm install --save gatsby-theme-NAME
```

## Walkthrough

- [Jason Lengstorf converts an existing Gatsby site to a theme](https://www.youtube.com/watch?v=NkW06HK9-aY)
