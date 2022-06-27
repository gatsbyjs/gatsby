import * as path from "path"
import { readFile, pathExistsSync } from "fs-extra"

export function getConfigPath(root: string): string {
  const { js, ts } = {
    js: path.join(root, `gatsby-config.js`),
    ts: path.join(root, `gatsby-config.ts`),
  }
  return pathExistsSync(ts) ? ts : js
}

export async function readConfigFile(root: string): Promise<string> {
  let src
  try {
    src = await readFile(getConfigPath(root), `utf8`)
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
