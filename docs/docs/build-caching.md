---
title: Build Caching
issue: https://github.com/gatsbyjs/gatsby/issues/8103
---

Plugins can cache data as json objects and retrieve them on consecutive builds.

Data is stored in the `.cache` directory relative to your project root.


## The cache api

The cache API is passed to [Gatsby's Node APIs](/docs/node-apis/), which is typically implemented by plugins.
```
exports.onPostBootstrap = async function({ cache, store, graphql }) {
```


The two functions you would want to use are:

### `set`
`cache.set(key: String, obj: Object): Promise<any>`

### `get`
`cache.get(key: String): Promise<any>`



## Plugin Example

In your plugin's `gatsby-node.js` file, you can access the `cache` argument like so:

```
exports.onPostBuild = async function(
  { cache, store, graphql },
  { query } ) {
    const cacheKey = 'some-key-name';
    let obj = await cache.get(cacheKey);

    if (!obj) {
      obj = { created: Date.now() };      
      const data = await graphql(query);
      obj.data = data;
    } else if (Date.now() > obj.lastChecked + 3600000) {
      /* Reload after a day */
      const data = await graphql(query);
      obj.data = data;
    }
    
    obj.lastChecked = Date.now();    

    await cache.set(cacheKey, obj);
    
    /* Do something with data ... */
  }
```


## Clearing cache

Since cache files are stored within the `/.cache/` directory, simply deleting it will clear all cache.
The cache is also invalidated by Gatsby in a few cases, specifically:

- If `package.json` changes, for example a dependency is updated or added
- If `gatsby-config.js` changes, for example a plugin is added or modified
- If `gatsby-node.js` changes, for example if you invoke a new Node API, or change a `createPage` call
