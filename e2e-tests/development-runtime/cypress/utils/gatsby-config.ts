import * as fs from "fs-extra"
import * as path from "path"

const CONFIG_PATH = path.join(__dirname, `../../gatsby-config.js`)
const originalConfig = fs.readFileSync(CONFIG_PATH, `utf8`)

export const gatsbyConfigUtils = {
  resetGatsbyConfig: () => {
    fs.writeFileSync(CONFIG_PATH, originalConfig)
    return originalConfig
  },
  changeGatsbyConfig: () => {
    if (fs.readFileSync(CONFIG_PATH, `utf8`) !== originalConfig) {
      throw new Error(
        `It looks like the gatsby-config.js has already been changed. Please call cy.task('resetGatsbyConfig') first.`
      )
    }
    // Switch the order of two plugins around to trigger a restart
    // that doesn't affect the functionality of the site.
    const changed = originalConfig.replace(
      `\`gatsby-source-fake-data\`,
    \`gatsby-transformer-sharp\`,
`,
      `
    \`gatsby-transformer-sharp\`,
    \`gatsby-source-fake-data\`,`
    )

    fs.writeFileSync(CONFIG_PATH, changed)
    return changed
  }
}