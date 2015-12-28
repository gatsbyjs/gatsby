const program = require('commander')
const loggy = require('loggy')

const packageJson = require('../package.json')

// Use compiled version of code when installed globally, otherwise use babelscript version.
const initStarter = require(('./published.js') ? ('../dist/utils/init-starter') : ('../lib/utils/init-starter'))

program
  .version(packageJson.version)
  .parse(process.argv)

const rootPath = program.args[0]
const starter = ((program.args.length === 1) ? ('gh:gatsbyjs/gatsby-starter-default') : (program.args[1]))

initStarter(starter, {
  rootPath,
  logger: loggy,
}, function (error) {
  if (error) {
    return loggy.error(error)
  }
})
