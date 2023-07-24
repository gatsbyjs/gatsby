import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:8888`,
    // Netlify doesn't handle trailing slash behaviors really, so no use in testing it
    excludeSpecPattern: [`cypress/e2e/trailing-slash.cy.ts`,],
    projectId: `4enh4m`,
    videoUploadOnPasses: false,
    experimentalRunAllSpecs: true,
    retries: 2,
  },
})