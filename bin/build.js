/*eslint-disable */
var program = require('commander')
var path = require('path')

var packageJson = require('../package.json')
/*eslint-enable */

// Use compiled version of code when installed globally, otherwise use
// babelscript version.
var build // eslint-disable-line no-var
var relativeDirectory // eslint-disable-line no-var
if (require('./published')) {
  build = require('../dist/utils/build')
} else {
  build = require('../lib/utils/build')
}

program
  .version(packageJson.version)
  .option('--prefix-links', 'Build site with links prefixed (set prefix in your config).')
  .parse(process.argv)

relativeDirectory = program.args[0]
if (!relativeDirectory) {
  relativeDirectory = '.'
}
const directory = path.resolve(relativeDirectory)

program.directory = directory
program.relativeDirectory = relativeDirectory

build(program, (err) => {
  if (err) {
    throw err
  } else {
    console.log('Done')
  }
})
