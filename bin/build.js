var program = require('commander') // eslint-disable-line no-var
var path = require('path') // eslint-disable-line no-var

var packageJson = require('../package.json') // eslint-disable-line no-var
var build = require('../dist/utils/build') // eslint-disable-line no-var
var relativeDirectory // eslint-disable-line no-var

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
