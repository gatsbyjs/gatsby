# Gatsby Link

Anchor tag src's in html that are links to your WP instance are automatically rewritten to relative links (`https://yoursite.com/beautiful-page` becomes `/beautiful-page`). For this reason, it's recommended to use your WordPress page and post [uri's](https://github.com/TylerBarnes/using-gatsby-source-wordpress/blob/master/gatsby-node.js#L29) to create your [Gatsby page paths](https://github.com/TylerBarnes/using-gatsby-source-wordpress/blob/master/gatsby-node.js#L68).

Anchor tags in html that are relative links automatically become `gatsby-link`'s so that navigation via html links are blazing fast.

## `gatsby-plugin-catch-links`

Because links in html fields are so common in WordPress, `gatsby-source-wordpress` auto-installs `gatsby-plugin-catch-links` for you. In 99% of cases this works well, but for some sites you may need to configure catch-links yourself. You can disable the automatically included version of `gatsby-plugin-catch-links` by setting the `catchLinks` plugin option to `false`. Once it's disabled you can install it yourself and configure its plugin options in your gatsby-config.js

Example `gatsby-config.js` file:

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        catchLinks: false,
      },
    },
    {
      resolve: `gatsby-plugin-catch-links`,
      options: {
        // add the options you need here.
      },
    },
  ],
}
```

:point_left: [Back to Features](./index.md)
