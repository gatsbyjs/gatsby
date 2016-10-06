# Change Log

## Unreleased
### Added
- Add more file extensions to file/url loader config. Default to url
  loader unless it never makes sense to use data-uri e.g. favicons.

### Fixed
- Actually use the "sources" key from gatsby-config.js for looking for
markdown files. This will be getting an overhaul soon.

## [1.0.0-alpha3] - 2016-10-05
### Added
- Introduce way to programatically add components to `<head>` + API to take over SSR rendering [a39c2a5](https://github.com/gatsbyjs/gatsby/commit/a39c2a5)
- Extract webpack manifest from commons.js so it doesn't change on every
  build improving its cachability
[0941d33](https://github.com/gatsbyjs/gatsby/commit/0941d33)
- Always add babel-plugin-add-module-exports
  [97f083d](https://github.com/gatsbyjs/gatsby/commit/97f083d)

### Changed
- Upgraded React Hot Loader to 3.0-beta5
  [5185c3a](https://github.com/gatsbyjs/gatsby/commit/5185c3a)

### Fixed
- Ensure bundle names for components and paths are unique [342030d](https://github.com/gatsbyjs/gatsby/commit/342030d)
  [a1dfe19](https://github.com/gatsbyjs/gatsby/commit/a1dfe19)
- Remove old code loading config.toml
  [66f901](https://github.com/gatsbyjs/gatsby/commit/66f901)

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
  [030f655](https://github.com/gatsbyjs/gatsby/commit/030f655075be5ad91af1dc12a05e6bd153a861df)
- Fix folder hierarchy for looking for loaders and modules #435
- Changed default `Config` GraphQL type to `Site` and added some
  Jekyll-inspired fields.

## [1.0.0-alpha1] - 2016-09-02
### Added
- Initial versions of new GraphQL data layer, PRPL pattern, programmatic routes, code
  splitting, supporting long-term caching of JS files.
