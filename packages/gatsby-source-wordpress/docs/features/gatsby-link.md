# Gatsby Link

Anchor tag src's in html that are links to your WP instance are automatically rewritten to relative links (`https://yoursite.com/beautiful-page` becomes `/beautiful-page`). For this reason, it's recommended to use your WordPress page and post [uri's](https://github.com/TylerBarnes/using-gatsby-source-wordpress/blob/master/gatsby-node.js#L29) to create your [Gatsby page paths](https://github.com/TylerBarnes/using-gatsby-source-wordpress/blob/master/gatsby-node.js#L68).

Anchor tags in html that are relative links automatically become `gatsby-link`'s so that navigation via html links are blazing fast.

:point_left: [Back to Features](./index.md)
