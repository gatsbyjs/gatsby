# Compatibility API

Because we have so many remote depencies (WordPress, WPGraphQL, and WPGatsby), we've baked a remote compatibility API into this plugin.

Anytime the build or develop process starts, the source plugin will send the WPGatsby and WPGraphQL semver version ranges it supports to WPGatsby. WPGatsby will return wether or not the currently installed plugins are within the supported range.

If your dependencies are out of the supported range, the build process will exit and provide a link to download the correct dependency versions.

:point_left: [Back to Features](./index.md)
