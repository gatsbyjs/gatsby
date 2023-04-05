import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:9000`,
    specPattern: `cypress/integration/**/*.{js,ts}`,
    projectId: `spbj28`,
  },
  videoUploadOnPasses: false,
  env: {
    "GATSBY_COMMAND": `build`
  }
})