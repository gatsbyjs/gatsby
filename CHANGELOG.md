# Change Log

## [1.0.0-alpha9] - 2016-11-04
### Added
- Put the routes module on `window` to support experimental idea. See
  this issue for more](https://github.com/gatsbyjs/gatsby/issues/537).
[commit](https://github.com/gatsbyjs/gatsby/commit/28e84f3aed480d1f5a8f9859172d1c6f531696d4)

### Changed
- Removed the package `sharp` as it's not used and is preventing Gatsby
  1.0 from being installed on Windows.
[commit](https://github.com/gatsbyjs/gatsby/commit/34fff74e6fb3cae88010b42f74d784382ead4031)

## [1.0.0-alpha8] - 2016-11-01
### Added
- Extension API `swOnUpdated` for when a service worker finishes
  updating. Use this to alert users of your app to reload to see the
latest version.
[commit](https://github.com/gatsbyjs/gatsby/commit/5173bdc5424e7c874b3f2abfad706cea2e38ebc3)

### Fixed
- hot reloading now fully works. Apparently you can't use function
  components for top-level routes on react-router with react-hot-loader
3.0 `¯\_(ツ)_/¯` [#532](https://github.com/gatsbyjs/gatsby/pull/532) and
[commit](https://github.com/gatsbyjs/gatsby/commit/36f2c169586ea30518639d7b1493e08e05befb73)
- Webpack needs the help of an obscure setting `recordsPath` to preserve
  module ids across builds. Big thanks to @NekR for pointing this out to
me. Previous to this change, loading changed JS chunks could cause a JS
error as the module ids the new chunk expects wouldn't match the module
ids from the older chunks.
[#533](https://github.com/gatsbyjs/gatsby/pull/533)

### Changed
- Disabled hard-source-webpack-plugin. It speeds up builds significantly
  but has been causing hard-to-debug errors while developing. We'll
circle back to it down the road.
[commit](https://github.com/gatsbyjs/gatsby/commit/4bc9660ac8c371d23c0295cde52002775eee5aa1)
- Restored using ChunkManifestPlugin. It was disabled while trying to
  debug the mismatched module id bug but that being fixed, we're using
it again.
[commit](https://github.com/gatsbyjs/gatsby/commit/8d16905f31b80ca56db225904d60ed78c6091ca9)
- Name modules ids in development for easier debugging. Primary benefit
  is you can see which modules are getting hot reloaded.
[commit](https://github.com/gatsbyjs/gatsby/commit/93f6bd2c4206e71623c1a7fa007322f8dc9887be)

## [1.0.0-alpha7] - 2016-10-27
### Fixed
- Removed entries from the webpack config looking for
  `node_modules/gatsby/node_modules`. This was added to help when
developing Gatsby using `npm link` but when Gatsby is installed
regularly, it then fails the Webpack validation as
`node_modules/gatsby/node_modules` doesn't now exist.

## [1.0.0-alpha6] - 2016-10-27
### Added
- extension API for adding types to the GraphQL schema
  [commit](https://github.com/gatsbyjs/gatsby/commit/18b8b64ed4cbe3399fb262395c0c6e6a5a16099a)

### Fixed
- Use babel-traverse instead of using babel-plugin so that don't say
  done early when running graphql queries that have async resolvers
[commit](https://github.com/gatsbyjs/gatsby/commit/a19677e38d1ce8ba4fb39ddff75482904f168db6)

## [1.0.0-alpha5] - 2016-10-14
### Added
- hard-source-webpack-plugin
  [commit](https://github.com/gatsbyjs/gatsby/commit/2c48e5c42887fecabc01c5f5b6f3dd8e06d3372f)
- New replacement API to wrap root component (useful for Redux, et
  al.)
[commit](https://github.com/gatsbyjs/gatsby/commit/ebd57d2bd6c39b51a455b76018737e2957e146ef)
- yarn.lock
  [commit](https://github.com/gatsbyjs/gatsby/commit/5ce3321b84e912925c4705ececef6f2c817b0684)

### Changed
- Disable extracting the Webpack chunk manifest until understand why
  this breaks updates when using Service Workers
[commit](https://github.com/gatsbyjs/gatsby/commit/07ed5b010ad27b1816084b361f06fd0ae6a017ba)

## [1.0.0-alpha4] - 2016-10-07
### Added
- Add more file extensions to file/url loader config. Default to url
  loader unless it never makes sense to use data-uri e.g. favicons.
- Use api-runner-browser for calling browser extension
  APIs/replacements. Prep for plugin system.
- Add extension API `clientEntry` that let's site code and plugins to
  run code at the very start of client app.

### Changed
- Add config to uglify to ignore ie8.
- Disable building AppCache until can research if useful.
- Turn on screw_ie8 options in UglifyJS.

### Fixed
- Actually use the "sources" key from gatsby-config.js for looking for
markdown files. This will be getting an overhaul soon.
- Don't use null-loader for css during the build-js stage as this
  prevents offline-plugin from caching files referenced in your CSS.
- Add missing publicPath for build-html step.

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
