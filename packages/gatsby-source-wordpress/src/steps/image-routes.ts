import { polyfillImageServiceDevRoutes } from "gatsby-plugin-utils/polyfill-remote-file"
import { Step } from "./../utils/run-steps"

export const imageRoutes: Step = async ({ app }): Promise<void> => {
  polyfillImageServiceDevRoutes(app)
}
