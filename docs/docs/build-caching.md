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

### SET
`cache.set(key: String, obj: Object): Promise<any>`

### `get`
`cache.get(key: String): Promise<Object>`



## Custom plugin – example

In your plugin's `gatsby-node.js` file, on the [Gatsby api](/docs/node-apis/) you wish to utilize cache in, include `cache` as an argument; eg.

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

**Note:** Adding an option such as `enableCaching` to your plugin's option could be used to toggle between using caching or not.


## Clearing cache

Since cache files are stored within the `/.cache/` directory, simply deleting it will clear all cache.
Otherwise it will also be cleared when there are changes made to you `gatsby-config.js` file


## Using with Netlify

In order to make use of any caching on Netlify you need to include the [gatsby-plugin-netlify-cache](/packages/gatsby-plugin-netlify-cache/) plugin.
