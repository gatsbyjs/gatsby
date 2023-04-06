import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:9000`,
    specPattern: `cypress/integration/**/*.{js,ts}`,
    projectId: `c9rs27`,
  },
  videoUploadOnPasses: false,
  chromeWebSecurity: false,
})