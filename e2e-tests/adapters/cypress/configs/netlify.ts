import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: process.env.DEPLOY_URL || `http://localhost:8888`,
    excludeSpecPattern: [],
    projectId: `4enh4m`,
    videoUploadOnPasses: false,
    experimentalRunAllSpecs: true,
    retries: 2,
  },
})
