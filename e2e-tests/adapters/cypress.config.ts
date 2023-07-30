import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:9000`,
    projectId: `4enh4m`,
    videoUploadOnPasses: false,
    experimentalRunAllSpecs: true,
    retries: 2,
  },
})