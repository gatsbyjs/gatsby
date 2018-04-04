# gatsby-plugin-manifest

Adds support for shipping a manifest.json with your site. The web application
manifest is a JSON file that lets users (on Android Chrome, Firefox, and Opera —
[support in MS Edge & Safari is under development](http://caniuse.com/#feat=web-app-manifest))
save your web application to their smartphone home screen so it behaves similar
to native apps.

This article from the Chrome DevRel team is a good intro to the web app
manifest—https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/

For more information see the w3 spec https://www.w3.org/TR/appmanifest/ or Mozilla Docs https://developer.mozilla.org/en-US/docs/Web/Manifest.

If you're using this plugin together with `gatsby-plugin-offline` (recommended),
this plugin should be listed _before_ the offline plugin so that it can cache
the created manifest.json.

## Install

`npm install --save gatsby-plugin-manifest`

## How to use

There are three configs in which this plugin will function: manual, hybrid, and auto. These three configuration options are explained below. The plugin functions differently depending on which of the three you choose.

### Auto config

In the auto config you are responsible for defining the entire web app manifest except for the icons portion. You only provide a high resolution source icon. The icons themselves and the needed config will be generated at build time. See the example below:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-manifest`,
    options: {
      name: "GatsbyJS",
      short_name: "GatsbyJS",
      start_url: "/",
      background_color: "#f7f0eb",
      theme_color: "#a2466c",
      display: "minimal-ui",
      icon: src/images/icon.png
    },
  },
];
```

The auto config will be the easiest option for most people. If you're looking to customize the icon set included in your web app manifest, then the hybrid option is for you. For your reference the default icons config used is as follows:

```js
[
  {
      "src": `icons/icon-48x48.png`,
      "sizes": `48x48`,
      "type": `image/png`,
  },
  {
      "src": `icons/icon-72x72.png`,
      "sizes": `72x72`,
      "type": `image/png`,
  },
  {
      "src": `icons/icon-96x96.png`,
      "sizes": `96x96`,
      "type": `image/png`,
  },
  {
      "src": `icons/icon-144x144.png`,
      "sizes": `144x144`,
      "type": `image/png`,
  },
  {
      "src": `icons/icon-192x192.png`,
      "sizes": `192x192`,
      "type": `image/png`,
  },
  {
      "src": `icons/icon-256x256.png`,
      "sizes": `256x256`,
      "type": `image/png`,
  },
  {
      "src": `icons/icon-384x384.png`,
      "sizes": `384x384`,
      "type": `image/png`,
  },
  {
      "src": `icons/icon-512x512.png`,
      "sizes": `512x512`,
      "type": `image/png`,
  },
]
```

### Hybrid config

In the hybrid config you are responsible for defining the entire web app manifest, including the icons portion. Including the icons config will override the default config and only the icons you have defined will be generated. See the example below:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-manifest`,
    options: {
      name: "GatsbyJS",
      short_name: "GatsbyJS",
      start_url: "/",
      background_color: "#f7f0eb",
      theme_color: "#a2466c",
      display: "minimal-ui",
      icon: src/images/icon.png
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
];
```
The hybrid option allows the most flexibility while still not requiring you to create the variety of icon sizes manually. However, if the auto icon resize is not up to you standards the manual config is for you.

### Manual config
In the manual config you are responsible for defining the entire web app manifest and providing the defined icons in the static directory. See the example below:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-manifest`,
    options: {
      name: "GatsbyJS",
      short_name: "GatsbyJS",
      start_url: "/",
      background_color: "#f7f0eb",
      theme_color: "#a2466c",
      display: "minimal-ui",
      icons: [
        {
          // Everything in /static will be copied to an equivalent
          // directory in /public during development and build, so
          // assuming your favicons are in /static/favicons,
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
];
```

To create `manifest.json`, you need to run `gatsby build`.


