---
title: Adding a Manifest File
---

If you've run an [audit with Lighthouse](/docs/how-to/performance/audit-with-lighthouse/), you may have noticed a lackluster score in the "Progressive Web App" category. Let's address how you can improve that score.

But first, what exactly _are_ PWAs?

They are regular websites that take advantage of modern browser functionality to augment the web experience with app-like features and benefits. Check out [Google's overview](https://developers.google.com/web/progressive-web-apps/) of what defines a PWA experience and the [Progressive web apps (PWAs) doc](/docs/progressive-web-app/) to learn how a Gatsby site is a progressive web app.

The inclusion of a web app manifest is one of the three generally accepted [baseline requirements for a PWA](https://alistapart.com/article/yes-that-web-project-should-be-a-pwa#section1).

Quoting [Google](https://developers.google.com/web/fundamentals/web-app-manifest/):

> The web app manifest is a simple JSON file that tells the browser about your web application and how it should behave when 'installed' on the user's mobile device or desktop.

[Gatsby's manifest plugin](/plugins/gatsby-plugin-manifest/) configures Gatsby to create a `manifest.webmanifest` file on every site build.

## Using `gatsby-plugin-manifest`

1. Install the plugin:

```shell
npm install gatsby-plugin-manifest
```

2. Add a favicon for your app under `src/images/icon.png`. The icon is necessary to build all images for the manifest. For more information look at the docs of [`gatsby-plugin-manifest`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-manifest/README.md).

3. Add the plugin to the `plugins` array in your `gatsby-config.js` file.

```javascript:title=gatsby-config.js
{
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: "GatsbyJS",
        short_name: "GatsbyJS",
        start_url: "/",
        background_color: "#6b37bf",
        theme_color: "#6b37bf",
        // Enables "Add to Homescreen" prompt and disables browser UI (including back button)
        // see https://developers.google.com/web/fundamentals/web-app-manifest/#display
        display: "standalone",
        icon: "src/images/icon.png", // This path is relative to the root of the site.
        // An optional attribute which provides support for CORS check.
        // If you do not provide a crossOrigin option, it will skip CORS for manifest.
        // Any invalid keyword or empty string defaults to `anonymous`
        crossOrigin: `use-credentials`,
      },
    },
  ]
}
```

That's all you need to get started with adding a web manifest to a Gatsby site. The example given reflects a base configuration -- check out the [plugin reference](/plugins/gatsby-plugin-manifest/?=gatsby-plugin-manifest#automatic-mode) for more options.
