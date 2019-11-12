const path = require(`path`)

const isLocalGatsbySite = () => {
  try {
    let { dependencies, devDependencies } = require(path.resolve(
      `./package.json`
    ))
    const inGatsbySite =
      (dependencies && dependencies.gatsby) ||
      (devDependencies && devDependencies.gatsby)
    return inGatsbySite
  } catch (err) {
    return false
  }
}

const getLocalGatsbyVersion = () => {
  try {
    const { version } = require(path.join(
      process.cwd(),
      `node_modules`,
      `gatsby`,
      `package.json`
    ))
    return version
  } catch (err) {
    return `unknown`
  }
}

exports.getVersionInfo = () => {
  const { version: devCliVersion } = require(`../../package.json`)
  const isGatsbySite = isLocalGatsbySite()

  if (isGatsbySite) {
    // we need to get the version from node_modules
    let gatsbyVersion = getLocalGatsbyVersion()

    return `Gatsby DEV CLI version: ${devCliVersion}
Gatsby version: ${gatsbyVersion}
  Note: this is the Gatsby version for the site at: ${process.cwd()}`
  } else {
    return `Gatsby DEV CLI version: ${devCliVersion}`
  }
}
