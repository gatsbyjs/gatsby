---
title: Building the JavaScript App
---

Gatsby is a static site generator. It generates your site's HTML pages, but also creates a JavaScript runtime that takes over in the browser once the initial HTML has loaded. This enables other pages to load instantaneously. Read on to find out how that runtime is generated.

## Webpack config

The [build-javascript.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/commands/build-javascript.js) Gatsby file is the entrypoint to this section. It dynamically creates a webpack configuration by calling [webpack.config.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/webpack.config.js). This can produce radically different configs depending on the stage. E.g `build-javascript`, `build-html`, `develop`, or `develop-html`. This section deals with the `build-javascript` stage.

The config is quite large, but here are some of the important values in the final output.

```javascript
{
  entry: {
    app: ".cache/production-app"
  },
  output: {
    // e.g app-2e49587d85e03a033f58.js
    filename: `[name]-[contenthash].js`,
    // e.g component---src-blog-2-js-cebc3ae7596cbb5b0951.js
    chunkFilename: `[name]-[contenthash].js`,
    path: `/public`,
    publicPath: `/`
  },
  target: `web`,
  mode: `production`,
  node: {
    ___filename: true
  },
  optimization: {
    runtimeChunk: {
      // e.g webpack-runtime-e402cdceeae5fad2aa61.js
      name: `webpack-runtime`
    },
    splitChunks: false
  }
  plugins: [
    // A custom webpack plugin that implements logic to write out chunk-map.json and webpack.stats.json
    plugins.extractStats(),
  ]
}
```

There's a lot going on here. And this is just a sample of the output that doesn't include the loaders, rules, etc. We won't go over everything here, but most of it is geared towards proper code splitting of your application.

Once Webpack has finished compilation, it will have produced a few key types of bundles:

##### app-[contenthash].js

This is bundle produced from [production-app.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/cache-dir/production-app.js) which we'll mostly be discussing in this section. It is configured in [webpack entry](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/webpack.config.js#L130)

##### webpack-runtime-[contenthash].js

This contains the small [webpack-runtime](https://webpack.js.org/concepts/manifest/#runtime) as a separate bundle (configured in `optimization` section). In practice, the app and webpack-runtime are always needed together.

##### component---[name]-[contenthash].js

This is a separate bundle for each page. The mechanics for how these are split off from the main production app are covered in [Code Splitting](/docs/how-code-splitting-works/).

## production-app.js

This is the entrypoint to webpack that outputs `app-[contenthash].js` bundle. It is responsible for navigation and page loading once the initial HTML has been loaded.

### First load

To show how `production-app` works, let's imagine that we've just refreshed the browser on our site's `/blog/2` page. The HTML loads immediately, painting our page quickly. It includes a CDATA section which injects page information into the `window` object so it's available in our JavaScript code (inserted during [Page HTML Generation](/docs/html-generation/#6-inject-page-info-to-cdata)).

```html
/*
<![
  CDATA[ */
    window.page={
      "path": "/blog/2.js",
      "componentChunkName": "component---src-blog-2-js",
      jsonName": "blog-2-995"
    };
    window.dataPath="621/path---blog-2-995-a74-dwfQIanOJGe2gi27a9CLKHjamc";
  */ ]
]>
*/
```

Then, the app, webpack-runtime, component, and data json bundles are loaded via `<link>` and `<script>` (see [HTML tag generation](/docs/html-generation/#5-add-preload-link-and-script-tags)). Now, our `production-app` code starts running.

### onClientEntry (api-runner-browser)

The first thing our app does is run the [onClientEntry](/docs/browser-apis/#onClientEntry) browser API. This allows plugins to perform any operations before we hit the rest of the page loading logic. For example [gatsby-plugin-glamor](/packages/gatsby-plugin-glamor/) will call rehydrate.

It's worth noting that the browser API runner is completely different to `api-runner-node` which is explained in [How APIs/Plugins Are Run](/docs/how-plugins-apis-are-run/). `api-runner-node` runs in Node.js and has to deal with complex server based execution paths. Whereas running APIs on the browser is simply a matter of iterating through the site's registered browser plugins and running them one after the other (see [api-runner-browser.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/cache-dir/api-runner-browser.js#L9)).

One thing to note is that it gets the list of plugins from `./cache/api-runner-browser-plugins.js`, which is generated [early in bootstrap](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/bootstrap/index.js#L289).

### DOM Hydration

[hydrate()](https://reactjs.org/docs/react-dom.html#hydrate) is a [ReactDOM](https://reactjs.org/docs/react-dom.html) function which is the same as `render()`, except that instead of generating a new DOM tree and inserting it into the document, it expects that a React DOM already exists with exactly the same structure as the React Model. It therefore descends this tree and attaches the appropriate event listeners to it so that it becomes a live React DOM. Since our HTML was rendered with exactly the same code as we're running in our browser, these will (and have to) match perfectly. The hydration occurs on the `<div id="___gatsby">...</div>` element defined in [default-html.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/cache-dir/default-html.js#L19).

### Page Rendering

The hydration requires a new React component to "replace" the existing DOM with. Gatsby uses [reach router](https://github.com/reach/router) for this. Within it, we provide a [RouteHandler](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/cache-dir/production-app.js#L35) component that uses [PageRenderer](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/cache-dir/page-renderer.js) to create the navigated to page.

PageRenderer's constructor [loads the page resources](/docs/production-app/#load-page-resources) for the path. On first load though, these will have already been requested from the server by `<link rel="preload" ... />` in the page's original HTML (see [Link Preloads](/docs/how-code-splitting-works/#construct-link-and-script-tags-for-current-page) in HTML Generation Docs). The loaded page resources includes the imported component, with which we create the actual page component using [React.createElement()](https://reactjs.org/docs/react-api.html). This element is returned to our RouteHandler which hands it off to Reach Router for rendering.

### Load Page Resources

Before hydration occurs, we kick off the loading of resources in the background. As mentioned above, the current page's resources will have already been requested by `link` tags in the HTML. So, technically, there's nothing more required for this page load. But we can start loading resources required to navigate to other pages.

This occurs in [loader.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/cache-dir/loader.js). The main function here is [getResourcesForPathname()](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/cache-dir/loader.js#L268). Given a path, it will find its page, and import its component module json query results. But to do this, it needs access to that information. This is provided by [async-requires.js](/docs/write-pages/#async-requiresjs) which contains the list of all pages in the site, and all their dataPaths. [fetchPageResourcesMap()](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/cache-dir/loader.js#L33) takes care of requesting that file, which occurs the [first time](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/cache-dir/loader.js#L292) `getResourcesForPathname()` is called.

### window variables

Gatsby attaches global state to the `window` object via `window.___somevar` variables so they can be used by plugins (though this is technically unsupported). Here are a few:

##### `___loader`

This is a reference to the [loader.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/cache-dir/loader.js) object that can be used for getting page resources and [enqueueing prefetch](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/cache-dir/loader.js#L188) commands. It is used by [gatsby-link](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-link/src/index.js#L60) to prefetch pages. And by [gatsby-plugin-guess-js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-guess-js/src/gatsby-browser.js#L60) to implement its own prefetching algorithm.

##### `___emitter`

only used during `gatsby develop`.

##### `___chunkMapping`

Contents of `chunk-map.json`. See [Code Splitting](/docs/how-code-splitting-works/#chunk-mapjson) for more.

##### `___push`, `___replace` and `___navigate`

These are set in [init navigation](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/cache-dir/navigation.js#L128). Used by `gatsby-link` to override navigation behavior so that it [loads pages](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-link/src/index.js#L185) before using reach to navigate.
