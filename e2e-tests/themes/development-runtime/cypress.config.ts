import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:8000`,
    specPattern: `cypress/integration/**/*.{js,ts}`,
    projectId: `9parq5`,
  },
  videoUploadOnPasses: false,
  chromeWebSecurity: false,
})