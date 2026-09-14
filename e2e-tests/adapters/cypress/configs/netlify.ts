import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: process.env.DEPLOY_URL || `http://localhost:8888`,
    // `cypress/e2e` is the shared, adapter-agnostic suite; `cypress/e2e-netlify`
    // holds assertions about this adapter's own behaviour
    specPattern: [
      `cypress/e2e/**/*.cy.{js,jsx,ts,tsx}`,
      `cypress/e2e-netlify/**/*.cy.{js,jsx,ts,tsx}`,
    ],
    excludeSpecPattern: [],
    projectId: `4enh4m`,
    videoUploadOnPasses: false,
    experimentalRunAllSpecs: true,
    retries: 2,
  },
})
