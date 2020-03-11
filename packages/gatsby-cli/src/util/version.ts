import { setDefaultTags } from "gatsby-telemetry"
import path from "path"

export const getLocalGatsbyVersion = (): string => {
  let version = ``
  try {
    const packageInfo = require(path.join(
      process.cwd(),
      `node_modules`,
      `gatsby`,
      `package.json`
    ))
    version = packageInfo.version

    try {
      setDefaultTags({ installedGatsbyVersion: version })
    } catch (e) {
      // ignore
    }
  } catch (err) {
    /* ignore */
  }

  return version
}
