# Change Log

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
