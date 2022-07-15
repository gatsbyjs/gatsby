# Gatsby Link

Anchor tag src's in html that are links to your WP instance are automatically rewritten to relative links (`https://yoursite.com/beautiful-page` becomes `/beautiful-page`). For this reason, it's recommended to use your WordPress page and post [uri's](https://github.com/TylerBarnes/using-gatsby-source-wordpress/blob/master/gatsby-node.js#L29) to create your [Gatsby page paths](https://github.com/TylerBarnes/using-gatsby-source-wordpress/blob/master/gatsby-node.js#L68).

Anchor tags in html that are relative links automatically become `gatsby-link`'s so that navigation via html links are blazing fast.

## `gatsby-plugin-catch-links`

Because links in html fields are so common in WordPress, this plugin auto-installs `gatsby-plugin-catch-links` for you. In 99% of cases this works well, but for some sites you may need to configure this plugin yourself. You can disable the automatically included version of `gatsby-plugin-catch-links` by setting the environment variable `WORDPRESS_CATCH_LINKS` to a string of `false`.

In .env:

```.env
WORDPRESS_CATCH_LINKS="false"
```

In gatsby-config.js:

```js
process.env.WORDPRESS_CATCH_LINKS = "false"

module.exports = {
  // gatsby-config.js configuration
}
```

:point_left: [Back to Features](./index.md)
