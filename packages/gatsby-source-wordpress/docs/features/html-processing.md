# HTML processing

HTML in node data received from WPGraphQL will be automatically processed.

## Gatsby Image

Media items in html are automatically sourced and image tags are swapped with `gatsby-image`'s

Image tags in html that return 404's are logged to the console with a link to which post or page has the broken image. This allows you to easily discover and fix broken images that were deleted from the media library.

This can be turned off with the `html.useGatsbyImage` boolean plugin option. See [plugin options](../plugin-options.md#html.usegatsbyimage-boolean) for more information.

## Gatsby Link

Anchor tag src's in html that are links to your WP instance are automatically rewritten to relative links (`https://yoursite.com/beautiful-page` becomes `/beautiful-page`). For this reason, it's recommended to use your WordPress page and post uri's to create your Gatsby page paths.

Anchor tags in html that are relative links automatically become `gatsby-link`'s so that navigation via html links are blazing fast.

:point_left: [Back to Features](./index.md)
