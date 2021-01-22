# Schema Merging

Schema Merging is the magic that makes this source plugin work!

The WPGraphQL and Gatsby GraphQL schemas are automagically merged behind the scenes for you by using GraphQL introspection and logic that understands WPGraphQL and Gatsby.

As much of the remote WPGQL schema as possible is fetched, queries are built automatically, the queries are sent to WPGraphQL, and then Gatsby nodes are created from the returned data. Data is never fetched twice. If we will already have data, for example on a connection field between an Author and a Post, we only pull the id of the Post and link the field to the Post node on the Gatsby side.

## So which schema am I querying?

You're querying the Gatsby GraphQL API, but using the schema definitions and data of WPGraphQL.
This means you will have the power of both systems! But data is coming from the Gatsby cache.

## Caveats

WPGraphQL field input arguments are currently not supported.

## Considerations

This plugin works with all (or most) WPGQL plugins. So ACF, polylang, etc will work. Not all popular WPGraphQL extensions have been tested yet. For example we know that`wp-graphql-woocommerce` can source data, but we haven't yet tested it beyond that point.

:point_left: [Back to Features](./index.md)
