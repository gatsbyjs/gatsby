var program = require('commander') // eslint-disable-line no-var
var loggy = require('loggy') // eslint-disable-line no-var

var packageJson = require('../package.json') // eslint-disable-line no-var
var rootPath // eslint-disable-line no-var
var starter // eslint-disable-line no-var
var initStarter = require('../dist/utils/init-starter') // eslint-disable-line no-var

program
  .version(packageJson.version)
  .parse(process.argv)

if (program.args.length === 1) {
  rootPath = program.args[0]
  starter = 'gh:gatsbyjs/gatsby-starter-default'
} else {
  rootPath = program.args[0]
  starter = program.args[1]
}

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
