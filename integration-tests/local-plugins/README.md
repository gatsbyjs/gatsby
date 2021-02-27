## Local plugins test

Before running suite, run [`gatsby-dev`](https://www.npmjs.com/package/gatsby-dev-cli) in the folder to setup the project to use your development code.

## Validating Plugin Options

The tests will verify local plugin options schema validation by dropping file markers into the build folder with a flag that flips if the `pluginOptionsSchema` export is invoked.
