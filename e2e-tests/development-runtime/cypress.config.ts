import { defineConfig } from "cypress"
import { addMatchImageSnapshotPlugin } from "@simonsmith/cypress-image-snapshot/plugin"
import { gatsbyConfigUtils } from "./cypress/utils/gatsby-config"
import { blockResourcesUtils } from "./cypress/utils/block-resources"

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:8000`,
    specPattern: `cypress/integration/**/*.{js,ts}`,
    projectId: `nusozx`,
    experimentalRunAllSpecs: true,
    chromeWebSecurity: false,
    defaultCommandTimeout: 30000,
    retries: 2,
    videoUploadOnPasses: false,
    setupNodeEvents(on, config) {
      addMatchImageSnapshotPlugin(on, config)
      on(`task`, {
        ...blockResourcesUtils,
        ...gatsbyConfigUtils,
      })
      on(`before:browser:launch`, (browser = {} as Cypress.Browser, launchOptions) => {
        if (browser.family === `chromium` || browser.name === `chrome`) {
          // Make retina screens run at 1x density so they match the versions in CI
          launchOptions.args.push(`--force-device-scale-factor=1`)
        }
        return launchOptions
      })
    },
  },
  env: {
    requireSnapshots: true,
  }
})