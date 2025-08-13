import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:8000",
    supportFile: false,
    specPattern: "cypress/integration/**/*.{js,jsx,ts,tsx}",
  },
  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
  },
})
