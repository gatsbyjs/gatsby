---
title: Gatsby Config
---

Site configuration options for a Gatsby site are placed in a file at the root of the project folder called `gatsby-config.js`. 

_Note: There are many sample configs which may be helpful to reference in the different [Gatsby Example Websites](https://github.com/gatsbyjs/gatsby/tree/master/examples)._

## Configuration options

Options available to set within `gatsby-config.js` include:

1. siteMetadata (object)
2. plugins (array)
3. pathPrefix (string)
4. polyfill (boolean)
5. mapping (object)
6. proxy (object)

## siteMetadata

When you want to reuse common pieces of data across the site (for example, your site title), you can store that data in `siteMetadata`:

```javascript
module.exports = {
  siteMetadata: {
    title: `Gatsby`,
    siteUrl: `https://www.gatsbyjs.org`,
    description: `Blazing-fast static site generator for React`,
  },
}
```

This way you can store it in one place, and pull it whenever you need it. If you ever need to update the info, you only have to change it here.

See a fuller description and sample usage in [Gatsby.js Tutorial Part Four](/tutorial/part-four/#data-in-gatsby).

## plugins

Plugins are Node.js packages that implement Gatsby APIs. The config file accepts an array of plugins. Some plugins may need only to be listed by name, while others may take options (see the docs for individual plugins).

```javascript
module.exports = {
    plugins: [
        `gatsby-plugin-react-helmet`,
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `docs`,
                path: `${__dirname}/../docs/`,
            },
        },
    ],
};
```

See more about [Plugins](/docs/plugins/) for more on utilizing plugins, and to see available official and community plugins.

## pathPrefix

It's common for sites to be hosted somewhere other than the root of their domain. Say we have a Gatsby site at `example.com/blog/`. In this case, we would need a prefix (`/blog`) added to all paths on the site. 

```javascript
module.exports = {
  // Note: it must *not* have a trailing slash.
  pathPrefix: `/blog`,
};
```

See more about [Adding a Path Prefix](/docs/path-prefix/).

## polyfill

Gatsby uses the ES6 Promise API. Because some browsers don't support this, Gatsby includes a Promise polyfill by default. 

If you'd like to provide your own Promise polyfill, you can set `polyfill` to false.

```javascript
module.exports = {
  polyfill: false
}
```

See more about [Browser Support](/docs/browser-support/#polyfills) in Gatsby.

## mapping

TODO

## proxy

Setting the proxy config option will tell the development server to proxy any unknown requests to your specified server. For example:

```javascript
module.exports = {
  proxy: {
    prefix: "/api",
    url: "http://examplesite.com/api/",
  },
}
```

See more about [Proxying API Requests in Development](/docs/api-proxy/).