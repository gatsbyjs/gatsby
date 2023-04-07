import { defineConfig } from "cypress"
import { addMatchImageSnapshotPlugin } from "@simonsmith/cypress-image-snapshot/plugin"

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:9000`,
    specPattern: `cypress/integration/*.{js,ts}`,
    projectId: `nz99aw`,
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
  video: false,
  videoUploadOnPasses: false,
  reporter: `junit`,
  reporterOptions: {
    mochaFile: `cypress/results/junit-[hash].xml`,
    overwrite: false,
    html: false,
    json: true,
  },
  env: {
    requireSnapshots: true,
  }
})