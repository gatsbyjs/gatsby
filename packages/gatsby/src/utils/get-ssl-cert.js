const getDevelopmentCertificate = require(`devcert-san`).default
const report = require(`gatsby-cli/lib/reporter`)
const fs = require(`fs`)
const path = require(`path`)

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
    return await getDevelopmentCertificate(name, {
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
