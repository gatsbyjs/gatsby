# Change Log

## 0.1.10

- Added plugin option `debug.disableCompatibilityCheck`. This is useful for testing the source plugin against versions of WPGraphQL outside the current accepted version range.

## 0.1.9

### Bug Fixes

- Type.exclude was not removing types from inline fragments during node sourcing, that is now fixed.
- Auto aliasing of conflicting field types in inline fragments is now recursive into nested fields.
- Added proper field def to resolve non_null lists of non_null types. `[Type!]!`

### New Features

- Added a new plugin option `schema.circularQueryLimit` which is used to set a limit on how many times a field type can be an ancestor of itself during query generation for node sourcing. This should help prevent out of memory issues for gigantic schemas with fields that are potentially infinitely nested. The default limit is set to 2 but this can be increased.
- exclude editLock and revisionOf fields by default as these fields require authentication.
- remove reliance on WPGatsby's postTypes field and use inputFields from introspection to determine which node list queries require the temporary `where: { parent: null }` input args to get a flat list of posts/pages. This slightly speeds up the sourcing process.
- Added a plugin option for debugging node list query generation. `debug.graphql.copyNodeSourcingQueryAndExit` expects to be passed the type name of a WPGraphQL node such as `Page`. If the Gatsby site is in development mode and a valid type is passed to this option it will write the node list query to be used in node sourcing to the system clipboard and exit the build process.

## 0.1.8

### New Features

`MediaItem.remoteFile` was deprecated and renamed to `MediaItem.localFile`. This more closely aligns with other Gatsby source plugins schemas.

## 0.1.7

The `User.description` field was mistakenly excluded by default, this release adds it back to the schema

## 0.1.6

Removed unecessary logic when fetching menu items that could prevent pulling some types of child items

## 0.1.5

### New Features

1. There is now a `type.__all` option which allows you to pass options to all types instead of only to specific types.

2. Because of the way menu items work in WPGraphQL, any child items in a menu need to be fetched recursively. Since this part of the build process didn't have any cli reporting the build appeared to hang for sites with a lot of menu items.
   This release adds logging to that part of the build step, explicitly telling you if there are async side-effects happening with a readout of how many additional nodes were created.

```
success  gatsby-source-wordpress  creating nodes - 57.784s - awaiting async side effects - 710 additional nodes fetched
```

In addition, this release moves recursive menu item sourcing into an async queue so we can increase concurrency and speed this up a bit.
In the future this will be less of an issue when WPGraphQL moves most node queries to a flat architecture.

## 0.1.4

### Bug Fixes

When fetching data for interface types, shared fields were being fetch on each inline fragment like so:

```graphql
{
  contentNode {
    title
    ... on Post {
      title
      otherPostField
    }
    ... on Page {
      title
      otherPageField
    }
  }
}
```

Normally that wasn't such a big deal since it just made the queries during node sourcing larger but didn't break anything. For interfaces with particularly deeply nested fields this was a huge problem (namely for Gutenberg).
This release solves this by only fetching these shared fields directly on the interface field.

```graphql
{
  contentNode {
    title
    ... on Post {
      otherPostField
    }
    ... on Page {
      otherPageField
    }
  }
}
```

## 0.1.3

### Bug fixes

- Previously root fields that were lists of non_null built in Scalars or non_null lists of Scalars on RootQuery fields that weren't lists of nodes could throw errors in some cases. This release fixes that.

## 0.1.2

### New Features

- Using the types.TypeName.lazyNodes option now works properly. Essentially what this option does is prevent fetching remote files and processing them via gatsby-image/Sharp unless they're queried for. When queried for, remote files are fetched in the gql resolver if the file doesn't exist locally. It's not recommended to use this if you're using gatsby-image a lot as fetching images this way is much slower. You might want to use this if you mostly use the original WP hosted media files 95% of the time and then just use a few gatsby-image's locally.

## 0.1.1

### Breaking changes

- Changed accepted WPGatsby version range to ~0.2.3

### Bug Fixes

- Because everything is fetched in a flat list, hierarchical terms weren't being properly sourced. Code was added to specifically support the Category type, but this will be made generic for all types soon as this is a reocurring problem.

## 0.1.0

### Breaking changes

- Changed accepted WPGatsby version range to ~0.2.2
- Changed accepted WPGraphQL version range to ~0.8.3
- Removed custom WpContentTypes type and contentTypes field as WPGraphQL 0.8.3 has this built in now

## 0.0.42

### Bug Fixes

- Scoped babel plugin source-map-support to just development env to prevent `warn Module not found: Error: Can't resolve 'fs' in warn Module not found: Error: Can't resolve 'module' in` errors

## 0.0.41

### Bug Fixes

- The `copyQueryOnError` plugin option was throwing cryptic errors on systems that don't support copy (namely CI). Now this is in a try/catch and the error is tossed away. This helps ensure users see relevant errors.

## 0.0.40 - skipped

## 0.0.39

### Bug Fixes

- Fixed normalizeUri helper to account for null uri (if a node has no uri)

### Features

- Improved fetch error messages. Some users were getting confused when they added www. to their api url setting. Visiting that URL in browser brought them to the GraphQL api endpoint. The problem is that WP seems to sometimes redirect in browser and axios can't handle this. The new error messages account for this.

## 0.0.38

### Bug Fixes

- For fields that are connections to lists of nodes, default variables were added to grab the first 100, before the max was 10. In the future an API will need to be added to resolve these lists of connections on the Gatsby-side, for now this works for a good deal of use-cases

## 0.0.37

### Bug Fixes

- Adding Preview support in an earlier release broke inc-builds in an effort to speed up previews. This release restores inc-builds functionality

## 0.0.36

### Bug Fixes

- Fixed lists of non_null types which have their type on type.ofType.ofType instead of type.ofType

## 0.0.35

### Bug Fixes

- Lists of MediaItems were not being recognized as media files that are referenced. This means those media items weren't being sourced as we only source referenced media items. This version fixes that issue!

## 0.0.34

### Bug Fixes

- Fixed an error where queries return null for some posts and we were checking properties on null. https://github.com/TylerBarnes/using-gatsby-source-wordpress-experimental/issues/6

## 0.0.33

### Features

- Updated Readme for npm

## 0.0.32

### Bug Fixes

- In the schema, lists of non null types weren't being properly ingested. For example a NON_NULL list of Blocks. This is now fixed! Thanks Peter Pristas!
