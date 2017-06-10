# gatsby-plugin-manifest

Adds support for shipping a manifest.json with your site. The web
application manifest is a simple JSON file that lets users (on Android
Chrome — [support in MS Edge & Firefox is under
development](http://caniuse.com/#feat=web-app-manifest)) save your web
application to their smartphone home screen so it behaves similar to
native apps.

This article from the Chrome DevRel team is a good intro to the web app
manifest—https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/

If you're using this plugin together with `gatsby-plugin-offline`
(recommended), this plugin should be listed *before* the offline plugin
so that it can cache the created manifest.json.

## Install

`npm install --save gatsby-plugin-manifest`

## How to use

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
          // Everything in /src/static will be copied to an equivalent
          // directory in /public during development and build, so
          // assuming your favicons are in /src/static/favicons,
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

