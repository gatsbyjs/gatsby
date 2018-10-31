# gatsby-plugin-manifest

Adds support for shipping a manifest.webmanifest with your site. The web application
manifest is a JSON file that lets users (on Chrome, Edge, Firefox, Safari Mobile, and Opera —
[support in Safari Desktop is under development](http://caniuse.com/#feat=web-app-manifest))
save your web application to their smartphone home screen so it behaves similar
to native apps.

This article from the Chrome DevRel team is a good intro to the web app
manifest—https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/

For more information see the w3 spec https://www.w3.org/TR/appmanifest/ or Mozilla Docs https://developer.mozilla.org/en-US/docs/Web/Manifest.

If you're using this plugin together with [`gatsby-plugin-offline`](https://www.gatsbyjs.org/packages/gatsby-plugin-offline) (recommended),
this plugin should be listed _before_ the offline plugin so that it can cache
the created manifest.webmanifest.

If you use the "automatic mode" (described below), this plugin will also add a favicon link to your html pages.

## Install

`npm install --save gatsby-plugin-manifest`

## How to use

This plugin configures Gatsby to create a `manifest.webmanifest` file on every site build.

## Generating icons

It can be tedious creating the multitude of icon sizes required by different devices and browsers. This plugin includes code to auto-generate smaller icons from a larger src image.

There are three modes in which icon generation can function: automatic, hybrid, and manual. These three modes are explained below. Icon generation functions differently depending on which of the three you choose.

### Automatic mode

In the automatic mode, you are responsible for defining the entire web app manifest except for the icons portion. You only provide a high resolution source icon. The icons themselves and the needed config will be generated at build time. See the example below:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-manifest`,
    options: {
      name: `GatsbyJS`,
      short_name: `GatsbyJS`,
      start_url: `/`,
      background_color: `#f7f0eb`,
      theme_color: `#a2466c`,
      display: `minimal-ui`,
      icon: `src/images/icon.png`, // This path is relative to the root of the site.
    },
  },
]
```

When in automatic mode the following json array is injected into the manifest configuration you provide and the icons are generated from it. The source icon you provide should be at least as big as the largest icon being generated.

```javascript
;[
  {
    src: `icons/icon-48x48.png`,
    sizes: `48x48`,
    type: `image/png`,
  },
  {
    src: `icons/icon-72x72.png`,
    sizes: `72x72`,
    type: `image/png`,
  },
  {
    src: `icons/icon-96x96.png`,
    sizes: `96x96`,
    type: `image/png`,
  },
  {
    src: `icons/icon-144x144.png`,
    sizes: `144x144`,
    type: `image/png`,
  },
  {
    src: `icons/icon-192x192.png`,
    sizes: `192x192`,
    type: `image/png`,
  },
  {
    src: `icons/icon-256x256.png`,
    sizes: `256x256`,
    type: `image/png`,
  },
  {
    src: `icons/icon-384x384.png`,
    sizes: `384x384`,
    type: `image/png`,
  },
  {
    src: `icons/icon-512x512.png`,
    sizes: `512x512`,
    type: `image/png`,
  },
]
```

The automatic mode is the easiest option for most people.

### Hybrid mode

However, if you want to include more or fewer sizes, then the hybrid option is for you. Like automatic mode, you should include a high resolution icon to generate smaller icons from. But unlike automatic mode, you provide the `icons` array config and icons are generated based on the sizes defined in your config. Here's an example:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-manifest`,
    options: {
      name: `GatsbyJS`,
      short_name: `GatsbyJS`,
      start_url: `/`,
      background_color: `#f7f0eb`,
      theme_color: `#a2466c`,
      display: `minimal-ui`,
      icon: `src/images/icon.png`, // This path is relative to the root of the site.
      icons: [
        {
          src: `/favicons/android-chrome-192x192.png`,
          sizes: `192x192`,
          type: `image/png`,
        },
        {
          src: `/favicons/android-chrome-512x512.png`,
          sizes: `512x512`,
          type: `image/png`,
        },
      ],
    },
  },
]
```

The hybrid option allows the most flexibility while still not requiring you to create most icons sizes manually.

### Manual mode

In the manual mode, you are responsible for defining the entire web app manifest and providing the defined icons in the static directory. Only icons you provide will be available. There is no automatic resizing done for you. See the example below:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-manifest`,
    options: {
      name: `GatsbyJS`,
      short_name: `GatsbyJS`,
      start_url: `/`,
      background_color: `#f7f0eb`,
      theme_color: `#a2466c`,
      display: `minimal-ui`,
      icons: [
        {
          // Everything in /static will be copied to an equivalent
          // directory in /public during development and build, so
          // assuming your favicons are in /favicons,
          // you can reference them here
          src: `/favicons/android-chrome-192x192.png`,
          sizes: `192x192`,
          type: `image/png`,
        },
        {
          src: `/favicons/android-chrome-512x512.png`,
          sizes: `512x512`,
          type: `image/png`,
        },
      ],
    },
  },
]
```
