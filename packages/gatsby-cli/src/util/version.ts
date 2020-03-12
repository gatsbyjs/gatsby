const { setDefaultTags } = require(`gatsby-telemetry`)
const path = require(`path`)

export const getLocalGatsbyVersion = (): string | undefined => {
  let version: string | undefined
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
