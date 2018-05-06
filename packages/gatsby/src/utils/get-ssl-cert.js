const getDevelopmentCertificate = require(`devcert-san`).default
const report = require(`gatsby-cli/lib/reporter`)

module.exports = async name => {
  report.info(`setting up SSL certificate (may require sudo)\n`)

  try {
    return await getDevelopmentCertificate(name, {
      installCertutil: true,
    })
  } catch (err) {
    report.panic(`\nFailed to generate dev SSL certificate`, err)
  }

  return false
}
