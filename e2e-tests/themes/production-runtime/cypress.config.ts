import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:9000`,
    specPattern: `cypress/integration/**/*.{js,ts}`,
  },
  videoUploadOnPasses: false,
  chromeWebSecurity: false,
})