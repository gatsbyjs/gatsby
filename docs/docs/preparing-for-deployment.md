---
title: Preparing a Site for Deployment
---

To Prepare your site for Deployment, you can do following:

1. Run your tests using `yarn test` (Optional)

   If you’d like to learn more about tests, see [Unit Testing](/docs/unit-testing).

2. Run `gatsby build` in your site root.

3. Run `gatsby serve` to see production view of your site.


 **Also you can add metadata, manifest and other.**
 
 ## Add manifest using 'gatsby-plugin-manifest'
 
 ### Install
 ```
 yarn add gatsby-plugin-manifest
 ```
 
 ### How to use
 
 You need to add `gatsby-plugin-manifest` to your `gatsby-config.js`
 
 ```javascript:title=gatsby-config.js
{
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: "yoursite",
        short_name: "yoursite",
        start_url: "/",
        background_color: "#6b37bf",
        theme_color: "#6b37bf",
        display: "minimal-ui",
        icon: "src/images/icon.png", // This path is relative to the root of the site.
      },
    },
  ]
}
```
 
## Total 

Your site is ready for Deployment!

You can deploy site using services like Netlify.
