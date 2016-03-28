const loggy = require('loggy')

const initStarter = require('./init-starter')

module.exports = (rootPath, starter='gh:gatsbyjs/gatsby-starter-default') => {
  initStarter(
    starter,
    {
      rootPath,
      logger: loggy,
    }, (error) => {
      if (error) {
        loggy.error(error)
      }
    }
  )
}
