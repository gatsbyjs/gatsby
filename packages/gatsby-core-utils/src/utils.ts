import * as path from "path"
import * as fs from "fs-extra"

export function getConfigPath(root: string): string {
  return path.join(root, `gatsby-config.js`)
}

export async function readConfigFile(root: string): Promise<string> {
  let src
  try {
    src = await fs.readFile(getConfigPath(root), `utf8`)
  } catch (e) {
    if (e.code === `ENOENT`) {
      src = `
module.exports = {
  siteMetadata: {
    siteUrl: \`https://www.yourdomain.tld\`,
  },
  plugins: [],
}
`
    } else {
      throw e
    }
  }

  return src
}
