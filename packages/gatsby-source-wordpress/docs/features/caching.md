# Caching :ballot_box:

After the first build or run of develop only changed data is pulled. This is what allows [Fast Builds](./fast-builds.md) and [Incremental Builds](./incremental-builds.md) to work properly!

If the remote schema changes between builds, the entire cache will be invalidated and the plugin will start a fresh pull/build. This can happen when updating your `gatsby-node.js` , `gatsby-config.js` or when adding a new npm package to your project.

## Supported Admin Actions

Currently the cache isn't selectively invalidated for every possible user interaction. For now it only works for the following events:

- Users
  - creating
  - updating
  - deleting
  - reattributing posts
  - creating/deleting based on wether the user becomes public/private
- Pages/Posts/CPT's
  - creating
  - deleting
  - drafting
  - updating
- Media Items
  - editing
  - creating
  - deleting
- Categories/Terms/Tags
  - creating
  - editing
  - deleting

## Unsupported Admin Actions

For example following events will not yet properly update the cache:

- Changing the home/blog page
- Changing permalink structure
- Saving any WP options
- Saving ACF options
- Others?

As we continue to support this plugin, these actions will be moved into the supported list. If you need one of these sooner than later, please open an issue with a feature request.

:point_left: [Back to Features](./index.md)
