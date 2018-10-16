const fs = require(`fs-extra`)
const path = require(`path`)

const base = path.join(__dirname, `packages`)

const configs = fs
  .readdirSync(base)
  .filter(fileOrFolderName => fileOrFolderName.startsWith(`gatsby`))
  .reduce((packages, folder) => {
    const configFile = path.join(base, folder, `.size-limit.js`)
    if (fs.existsSync(configFile)) {
      const config = require(configFile).map(part => {
        part.path = path.join(base, folder, part.path)
        part.name = part.name || folder
        return part
      })
      packages = packages.concat(config)
    }
    return packages
  }, [])

module.exports = configs
