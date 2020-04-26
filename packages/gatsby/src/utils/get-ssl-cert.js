const report = require(`gatsby-cli/lib/reporter`)
const fs = require(`fs`)
const path = require(`path`)
const os = require(`os`)

const absoluteOrDirectory = (directory, filePath) => {
  // Support absolute paths
  if (path.isAbsolute(filePath)) {
    return filePath
  }
  return path.join(directory, filePath)
}

module.exports = async ({ name, certFile, keyFile, directory }) => {
  // check that cert file and key file are both true or both false, if they are both
  // false, it defaults to the automatic ssl
  if (certFile ? !keyFile : keyFile) {
    report.panic({
      id: `11521`,
      context: {},
    })
  }

  if (certFile && keyFile) {
    const keyPath = absoluteOrDirectory(directory, keyFile)
    const certPath = absoluteOrDirectory(directory, certFile)

    return await {
      keyPath,
      certPath,
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  }

  report.info(`setting up automatic SSL certificate (may require sudo)\n`)
  try {
    if ([`linux`, `darwin`].includes(os.platform()) && !process.env.HOME) {
      // this is a total hack to ensure process.env.HOME is set on linux and mac
      // devcert creates config path at import time (hence we import devcert after setting dummy value):
      // - https://github.com/davewasmer/devcert/blob/2b1b8d40eda251616bf74fd69f00ae8222ca1171/src/constants.ts#L15
      // - https://github.com/LinusU/node-application-config-path/blob/ae49ff6748b68b29ec76c00ce4a28ba8e9161d9b/index.js#L13
      // if HOME is not set, we will get:
      // "The "path" argument must be of type s tring. Received type undefined"
      // fatal error. This still likely will result in fatal error, but at least it's not on import time
      const mkdtemp = fs.mkdtempSync(path.join(os.tmpdir(), `home-`))
      process.env.HOME = mkdtemp
    }
    const certificateFor = require(`devcert`).certificateFor
    return await certificateFor(name, {
      installCertutil: true,
    })
  } catch (err) {
    report.panic({
      id: `11522`,
      error: err,
      context: {
        message: err.message,
      },
    })
  }

  return false
}
