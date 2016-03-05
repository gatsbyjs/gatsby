/*eslint-disable */
var program = require('commander')
var path = require('path')

var packageJson = require('../package.json')
/*eslint-enable */

// Use compiled version of code when installed globally, otherwise use
// babelscript version.
var develop // eslint-disable-line no-var
var relativeDirectory // eslint-disable-line no-var
if (require('./published')) {
  develop = require('../dist/utils/develop')
} else {
  develop = require('../lib/utils/develop')
}

var defaultHost = process.platform === 'win32' 
  ? 'localhost'
  : '0.0.0.0';
  
program
  .version(packageJson.version)
  .option('-h, --host <url>', 'Set host. Defaults to ' + defaultHost, defaultHost)
  .option('-p, --port <port>', 'Set port. Defaults to 8000', '8000')
  .parse(process.argv)

relativeDirectory = program.args[0]
if (!relativeDirectory) {
  relativeDirectory = '.'
}
const directory = path.resolve(relativeDirectory)

program.directory = directory
program.relativeDirectory = relativeDirectory

develop(program)
