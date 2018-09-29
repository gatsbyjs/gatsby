const chalk = require(`chalk`)
const report = require(`gatsby-cli/lib/reporter`)


module.exports = async program => {
    report.info(`action: ${program.action}`)
    report.info(`plugin: ${program.plugin}`)
}