import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:9000/blog`,
    specPattern: `cypress/integration/**/*.{js,ts}`,
    projectId: `pzj19c`,
  },
  videoUploadOnPasses: false,
})