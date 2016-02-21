/*eslint-disable */
var program = require('commander')
var path = require('path')

var packageJson = require('../package.json')
/*eslint-enable */

// Use compiled version of code when installed globally, otherwise use
// babelscript version.
let develop
if (require('./published')) {
  develop = require('../dist/utils/develop')
} else {
  develop = require('../lib/utils/develop')
}

program
  .version(packageJson.version)
  .option('-h, --host <url>', 'Set host. Defaults to 0.0.0.0', '0.0.0.0')
  .option('-p, --port <port>', 'Set port. Defaults to 8000', '8000')
  .parse(process.argv)

let relativeDirectory = program.args[0]
if (!relativeDirectory) {
  relativeDirectory = '.'
}
const directory = path.resolve(relativeDirectory)

program.directory = directory
program.relativeDirectory = relativeDirectory

develop(program)
