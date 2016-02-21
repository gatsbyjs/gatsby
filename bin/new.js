/*eslint-disable */
var program = require('commander')
var loggy = require('loggy')

var packageJson = require('../package.json')
/*eslint-enable */

// Use compiled version of code when installed globally, otherwise use
// babelscript version.
var initStarter // eslint-disable-line no-var
var rootPath // eslint-disable-line no-var
var starter // eslint-disable-line no-var
if (require('./published')) {
  initStarter = require('../dist/utils/init-starter')
} else {
  initStarter = require('../lib/utils/init-starter')
}

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
