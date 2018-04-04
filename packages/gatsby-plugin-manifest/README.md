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

### Hybrid config

In the hybrid config you are responsible for defining the entire web app manifest but instead of manually generating the defined icons you provide a high resolution source icon to be used to auto generate your defined icons. See the example below:

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

### Auto config

In the auto config you are responsible for defining the entire web app manifest except for the icons. You only provide a high resolution source icon. The icons themselves and the needed config will be generated. See the example below:

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

To create `manifest.json`, you need to run `gatsby build`.


