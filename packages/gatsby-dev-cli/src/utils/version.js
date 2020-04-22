exports.getVersionInfo = () => {
  const { version: devCliVersion } = require(`../../package.json`)
  return `Gatsby Dev CLI version: ${devCliVersion}`
}
