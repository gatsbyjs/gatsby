---
title: Adding a Service Worker
---

## What is a service worker

A service worker is a script that your browser runs in the background, separate from a web page, opening the door to features that don't need a web page or user interaction. They increase your site availability in spotty connections, and are essential to making a nice user experience.

It supports features like push notifications and background sync.

## Using service workers in Gatsby with `gatsby-plugin-offline`

Gatsby provides awesome plugin interface to create and load a service worker into your site [gatsby-plugin-offline](https://www.npmjs.com/package/gatsby-plugin-offline).

You can use this plugin together with the [manifest plugin](https://www.npmjs.com/package/gatsby-plugin-manifest). (Don’t forget to list the offline plugin after the manifest plugin so that the manifest file can be included in the service worker).

## Installing `gatsby-plugin-offline`

`npm install gatsby-plugin-offline`

Add this plugin to your `gatsby-config.js`

```javascript:title=gatsby-config.js
plugins: [`gatsby-plugin-offline`]
```

## References

- [Service Workers: an Introduction](https://developers.google.com/web/fundamentals/primers/service-workers/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
