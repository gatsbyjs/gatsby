// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const blockResources = require(`./block-resources`)
const gatsbyConfig = require(`./gatsby-config`)
const { addMatchImageSnapshotPlugin } = require("cypress-image-snapshot/plugin")

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on(`task`, {
    ...blockResources,
    ...gatsbyConfig,
  })
  
  addMatchImageSnapshotPlugin(on, config)
  on("before:browser:launch", (browser = {}, launchOptions) => {
    if (browser.family === "chromium" || browser.family === "chrome") {
      // Make retina screens run at 1x density so they match the versions in CI
      launchOptions.args.push("--force-device-scale-factor=1")
    }
    return launchOptions
  })
}
