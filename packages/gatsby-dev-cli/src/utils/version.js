exports.getVersionInfo = () => {
  const { version: devCliVersion } = require(`../../package.json`)
  return `Gatsby DEV CLI version: ${devCliVersion}`
}
