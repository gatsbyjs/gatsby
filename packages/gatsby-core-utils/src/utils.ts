import * as path from "path"
import fs from "fs"

export function getConfigPath(root: string): string {
  const { js, ts } = {
    js: path.join(root, `gatsby-config.js`),
    ts: path.join(root, `gatsby-config.ts`),
  }
  return fs.existsSync(ts) ? ts : js
}

export async function readConfigFile(root: string): Promise<string> {
  let src
  try {
    src = await fs.promises.readFile(getConfigPath(root), `utf8`)
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
