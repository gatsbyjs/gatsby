import { PluginRef } from "gatsby"

export const moreDataConfig: PluginRef = {
  resolve: `gatsby-source-filesystem`,
  options: {
    name: `westworld`,
    path: `./src/more-data/some-data`,
  },
}