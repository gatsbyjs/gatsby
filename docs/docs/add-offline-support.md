---
title: Add offline support
---

If you've run an [audit with Lighthouse](/audit-with-lighthouse/), you may have noticed a lackluster score in the "Progressive Web App" category. Let's address how you can improve that score.

1.  You can [add a manifest file](/add-a-manifest-file/).
2.  You can also add offline support, since another requirement for a website to qualify as a PWA is the use of a [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API). A service worker runs in the background, deciding to serve network or cached content based on connectivity, allowing for a seamless, managed offline experience.

[Gatsby's offline plugin](/packages/gatsby-plugin-offline/) makes a Gatsby site work offline--and makes it more resistant to bad network conditions--by creating a service worker for your site.

### Using `gatsby-plugin-offline`

1.  Install the plugin:

```bash
npm install --save gatsby-plugin-offline
```

2.  Add the plugin to the `plugins` array in your `gatsby-config.js` file.

```javascript
{
    plugins: [
        {
            resolve: `gatsby-plugin-manifest`,
            options: {
                ...
            }
        },
        'gatsby-plugin-offline'
    ]
}
```

That's all you need to get started with service workers with Gatsby.

> 💡 If you are also [adding a manifest file](add-a-manifest-file), the manifest plugin should be listed _before_ the offline plugin so that the offline plugin can cache the created `manifest.webmanifest`.
