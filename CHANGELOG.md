# Change Log

## [1.0.0-alpha2] - 2016-09-21
### Added
- New system for specifying page layouts inspired by Jekyll.
- `<HTMLScripts />` and `<HTMLStyles />` helper components for rendering
  correct scripts and styles in your html.js,
- Validate at runtime gatsby-config.js and page objects.
- Start of new plugin system.
- New extension API: `onPostCreatePages` — called with pages after all
  pages are created. Useful for programmatically modifying pages created
in plugins.

### Changed
- Removed remaining 0.x code
- Exit if can't find local install of Gatsby.
  https://github.com/gatsbyjs/gatsby/commit/030f655075be5ad91af1dc12a05e6bd153a861df
- Fix folder hierarchy for looking for loaders and modules #435
- Changed default `Config` GraphQL type to `Site` and added some
  Jekyll-inspired fields.

## [1.0.0-alpha1] - 2016-09-02
### Added
- Initial versions of new GraphQL data layer, PRPL pattern, programmatic routes, code
  splitting, supporting long-term caching of JS files.
