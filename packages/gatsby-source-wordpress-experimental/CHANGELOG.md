# Change Log

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
