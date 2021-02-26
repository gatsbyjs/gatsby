## Local plugins test

Before running suite, run `yarn` in the folder to create the `node_modules` and lockfile. To test work-in-progress code like the `gatsby` package, use `yarn link`.

## Validating Plugin Options

The tests will verify local plugin options schema validation by dropping a file into the build folder with a flag that flips if the `pluginOptionsSchema` export is invoked.
