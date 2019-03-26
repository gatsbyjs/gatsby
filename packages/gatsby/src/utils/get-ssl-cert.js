const getDevelopmentCertificate = require(`devcert-san`).default
const fs = require(`fs`)
const path = require(`path`)

const { store } = require(`../redux`)
const { actions } = require(`../redux/actions`)

const { dispatch } = store
const { log } = actions

module.exports = async ({ name, certFile, keyFile, directory }) => {
  // check that cert file and key file are both true or both false, if they are both
  // false, it defaults to the automatic ssl
  if (certFile ? !keyFile : keyFile) {
    const message = `For custom ssl --https, --cert-file, and --key-file must be used together.`
    dispatch(log({ message, type: `panic` }))
  }

  if (certFile && keyFile) {
    const keyPath = path.join(directory, keyFile)
    const certPath = path.join(directory, certFile)

    return await {
      keyPath,
      certPath,
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  }

  const message = `setting up automatic SSL certificate (may require sudo)\n`
  dispatch(log({ message, type: `info` }))
  try {
    return await getDevelopmentCertificate(name, {
      installCertutil: true,
    })
  } catch (err) {
    const message = `\nFailed to generate dev SSL certificate.\n` + err
    dispatch(log({ message, type: `panic` }))
  }

  return false
}
