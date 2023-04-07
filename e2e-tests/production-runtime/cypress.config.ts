import { defineConfig } from "cypress"
import { blockResourcesUtils } from "./cypress/utils/block-resources"

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:9000`,
    specPattern: `cypress/integration/**/*.{js,ts}`,
    experimentalRunAllSpecs: true,
    chromeWebSecurity: false,
    videoUploadOnPasses: false,
    setupNodeEvents(on) {
      on(`task`, {
        ...blockResourcesUtils
      })
      on(`before:browser:launch`, (browser = {} as Cypress.Browser, launchOptions) => {
        if (
          browser.name === `chrome` &&
          process.env.CYPRESS_CONNECTION_TYPE === `bot`
        ) {
          launchOptions.args.push(
            `--user-agent="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"`
          )
        }
    
        return launchOptions
      })
    },
  },
})