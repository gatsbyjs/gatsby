const fs = require(`fs`)
const path = require(`path`)
const os = require(`os`)
const baseConfig = require(`../jest.config.js`)

// install global gatsby-cli to tmp dir to simulate sandbox
const GLOBAL_GATSBY_CLI_LOCATION = (process.env.GLOBAL_GATSBY_CLI_LOCATION = fs.mkdtempSync(
  path.join(os.tmpdir(), `gatsby-cli-`)
))

module.exports = {
  ...baseConfig,
  globalSetup: "<rootDir>/integration-tests/gatsby-cli/jest.boot.js",
  rootDir: `../../`,
  globals: {
    GLOBAL_GATSBY_CLI_LOCATION,
  },
}
