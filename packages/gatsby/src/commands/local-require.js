const path = require(`path`)
const fs = require(`fs-extra`)

const srcLocation = process.cwd()

fs.ensureDirSync(srcLocation)
process.chdir(srcLocation)

let localGatsbyDir

const getLocalGatsbyDir = () => {
  if (localGatsbyDir) {
    return localGatsbyDir
  }

  try {
    localGatsbyDir = path.dirname(
      require.resolve(`gatsby/package.json`, {
        paths: [path.join(srcLocation)],
      })
    )
    console.log(`Setting gatsby to ${localGatsbyDir}`)
  } catch (err) {
    throw new Error(`${process.cwd()} is not a gatsby site`)
  }

  return localGatsbyDir
}

/**
 * @param {string} file
 */
const requireFromSiteGatsbyDist = file => {
  const gatsbyDir = getLocalGatsbyDir()
  return require(`${gatsbyDir}/dist/${file}`)
}

/**
 * @param {string} file
 */
const requireFromSiteModules = file => {
  try {
    const requirePath = require.resolve(file, {
      paths: [getLocalGatsbyDir()],
    })
    return require(requirePath)
  } catch (err) {
    console.log(`error getting module`, err)
    return require(`${process.cwd()}/node_modules/${file}`)
  }
}

module.exports = {
  requireFromSiteGatsbyDist,
  requireFromSiteModules,
  srcLocation,
}
