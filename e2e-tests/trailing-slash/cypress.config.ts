import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    specPattern: `cypress/integration/**/*.{js,ts}`,
    projectId: `ofxgw8`,
  },
  videoUploadOnPasses: false,
  chromeWebSecurity: false,
})