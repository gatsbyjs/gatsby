import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:8888`,
    projectId: `4enh4m`,
    viewportWidth: 1440,
    viewportHeight: 900,
    videoUploadOnPasses: false,
  },
})