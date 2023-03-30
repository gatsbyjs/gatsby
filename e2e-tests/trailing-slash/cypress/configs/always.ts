import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    specPattern: [`cypress/integration/always.js`, `cypress/integration/functions.js`, `cypress/integration/static.js`]
  },
  videoUploadOnPasses: false,
  chromeWebSecurity: false,
})