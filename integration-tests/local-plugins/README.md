## Local plugins test

Before running suite, run `yarn` in the folder to create the `node_modules` and lockfile. To test work-in-progress code like the `gatsby` package, use `yarn link`.

## Validating Plugin Options

The test suite includes tests to validate that the local plugins are loaded and that they have run the `pluginOptionsSchema` routine by dropping a file into the build folder.
