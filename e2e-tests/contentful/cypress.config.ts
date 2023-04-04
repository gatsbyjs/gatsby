import { defineConfig } from "cypress"
import { addMatchImageSnapshotPlugin } from "@simonsmith/cypress-image-snapshot/plugin"

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:9000`,
    specPattern: `cypress/integration/**/*.{js,ts}`,
    viewportWidth: 1440,
    viewportHeight: 900,
    retries: {
      runMode: 0,
      openMode: 0
    },
    setupNodeEvents(on, config) {
      addMatchImageSnapshotPlugin(on, config)
      on("before:browser:launch", (browser = {} as Cypress.Browser, launchOptions) => {
        if (browser.family === "chromium" || browser.name === "chrome") {
          // Make retina screens run at 1x density so they match the versions in CI
          launchOptions.args.push("--force-device-scale-factor=1")
        }
        return launchOptions
      })
    },
  },
})