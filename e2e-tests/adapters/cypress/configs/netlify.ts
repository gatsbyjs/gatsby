import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:8888`,
    projectId: `4enh4m`,
    videoUploadOnPasses: false,
  },
})