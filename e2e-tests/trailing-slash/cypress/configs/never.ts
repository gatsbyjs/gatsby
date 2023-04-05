import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    specPattern: [`cypress/integration/never.js`, `cypress/integration/functions.js`, `cypress/integration/static.js`],
    projectId: `ofxgw8`,
  },
  videoUploadOnPasses: false,
  chromeWebSecurity: false,
})